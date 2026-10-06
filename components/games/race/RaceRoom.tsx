"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, LogOut, WifiOff } from "lucide-react";
import { popConfetti } from "@/lib/confetti";
import type { Progress, RaceSession } from "@/lib/race-shared";
import { BouncyButton, Card, ErrorBox } from "../../ui";
import { Leaderboard } from "./Leaderboard";
import { Lobby } from "./Lobby";
import { RaceTrack, type Racer } from "./RaceTrack";
import { TypingBoard } from "./TypingBoard";
import { useRaceRoom, type RaceRoom as Room } from "./useRaceRoom";

const FINISH_EXP = 10;
const WINNER_EXP = 20;

export function RaceRoom({
  session,
  onLeave,
  onReward,
}: {
  session: RaceSession;
  onLeave: () => void;
  onReward: (exp: number) => void;
}) {
  const room = useRaceRoom(session);

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-xl font-extrabold">
          <span className="text-3xl" aria-hidden>
            🏁
          </span>
          Đua Tốc Độ Gõ
          <span className="rounded-full bg-lemon-pastel px-3 py-1 font-mono text-sm font-black tracking-widest text-amber-800 dark:text-amber-200">
            {session.roomId}
          </span>
        </h3>
        <button
          type="button"
          onClick={onLeave}
          className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-sm font-bold text-ink/70 transition duration-300 ease-bounce hover:-translate-y-0.5 hover:text-red-500"
        >
          <LogOut className="h-4 w-4" /> Rời phòng
        </button>
      </div>

      {!room.online && room.status === "ready" && (
        <p className="flex items-center gap-2 rounded-2xl bg-peach-pastel px-4 py-2.5 text-sm font-bold text-orange-800 dark:text-orange-200">
          <WifiOff className="h-4 w-4" /> Mất kết nối, đang thử kết nối lại...
        </p>
      )}

      {room.status === "connecting" && (
        <p className="flex items-center justify-center gap-2 py-10 font-bold text-ink/60">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Đang vào phòng...
        </p>
      )}

      {room.status === "error" && (
        <div className="space-y-4 text-center">
          <ErrorBox message={room.error ?? "Không vào được phòng."} />
          <BouncyButton type="button" onClick={onLeave} className="bg-sky-400">
            Quay lại
          </BouncyButton>
        </div>
      )}

      {room.status === "ready" &&
        (room.round ? <RaceView room={room} onReward={onReward} /> : <Lobby room={room} roomId={session.roomId} />)}
    </Card>
  );
}

/* ------------------------------------------------------------------ */

function RaceView({ room, onReward }: { room: Room; onReward: (exp: number) => void }) {
  const round = room.round!;
  const now = useNow(round.startsAt);
  const started = now >= round.startsAt;
  const meId = room.me.id;

  const { lanes, ranking, over } = useMemo(() => {
    const present = new Set(room.members);
    const finishOrder = round.participants
      .filter((id) => room.progress[id]?.finishMs != null)
      .sort((a, b) => room.progress[a].finishMs! - room.progress[b].finishMs!);

    const lanes: Racer[] = round.participants.map((id) => ({
      player: room.roster[id] ?? { id, name: "Bạn ẩn danh", avatar: "🚗" },
      progress: room.progress[id],
      present: present.has(id),
      place: finishOrder.includes(id) ? finishOrder.indexOf(id) + 1 : null,
    }));

    const ranking = [...lanes].sort(
      (a, b) =>
        (a.place ?? Infinity) - (b.place ?? Infinity) ||
        (b.progress?.wordsDone ?? 0) - (a.progress?.wordsDone ?? 0) ||
        Number(b.present) - Number(a.present),
    );

    // Ván kết thúc khi mọi tay đua còn trong phòng đều đã về đích (người thoát giữa chừng không chặn ván).
    const over = lanes.every((r) => !r.present || r.place !== null);
    return { lanes, ranking, over };
  }, [room.members, room.roster, room.progress, round.participants]);

  const isRacer = round.participants.includes(meId);
  const myFinished = room.progress[meId]?.finishMs != null;

  const onProgress = (progress: Progress) => {
    room.reportProgress(progress);
    if (progress.finishMs === null) return;
    const someoneAhead = Object.entries(room.progress).some(([id, p]) => id !== meId && p.finishMs !== null);
    onReward(someoneAhead ? FINISH_EXP : WINNER_EXP);
    popConfetti();
  };

  return (
    <div className="space-y-5">
      {!started && <Countdown msLeft={round.startsAt - now} />}

      <RaceTrack racers={lanes} meId={meId} />

      {!isRacer && !over && (
        <p className="rounded-2xl bg-sky-pastel/60 px-4 py-3 text-center text-sm font-bold text-ink/70">
          👀 Em vào phòng khi ván đang chạy nên đang ở chế độ xem – ván sau sẽ được đua nhé!
        </p>
      )}

      {isRacer && !myFinished && !over ? (
        <TypingBoard key={round.id} words={round.words} startsAt={round.startsAt} started={started} onProgress={onProgress} />
      ) : (
        <Leaderboard racers={ranking} meId={meId} over={over} isHost={room.isHost} onReset={room.resetGame} />
      )}
    </div>
  );
}

/** Đồng hồ cục bộ: chạy nhanh trong lúc đếm ngược, rồi dừng hẳn khi đã xuất phát. */
function useNow(until: number) {
  const [now, setNow] = useState(() => Date.now());
  const done = now >= until;
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [done]);
  return now;
}

function Countdown({ msLeft }: { msLeft: number }) {
  const n = Math.ceil(msLeft / 1000);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 backdrop-blur-sm" role="alert">
      <div key={n} className="animate-pop-in text-center">
        <p className="text-[9rem] font-black leading-none text-white drop-shadow-[0_6px_0_rgb(236_72_153)]">{n}</p>
        <p className="mt-2 rounded-full bg-white/90 px-5 py-2 text-lg font-extrabold text-ink shadow-pop dark:bg-surface">
          Chuẩn bị... đặt tay lên bàn phím nào! ⌨️
        </p>
      </div>
    </div>
  );
}
