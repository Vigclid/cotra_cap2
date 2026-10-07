import "dotenv/config";

/** Đọc biến môi trường bắt buộc – thiếu là dừng server ngay thay vì chạy với cấu hình sai. */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu biến môi trường ${name} (xem .env.example)`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  /** Mã bí mật giáo viên nhập khi đăng ký role teacher. Không đưa mã này lên frontend. */
  teacherSecretCode: required("TEACHER_SECRET_CODE"),
};

/** Site production và các bản preview Vercel của cùng project. */
const VERCEL_ORIGIN = /^https:\/\/tramsacnguvan(-[a-z0-9-]+)?\.vercel\.app$/i;

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (env.corsOrigin.includes(origin)) return true;
  return VERCEL_ORIGIN.test(origin);
}
