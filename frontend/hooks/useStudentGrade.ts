"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_STUDENT_GRADE } from "@/lib/grades";

/**
 * Khối lớp của học sinh đang đăng nhập.
 * `ready` = false khi phiên chưa khôi phục xong – UI phải chờ, không được coi là khoá hết.
 * Giáo viên/admin có `grade: null` (xem trước, không khoá).
 */
export function useStudentGrade() {
  const { user, status } = useAuth();
  const ready = status === "authenticated" && user != null;
  if (!ready || user.role !== "student") return { ready, grade: null as number | null };
  const grade = user.grade;
  return { ready, grade: typeof grade === "number" && grade > 0 ? grade : DEFAULT_STUDENT_GRADE };
}
