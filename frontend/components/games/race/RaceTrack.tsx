"use client";

import type { Player, Progress } from "@/lib/race-shared";

const LANES = [
  "from-pink-pastel to-pink-100 dark:to-pink-950/40",
  "from-sky-pastel to-sky-100 dark:to-sky-950/40",
  "from-mint-pastel to-emerald-100 dark:to-emerald-950/40",
  "from-lemon-pastel to-amber-100 dark:to-amber-950/40",
  "from-peach-pastel to-orange-100 dark:to-orange-950/40",
  "from-violet-100 to-fuchsia-100 dark:from-violet-950/40 dark:to-fuchsia-950/40",
];

export type Racer = { player: Player; progress?: Progress; present: boolean; place: number | null };

/** Đường đua: mỗi tay đua một làn, xe chạy từ trái sang phải theo % hoàn thành. */
export function RaceTrack({ racers, meId }: { racers: Racer[]; meId: string }) {
  return (
    <ul className="space-y-2.5" aria-label="Đường đua">
      {racers.map(({ player, progress, present, place }, i) => {
        const percent = progress ? Math.round((progress.wordsDone / progress.total) * 100) : 0;
        const finished = progress?.finishMs != null;
        return (
          <li key={player.id} className={`transition-opacity ${present ? "" : "opacity-45"}`}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs font-extrabold">
              <span className="truncate">
                {player.name}
                {player.id === meId && <span className="ml-1 text-ink/45">(em)</span>}
                {!present && <span className="ml-1.5 rounded-full bg-slate-200 px-2 py-0.5 text-slate-600">đã rời phòng</span>}
              </span>
              <span className="shrink-0 tabular-nums text-ink/55">
                {progress?.wpm ?? 0} từ/phút · {percent}%
              </span>
            </div>
            <div
              className={`relative h-14 overflow-hidden rounded-2xl bg-gradient-to-r ${LANES[i % LANES.length]} ${
                player.id === meId ? "ring-4 ring-sky-300 dark:ring-sky-700" : ""
              }`}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Tiến độ của ${player.name}`}
            >
              <span
                className="absolute inset-y-0 left-0 bg-white/50 transition-[width] duration-700 ease-out dark:bg-white/10"
                style={{ width: `${percent}%` }}
              />
              <span className="absolute inset-y-2 right-12 border-r-4 border-dashed border-ink/15" aria-hidden />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl" aria-hidden>
                🏁
              </span>
              <span className="absolute inset-y-0 left-1 right-14" aria-hidden>
                <span
                  className="absolute top-1/2 text-4xl leading-none transition-[left,transform] duration-700 ease-bounce"
                  style={{ left: `${percent}%`, transform: `translate(-${percent}%, -50%)` }}
                >
                  <span
                    className={`inline-block ${FACING_RIGHT.has(player.avatar) ? "" : "-scale-x-100"} ${
                      finished ? "animate-bounce" : ""
                    }`}
                  >
                    {player.avatar}
                  </span>
                </span>
              </span>
              {place !== null && (
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pop-in rounded-full bg-white/90 px-3 py-1 text-sm font-black shadow-soft dark:bg-surface">
                  {MEDALS[place - 1] ?? `#${place}`} về đích
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export const MEDALS = ["🥇", "🥈", "🥉"];

/** Đa số emoji xe nhìn sang trái → lật ngang cho chạy về phía vạch đích; tên lửa & đĩa bay giữ nguyên. */
const FACING_RIGHT = new Set(["🚀", "🛸"]);
