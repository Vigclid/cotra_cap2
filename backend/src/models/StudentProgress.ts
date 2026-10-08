import { Schema, model, type Types } from "mongoose";

export const MAX_DRAFT_LENGTH = 300;

export interface IDraft {
  lessonId: number;
  /** Vị trí văn bản trong lesson.texts – một bài có thể có nhiều văn bản, mỗi văn bản có bộ câu hỏi riêng. */
  textIndex: number;
  questionIndex: number;
  /** Nội dung vở nháp. API nhận và trả về tên `content`. */
  content: string;
  /** Cùng giá trị với `content`, giữ cho bản nháp đã lưu và client hiện tại. */
  draftContent: string;
  updatedAt: Date;
}

export interface IWpmRecord {
  wpm: number;
  /** Độ chính xác (%) – tuỳ chọn. */
  accuracy?: number;
  /** Tên mini-game, vd: "typing-race", "multiplayer-race". */
  game: string;
  playedAt: Date;
}

export interface IStudentProgress {
  studentId: Types.ObjectId;
  completedLessons: number[];
  drafts: IDraft[];
  wpmRecords: IWpmRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const draftSchema = new Schema<IDraft>(
  {
    lessonId: { type: Number, required: true },
    textIndex: { type: Number, required: true, min: 0, default: 0 },
    questionIndex: { type: Number, required: true, min: 0 },
    content: { type: String, default: "", maxlength: MAX_DRAFT_LENGTH },
    draftContent: { type: String, default: "", maxlength: MAX_DRAFT_LENGTH },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const wpmRecordSchema = new Schema<IWpmRecord>(
  {
    wpm: { type: Number, required: true, min: 0, max: 400 },
    accuracy: { type: Number, min: 0, max: 100 },
    game: { type: String, default: "typing-race", trim: true, maxlength: 50 },
    playedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const studentProgressSchema = new Schema<IStudentProgress>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    completedLessons: { type: [Number], default: [] },
    drafts: { type: [draftSchema], default: [] },
    wpmRecords: { type: [wpmRecordSchema], default: [] },
  },
  { timestamps: true },
);

// Mỗi học sinh một document. Index này phục vụ mọi query theo studentId (nháp, analytics, AI).
studentProgressSchema.index({ studentId: 1 }, { unique: true });

export const StudentProgress = model<IStudentProgress>("StudentProgress", studentProgressSchema);
