"use client";

import { useState } from "react";
import { Card } from "../ui";
import { AuthorQuiz } from "./AuthorQuiz";
import { MultiplayerRace } from "./MultiplayerRace";
import { SpellingHunt } from "./SpellingHunt";
import { TypingRace } from "./TypingRace";

type GameId = "spelling" | "typing" | "race" | "quiz";

const GAMES: { id: GameId; emoji: string; title: string; desc: string; reward: string; active: string }[] = [
  {
    id: "spelling",
    emoji: "👮‍♂️",
    title: "Cảnh sát Chính tả",
    desc: "Tìm từ viết sai & sửa lại",
    reward: "+10 EXP / câu đúng",
    active: "bg-sky-pastel ring-sky-300 dark:ring-sky-700",
  },
  {
    id: "typing",
    emoji: "⌨️",
    title: "Bàn phím Siêu tốc",
    desc: "Gõ lại trích đoạn văn hay",
    reward: "5–20 EXP theo tốc độ",
    active: "bg-pink-pastel ring-pink-300 dark:ring-pink-700",
  },
  {
    id: "race",
    emoji: "🏁",
    title: "Đua Tốc Độ Gõ",
    desc: "Tạo phòng, đua gõ cùng bạn bè",
    reward: "+10 EXP, về nhất +20",
    active: "bg-peach-pastel ring-orange-300 dark:ring-orange-700",
  },
  {
    id: "quiz",
    emoji: "🧠",
    title: "Tác giả – Tác phẩm",
    desc: "Trắc nghiệm kiến thức THCS",
    reward: "+2 EXP / câu, +10 nếu đúng hết",
    active: "bg-mint-pastel ring-emerald-300 dark:ring-emerald-700",
  },
];

/** Góc Giải Trí – mini-game chạy hoàn toàn ở client, thưởng EXP qua `onReward` (game.addExp). */
export function GameCorner({
  onReward,
  raceInvite = null,
}: {
  onReward: (exp: number) => void;
  /** Mã phòng lấy từ link mời / mã QR. */
  raceInvite?: string | null;
}) {
  const [game, setGame] = useState<GameId>(raceInvite ? "race" : "spelling");

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-extrabold">🎮 Góc Giải Trí</h2>
        <p className="text-sm font-semibold text-ink/60">Vừa chơi vừa học – chơi xong là có EXP để lên cấp nhé!</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GAMES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGame(g.id)}
              aria-pressed={game === g.id}
              className={`group rounded-2xl p-4 text-left transition duration-300 ease-bounce hover:-translate-y-1 hover:shadow-pop active:scale-95 ${
                game === g.id ? `${g.active} ring-4` : "bg-cream"
              }`}
            >
              <span className="block text-3xl transition duration-300 ease-bounce" aria-hidden>
                {g.emoji}
              </span>
              <span className="mt-1 block font-extrabold">{g.title}</span>
              <span className="block text-sm font-semibold text-ink/60">{g.desc}</span>
              <span className="mt-2 inline-block rounded-full bg-lemon-pastel px-2.5 py-0.5 text-xs font-extrabold text-amber-700 dark:text-amber-300">
                🎁 {g.reward}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {game === "spelling" && <SpellingHunt onReward={onReward} />}
      {game === "typing" && <TypingRace onReward={onReward} />}
      {game === "race" && <MultiplayerRace onReward={onReward} invite={raceInvite} />}
      {game === "quiz" && <AuthorQuiz onReward={onReward} />}
    </div>
  );
}
