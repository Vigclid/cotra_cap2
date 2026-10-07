import type { Request, RequestHandler } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { ROLES, type Role } from "../models/User";
import { HttpError } from "../utils/HttpError";

/** Dữ liệu được nhúng trong JWT – chỉ gồm id và role, KHÔNG chứa thông tin nhạy cảm. */
export interface AuthPayload {
  id: string;
  role: Role;
}

// Mở rộng kiểu Request của Express để controller đọc được req.user một cách type-safe.
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

/**
 * verifyToken – "người gác cổng" thứ nhất: xác thực (Authentication).
 * 1. Đọc header `Authorization: Bearer <token>`.
 * 2. Kiểm tra chữ ký + hạn dùng bằng JWT_SECRET.
 * 3. Gắn { id, role } vào req.user cho các middleware/controller phía sau.
 * Token sai/thiếu/hết hạn → 401 Unauthorized.
 *
 * Token là stateless: nếu admin đổi role của một user, token cũ vẫn mang role cũ đến khi hết hạn.
 */
export const verifyToken: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Bạn cần đăng nhập để sử dụng chức năng này");
  }

  let decoded: unknown;
  try {
    decoded = jwt.verify(header.slice(7).trim(), env.jwtSecret);
  } catch (err) {
    const expired = err instanceof jwt.TokenExpiredError;
    throw new HttpError(401, expired ? "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại" : "Token không hợp lệ");
  }

  // Phòng trường hợp token hợp lệ về chữ ký nhưng payload không đúng cấu trúc mong đợi.
  const { id, role } = (decoded ?? {}) as Partial<AuthPayload>;
  if (typeof id !== "string" || !ROLES.includes(role as Role)) {
    throw new HttpError(401, "Token không hợp lệ");
  }

  req.user = { id, role: role as Role };
  next();
};

/**
 * checkRole – "người gác cổng" thứ hai: phân quyền (Authorization / RBAC).
 * Luôn đặt SAU verifyToken. Chỉ cho đi tiếp nếu role trong token thuộc danh sách được phép.
 * Ví dụ: checkRole("teacher", "admin") → học sinh gọi sẽ nhận 403 Forbidden.
 */
export const checkRole =
  (...allowed: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw new HttpError(401, "Bạn cần đăng nhập để sử dụng chức năng này");
    if (!allowed.includes(req.user.role)) {
      throw new HttpError(403, "Bạn không có quyền truy cập chức năng này");
    }
    next();
  };

/** Lấy user đã xác thực trong controller (ném 401 nếu route quên gắn verifyToken). */
export function getAuthUser(req: Request): AuthPayload {
  if (!req.user) throw new HttpError(401, "Bạn cần đăng nhập để sử dụng chức năng này");
  return req.user;
}
