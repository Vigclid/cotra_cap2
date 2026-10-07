/** Kiểu dữ liệu trao đổi với Backend Express – khớp với Mongoose schema trong /backend/src/models. */

export type Role = "student" | "teacher" | "admin";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  /** Backend chỉ trả 3 trường gamification cho học sinh; client chuẩn hoá về 0 / [] cho role khác. */
  exp: number;
  level: number;
  badges: string[];
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
  title: string;
  theme: string;
  quote: LessonQuote;
  objectives: string[];
  heroImage?: string;
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
  updatedAt: string;
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
