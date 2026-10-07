import { Schema, model } from "mongoose";

/** Một câu của game "Cảnh sát chính tả". */
export interface ISpellingQuestion {
  /** Câu có chứa đúng một lần `wrongWord`. */
  sentence: string;
  wrongWord: string;
  correctWord: string;
  /** Các cách viết sai khác để học sinh chọn, không gồm đáp án đúng. */
  distractors: string[];
  tip: string;
  createdAt: Date;
  updatedAt: Date;
}

const spellingQuestionSchema = new Schema<ISpellingQuestion>(
  {
    sentence: { type: String, required: [true, "Vui lòng nhập câu chứa lỗi"], trim: true, maxlength: 500 },
    wrongWord: { type: String, required: [true, "Vui lòng nhập từ viết sai"], trim: true, maxlength: 80 },
    correctWord: { type: String, required: [true, "Vui lòng nhập từ viết đúng"], trim: true, maxlength: 80 },
    distractors: {
      type: [String],
      required: true,
      validate: {
        validator: (values: string[]) => values.length >= 2 && values.length <= 3 && values.every((v) => v.trim().length > 0),
        message: "Cần 2 hoặc 3 cách viết nhiễu",
      },
    },
    tip: { type: String, default: "", trim: true, maxlength: 400 },
  },
  { timestamps: true },
);

export const SpellingQuestion = model<ISpellingQuestion>("SpellingQuestion", spellingQuestionSchema);
