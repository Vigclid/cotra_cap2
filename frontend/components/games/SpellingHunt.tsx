"use client";

import { useState } from "react";
import { ArrowRight, Trophy } from "lucide-react";
import { useGameQuestions } from "@/hooks/useGameQuestions";
import { popConfetti } from "@/lib/confetti";
import type { SpellingRound } from "@/lib/games-data";
import { BouncyButton, Card } from "../ui";
import { GameFetchState, GameHeader, ResultScreen } from "./shared";

const EXP_PER_ROUND = 10;

type Phase = "find" | "fix" | "done";
type Token = { text: string; target?: boolean; plain?: boolean };

/** Tách câu thành các từ có thể bấm; cụm từ sai là một token riêng. */
function tokenize(sentence: string, wrong: string): Token[] {
  const [before, after = ""] = sentence.split(wrong);
  const punct = after.match(/^\S*/)?.[0] ?? ""; // dấu câu dính ngay sau từ sai
  const words = (s: string) => s.split(" ").filter(Boolean).map((text) => ({ text }));
  return [
    ...words(before),
    { text: wrong, target: true },
    ...(punct ? [{ text: punct, plain: true }] : []),
    ...words(after.slice(punct.length)),
  ];
}

/** Đổi thứ tự phương án theo số thứ tự câu – cố định, không dùng random để tránh lệch hydration. */
const rotate = <T,>(arr: T[], by: number) => arr.map((_, i) => arr[(i + by) % arr.length]);

export function SpellingHunt({ onReward }: { onReward: (exp: number) => void }) {
  const { items, error, retry } = useGameQuestions("spelling");
  const rounds = (items ?? []) as SpellingRound[];
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("find");
  const [missed, setMissed] = useState<number[]>([]); // token đã bấm nhầm
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (error || !items || rounds.length === 0) {
    return (
      <GameFetchState
        title="Cảnh sát Chính tả"
        loading={!items && !error}
        error={error}
        empty={!!items && rounds.length === 0}
        onRetry={retry}
      />
    );
  }

  const round = rounds[Math.min(idx, rounds.length - 1)];
  const tokens = tokenize(round.sentence, round.wrong);
  const answer = round.options[0];
  const options = rotate(round.options, idx);
  const correct = picked === answer;

  const clickToken = (t: Token, i: number) => {
    if (phase !== "find" || t.plain) return;
    if (t.target) setPhase("fix");
    else if (!missed.includes(i)) setMissed([...missed, i]);
  };

  const pick = (option: string) => {
    if (phase !== "fix") return;
    setPicked(option);
    setPhase("done");
    if (option === answer) {
      setScore((s) => s + 1);
      onReward(EXP_PER_ROUND);
      popConfetti();
    }
  };

  const next = () => {
    if (idx + 1 >= rounds.length) return setFinished(true);
    setIdx(idx + 1);
    setPhase("find");
    setMissed([]);
    setPicked(null);
  };

  const restart = () => {
    setIdx(0);
    setPhase("find");
    setMissed([]);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <ResultScreen
        emoji={score === rounds.length ? "🏅" : "👮‍♂️"}
        title={score === rounds.length ? "Cảnh sát Chính tả xuất sắc!" : "Hoàn thành nhiệm vụ!"}
        lines={[`Em bắt đúng ${score}/${rounds.length} lỗi chính tả.`, `Nhận được +${score * EXP_PER_ROUND} EXP 🎁`]}
        onRestart={restart}
      />
    );
  }

  return (
    <Card className="space-y-5">
      <GameHeader
        emoji="👮‍♂️"
        title="Cảnh sát Chính tả"
        step={idx + 1}
        total={rounds.length}
        score={`${score} lỗi đã bắt`}
      />

      <p className="rounded-2xl bg-sky-pastel px-4 py-2 text-sm font-bold text-sky-800 dark:text-sky-200">
        {phase === "find" && "🔍 Bước 1: Câu dưới đây có 1 từ viết sai. Em bấm vào từ đó nhé!"}
        {phase === "fix" && "✏️ Bước 2: Tìm ra rồi! Giờ chọn cách viết đúng nào."}
        {phase === "done" && (correct ? `🎉 Chính xác! +${EXP_PER_ROUND} EXP` : "😅 Tiếc quá, xem đáp án bên dưới nhé!")}
      </p>

      {/* Thẻ câu văn */}
      <div className="rounded-2xl border-4 border-dashed border-pink-200 bg-cream p-5 text-xl leading-loose sm:text-2xl dark:border-pink-900">
        {tokens.map((t, i) => {
          if (t.plain) return <span key={i}>{t.text}</span>;
          const isMiss = missed.includes(i);
          const found = t.target && phase !== "find";
          return (
            <span key={i}>
              {i > 0 && " "}
              <button
                type="button"
                onClick={() => clickToken(t, i)}
                disabled={phase !== "find"}
                className={`rounded-xl px-1 font-bold transition duration-300 ease-bounce ${
                  phase === "find" ? "hover:-translate-y-0.5 hover:bg-lemon-pastel" : "cursor-default"
                } ${isMiss ? "animate-wiggle text-ink/30 line-through" : ""} ${
                  found
                    ? phase === "done"
                      ? correct
                        ? "bg-mint-pastel text-emerald-700 dark:text-emerald-300"
                        : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300"
                      : "bg-pink-pastel text-pink-600 ring-2 ring-pink-300 dark:text-pink-300"
                    : ""
                }`}
              >
                {found && phase === "done" ? answer : t.text}
              </button>
            </span>
          );
        })}
      </div>

      {missed.length > 0 && phase === "find" && (
        <p className="animate-pop-in text-sm font-bold text-ink/60">
          Từ đó viết đúng rồi mà! Đọc chậm lại từng chữ xem nào 🧐
        </p>
      )}

      {phase !== "find" && (
        <div className="grid animate-pop-in gap-3 sm:grid-cols-3">
          {options.map((o) => {
            const state =
              phase === "done" ? (o === answer ? "right" : o === picked ? "wrong" : "idle") : "idle";
            return (
              <button
                key={o}
                type="button"
                onClick={() => pick(o)}
                disabled={phase === "done"}
                className={`rounded-2xl px-4 py-3 text-lg font-extrabold shadow-soft transition duration-300 ease-bounce enabled:hover:-translate-y-1 enabled:hover:shadow-pop enabled:active:scale-95 ${
                  state === "right"
                    ? "bg-mint-pastel text-emerald-700 ring-4 ring-emerald-300 dark:text-emerald-300 dark:ring-emerald-700"
                    : state === "wrong"
                      ? "animate-wiggle bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300"
                      : "bg-surface"
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      )}

      {phase === "done" && (
        <div className="flex animate-pop-in flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="rounded-2xl bg-lemon-pastel px-4 py-3 text-sm font-semibold text-amber-800 dark:text-amber-200">
            💡 {round.tip}
          </p>
          <BouncyButton
            type="button"
            onClick={next}
            icon={idx + 1 >= rounds.length ? <Trophy className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
            className="shrink-0 bg-gradient-to-r from-pink-400 to-sky-400"
          >
            {idx + 1 >= rounds.length ? "Xem kết quả" : "Câu tiếp"}
          </BouncyButton>
        </div>
      )}
    </Card>
  );
}
