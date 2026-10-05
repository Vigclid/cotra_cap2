"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { RotateCcw, Shuffle, Timer, Target, Zap } from "lucide-react";
import { popConfetti } from "@/lib/confetti";
import { TYPING_PASSAGES } from "@/lib/games-data";
import { BouncyButton, Card } from "../ui";

/**
 * Chuẩn hóa tiếng Việt để so sánh công bằng:
 * - NFC: gộp dấu tổ hợp (bộ gõ trên macOS/iOS có thể sinh dạng NFD).
 * - Thống nhất vị trí dấu thanh kiểu mới: "òa"→"oà", "óe"→"oé", "ủy"→"uỷ"
 *   (học sinh gõ "thủy" hay "thuỷ" đều được tính đúng).
 */
const TONES = "̣̀́̃̉";
function canon(s: string) {
  return s
    .replace(/\s/g, " ")
    .normalize("NFD")
    .replace(new RegExp(`([oO])([${TONES}])([aAeE])`, "g"), "$1$3$2")
    .replace(new RegExp(`([uU])([${TONES}])([yY])`, "g"), "$1$3$2")
    .normalize("NFC");
}

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
  const [passageIdx, setPassageIdx] = useState(0);
  const [input, setInput] = useState("");
  const [startAt, setStartAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const passage = TYPING_PASSAGES[passageIdx];
  const target = canon(passage.text);
  const typed = canon(input).slice(0, target.length);
  const elapsed = startAt ? Math.max(0, (now || startAt) - startAt) : 0;
  const live = getStats(typed, target, elapsed, false);

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
          {TYPING_PASSAGES.map((p, i) => (
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
            let cls = "text-ink/40";
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

      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        disabled={!!result}
        rows={3}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder="Bắt đầu gõ lại đoạn văn ở đây – đồng hồ sẽ chạy khi em gõ chữ đầu tiên! (không dán được đâu nhé 😉)"
        className="w-full resize-none rounded-2xl border-4 border-sky-pastel bg-surface p-4 text-lg font-semibold outline-none transition focus:border-sky-300 disabled:opacity-60 dark:focus:border-sky-700"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-ink/60">
        <span>
          🎁 Thưởng: 10 EXP · ≥25 từ/phút +5 · ≥40 từ/phút +10 (cần chính xác từ 70%)
        </span>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1.5 font-bold transition duration-300 ease-bounce hover:-translate-y-0.5"
        >
          <RotateCcw className="h-4 w-4" /> Gõ lại
        </button>
      </div>

      {result && (
        <ResultModal
          result={result}
          onRetry={() => reset()}
          onNext={() => reset((passageIdx + 1) % TYPING_PASSAGES.length)}
        />
      )}
    </Card>
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
