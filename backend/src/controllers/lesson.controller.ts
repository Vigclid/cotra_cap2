import type { RequestHandler } from "express";
import { getAuthUser } from "../middlewares/auth";
import { Lesson } from "../models/Lesson";
import { StudentProgress } from "../models/StudentProgress";
import { HttpError } from "../utils/HttpError";
import { toLessonId } from "../utils/validate";

/**
 * GET /api/lessons – toàn bộ roadmap (đường zic-zac).
 * Chỉ trả phần tóm tắt, bỏ `fullText` cho nhẹ. Nếu là học sinh, kèm cờ `completed` từng chặng.
 */
export const listLessons: RequestHandler = async (req, res) => {
  const user = getAuthUser(req);

  const [lessons, progress] = await Promise.all([
    Lesson.find().sort({ lessonId: 1 }).select("-texts.fullText -__v").lean(),
    user.role === "student" ? StudentProgress.findOne({ studentId: user.id }).select("completedLessons").lean() : null,
  ]);

  const completed = new Set(progress?.completedLessons ?? []);
  res.json({
    lessons: lessons.map(({ _id, texts, ...lesson }) => ({
      ...lesson,
      textCount: texts.length,
      textNames: texts.map((t) => t.name),
      completed: completed.has(lesson.lessonId),
    })),
  });
};

/** GET /api/lessons/:id – chi tiết một chặng (kèm toàn văn và câu hỏi). `:id` là lessonId (1, 2, 3...). */
export const getLesson: RequestHandler = async (req, res) => {
  const lessonId = toLessonId(req.params.id);
  const lesson = await Lesson.findOne({ lessonId }).select("-__v").lean();
  if (!lesson) throw new HttpError(404, `Không tìm thấy bài học ${lessonId}`);
  res.json({ lesson });
};
