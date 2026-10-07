import { getToken } from "@/utils/apiClient";
import type { AIRequest, AIResponseMap } from "./types";

/**
 * Gọi endpoint chung /api/ai (Route Handler nội bộ của Next.js), có type an toàn theo actionType.
 * Kèm JWT để route `lesson_hint` đọc câu hỏi từ Backend thay mặt học sinh.
 */
export async function callAI<R extends AIRequest>(
  request: R,
): Promise<AIResponseMap[R["actionType"]] & { demo?: boolean }> {
  const token = getToken();
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: JSON.stringify(request),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra, em thử lại nhé!");
  return data;
}

export const errorMessage = (err: unknown) =>
  err instanceof Error && err.message ? err.message : "Có lỗi xảy ra, em thử lại nhé!";
