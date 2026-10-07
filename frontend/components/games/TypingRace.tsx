"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, Keyboard, Lightbulb, RotateCcw, Shuffle, Timer, Target, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { popConfetti } from "@/lib/confetti";
import { api } from "@/utils/apiClient";
import { useGameQuestions } from "@/hooks/useGameQuestions";
import type { TypingPassage } from "@/lib/games-data";
import { getWordHint, type WordHint } from "@/lib/telex";
import { canon } from "@/lib/vietnamese";
import { BouncyButton, Card } from "../ui";
import { GameFetchState } from "./shared";
import { keyIdFromCode, VirtualKeyboard } from "./VirtualKeyboard";

function getStats(typed: string, target: string, elapsedMs: number, done: boolean) {
  let correctChars = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) correctChars++;
  const accuracy = typed.length ? Math.round((correctChars / typed.length) * 100) : 100;

  // WPM tính theo số TỪ gõ đúng hoàn chỉnh (từ cuối đang gõ dở thì chưa tính).
  const targetWords = target.split(" ");
  const typedWords = typed.split(" ");
  const complete = done ? typedWords.length : typedWords.length - 1;
  let correctWords = 0;
  for (let i = 0; i < complete; i++) if (typedWords[i] === targetWords[i]) correctWords++;
  const minutes = Math.max(elapsedMs, 3000) / 60_000; // tránh WPM "ảo" trong vài giây đầu
  const wpm = Math.round(correctWords / minutes);

  return { accuracy, wpm, correctWords };
}

/** EXP thưởng theo tốc độ – chính xác dưới 70% chỉ nhận thưởng an ủi. */
function rewardFor(wpm: number, accuracy: number) {
  if (accuracy < 70) return 5;
  return 10 + (wpm >= 40 ? 10 : wpm >= 25 ? 5 : 0);
}

type Result = { wpm: number; accuracy: number; seconds: number; exp: number };

export function TypingRace({ onReward }: { onReward: (exp: number) => void }) {
  const { user } = useAuth();
  const { items, error, retry } = useGameQuestions("typing");
  const passages = (items ?? []) as TypingPassage[];
  const [passageIdx, setPassageIdx] = useState(0);
  const [input, setInput] = useState("");
  const [startAt, setStartAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [pressed, setPressed] = useState<ReadonlySet<string>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const passage = passages[passageIdx];
  const target = passage ? canon(passage.text) : "";
  const typed = canon(input).slice(0, target.length);
  const elapsed = startAt ? Math.max(0, (now || startAt) - startAt) : 0;
  const live = getStats(typed, target, elapsed, false);
  const hint = result ? null : getWordHint(target, typed);

  const togglePressed = (e: KeyboardEvent, down: boolean) => {
    const id = keyIdFromCode(e.code);
    if (!id) return;
    setPressed((prev) => {
      if (prev.has(id) === down) return prev;
      const next = new Set(prev);
      if (down) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Đồng hồ chạy trong lúc đang gõ.
  useEffect(() => {
    if (!startAt || result) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startAt, result]);

  const onChange = (value: string) => {
    if (result) return;
    const t = Date.now();
    const start = startAt ?? t;
    if (!startAt) setStartAt(t);
    setNow(t);
    setInput(value);

    const nextTyped = canon(value);
    if (nextTyped.length >= target.length) {
      const final = getStats(nextTyped.slice(0, target.length), target, t - start, true);
      const exp = rewardFor(final.wpm, final.accuracy);
      setResult({ wpm: final.wpm, accuracy: final.accuracy, seconds: Math.round((t - start) / 1000), exp });
      onReward(exp);
      // Lịch sử WPM để giáo viên theo dõi (GET /api/admin/students → bestWpm); lỗi thì bỏ qua, không ảnh hưởng game.
      if (user?.role === "student") {
        api.progress
          .addWpm({ wpm: Math.min(final.wpm, 400), accuracy: final.accuracy, game: "typing-race" })
          .catch((err) => console.warn("[TypingRace] Không lưu được WPM:", err));
      }
      popConfetti();
    }
  };

  const reset = (nextIdx = passageIdx) => {
    setPassageIdx(nextIdx);
    setInput("");
    setStartAt(null);
    setNow(0);
    setResult(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  if (error || !items || !passage) {
    return (
      <GameFetchState
        title="Bàn phím Siêu tốc"
        loading={!items && !error}
        error={error}
        empty={!!items && passages.length === 0}
        onRetry={retry}
      />
    );
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-xl font-extrabold">
          <span className="text-3xl" aria-hidden>
            ⌨️
          </span>
          Bàn phím Siêu tốc
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {passages.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => reset(i)}
              className={`rounded-full px-3 py-1.5 text-sm font-bold transition duration-300 ease-bounce hover:-translate-y-0.5 ${
                i === passageIdx ? "bg-sky-300 text-sky-950" : "bg-cream text-ink/70"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Chỉ số thời gian thực */}
      <div className="grid grid-cols-3 gap-3">
        <Stat icon={<Zap className="h-4 w-4" />} label="Tốc độ" value={`${live.wpm}`} unit="từ/phút" tone="bg-pink-pastel" />
        <Stat icon={<Target className="h-4 w-4" />} label="Chính xác" value={`${live.accuracy}`} unit="%" tone="bg-mint-pastel" />
        <Stat icon={<Timer className="h-4 w-4" />} label="Thời gian" value={`${Math.floor(elapsed / 1000)}`} unit="giây" tone="bg-sky-pastel" />
      </div>

      {/* Đoạn văn mẫu, tô màu theo từng kí tự đã gõ */}
      <div className="rounded-2xl bg-cream p-5">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-ink/40">📖 {passage.source}</p>
        <p className="select-none text-lg leading-relaxed sm:text-xl" aria-label={passage.text}>
          {[...target].map((ch, i) => {
            let cls =
              hint && i >= hint.start && i < hint.end
                ? "text-ink/70 underline decoration-sky-400 decoration-[3px] underline-offset-[6px]"
                : "text-ink/40";
            if (i < typed.length) {
              cls =
                typed[i] === ch
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "rounded bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-200";
            } else if (i === typed.length) {
              cls = "rounded bg-pink-pastel text-ink border-b-4 border-pink-400 animate-pulse";
            }
            return (
              <span key={i} className={`font-bold ${cls}`}>
                {ch}
              </span>
            );
          })}
        </p>
      </div>

      {hint && <TelexHint hint={hint} />}

      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
          togglePressed(e, true);
        }}
        onKeyUp={(e) => togglePressed(e, false)}
        onBlur={() => setPressed(new Set())}
        disabled={!!result}
        rows={3}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder="Bắt đầu gõ lại đoạn văn ở đây – đồng hồ sẽ chạy khi em gõ chữ đầu tiên! (không dán được đâu nhé 😉)"
        className="w-full resize-none rounded-2xl border-4 border-sky-pastel bg-surface p-4 text-lg font-semibold outline-none transition focus:border-sky-300 disabled:opacity-60 dark:focus:border-sky-700"
      />

      {showKeyboard && (
        <div className="hidden sm:block">
          <VirtualKeyboard next={hint?.next ?? null} pressed={pressed} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-ink/60">
        <span>
          🎁 Thưởng: 10 EXP · ≥25 từ/phút +5 · ≥40 từ/phút +10 (cần chính xác từ 70%)
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowKeyboard((v) => !v)}
            aria-pressed={showKeyboard}
            className="hidden items-center gap-1 rounded-full bg-cream px-3 py-1.5 font-bold transition duration-300 ease-bounce hover:-translate-y-0.5 sm:inline-flex"
          >
            <Keyboard className="h-4 w-4" /> {showKeyboard ? "Ẩn bàn phím" : "Hiện bàn phím"}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1.5 font-bold transition duration-300 ease-bounce hover:-translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" /> Gõ lại
          </button>
        </div>
      </div>

      {result && (
        <ResultModal
          result={result}
          onRetry={() => reset()}
          onNext={() => reset((passageIdx + 1) % passages.length)}
        />
      )}
    </Card>
  );
}

/** Gợi ý gõ Telex cho từ hiện tại: "Có" → C o s, "đau" → d d a u. */
function TelexHint({ hint }: { hint: WordHint }) {
  const nextIndex = hint.offTrack ? -1 : hint.steps.findIndex((s) => !s.done);

  return (
    <div
      aria-live="polite"
      className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${
        hint.offTrack ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30" : "border-sky-200 bg-sky-pastel/40 dark:border-sky-800"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-ink/50">
          <Lightbulb className="h-4 w-4 text-amber-500" /> Từ đang gõ
        </span>
        <span className="rounded-xl bg-surface px-3 py-1 text-2xl font-black shadow-soft">{hint.word}</span>
        <ArrowRight className="h-5 w-5 text-ink/30" aria-hidden />
        <span className="text-xs font-black uppercase tracking-widest text-ink/50">Gõ phím</span>
        <span className="flex flex-wrap items-end gap-1" aria-label={`Gõ ${hint.steps.map((s) => s.key).join("")}`}>
          {hint.steps.map((step, i) => (
            <span key={i} className="flex flex-col items-center">
              <kbd
                className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 font-sans text-lg font-black transition duration-200 ease-bounce ${
                  step.done
                    ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                    : i === nextIndex
                      ? "scale-110 bg-pink-400 text-white shadow-[0_3px_0_#db2777]"
                      : step.tone
                        ? "bg-amber-100 text-amber-800 shadow-[0_3px_0_#fcd34d] dark:bg-amber-900/50 dark:text-amber-200"
                        : "bg-surface text-ink shadow-[0_3px_0_rgb(0_0_0/0.12)]"
                }`}
              >
                {step.key}
              </kbd>
              {step.tone && <span className="mt-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-300">{step.tone}</span>}
            </span>
          ))}
        </span>
        {hint.next === " " && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-ink/60">
            rồi bấm
            <kbd className="animate-pulse rounded-lg bg-pink-400 px-3 py-1.5 font-sans text-xs font-black text-white shadow-[0_3px_0_#db2777]">
              Phím cách
            </kbd>
          </span>
        )}
      </div>

      {hint.rules.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {hint.rules.map((rule) => (
            <span key={rule.keys} className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-ink/70 shadow-soft">
              <span className="font-black text-sky-600 dark:text-sky-300">{rule.keys}</span> → {rule.result}
            </span>
          ))}
        </div>
      )}

      {hint.offTrack && (
        <p className="mt-3 text-sm font-bold text-red-600 dark:text-red-300">
          Ôi, từ này đang gõ chưa đúng! Bấm <kbd className="rounded bg-surface px-1.5 font-sans">⌫ Xoá</kbd> để sửa nhé.
          Nếu chữ không lên dấu, em nhờ người lớn bật bộ gõ tiếng Việt kiểu <b>Telex</b> (Unikey, EVKey...) nha.
        </p>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
  tone: string;
}) {
  return (
    <div className={`rounded-2xl ${tone} px-3 py-2.5 text-center`}>
      <p className="flex items-center justify-center gap-1 text-xs font-extrabold text-ink/60">
        {icon} {label}
      </p>
      <p className="text-2xl font-black tabular-nums">
        {value} <span className="text-xs font-bold text-ink/50">{unit}</span>
      </p>
    </div>
  );
}

function ResultModal({ result, onRetry, onNext }: { result: Result; onRetry: () => void; onNext: () => void }) {
  const title =
    result.accuracy < 70
      ? "Về đích rồi! Lần sau gõ cẩn thận hơn nhé 🐢"
      : result.wpm >= 40
        ? "Tay gõ thần tốc! ⚡"
        : result.wpm >= 25
          ? "Nhanh và chuẩn lắm! 🚀"
          : "Hoàn thành xuất sắc! 🌟";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm" role="dialog" aria-modal>
      <div className="w-full max-w-sm animate-pop-in space-y-4 rounded-2xl border-4 border-amber-200 bg-surface p-6 text-center shadow-pop">
        <div className="animate-bounce text-6xl" aria-hidden>
          🏆
        </div>
        <h3 className="text-xl font-black">{title}</h3>
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<Zap className="h-4 w-4" />} label="Tốc độ" value={`${result.wpm}`} unit="từ/ph" tone="bg-pink-pastel" />
          <Stat icon={<Target className="h-4 w-4" />} label="Chính xác" value={`${result.accuracy}`} unit="%" tone="bg-mint-pastel" />
          <Stat icon={<Timer className="h-4 w-4" />} label="Thời gian" value={`${result.seconds}`} unit="s" tone="bg-sky-pastel" />
        </div>
        <p className="text-lg font-extrabold text-amber-500">+{result.exp} EXP 🎁</p>
        <div className="flex justify-center gap-2">
          <BouncyButton type="button" onClick={onRetry} icon={<RotateCcw className="h-5 w-5" />} className="bg-sky-400 px-5 py-2.5 text-base">
            Gõ lại
          </BouncyButton>
          <BouncyButton type="button" onClick={onNext} icon={<Shuffle className="h-5 w-5" />} className="bg-pink-400 px-5 py-2.5 text-base">
            Đoạn khác
          </BouncyButton>
        </div>
      </div>
    </div>
  );
}
