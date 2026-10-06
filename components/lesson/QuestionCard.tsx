"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { callAI, errorMessage } from "@/lib/api-client";
import { MAX_DRAFT_CHARS } from "@/lib/types";
import { Mascot } from "../Mascot";
import { ErrorBox, Markdown } from "../ui";
import type { SaveFn } from "./shared";

const HINT_LOADING = [
  "Cô Cú đang lật lại trang sách... 📖",
  "Cô đang đọc vở nháp của em đó 👀",
  "Sắp có gợi ý rồi, chờ cô xíu nhé! ✨",
];

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
}: {
  storageKey: string;
  lessonId: number;
  textIndex: number;
  questionIndex: number;
  question: string;
  saved: string;
  hint?: string;
  onSaveDraft: SaveFn;
  onSaveHint: SaveFn;
}) {
  const [text, setText] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Nội dung chưa kịp lưu – được ghi ngay khi blur, xin gợi ý hoặc unmount. */
  const pending = useRef<string | null>(null);

  const flush = useCallback(() => {
    if (pending.current === null) return;
    onSaveDraft(storageKey, pending.current);
    pending.current = null;
    setSaving(false);
  }, [onSaveDraft, storageKey]);

  // Debounce 600ms sau lần gõ cuối.
  useEffect(() => {
    if (text === saved) {
      pending.current = null;
      setSaving(false);
      return;
    }
    pending.current = text;
    setSaving(true);
    const timer = setTimeout(flush, 600);
    return () => clearTimeout(timer);
  }, [text, saved, flush]);

  useEffect(() => flush, [flush]);

  const askHint = async () => {
    flush();
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
          <span className="text-xs font-bold text-ink/45" aria-live="polite">
            {saving ? "✏️ Đang lưu..." : text.trim() ? "✓ Đã lưu" : "Tự động lưu"}
          </span>
        </div>
        <textarea
          id={textareaId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={flush}
          rows={3}
          maxLength={MAX_DRAFT_CHARS}
          placeholder="Em thử viết câu trả lời theo ý hiểu của mình nhé..."
          className="block w-full resize-y rounded-2xl border-2 border-amber-200/70 bg-lemon-pastel/50 bg-[image:repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgb(251_191_36/0.35)_31px,rgb(251_191_36/0.35)_32px)] bg-local px-4 pb-2 pt-0 text-base font-semibold leading-8 outline-none transition placeholder:text-ink/35 focus:border-amber-300 focus:bg-lemon-pastel/80 dark:border-amber-900"
        />
      </div>
    </li>
  );
}
