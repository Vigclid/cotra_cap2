import mongoose from "mongoose";
import { HttpError } from "./HttpError";

/** Ép giá trị (từ params/body) về số nguyên trong khoảng [min, max], sai thì ném 400. */
export function toInt(value: unknown, field: string, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}): number {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isInteger(n) || n < min || n > max) {
    throw new HttpError(400, `${field} phải là số nguyên từ ${min} đến ${max}`);
  }
  return n;
}

export const toLessonId = (value: unknown) => toInt(value, "lessonId", { min: 1 });

/** `:id` trên URL phải là ObjectId của MongoDB. */
export function toObjectId(value: unknown, field = "id"): string {
  const id = Array.isArray(value) ? value[0] : value;
  if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    throw new HttpError(400, `${field} không hợp lệ`);
  }
  return id;
}

/** Chỉ giữ lại các key được phép – chặn client ghi đè trường nhạy cảm (mass assignment). */
export function pick<T extends object, K extends string>(obj: T, keys: readonly K[]): Partial<Record<K, unknown>> {
  const source = obj as Record<string, unknown>;
  return Object.fromEntries(keys.filter((k) => source[k] !== undefined).map((k) => [k, source[k]])) as Partial<
    Record<K, unknown>
  >;
}
