"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Trophy } from "lucide-react";
import { popConfetti } from "@/lib/confetti";
import { QUIZ_QUESTIONS } from "@/lib/games-data";
import { BouncyButton, Card } from "../ui";
import { GameHeader, ResultScreen } from "./shared";

const EXP_PER_CORRECT = 2;
const PERFECT_BONUS = 10;
const LETTERS = ["A", "B", "C", "D"];

export function AuthorQuiz({ onReward }: { onReward: (exp: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_QUESTIONS[idx];
  const answered = picked !== null;
  const correct = picked === q.answer;
  const isLast = idx + 1 >= QUIZ_QUESTIONS.length;

  const finish = (finalScore: number) => {
    const perfect = finalScore === QUIZ_QUESTIONS.length;
    onReward(finalScore * EXP_PER_CORRECT + (perfect ? PERFECT_BONUS : 0));
    if (perfect) popConfetti();
    setFinished(true);
  };

  const next = () => {
    if (isLast) return finish(score);
    setIdx(idx + 1);
    setPicked(null);
  };

  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  // Trả lời đúng → tự sang câu tiếp sau một nhịp; sai → ở lại đọc giải thích.
  useEffect(() => {
    if (!answered || !correct) return;
    const id = setTimeout(next, 1400);
    return () => clearTimeout(id);
  }, [answered, correct, idx]);

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const perfect = score === QUIZ_QUESTIONS.length;
    const exp = score * EXP_PER_CORRECT + (perfect ? PERFECT_BONUS : 0);
    return (
      <ResultScreen
        emoji={perfect ? "🧠" : score >= QUIZ_QUESTIONS.length / 2 ? "📚" : "🌱"}
        title={perfect ? "Không sai câu nào – Bách khoa văn học!" : "Hoàn thành bài trắc nghiệm!"}
        lines={[
          `Em trả lời đúng ${score}/${QUIZ_QUESTIONS.length} câu.`,
          exp > 0 ? `Nhận được +${exp} EXP${perfect ? " (có thưởng điểm tuyệt đối!)" : ""} 🎁` : "Ôn lại một chút rồi thử tiếp nhé!",
        ]}
        onRestart={restart}
      />
    );
  }

  return (
    <Card className="space-y-5">
      <GameHeader
        emoji="🧠"
        title="Trắc nghiệm Tác giả – Tác phẩm"
        step={idx + 1}
        total={QUIZ_QUESTIONS.length}
        score={`${score} đúng`}
      />

      {/* Flashcard câu hỏi */}
      <div
        key={idx}
        className="animate-pop-in rounded-2xl bg-gradient-to-br from-violet-100 to-pink-pastel p-6 text-center dark:from-violet-950"
      >
        <p className="text-xs font-extrabold uppercase tracking-widest text-violet-500 dark:text-violet-300">
          Câu hỏi {idx + 1}
        </p>
        <p className="mt-2 text-xl font-extrabold leading-snug sm:text-2xl">{q.question}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {q.options.map((o, i) => {
          const state = !answered ? "idle" : i === q.answer ? "right" : i === picked ? "wrong" : "dim";
          return (
            <button
              key={o}
              type="button"
              onClick={() => pick(i)}
              disabled={answered}
              className={`flex items-center gap-3 rounded-2xl p-4 text-left font-bold shadow-soft transition duration-300 ease-bounce enabled:hover:-translate-y-1 enabled:hover:shadow-pop enabled:active:scale-95 ${
                state === "right"
                  ? "bg-mint-pastel ring-4 ring-emerald-300 dark:ring-emerald-700"
                  : state === "wrong"
                    ? "animate-wiggle bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300"
                    : state === "dim"
                      ? "bg-surface opacity-50"
                      : "bg-surface"
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black ${
                  state === "right" ? "bg-emerald-400 text-white" : state === "wrong" ? "bg-red-400 text-white" : "bg-cream"
                }`}
              >
                {state === "right" ? "✓" : state === "wrong" ? "✗" : LETTERS[i]}
              </span>
              {o}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="flex animate-pop-in flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
              correct
                ? "bg-mint-pastel text-emerald-800 dark:text-emerald-200"
                : "bg-lemon-pastel text-amber-800 dark:text-amber-200"
            }`}
          >
            {correct ? "🎉 Chính xác! " : "💡 "}
            {q.explain}
          </p>
          {!correct && (
            <BouncyButton
              type="button"
              onClick={next}
              icon={isLast ? <Trophy className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
              className="shrink-0 bg-gradient-to-r from-violet-400 to-pink-400"
            >
              {isLast ? "Xem kết quả" : "Câu tiếp"}
            </BouncyButton>
          )}
        </div>
      )}
    </Card>
  );
}
