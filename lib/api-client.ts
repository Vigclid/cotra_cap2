import type { AIRequest, AIResponseMap } from "./types";

/** Gọi endpoint chung /api/ai từ phía client, có type an toàn theo actionType. */
export async function callAI<R extends AIRequest>(
  request: R,
): Promise<AIResponseMap[R["actionType"]] & { demo?: boolean }> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra, em thử lại nhé!");
  return data;
}

export const errorMessage = (err: unknown) =>
  err instanceof Error && err.message ? err.message : "Có lỗi xảy ra, em thử lại nhé!";
