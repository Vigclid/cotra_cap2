import type { RequestHandler } from "express";
import type { Model, UpdateQuery } from "mongoose";
import { QuizQuestion } from "../models/QuizQuestion";
import { SpellingQuestion } from "../models/SpellingQuestion";
import { TypingText } from "../models/TypingText";
import { HttpError } from "../utils/HttpError";
import { toObjectId } from "../utils/validate";

type LeanDoc = { _id: unknown; __v?: unknown };

function present(doc: LeanDoc) {
  const { _id, __v: _ignored, ...rest } = doc;
  return { id: String(_id), ...rest };
}

function text(value: unknown, label: string, max: number) {
  if (typeof value !== "string" || !value.trim()) throw new HttpError(400, `Vui lòng nhập ${label}`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new HttpError(400, `${label} tối đa ${max} ký tự`);
  return trimmed;
}

function optionalText(value: unknown, label: string, max: number) {
  if (value === undefined || value === null || value === "") return "";
  return text(value, label, max);
}

function stringList(value: unknown, label: string, { min, max, itemMax }: { min: number; max: number; itemMax: number }) {
  if (!Array.isArray(value)) throw new HttpError(400, `${label} phải là danh sách`);
  const items = value.map((item, i) => text(item, `${label} ${i + 1}`, itemMax));
  if (items.length < min || items.length > max) {
    throw new HttpError(400, `${label} cần từ ${min} đến ${max} mục`);
  }
  if (new Set(items).size !== items.length) throw new HttpError(400, `${label} không được trùng nhau`);
  return items;
}

function parseSpelling(body: unknown) {
  const source = (body ?? {}) as Record<string, unknown>;
  const sentence = text(source.sentence, "câu chứa lỗi", 500);
  const wrongWord = text(source.wrongWord, "từ viết sai", 80);
  const correctWord = text(source.correctWord, "từ viết đúng", 80);
  if (wrongWord === correctWord) throw new HttpError(400, "Từ viết sai và từ viết đúng phải khác nhau");
  if (sentence.split(wrongWord).length !== 2) {
    throw new HttpError(400, "Câu phải chứa đúng một lần từ viết sai, để học sinh bấm trúng từ đó");
  }
  const distractors = stringList(source.distractors, "Cách viết nhiễu", { min: 2, max: 3, itemMax: 80 });
  if (distractors.some((item) => item === correctWord || item === wrongWord)) {
    throw new HttpError(400, "Cách viết nhiễu không được trùng từ đúng hoặc từ sai");
  }
  return { sentence, wrongWord, correctWord, distractors, tip: optionalText(source.tip, "mẹo ghi nhớ", 400) };
}

function parseTyping(body: unknown) {
  const source = (body ?? {}) as Record<string, unknown>;
  return {
    title: text(source.title, "tên trích đoạn", 120),
    content: text(source.content, "nội dung đoạn văn", 1500),
    author: text(source.author, "tác giả", 120),
  };
}

function parseQuiz(body: unknown) {
  const source = (body ?? {}) as Record<string, unknown>;
  const options = stringList(source.options, "Đáp án", { min: 4, max: 4, itemMax: 200 });
  const correctIndex = source.correctIndex;
  if (typeof correctIndex !== "number" || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    throw new HttpError(400, "Hãy chọn đáp án đúng (A, B, C hoặc D)");
  }
  return {
    question: text(source.question, "câu hỏi", 300),
    options,
    correctIndex,
    explain: optionalText(source.explain, "giải thích", 400),
  };
}

// Model cụ thể của từng game không dùng chung một document type, nên factory nhận Model<any>.
function collectionHandlers(model: Model<any>, parse: (body: unknown) => Record<string, unknown>) {
  const list: RequestHandler = async (_req, res) => {
    const items = await model.find().sort({ createdAt: 1 }).select("-__v").lean();
    res.json({ items: items.map((item) => present(item)) });
  };

  const create: RequestHandler = async (req, res) => {
    const doc = await model.create(parse(req.body));
    res.status(201).json({ message: "Đã thêm câu hỏi", item: present(doc.toObject()) });
  };

  const update: RequestHandler = async (req, res) => {
    const id = toObjectId(req.params.id);
    const doc = await model
      .findByIdAndUpdate(id, parse(req.body) as UpdateQuery<any>, { returnDocument: "after", runValidators: true })
      .select("-__v")
      .lean();
    if (!doc) throw new HttpError(404, "Không tìm thấy câu hỏi");
    res.json({ message: "Đã cập nhật câu hỏi", item: present(doc) });
  };

  const remove: RequestHandler = async (req, res) => {
    const id = toObjectId(req.params.id);
    const doc = await model.findByIdAndDelete(id).lean();
    if (!doc) throw new HttpError(404, "Không tìm thấy câu hỏi");
    res.json({ message: "Đã xoá câu hỏi" });
  };

  return { list, create, update, remove };
}

export const spelling = collectionHandlers(SpellingQuestion, parseSpelling);
export const typing = collectionHandlers(TypingText, parseTyping);
export const quiz = collectionHandlers(QuizQuestion, parseQuiz);
