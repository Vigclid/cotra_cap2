"use client";

import { useEffect, useState } from "react";
import { isRaceSession, type RaceSession } from "@/lib/race-shared";
import { RaceHome } from "./race/RaceHome";
import { RaceRoom } from "./race/RaceRoom";

const SESSION_KEY = "tram-sac-race-session";

/**
 * "Đua Tốc Độ Gõ" nhiều người chơi qua Pusher.
 * Vé vào phòng được giữ trong sessionStorage → tải lại trang vẫn quay về đúng phòng (và giữ quyền chủ phòng).
 */
export function MultiplayerRace({
  onReward,
  invite = null,
}: {
  onReward: (exp: number) => void;
  /** Mã phòng từ link mời / QR – điền sẵn vào ô "Vào phòng". */
  invite?: string | null;
}) {
  const [session, setSession] = useState<RaceSession | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      const saved: unknown = raw ? JSON.parse(raw) : null;
      // Quét QR của phòng khác → ưu tiên lời mời mới thay vì quay về phòng cũ.
      if (isRaceSession(saved) && (!invite || saved.roomId === invite)) setSession(saved);
    } catch {}
  }, [invite]);

  const join = (next: RaceSession) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch {}
    setSession(next);
  };

  const leave = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    setSession(null);
  };

  return session ? (
    <RaceRoom key={session.ticket} session={session} onLeave={leave} onReward={onReward} />
  ) : (
    <RaceHome onJoined={join} invite={invite} />
  );
}
