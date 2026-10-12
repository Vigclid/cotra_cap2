/** Kiểu dữ liệu trao đổi với Backend Express – khớp với Mongoose schema trong /backend/src/models. */

export type Role = "student" | "teacher" | "admin";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  /** Backend chỉ trả các trường gamification và khối lớp cho học sinh; client chuẩn hoá về 0 / [] cho role khác. */
  exp: number;
  level: number;
  badges: string[];
  /** Khối lớp hiện tại. Chỉ có với học sinh. */
  grade?: number;
}

export interface LessonQuote {
  text: string;
  author: string;
}

export interface LessonText {
  /** "Tên văn bản (Tác giả)" */
  name: string;
  fullText: string[];
  questions: string[];
}

interface LessonBase {
  lessonId: number;
  /** Khối lớp của chặng. Thiếu dữ liệu cũ được chuẩn hoá thành 6. */
  grade: number;
  title: string;
  theme: string;
  quote: LessonQuote;
  objectives: string[];
  heroImage?: string;
}

/** Thẻ nhân vật từ GET /api/characters. */
export interface CharacterSummary {
  id: string;
  name: string;
  work: string;
  author: string;
  grade: number;
  lesson: number;
  emoji: string;
  gradient: string;
  tagline: string;
  sampleQuestions: string[];
}

/** Một dòng trong GET /api/admin/students. */
export interface ManagedStudent {
  id: string;
  username: string;
  fullName: string;
  grade: number;
  exp: number;
  level: number;
  levelName: string;
  completedCount: number;
  draftCount: number;
  joinedAt: string;
}

export interface ManagedStudentPage {
  page: number;
  limit: number;
  total: number;
  students: ManagedStudent[];
}

/** Phần tử của GET /api/lessons (roadmap – không kèm toàn văn). */
export interface LessonSummary extends LessonBase {
  textCount: number;
  textNames: string[];
  completed: boolean;
}

/** GET /api/lessons/:id */
export interface LessonDetail extends LessonBase {
  texts: LessonText[];
}

export interface Draft {
  lessonId: number;
  textIndex: number;
  questionIndex: number;
  draftContent: string;
  /** Cùng nội dung với draftContent. Backend lưu cả hai tên. */
  content?: string;
  updatedAt: string;
}

export interface AnalyticsStudent {
  id: string;
  fullName: string;
  username: string;
  grade: number;
  level: number;
  levelName: string;
  levelEmoji: string;
  exp: number;
  completionRate: number;
  completedCount: number;
  draftCount: number;
  completedLessonIds: number[];
  draftLessonIds: number[];
}

export interface AnalyticsLesson {
  lessonId: number;
  title: string;
  grade: number;
}

export interface AnalyticsOverview {
  totalStudents: number;
  avgCompletionRate: number;
  totalDraftsWritten: number;
  totalLessons: number;
  mostActiveLesson: { lessonId: number; title: string; studentCount: number } | null;
  lessons: AnalyticsLesson[];
  students: AnalyticsStudent[];
}

export interface AiEvaluation {
  strengths: string[];
  weaknesses: string[];
  focusAreas: string[];
  actionPlan: string[];
}

export interface AiEvaluationReport {
  student: {
    id: string;
    fullName: string;
    username: string;
    levelName: string;
    levelEmoji: string;
    exp: number;
    completionRate: number;
  };
  draftsUsed: number;
  source: "gemini" | "openai" | "demo";
  evaluation: AiEvaluation;
}

export type DraftInput = Omit<Draft, "updatedAt">;

/** POST /api/progress/exp */
export interface ExpResult {
  gained: number;
  exp: number;
  level: number;
  levelName: string;
  nextLevelAt: number | null;
  leveledUp: boolean;
  badges: string[];
  completedLessons?: number[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterInput {
  username: string;
  password: string;
  fullName: string;
  role: "student" | "teacher";
  teacherCode?: string;
}

/** Đề "Cảnh sát chính tả" – dạng giáo viên sửa trên dashboard. */
export interface SpellingItem {
  id: string;
  sentence: string;
  wrongWord: string;
  correctWord: string;
  distractors: string[];
  tip: string;
}

/** Đề "Bàn phím siêu tốc". */
export interface TypingItem {
  id: string;
  title: string;
  content: string;
  author: string;
}

/** Đề "Tác giả – Tác phẩm". */
export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explain: string;
}
