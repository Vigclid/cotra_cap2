"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { BouncyButton, ErrorBox } from "../../ui";
import { MEDALS, type Racer } from "./RaceTrack";

/** Bảng xếp hạng: ai về đích trước đứng trên; người chưa xong xếp theo % tiến độ. */
export function Leaderboard({
  racers,
  meId,
  over,
  isHost,
  onReset,
}: {
  racers: Racer[];
  meId: string;
  over: boolean;
  isHost: boolean;
  onReset: () => Promise<unknown>;
}) {
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = async () => {
    setResetting(true);
    setError(null);
    try {
      await onReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setResetting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border-4 border-amber-200 bg-gradient-to-b from-lemon-pastel/70 to-surface p-5 dark:border-amber-900">
      <div className="text-center">
        <div className={`text-5xl ${over ? "animate-bounce" : "animate-float"}`} aria-hidden>
          {over ? "🏆" : "⏱️"}
        </div>
        <h4 className="mt-1 text-2xl font-black">{over ? "Chung cuộc" : "Bảng xếp hạng tạm thời"}</h4>
        {!over && <p className="text-sm font-semibold text-ink/55">Chờ các bạn khác về đích nhé...</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[22rem] border-separate border-spacing-y-1.5 text-left">
          <thead>
            <tr className="text-xs font-black uppercase tracking-wider text-ink/45">
              <th className="px-3 py-1">Hạng</th>
              <th className="px-3 py-1">Tay đua</th>
              <th className="px-3 py-1 text-right">WPM</th>
              <th className="px-3 py-1 text-right">Chính xác</th>
              <th className="px-3 py-1 text-right">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {racers.map(({ player, progress, present, place }, i) => {
              const percent = progress ? Math.round((progress.wordsDone / progress.total) * 100) : 0;
              return (
                <tr
                  key={player.id}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className={`animate-pop-in font-bold ${player.id === meId ? "bg-sky-pastel" : "bg-surface"} ${
                    present ? "" : "opacity-55"
                  }`}
                >
                  <td className="rounded-l-2xl px-3 py-2.5 text-xl">{place ? (MEDALS[place - 1] ?? `#${place}`) : "–"}</td>
                  <td className="px-3 py-2.5">
                    <span className="mr-1.5" aria-hidden>
                      {player.avatar}
                    </span>
                    {player.name}
                    {player.id === meId && <span className="ml-1 text-xs text-ink/45">(em)</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{progress?.wpm ?? 0}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{progress?.accuracy ?? 100}%</td>
                  <td className="rounded-r-2xl px-3 py-2.5 text-right text-sm tabular-nums">
                    {progress?.finishMs != null ? (
                      `${(progress.finishMs / 1000).toFixed(1)}s`
                    ) : !present ? (
                      <span className="text-slate-500">Bỏ cuộc</span>
                    ) : (
                      <span className="text-ink/50">Đang gõ {percent}%</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isHost ? (
        <div className="text-center">
          <BouncyButton
            type="button"
            onClick={reset}
            loading={resetting}
            loadingText="Đang mở ván mới..."
            icon={<RotateCcw className="h-5 w-5" />}
            className="bg-gradient-to-r from-pink-400 to-violet-400"
          >
            Chơi ván mới
          </BouncyButton>
        </div>
      ) : (
        over && <p className="text-center text-sm font-bold text-ink/55">Chờ chủ phòng mở ván mới nhé!</p>
      )}
      {error && <ErrorBox message={error} />}
    </div>
  );
}
