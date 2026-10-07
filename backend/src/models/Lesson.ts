import { Schema, model } from "mongoose";

export interface ILessonText {
  /** Định dạng "Tên văn bản (Tác giả)" – frontend tách phần trong ngoặc làm tên tác giả. */
  name: string;
  /** Toàn văn, mỗi phần tử là một đoạn. Mảng rỗng → frontend hiển thị "đang cập nhật". */
  fullText: string[];
  questions: string[];
}

export interface ILesson {
  /** Số thứ tự chặng (1, 2, 3...) – dùng làm khoá nghiệp vụ trong URL và trong StudentProgress. */
  lessonId: number;
  title: string;
  theme: string;
  quote: { text: string; author: string };
  objectives: string[];
  heroImage?: string;
  texts: ILessonText[];
  createdAt: Date;
  updatedAt: Date;
}

// _id: false → câu hỏi được tham chiếu bằng vị trí (textIndex, questionIndex) giống frontend.
const lessonTextSchema = new Schema<ILessonText>(
  {
    name: { type: String, required: [true, "Văn bản cần có tên"], trim: true },
    fullText: { type: [String], default: [] },
    questions: { type: [String], default: [] },
  },
  { _id: false },
);

const lessonSchema = new Schema<ILesson>(
  {
    lessonId: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      validate: { validator: Number.isInteger, message: "lessonId phải là số nguyên" },
    },
    title: { type: String, required: [true, "Vui lòng nhập tiêu đề bài học"], trim: true },
    theme: { type: String, required: [true, "Vui lòng nhập thể loại/chủ đề"], trim: true },
    quote: {
      text: { type: String, default: "", trim: true },
      author: { type: String, default: "", trim: true },
    },
    objectives: { type: [String], default: [] },
    heroImage: { type: String, trim: true },
    texts: { type: [lessonTextSchema], default: [] },
  },
  { timestamps: true },
);

export const Lesson = model<ILesson>("Lesson", lessonSchema);
