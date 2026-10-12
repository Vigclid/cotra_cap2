import { timingSafeEqual } from "crypto";
import type { RequestHandler } from "express";
import { env } from "../config/env";
import { getAuthUser, signToken } from "../middlewares/auth";
import { StudentProgress } from "../models/StudentProgress";
import { User } from "../models/User";
import { HttpError } from "../utils/HttpError";
import { coerceGrade } from "../utils/grades";
import { getLevel } from "../utils/levels";

type PublicUserSource = {
  _id: unknown;
  username: string;
  fullName: string;
  role: string;
  exp: number;
  level: number;
  badges: string[];
  grade?: number;
};

/** Dữ liệu user an toàn để trả cho client (không bao giờ có password). */
export function toPublicUser(user: PublicUserSource) {
  const base = { id: String(user._id), username: user.username, fullName: user.fullName, role: user.role };
  if (user.role !== "student") return base;
  return {
    ...base,
    exp: user.exp,
    level: user.level,
    levelName: getLevel(user.exp).name,
    badges: user.badges,
    grade: coerceGrade(user.grade),
  };
}

/** So sánh mã giáo viên không lộ độ dài qua thời gian trả về. */
function sameSecret(input: string, secret: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(secret);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * POST /api/auth/register
 * body: { username, password, fullName, role: "student" | "teacher", teacherCode? }
 * Giáo viên bắt buộc đúng TEACHER_SECRET_CODE. Không cấp token – client chuyển sang trang đăng nhập.
 */
export const register: RequestHandler = async (req, res) => {
  const body = req.body ?? {};
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const role = body.role;

  if (role !== "student" && role !== "teacher") {
    throw new HttpError(400, "Vai trò chỉ được là học sinh hoặc giáo viên");
  }
  if (!username || !password || !fullName) {
    throw new HttpError(400, "Vui lòng nhập đủ tên đăng nhập, mật khẩu và họ tên");
  }
  if (password.length < 6) throw new HttpError(400, "Mật khẩu cần ít nhất 6 ký tự");
  if (password.length > 72) throw new HttpError(400, "Mật khẩu tối đa 72 ký tự");

  if (role === "teacher") {
    const teacherCode = typeof body.teacherCode === "string" ? body.teacherCode.trim() : "";
    if (!teacherCode || !sameSecret(teacherCode, env.teacherSecretCode)) {
      throw new HttpError(403, "Mã xác nhận giáo viên không đúng");
    }
  }

  if (await User.exists({ username })) throw new HttpError(409, "Tên đăng nhập đã được dùng");

  const user = await User.create({ username, password, fullName, role });
  if (user.role === "student") await StudentProgress.create({ studentId: user._id });

  res.status(201).json({ message: "Đăng ký thành công", user: toPublicUser(user) });
};

/** POST /api/auth/login – body: { username, password } → { token, user } */
export const login: RequestHandler = async (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
    throw new HttpError(400, "Vui lòng nhập tên đăng nhập và mật khẩu");
  }

  const user = await User.findOne({ username: username.trim().toLowerCase() }).select("+password");

  // Cùng một thông báo cho "sai username" và "sai mật khẩu" để không lộ username nào tồn tại.
  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Tên đăng nhập hoặc mật khẩu không đúng");
  }

  const token = signToken({ id: user.id, role: user.role });
  res.json({ token, user: toPublicUser(user) });
};

/** GET /api/auth/me – trả thông tin user đang đăng nhập (dùng khi F5 trang). */
export const me: RequestHandler = async (req, res) => {
  const user = await User.findById(getAuthUser(req).id).lean();
  if (!user) throw new HttpError(404, "Tài khoản không còn tồn tại");
  res.json({ user: toPublicUser(user) });
};
