"use client";

import { RotateCcw } from "lucide-react";
import { BouncyButton, Card } from "../ui";

/** Tiêu đề game + thanh tiến độ. */
export function GameHeader({
  emoji,
  title,
  step,
  total,
  score,
}: {
  emoji: string;
  title: string;
  step: number;
  total: number;
  score: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xl font-extrabold">
          <span className="text-3xl" aria-hidden>
            {emoji}
          </span>
          {title}
        </h3>
        <span className="rounded-full bg-lemon-pastel px-3 py-1 text-sm font-extrabold text-amber-700 dark:text-amber-300">
          ⭐ {score}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-2.5 flex-1 rounded-full transition-colors duration-500 ${
                i < step ? "bg-gradient-to-r from-pink-300 to-sky-300" : "bg-cream"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-extrabold text-ink/60">
          Câu {step}/{total}
        </span>
      </div>
    </div>
  );
}

/** Màn hình tổng kết khi chơi xong một lượt. */
export function ResultScreen({
  emoji,
  title,
  lines,
  onRestart,
}: {
  emoji: string;
  title: string;
  lines: string[];
  onRestart: () => void;
}) {
  return (
    <Card className="animate-pop-in space-y-4 py-10 text-center">
      <div className="animate-float text-7xl" aria-hidden>
        {emoji}
      </div>
      <h3 className="text-2xl font-black">{title}</h3>
      {lines.map((l) => (
        <p key={l} className="font-bold text-ink/70">
          {l}
        </p>
      ))}
      <BouncyButton
        type="button"
        onClick={onRestart}
        icon={<RotateCcw className="h-5 w-5" />}
        className="bg-gradient-to-r from-pink-400 to-sky-400"
      >
        Chơi lại
      </BouncyButton>
    </Card>
  );
}
