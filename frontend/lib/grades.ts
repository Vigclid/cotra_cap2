export const CLASS_GRADES = [6, 7, 8, 9] as const;
export const DEFAULT_STUDENT_GRADE = 6;

export function groupByGrade<T extends { grade: number }>(items: T[]): [number, T[]][] {
  const map = new Map<number, T[]>();
  for (const item of items) {
    const grade = Number.isInteger(item.grade) && item.grade > 0 ? item.grade : DEFAULT_STUDENT_GRADE;
    const bucket = map.get(grade);
    if (bucket) bucket.push(item);
    else map.set(grade, [item]);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

/** `null` = giáo viên/admin hoặc chưa biết khối: không khoá. */
export function isGradeLocked(studentGrade: number | null, contentGrade: number) {
  return studentGrade !== null && contentGrade > studentGrade;
}

export function gradeLockMessage(grade: number, target: "chặng" | "nhân vật" = "chặng") {
  return `Em cần lên Lớp ${grade} để mở khoá ${target} này nhé!`;
}
