"use client";

import { useEffect, useState } from "react";

const DEFAULT_MESSAGES = [
  "Đợi tớ xíu nha, tớ đang lật sách... 📚",
  "Hmm, để tớ suy nghĩ thật kĩ nào 🤔",
  "Sắp xong rồi, đừng đi đâu nhé! ✨",
  "Tớ đang gom chữ hay cho cậu đây 🧺",
  "Cú cú... ý tưởng đang bay tới! 🪶",
];

/**
 * Mascot Cô Cú 🦉 với bong bóng chat.
 * - `loading`: nhún nhảy + đổi câu nói liên tục.
 * - Không loading: hiển thị `message` cố định.
 */
export function Mascot({
  loading = false,
  message,
  messages = DEFAULT_MESSAGES,
  emoji = "🦉",
  size = "md",
}: {
  loading?: boolean;
  message?: string;
  messages?: string[];
  emoji?: string;
  size?: "sm" | "md";
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setIndex(Math.floor(Math.random() * messages.length));
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), 1800);
    return () => clearInterval(timer);
  }, [loading, messages.length]);

  const text = loading ? messages[index] : message;

  return (
    <div className="flex items-end gap-3" role={loading ? "status" : undefined} aria-live="polite">
      <span
        className={`select-none drop-shadow-md ${size === "sm" ? "text-4xl" : "text-6xl"} ${
          loading ? "animate-bounce" : "animate-float"
        }`}
        aria-hidden
      >
        {emoji}
      </span>
      {text && (
        <div
          key={text}
          className="relative mb-4 max-w-xs animate-pop-in rounded-2xl rounded-bl-sm bg-surface px-4 py-2.5 text-sm font-bold shadow-soft"
        >
          {text}
          {loading && (
            <span className="ml-1 inline-flex gap-0.5 align-middle" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Thẻ loading đầy đủ dùng trong các tính năng. */
export function MascotLoading({ messages }: { messages?: string[] }) {
  return (
    <div className="flex animate-pop-in justify-center rounded-2xl bg-surface/70 px-5 py-8 shadow-soft">
      <Mascot loading messages={messages} />
    </div>
  );
}
