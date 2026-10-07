import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { HttpError } from "../utils/HttpError";

export const notFound: RequestHandler = (req) => {
  throw new HttpError(404, `Không tìm thấy endpoint ${req.method} ${req.originalUrl}`);
};

/**
 * Bộ xử lý lỗi tập trung. Express 5 tự chuyển lỗi từ async handler về đây,
 * nên controller chỉ cần `throw` mà không phải try/catch.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
    res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: `Giá trị không hợp lệ cho trường ${err.path}` });
    return;
  }

  // Trùng khoá unique (username, lessonId...)
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "dữ liệu";
    res.status(409).json({ message: `${field} đã tồn tại` });
    return;
  }

  // Lỗi từ body-parser của express.json(): JSON sai cú pháp, body quá lớn...
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ message: "Body JSON không hợp lệ" });
    return;
  }
  if (err?.expose && typeof err.status === "number") {
    res.status(err.status).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Lỗi máy chủ, vui lòng thử lại sau" });
};
