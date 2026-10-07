"use client";

import { RotateCcw } from "lucide-react";
import { Mascot } from "../Mascot";
import { BouncyButton, Card, ErrorBox } from "../ui";

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

/** Chờ đề từ server, báo lỗi, hoặc khi giáo viên chưa thêm câu nào. */
export function GameFetchState({
  title,
  loading,
  error,
  empty,
  onRetry,
}: {
  title: string;
  loading: boolean;
  error: string | null;
  empty: boolean;
  onRetry: () => void;
}) {
  return (
    <Card className="space-y-4 py-8 text-center">
      <h3 className="text-xl font-extrabold">{title}</h3>
      {loading && <Mascot loading size="sm" messages={["Cô Cú đang mở đề chơi... 🎮", "Lấy câu hỏi từ Trạm Sạc nè! ✨"]} />}
      {error && (
        <>
          <ErrorBox message={error} />
          <BouncyButton type="button" onClick={onRetry} icon={<RotateCcw className="h-5 w-5" />} className="bg-violet-400 hover:bg-violet-500">
            Thử lại
          </BouncyButton>
        </>
      )}
      {empty && !error && (
        <p className="font-bold text-ink/60">Thầy cô chưa thêm câu hỏi cho trò này. Em quay lại sau nhé!</p>
      )}
    </Card>
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
