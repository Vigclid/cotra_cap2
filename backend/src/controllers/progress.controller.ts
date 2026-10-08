import type { RequestHandler } from "express";
import { getAuthUser } from "../middlewares/auth";
import { Lesson } from "../models/Lesson";
import { MAX_DRAFT_LENGTH, StudentProgress, type IDraft } from "../models/StudentProgress";
import { User } from "../models/User";
import { HttpError } from "../utils/HttpError";
import { LEVELS, getLevel } from "../utils/levels";
import { toInt, toLessonId } from "../utils/validate";

/** Bản nháp cũ chỉ có `draftContent`; bản mới ghi cả `content`. */
export function draftText(draft: { content?: string; draftContent?: string }): string {
  if (typeof draft.content === "string" && draft.content.length > 0) return draft.content;
  return typeof draft.draftContent === "string" ? draft.draftContent : "";
}

function presentDraft(draft: IDraft) {
  const content = draftText(draft);
  return {
    lessonId: draft.lessonId,
    textIndex: draft.textIndex ?? 0,
    questionIndex: draft.questionIndex,
    content,
    draftContent: content,
    updatedAt: draft.updatedAt,
  };
}

const DEFAULT_EXP = 10;
/** Trần EXP cho một request – EXP do client gửi lên nên không thể tin tuyệt đối. */
const MAX_EXP_PER_REQUEST = 50;

/** GET /api/progress/me – toàn bộ tiến độ của học sinh đang đăng nhập (thay cho đọc LocalStorage). */
export const getMyProgress: RequestHandler = async (req, res) => {
  const { id } = getAuthUser(req);
  const progress = await StudentProgress.findOneAndUpdate(
    { studentId: id },
    { $setOnInsert: { studentId: id } },
    { upsert: true, returnDocument: "after" },
  )
    .select("-__v")
    .lean();
  res.json({ progress });
};

/** GET /api/progress/draft/:lessonId – các bài nháp của học sinh trong một chặng (để fill vào vở khi mở bài). */
export const getDrafts: RequestHandler = async (req, res) => {
  const { id } = getAuthUser(req);
  const lessonId = toLessonId(req.params.lessonId);
  const progress = await StudentProgress.findOne({ studentId: id }).select("drafts").lean();
  res.json({
    lessonId,
    drafts: (progress?.drafts ?? []).filter((d) => d.lessonId === lessonId).map(presentDraft),
  });
};

/** GET /api/progress/drafts – toàn bộ vở nháp của học sinh đang đăng nhập, mới nhất trước. */
export const getAllDrafts: RequestHandler = async (req, res) => {
  const { id } = getAuthUser(req);
  const progress = await StudentProgress.findOne({ studentId: id }).select("drafts").lean();
  const drafts = [...(progress?.drafts ?? [])]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .map(presentDraft);
  res.json({ drafts });
};

/**
 * POST /api/progress/draft – lưu vở nháp (client đã debounce).
 * body: { lessonId, questionIndex, content, textIndex = 0 }
 * `draftContent` vẫn được nhận để tương thích với vở học sinh hiện tại.
 * Nếu đã có nháp cho đúng câu hỏi đó thì ghi đè, chưa có thì thêm mới.
 */
export const saveDraft: RequestHandler = async (req, res) => {
  const { id } = getAuthUser(req);
  const lessonId = toLessonId(req.body?.lessonId);
  const textIndex = toInt(req.body?.textIndex ?? 0, "textIndex");
  const questionIndex = toInt(req.body?.questionIndex, "questionIndex");
  const rawContent = req.body?.content !== undefined ? req.body.content : req.body?.draftContent;

  if (typeof rawContent !== "string") throw new HttpError(400, "Nội dung nháp phải là chuỗi");
  if (rawContent.length > MAX_DRAFT_LENGTH) {
    throw new HttpError(400, `Bài nháp tối đa ${MAX_DRAFT_LENGTH} ký tự`);
  }
  const draftContent = rawContent;

  // Chỉ cho lưu nháp vào câu hỏi thực sự tồn tại.
  const lesson = await Lesson.findOne({ lessonId }).select("texts.questions").lean();
  if (!lesson?.texts[textIndex]?.questions[questionIndex]) {
    throw new HttpError(404, "Không tìm thấy câu hỏi tương ứng");
  }

  const updatedAt = new Date();
  const match = { lessonId, textIndex, questionIndex };

  // Bước 1: cập nhật nháp đã có (toán tử vị trí `$` trỏ vào phần tử khớp $elemMatch).
  const updated = await StudentProgress.updateOne(
    { studentId: id, drafts: { $elemMatch: match } },
    {
      $set: {
        "drafts.$.content": draftContent,
        "drafts.$.draftContent": draftContent,
        "drafts.$.updatedAt": updatedAt,
      },
    },
  );

  // Bước 2: chưa có → push nháp mới (upsert tạo luôn document tiến độ nếu học sinh chưa có).
  if (updated.matchedCount === 0) {
    await StudentProgress.updateOne(
      { studentId: id },
      { $push: { drafts: { ...match, content: draftContent, draftContent, updatedAt } } },
      { upsert: true, runValidators: true },
    );
  }

  res.json({ message: "Đã lưu bài nháp", draft: { ...match, content: draftContent, draftContent, updatedAt } });
};

/**
 * POST /api/progress/exp – cộng EXP sau khi hoàn thành nhiệm vụ.
 * body: { amount = 10, lessonId? } – có lessonId thì đánh dấu luôn chặng đó đã hoàn thành.
 * Chặng đã hoàn thành từ trước thì KHÔNG cộng thêm EXP (gained = 0) để không "cày" lại được.
 * Trả về EXP/level mới và cờ `leveledUp` để frontend bắn confetti.
 */
export const addExp: RequestHandler = async (req, res) => {
  const { id } = getAuthUser(req);
  const amount = toInt(req.body?.amount ?? DEFAULT_EXP, "amount", { min: 1, max: MAX_EXP_PER_REQUEST });

  let completedLessons: number[] | undefined;
  if (req.body?.lessonId !== undefined) {
    const lessonId = toLessonId(req.body.lessonId);
    if (!(await Lesson.exists({ lessonId }))) throw new HttpError(404, `Không tìm thấy bài học ${lessonId}`);
    // Lấy bản TRƯỚC khi cập nhật để biết chặng này đã hoàn thành chưa (thao tác nguyên tử).
    const before = await StudentProgress.findOneAndUpdate(
      { studentId: id },
      { $addToSet: { completedLessons: lessonId } },
      { upsert: true, returnDocument: "before" },
    ).lean();
    const previous = before?.completedLessons ?? [];
    completedLessons = previous.includes(lessonId) ? previous : [...previous, lessonId];

    if (previous.includes(lessonId)) {
      const user = await User.findOne({ _id: id, role: "student" }).lean();
      if (!user) throw new HttpError(404, "Không tìm thấy học sinh");
      const level = getLevel(user.exp);
      res.json({
        gained: 0,
        exp: user.exp,
        level: level.index,
        levelName: level.name,
        nextLevelAt: LEVELS[level.index + 1]?.min ?? null,
        leveledUp: false,
        badges: user.badges,
        completedLessons,
      });
      return;
    }
  }

  // $inc là thao tác nguyên tử → nhiều request song song không bị mất EXP.
  const user = await User.findOneAndUpdate(
    { _id: id, role: "student" },
    { $inc: { exp: amount } },
    { returnDocument: "after" },
  ).lean();
  if (!user) throw new HttpError(404, "Không tìm thấy học sinh");

  // Đồng bộ level và trao danh hiệu cho mọi cấp vừa vượt qua (có thể nhảy nhiều cấp một lúc).
  const newLevel = getLevel(user.exp);
  const leveledUp = newLevel.index > user.level;
  let badges = user.badges;
  if (newLevel.index !== user.level) {
    const earned = LEVELS.filter((l) => l.index > user.level && l.index <= newLevel.index).map(
      (l) => `${l.emoji} ${l.name}`,
    );
    const synced = await User.findByIdAndUpdate(
      id,
      { $set: { level: newLevel.index }, $addToSet: { badges: { $each: earned } } },
      { returnDocument: "after" },
    ).lean();
    badges = synced?.badges ?? badges;
  }

  res.json({
    gained: amount,
    exp: user.exp,
    level: newLevel.index,
    levelName: newLevel.name,
    nextLevelAt: LEVELS[newLevel.index + 1]?.min ?? null,
    leveledUp,
    badges,
    ...(completedLessons && { completedLessons }),
  });
};

/** POST /api/progress/wpm – lưu kết quả mini-game gõ phím. body: { wpm, accuracy?, game? } */
export const addWpmRecord: RequestHandler = async (req, res) => {
  const { id } = getAuthUser(req);
  const wpm = toInt(Math.round(Number(req.body?.wpm)), "wpm", { max: 400 });
  const accuracy = req.body?.accuracy === undefined ? undefined : Number(req.body.accuracy);
  if (accuracy !== undefined && !(accuracy >= 0 && accuracy <= 100)) {
    throw new HttpError(400, "accuracy phải trong khoảng 0–100");
  }
  const game = typeof req.body?.game === "string" ? req.body.game : undefined;

  const record = { wpm, accuracy, game, playedAt: new Date() };
  await StudentProgress.updateOne(
    { studentId: id },
    // Chỉ giữ 100 lượt gần nhất để document không phình vô hạn.
    { $push: { wpmRecords: { $each: [record], $slice: -100 } } },
    { upsert: true, runValidators: true },
  );
  res.status(201).json({ message: "Đã lưu kết quả", record });
};
