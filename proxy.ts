import { NextResponse, type NextRequest } from "next/server";
import {
  AI_RULES_GLOBAL,
  AI_RULES_PER_IP,
  DEFAULT_API_RULES,
  consume,
  getClientIp,
  type Check,
} from "@/lib/rate-limit";

/**
 * Proxy (tên mới của Middleware từ Next.js 16) – chạy trước mọi request /api/*.
 * 1. Chặn body quá lớn (tránh tốn RAM / token).
 * 2. Rate limit theo IP + giới hạn tổng toàn server cho API gọi AI.
 */

const MAX_BODY_BYTES = 16 * 1024; // 16KB là dư cho đoạn văn 300 chữ + lịch sử chat

export function proxy(req: NextRequest) {
  if (req.method === "OPTIONS" || req.method === "HEAD") return NextResponse.next();

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Nội dung gửi lên quá dài, em rút gọn lại nhé!" }, { status: 413 });
  }

  const ip = getClientIp(req.headers);
  const isAI = req.nextUrl.pathname === "/api/ai" || req.nextUrl.pathname.startsWith("/api/ai/");

  const checks: Check[] = isAI
    ? [
        ...AI_RULES_PER_IP.map((rule) => ({ id: ip, rule })),
        ...AI_RULES_GLOBAL.map((rule) => ({ id: "global", rule })),
      ]
    : DEFAULT_API_RULES.map((rule) => ({ id: ip, rule }));

  const result = consume(checks);
  const resetSec = Math.ceil(result.resetMs / 1000);

  if (!result.ok) {
    console.warn(`[rate-limit] chặn ${ip} ${req.method} ${req.nextUrl.pathname} (rule: ${result.rule.name})`);
    return NextResponse.json(
      { error: result.rule.message, retryAfter: resetSec },
      {
        status: 429,
        headers: {
          "Retry-After": String(resetSec),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(resetSec),
        },
      },
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(result.limit));
  res.headers.set("X-RateLimit-Remaining", String(result.remaining));
  res.headers.set("X-RateLimit-Reset", String(resetSec));
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
