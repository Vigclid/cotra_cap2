"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { callAI, errorMessage } from "@/lib/api-client";
import { MAX_DRAFT_CHARS } from "@/lib/types";
import { Mascot } from "../Mascot";
import { ErrorBox, Markdown } from "../ui";
import type { SaveDraftFn, SaveFn } from "./shared";

const HINT_LOADING = [
  "Cô Cú đang lật lại trang sách... 📖",
  "Cô đang đọc vở nháp của em đó 👀",
  "Sắp có gợi ý rồi, chờ cô xíu nhé! ✨",
];

const AUTOSAVE_MS = 1000;

type SaveStatus = "idle" | "saving" | "saved" | "error";

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "Tự động lưu",
  saving: "✏️ Đang lưu...",
  saved: "Đã lưu ✓",
  error: "⚠️ Lưu thất bại – thử lại",
};

export function QuestionCard({
  storageKey,
  lessonId,
  textIndex,
  questionIndex,
  question,
  saved,
  hint,
  onSaveDraft,
  onSaveHint,
  onDraftChange,
}: {
  storageKey: string;
  lessonId: number;
  textIndex: number;
  questionIndex: number;
  question: string;
  saved: string;
  hint?: string;
  onSaveDraft: SaveDraftFn;
  onSaveHint: SaveFn;
  /** Cập nhật ngay khi gõ, để nút hoàn thành chặng phản ánh nội dung đang có trên vở. */
  onDraftChange: (value: string) => void;
}) {
  const [text, setText] = useState(saved);
  const [status, setStatus] = useState<SaveStatus>(saved.trim() ? "saved" : "idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Nội dung chưa kịp lưu – được ghi ngay khi blur, xin gợi ý hoặc unmount (đóng modal). */
  const pending = useRef<string | null>(null);
  /** Nội dung server đã xác nhận – gõ lại y hệt thì khỏi gọi API. */
  const lastSaved = useRef(saved);
  /** Hàng đợi tuần tự: request sau chỉ chạy khi request trước xong → bản cũ không đè được bản mới trên server. */
  const queue = useRef<Promise<void>>(Promise.resolve());

  const flush = useCallback(() => {
    const value = pending.current;
    if (value === null) return queue.current;
    pending.current = null;
    if (value === lastSaved.current) return queue.current;

    setStatus("saving");
    queue.current = queue.current.then(async () => {
      try {
        await onSaveDraft({ lessonId, textIndex, questionIndex }, value);
        lastSaved.current = value;
        // Trong lúc chờ mà em đã gõ tiếp thì vẫn giữ "Đang lưu...".
        if (pending.current === null) setStatus("saved");
      } catch {
        pending.current ??= value;
        setStatus("error");
      }
    });
    return queue.current;
  }, [onSaveDraft, lessonId, textIndex, questionIndex]);

  // Debounce: chỉ gọi API khi em ngừng gõ AUTOSAVE_MS.
  useEffect(() => {
    if (pending.current === null) return;
    const timer = setTimeout(flush, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [text, flush]);

  useEffect(() => () => void flush(), [flush]);

  const onChange = (value: string) => {
    const next = value.slice(0, MAX_DRAFT_CHARS);
    setText(next);
    pending.current = next;
    onDraftChange(next);
    setStatus(next === lastSaved.current ? (next.trim() ? "saved" : "idle") : "saving");
  };

  const askHint = async () => {
    void flush();
    setLoading(true);
    setError(null);
    try {
      const data = await callAI({
        actionType: "lesson_hint",
        payload: { lessonId, textIndex, questionIndex, draft: text },
      });
      onSaveHint(storageKey, data.hint);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const textareaId = `draft-${storageKey}`;

  return (
    <li className="space-y-3 rounded-2xl border border-ink/5 bg-cream/60 p-4">
      <div className="flex gap-3">
        <span className="h-fit shrink-0 rounded-full bg-violet-200 px-2.5 py-0.5 text-xs font-black text-violet-900">
          Câu {questionIndex + 1}
        </span>
        <p className="font-bold leading-relaxed">{question}</p>
      </div>

      <button
        type="button"
        onClick={askHint}
        disabled={loading}
        className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-200 via-violet-200 to-sky-200 px-4 py-2 text-sm font-extrabold text-violet-900 shadow-soft transition duration-300 ease-bounce hover:-translate-y-0.5 hover:shadow-pop active:scale-95 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
      >
        <Sparkles className="h-4 w-4 group-hover:animate-wiggle" />
        {hint ? "Nhờ cô gợi ý thêm" : "Nhờ cô giáo AI gợi ý"}
      </button>

      {loading && (
        <div className="animate-pop-in rounded-2xl bg-sky-pastel/60 px-4 py-3">
          <Mascot loading size="sm" messages={HINT_LOADING} />
        </div>
      )}
      {error && !loading && <ErrorBox message={error} />}
      {hint && !loading && (
        <div
          key={hint}
          className="animate-pop-in rounded-2xl rounded-tl-sm border-2 border-sky-200 bg-sky-pastel px-4 py-3 text-[15px] leading-relaxed text-sky-950 dark:border-sky-800 dark:text-sky-100 [&_p]:my-1.5"
        >
          <p className="mb-1 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-300">
            🦉 Cô Cú gợi ý
          </p>
          <Markdown>{hint}</Markdown>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor={textareaId} className="text-sm font-extrabold">
            📒 Vở nháp của em
          </label>
          {status === "error" ? (
            <button
              type="button"
              onClick={() => void flush()}
              className="text-xs font-bold text-red-500 underline-offset-2 hover:underline"
              aria-live="polite"
            >
              {STATUS_TEXT.error}
            </button>
          ) : (
            <span
              className={`text-xs font-bold ${status === "saved" ? "text-emerald-600 dark:text-emerald-300" : "text-ink/45"}`}
              aria-live="polite"
            >
              {STATUS_TEXT[status]}
            </span>
          )}
        </div>
        <textarea
          id={textareaId}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => void flush()}
          rows={3}
          maxLength={MAX_DRAFT_CHARS}
          placeholder="Em thử viết câu trả lời theo ý hiểu của mình nhé..."
          className="block w-full resize-y rounded-2xl border-2 border-amber-200/70 bg-lemon-pastel/50 bg-[image:repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgb(251_191_36/0.35)_31px,rgb(251_191_36/0.35)_32px)] bg-local px-4 pb-2 pt-0 text-base font-semibold leading-8 outline-none transition placeholder:text-ink/35 focus:border-amber-300 focus:bg-lemon-pastel/80 dark:border-amber-900"
        />
        <p
          className={`mt-1 text-right text-xs font-bold tabular-nums ${
            text.length >= MAX_DRAFT_CHARS ? "text-amber-700 dark:text-amber-300" : "text-ink/40"
          }`}
        >
          {text.length}/{MAX_DRAFT_CHARS}
        </p>
      </div>
    </li>
  );
}
