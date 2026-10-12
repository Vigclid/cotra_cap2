import { User } from "../models/User";
import { HttpError } from "./HttpError";

export const DEFAULT_STUDENT_GRADE = 6;
export const MIN_GRADE = 1;
export const MAX_GRADE = 12;

/** Chuẩn hoá khối lớp. Giá trị thiếu hoặc không hợp lệ về mặc định Lớp 6. */
export function coerceGrade(value: unknown, fallback = DEFAULT_STUDENT_GRADE): number {
  return typeof value === "number" && Number.isInteger(value) && value >= MIN_GRADE && value <= MAX_GRADE
    ? value
    : fallback;
}

export async function loadStudentGrade(userId: string): Promise<number> {
  const student = await User.findById(userId).select("grade").lean();
  return coerceGrade(student?.grade);
}

/** Học sinh chỉ học được nội dung có khối lớp nhỏ hơn hoặc bằng khối của mình. Giáo viên/admin không bị chặn. */
export async function assertStudentContentOpen(userId: string, role: string, contentGrade: unknown) {
  if (role !== "student") return;
  const studentGrade = await loadStudentGrade(userId);
  const required = coerceGrade(contentGrade);
  if (required > studentGrade) {
    throw new HttpError(403, `Em cần lên Lớp ${required} để mở khoá chặng này nhé!`);
  }
}
