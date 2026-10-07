import { Schema, model } from "mongoose";

/** Một câu của game "Tác giả – Tác phẩm". */
export interface IQuizQuestion {
  question: string;
  /** Đúng 4 đáp án. */
  options: string[];
  /** Vị trí đáp án đúng trong `options`, từ 0 đến 3. */
  correctIndex: number;
  explain: string;
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: [true, "Vui lòng nhập câu hỏi"], trim: true, maxlength: 300 },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (values: string[]) => values.length === 4 && values.every((v) => v.trim().length > 0),
        message: "Cần đúng 4 đáp án",
      },
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    explain: { type: String, default: "", trim: true, maxlength: 400 },
  },
  { timestamps: true },
);

export const QuizQuestion = model<IQuizQuestion>("QuizQuestion", quizQuestionSchema);
