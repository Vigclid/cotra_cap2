import type { RequestHandler } from "express";
import { Lesson, type ILesson } from "../models/Lesson";
import { StudentProgress } from "../models/StudentProgress";
import { User } from "../models/User";
import { HttpError } from "../utils/HttpError";
import { getLevel } from "../utils/levels";
import { coerceGrade, MIN_GRADE, MAX_GRADE } from "../utils/grades";
import { pick, toInt, toLessonId, toObjectId } from "../utils/validate";

/** Các trường giáo viên/admin được phép sửa. `lessonId` cố định sau khi tạo vì tiến độ học sinh tham chiếu tới nó. */
const EDITABLE_LESSON_FIELDS = ["title", "theme", "quote", "objectives", "heroImage", "texts", "grade"] as const;

/** GET /api/admin/lessons – danh sách đầy đủ (kể cả toàn văn) để hiển thị trong trang quản trị. */
export const listLessonsAdmin: RequestHandler = async (_req, res) => {
  const lessons = await Lesson.find().sort({ grade: 1, lessonId: 1 }).select("-__v").lean();
  res.json({
    lessons: lessons.map((lesson) => ({ ...lesson, grade: coerceGrade(lesson.grade) })),
  });
};

/**
 * POST /api/admin/lessons – tạo chặng mới.
 * Không truyền `lessonId` → tự lấy số lớn nhất hiện có + 1.
 */
export const createLesson: RequestHandler = async (req, res) => {
  const data = pick(req.body ?? {}, EDITABLE_LESSON_FIELDS);
  let lessonId: number;
  if (req.body?.lessonId !== undefined) {
    lessonId = toLessonId(req.body.lessonId);
  } else {
    const last = await Lesson.findOne().sort({ lessonId: -1 }).select("lessonId").lean();
    lessonId = (last?.lessonId ?? 0) + 1;
  }

  const grade = req.body?.grade === undefined ? 6 : toInt(req.body.grade, "grade", { min: MIN_GRADE, max: MAX_GRADE });

  // Kiểu dữ liệu từng trường do schema Mongoose validate khi create().
  const lesson = await Lesson.create({ ...data, lessonId, grade } as Partial<ILesson>);
  res.status(201).json({ message: "Đã tạo bài học", lesson });
};

/** PUT /api/admin/lessons/:id – cập nhật các trường được gửi lên (`:id` là lessonId). */
export const updateLesson: RequestHandler = async (req, res) => {
  const lessonId = toLessonId(req.params.id);
  const data = pick(req.body ?? {}, EDITABLE_LESSON_FIELDS);
  if (data.grade !== undefined) data.grade = toInt(data.grade, "grade", { min: MIN_GRADE, max: MAX_GRADE });
  if (Object.keys(data).length === 0) {
    throw new HttpError(400, `Không có trường nào để cập nhật (cho phép: ${EDITABLE_LESSON_FIELDS.join(", ")})`);
  }

  const lesson = await Lesson.findOneAndUpdate(
    { lessonId },
    { $set: data },
    { returnDocument: "after", runValidators: true },
  ).lean();
  if (!lesson) throw new HttpError(404, `Không tìm thấy bài học ${lessonId}`);
  res.json({ message: "Đã cập nhật bài học", lesson });
};

/** DELETE /api/admin/lessons/:id – xoá chặng và dọn dữ liệu tiến độ liên quan của mọi học sinh. */
export const deleteLesson: RequestHandler = async (req, res) => {
  const lessonId = toLessonId(req.params.id);
  const deleted = await Lesson.findOneAndDelete({ lessonId }).lean();
  if (!deleted) throw new HttpError(404, `Không tìm thấy bài học ${lessonId}`);

  await StudentProgress.updateMany({}, { $pull: { completedLessons: lessonId, drafts: { lessonId } } });
  res.json({ message: `Đã xoá bài học ${lessonId}` });
};

/**
 * GET /api/admin/students?search=&grade=&page=1&limit=20
 * Danh sách học sinh (xếp theo EXP giảm dần) kèm tiến độ và khối lớp.
 * `grade` bỏ trống hoặc `all` → mọi khối. Học sinh cũ chưa có field grade được tính là Lớp 6.
 */
export const listStudents: RequestHandler = async (req, res) => {
  const page = toInt(req.query.page ?? 1, "page", { min: 1 });
  const limit = toInt(req.query.limit ?? 20, "limit", { min: 1, max: 100 });
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const rawGrade = req.query.grade;
  const grade =
    rawGrade === undefined || rawGrade === "" || rawGrade === "all"
      ? null
      : toInt(rawGrade, "grade", { min: MIN_GRADE, max: MAX_GRADE });

  const clauses: Record<string, unknown>[] = [{ role: "student" }];
  if (search) {
    // Escape ký tự đặc biệt để chuỗi tìm kiếm không bị hiểu thành regex.
    const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    clauses.push({ $or: [{ username: pattern }, { fullName: pattern }] });
  }
  if (grade === 6) {
    clauses.push({ $or: [{ grade: 6 }, { grade: null }, { grade: { $exists: false } }] });
  } else if (grade !== null) {
    clauses.push({ grade });
  }
  const filter = clauses.length === 1 ? clauses[0] : { $and: clauses };

  const [students, total, totalLessons] = await Promise.all([
    User.find(filter)
      .sort({ exp: -1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("username fullName exp level badges grade createdAt")
      .lean(),
    User.countDocuments(filter),
    Lesson.countDocuments(),
  ]);

  const progresses = await StudentProgress.find({ studentId: { $in: students.map((s) => s._id) } })
    .select("studentId completedLessons drafts.updatedAt wpmRecords.wpm updatedAt")
    .lean();
  const progressById = new Map(progresses.map((p) => [String(p.studentId), p]));

  res.json({
    page,
    limit,
    total,
    totalLessons,
    students: students.map((s) => {
      const p = progressById.get(String(s._id));
      const completedLessons = [...(p?.completedLessons ?? [])].sort((a, b) => a - b);
      return {
        id: String(s._id),
        username: s.username,
        fullName: s.fullName,
        grade: coerceGrade(s.grade),
        exp: s.exp,
        level: s.level,
        levelName: getLevel(s.exp).name,
        badges: s.badges,
        completedLessons,
        completedCount: completedLessons.length,
        draftCount: p?.drafts.length ?? 0,
        bestWpm: p?.wpmRecords.length ? Math.max(...p.wpmRecords.map((r) => r.wpm)) : null,
        lastActiveAt: p?.updatedAt ?? null,
        joinedAt: s.createdAt,
      };
    }),
  });
};

/**
 * PUT /api/admin/students/:id
 * body: { fullName?, grade? } – đổi họ tên và/hoặc khối lớp. Không đụng role, mật khẩu, EXP.
 * Sau khi nâng khối, học sinh đăng nhập lại (hoặc F5) sẽ thấy lộ trình mới được mở khoá.
 */
export const updateStudent: RequestHandler = async (req, res) => {
  const id = toObjectId(req.params.id);
  const student = await User.findOne({ _id: id, role: "student" });
  if (!student) throw new HttpError(404, "Không tìm thấy học sinh");

  const body = req.body ?? {};
  const hasName = typeof body.fullName === "string";
  const hasGrade = body.grade !== undefined;
  if (!hasName && !hasGrade) {
    throw new HttpError(400, "Không có trường nào để cập nhật (cho phép: fullName, grade)");
  }

  if (hasName) {
    const fullName = body.fullName.trim();
    if (!fullName || fullName.length > 100) throw new HttpError(400, "Họ tên cần từ 1 đến 100 ký tự");
    student.fullName = fullName;
  }
  if (hasGrade) {
    student.grade = toInt(body.grade, "grade", { min: MIN_GRADE, max: MAX_GRADE });
  }

  await student.save();
  res.json({
    message: "Đã cập nhật học sinh",
    student: {
      id: String(student._id),
      username: student.username,
      fullName: student.fullName,
      grade: coerceGrade(student.grade),
    },
  });
};
