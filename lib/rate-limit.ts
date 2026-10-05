/**
 * Rate limiter dạng "sliding window log", lưu trong bộ nhớ của process.
 *
 * ⚠️ Phù hợp khi chạy 1 server Node (next start, VPS, Docker 1 instance).
 * Nếu deploy nhiều instance / serverless (Vercel...), mỗi instance có bộ nhớ riêng →
 * nên thay `store` bằng Redis (VD: @upstash/ratelimit) để giới hạn được chia sẻ.
 */

export type Rule = {
  /** Tên rule, dùng làm tiền tố key và để debug. */
  name: string;
  /** Số request tối đa trong một cửa sổ thời gian. */
  limit: number;
  /** Độ dài cửa sổ (ms). */
  windowMs: number;
  /** Thông báo trả về cho học sinh khi vượt giới hạn. */
  message: string;
};

export type RateLimitResult =
  | { ok: true; limit: number; remaining: number; resetMs: number }
  | { ok: false; rule: Rule; limit: number; remaining: 0; resetMs: number };

/** key → danh sách mốc thời gian (ms) của các request còn nằm trong cửa sổ. */
const store = new Map<string, number[]>();
let callsSinceCleanup = 0;

function prune(key: string, windowMs: number, now: number) {
  const hits = store.get(key);
  if (!hits) return [];
  const cutoff = now - windowMs;
  let i = 0;
  while (i < hits.length && hits[i] <= cutoff) i++;
  if (i > 0) hits.splice(0, i);
  return hits;
}

/** Dọn các key không còn request nào trong cửa sổ dài nhất để tránh rò rỉ bộ nhớ. */
function cleanup(now: number) {
  for (const [key, hits] of store) {
    if (!hits.length || hits[hits.length - 1] <= now - MAX_WINDOW_MS) store.delete(key);
  }
}

/** Một lần kiểm tra: áp `rule` cho đối tượng `id` (IP, "global"...). */
export type Check = { id: string; rule: Rule };

/**
 * Kiểm tra TẤT CẢ check trước, chỉ ghi nhận request khi mọi check đều cho qua
 * (tránh việc request bị chặn ở rule này nhưng vẫn bị trừ lượt ở rule khác).
 */
export function consume(checks: Check[], now = Date.now()): RateLimitResult {
  if (++callsSinceCleanup >= 500) {
    callsSinceCleanup = 0;
    cleanup(now);
  }

  let tightest: { limit: number; remaining: number; resetMs: number } | null = null;

  for (const { id, rule } of checks) {
    const hits = prune(`${rule.name}:${id}`, rule.windowMs, now);
    const resetMs = hits.length ? hits[0] + rule.windowMs - now : rule.windowMs;

    if (hits.length >= rule.limit) {
      return { ok: false, rule, limit: rule.limit, remaining: 0, resetMs };
    }
    const remaining = rule.limit - hits.length - 1;
    if (!tightest || remaining < tightest.remaining) tightest = { limit: rule.limit, remaining, resetMs };
  }

  for (const { id, rule } of checks) {
    const key = `${rule.name}:${id}`;
    const hits = store.get(key);
    if (hits) hits.push(now);
    else store.set(key, [now]);
  }

  return { ok: true, ...(tightest ?? { limit: 0, remaining: 0, resetMs: 0 }) };
}

/** Dùng cho test hoặc khi cần reset thủ công. */
export function resetRateLimits() {
  store.clear();
}

/** Lấy IP client. Chỉ tin header proxy khi app chạy sau reverse proxy đáng tin (Nginx, Vercel...). */
export function getClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

const envInt = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
/** Cửa sổ dài nhất trong các rule bên dưới – key cũ hơn mốc này được dọn đi. */
const MAX_WINDOW_MS = DAY;

/** Giới hạn cho các API gọi AI (tốn token). */
export const AI_RULES_PER_IP: Rule[] = [
  {
    name: "ai-burst",
    limit: envInt("RATE_LIMIT_AI_PER_MINUTE", 8),
    windowMs: MINUTE,
    message: "Em hỏi nhanh quá, Cô Cú theo không kịp! Nghỉ tay một phút rồi thử lại nhé 🦉",
  },
  {
    name: "ai-daily",
    limit: envInt("RATE_LIMIT_AI_PER_DAY", 150),
    windowMs: DAY,
    message: "Hôm nay em đã học rất chăm rồi! Cô Cú cần sạc pin, mai mình học tiếp nhé 🔋",
  },
];

/** Giới hạn chung cho toàn server – chặn trường hợp nhiều IP cùng spam làm cạn quota API key. */
export const AI_RULES_GLOBAL: Rule[] = [
  {
    name: "ai-global",
    limit: envInt("RATE_LIMIT_AI_GLOBAL_PER_MINUTE", 120),
    windowMs: MINUTE,
    message: "Trạm Sạc đang đông bạn quá, em đợi một chút rồi thử lại nhé 🚦",
  },
];

/** Giới hạn mặc định cho các API khác. */
export const DEFAULT_API_RULES: Rule[] = [
  {
    name: "api",
    limit: envInt("RATE_LIMIT_API_PER_MINUTE", 60),
    windowMs: MINUTE,
    message: "Có quá nhiều yêu cầu, em thử lại sau ít phút nhé!",
  },
];
