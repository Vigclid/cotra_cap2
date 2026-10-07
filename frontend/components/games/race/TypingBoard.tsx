"use client";

import { useEffect, useRef, useState } from "react";
import type { Progress } from "@/lib/race-shared";
import { canon } from "@/lib/vietnamese";

/**
 * Khu vực gõ chữ: mỗi lần chỉ gõ một từ. Bấm phím cách khi từ đã đúng → sang từ mới và báo tiến độ;
 * từ còn sai thì phím cách bị chặn để em sửa lại.
 */
export function TypingBoard({
  words,
  startsAt,
  started,
  onProgress,
}: {
  words: string[];
  startsAt: number;
  started: boolean;
  onProgress: (progress: Progress) => void;
}) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [rejected, setRejected] = useState(false);
  const [shaking, setShaking] = useState(false);
  const keystrokes = useRef({ correct: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (started) inputRef.current?.focus();
  }, [started]);

  useEffect(() => {
    if (!shaking) return;
    const timer = setTimeout(() => setShaking(false), 450);
    return () => clearTimeout(timer);
  }, [shaking]);

  const word = words[index];
  const typed = canon(input);

  const stats = (wordsDone: number, finishMs: number | null): Progress => {
    const { correct, total } = keystrokes.current;
    const minutes = Math.max(Date.now() - startsAt, 3000) / 60_000;
    return {
      wordsDone,
      total: words.length,
      wpm: Math.round(wordsDone / minutes),
      accuracy: total ? Math.round((correct / total) * 100) : 100,
      finishMs,
    };
  };

  const onChange = (raw: string) => {
    if (!started || !word) return;
    const value = canon(raw);

    // Độ chính xác: so từng kí tự mới gõ thêm với kí tự mong đợi (bộ gõ đổi "o"→"ó" không tính là gõ thêm).
    if (value.length > typed.length) {
      const expected = `${word} `;
      for (let i = typed.length; i < value.length; i++) {
        keystrokes.current.total++;
        if (value[i] === expected[i]) keystrokes.current.correct++;
      }
    }

    const isLast = index === words.length - 1;
    if (value.includes(" ")) {
      if (value.split(" ")[0] === word && !isLast) {
        setIndex(index + 1);
        setInput("");
        setRejected(false);
        onProgress(stats(index + 1, null));
      } else {
        setInput(raw.replace(/\s/g, ""));
        setRejected(true);
        setShaking(true);
      }
      return;
    }

    if (isLast && value === word) {
      setIndex(words.length);
      setInput("");
      onProgress(stats(words.length, Date.now() - startsAt));
      return;
    }
    setInput(raw);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-cream p-5" aria-label="Đề thi">
        <p className="flex flex-wrap gap-x-2.5 gap-y-2 text-xl font-bold leading-relaxed sm:text-2xl">
          {words.map((w, i) =>
            i < index ? (
              <span key={i} className="text-emerald-600 dark:text-emerald-400">
                {w}
              </span>
            ) : i === index ? (
              <CurrentWord key={i} word={w} typed={typed} />
            ) : (
              <span key={i} className="text-ink/35">
                {w}
              </span>
            ),
          )}
        </p>
      </div>

      <div>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          disabled={!started}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="Ô gõ chữ"
          placeholder={started ? "Gõ từ được tô vàng rồi bấm phím cách ␣" : "Chuẩn bị nào..."}
          className={`w-full rounded-2xl border-4 bg-surface px-5 py-4 text-2xl font-bold outline-none transition disabled:opacity-60 ${
            shaking ? "animate-shake" : ""
          } ${
            typed && !word?.startsWith(typed)
              ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
              : "border-sky-pastel focus:border-sky-300 dark:focus:border-sky-700"
          }`}
        />
        {rejected && typed !== word && (
          <p className="mt-2 animate-pop-in text-sm font-bold text-red-500 dark:text-red-300">
            Từ chưa đúng – em sửa lại rồi mới bấm phím cách nhé!
          </p>
        )}
      </div>
    </div>
  );
}

/** Từ đang gõ: nền vàng, từng kí tự xanh (đúng) / đỏ nhạt (sai), kí tự gõ thừa hiện đỏ phía sau. */
function CurrentWord({ word, typed }: { word: string; typed: string }) {
  const chars = [...word];
  const extra = [...typed].slice(chars.length).join("");
  return (
    <span className="relative rounded-xl bg-lemon-pastel px-1.5 ring-4 ring-amber-200 dark:ring-amber-800">
      {chars.map((ch, i) => (
        <span
          key={i}
          className={
            i >= typed.length
              ? "text-ink"
              : typed[i] === ch
                ? "text-emerald-600 dark:text-emerald-400"
                : "rounded bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200"
          }
        >
          {ch}
        </span>
      ))}
      {extra && <span className="rounded bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200">{extra}</span>}
    </span>
  );
}
