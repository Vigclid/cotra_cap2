import { Schema, model } from "mongoose";

/** Một đoạn văn của game "Bàn phím siêu tốc". */
export interface ITypingText {
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

const typingTextSchema = new Schema<ITypingText>(
  {
    title: { type: String, required: [true, "Vui lòng nhập tên trích đoạn"], trim: true, maxlength: 120 },
    content: { type: String, required: [true, "Vui lòng nhập nội dung đoạn văn"], trim: true, maxlength: 1500 },
    author: { type: String, required: [true, "Vui lòng nhập tác giả"], trim: true, maxlength: 120 },
  },
  { timestamps: true },
);

export const TypingText = model<ITypingText>("TypingText", typingTextSchema);
