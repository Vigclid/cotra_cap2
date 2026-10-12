import { Schema, model } from "mongoose";

/** Nhân vật văn học của mục "Khám phá nhân vật". `grade` quyết định thẻ nào được mở. */
export interface ICharacter {
  /** Khoá ổn định, khớp `id` mà frontend dùng khi gọi AI (vd: "de-men"). */
  slug: string;
  name: string;
  work: string;
  author: string;
  grade: number;
  /** Số thứ tự bài trong SGK của khối đó. */
  lesson: number;
  emoji: string;
  gradient: string;
  tagline: string;
  sampleQuestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const characterSchema = new Schema<ICharacter>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: [true, "Vui lòng nhập tên nhân vật"], trim: true },
    work: { type: String, required: [true, "Vui lòng nhập tên tác phẩm"], trim: true },
    author: { type: String, required: [true, "Vui lòng nhập tác giả"], trim: true },
    grade: {
      type: Number,
      required: [true, "Vui lòng chọn khối lớp"],
      min: [1, "Khối lớp phải từ 1 đến 12"],
      max: [12, "Khối lớp phải từ 1 đến 12"],
      validate: { validator: Number.isInteger, message: "grade phải là số nguyên" },
    },
    lesson: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isInteger, message: "lesson phải là số nguyên" },
    },
    emoji: { type: String, default: "📖", trim: true },
    gradient: { type: String, default: "from-slate-200 to-slate-300", trim: true },
    tagline: { type: String, default: "", trim: true },
    sampleQuestions: { type: [String], default: [] },
  },
  { timestamps: true },
);

characterSchema.index({ grade: 1, lesson: 1 });

export const Character = model<ICharacter>("Character", characterSchema);
