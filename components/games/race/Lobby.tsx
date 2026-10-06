"use client";

import { useState } from "react";
import { Crown, Flag } from "lucide-react";
import { MAX_PLAYERS } from "@/lib/race-shared";
import { BouncyButton, ErrorBox } from "../../ui";
import { InvitePanel } from "./InvitePanel";
import type { RaceRoom } from "./useRaceRoom";

export function Lobby({ room, roomId }: { room: RaceRoom; roomId: string }) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const host = room.hostId ? room.roster[room.hostId] : null;

  const start = async () => {
    setStarting(true);
    setError(null);
    try {
      await room.startGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-5">
      <InvitePanel roomId={roomId} />

      <div>
        <p className="mb-2 flex items-center justify-between text-sm font-extrabold text-ink/60">
          <span>🧑‍🤝‍🧑 Tay đua trong phòng</span>
          <span>
            {room.members.length}/{MAX_PLAYERS}
          </span>
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {room.members.map((id, i) => {
            const p = room.roster[id];
            if (!p) return null;
            return (
              <li
                key={id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="flex animate-pop-in items-center gap-3 rounded-2xl bg-cream px-4 py-3"
              >
                <span className="text-3xl" aria-hidden>
                  {p.avatar}
                </span>
                <span className="min-w-0 flex-1 truncate font-extrabold">
                  {p.name}
                  {id === room.me.id && <span className="ml-1.5 text-xs font-bold text-ink/45">(em)</span>}
                </span>
                {id === room.hostId && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-black text-amber-900">
                    <Crown className="h-3.5 w-3.5" /> Chủ phòng
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {room.isHost ? (
        <div className="space-y-2 text-center">
          <BouncyButton
            type="button"
            onClick={start}
            loading={starting}
            loadingText="Đang phát đề..."
            icon={<Flag className="h-5 w-5" />}
            className="w-full bg-gradient-to-r from-emerald-400 to-sky-400 sm:w-auto"
          >
            Bắt Đầu Đua
          </BouncyButton>
          {room.members.length < 2 && (
            <p className="text-sm font-semibold text-ink/50">Mời thêm bạn để đua cho vui – hoặc bấm bắt đầu để tự luyện nhé!</p>
          )}
        </div>
      ) : (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-sky-pastel/60 px-4 py-3 text-center font-bold text-ink/70">
          <span className="animate-wiggle" aria-hidden>
            ⏳
          </span>
          Chờ {host ? <b>{host.name}</b> : "chủ phòng"} bấm bắt đầu nhé...
        </p>
      )}

      {error && <ErrorBox message={error} />}
    </div>
  );
}
