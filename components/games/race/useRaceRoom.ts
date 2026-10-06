"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type PusherClient from "pusher-js";
import type { Members, PresenceChannel } from "pusher-js";
import { createPusherClient } from "@/lib/pusher-client";
import {
  RACE_EVENTS,
  pickHost,
  roomChannel,
  type GameStartEvent,
  type Player,
  type Progress,
  type ProgressEvent,
  type RaceSession,
  type RoomStateEvent,
} from "@/lib/race-shared";
import { canon } from "@/lib/vietnamese";

export type Round = {
  id: string;
  words: string[];
  participants: string[];
  /** Mốc `Date.now()` trên máy này khi cuộc đua bắt đầu (sau đếm ngược). */
  startsAt: number;
};

type State = {
  status: "connecting" | "ready" | "error";
  error: string | null;
  online: boolean;
  /** Id người đang ở trong phòng. */
  members: string[];
  /** Mọi người từng thấy trong phòng – giữ lại tên của người đã rời để hiện trên bảng xếp hạng. */
  roster: Record<string, Player>;
  round: Round | null;
  progress: Record<string, Progress>;
};

type Action =
  | { type: "subscribed"; players: Player[] }
  | { type: "member-added"; player: Player }
  | { type: "member-removed"; id: string }
  | { type: "online"; online: boolean }
  | { type: "error"; message: string }
  | { type: "start"; event: GameStartEvent }
  | { type: "progress"; roundId: string; playerId: string; progress: Progress }
  | { type: "sync"; event: RoomStateEvent; meId: string }
  | { type: "reset" };

const initialState: State = {
  status: "connecting",
  error: null,
  online: true,
  members: [],
  roster: {},
  round: null,
  progress: {},
};

/** Sự kiện có thể đến không theo thứ tự → chỉ nhận tiến độ mới hơn, và không "huỷ" trạng thái về đích. */
function mergeProgress(prev: Progress | undefined, next: Progress): Progress {
  if (!prev) return next;
  if (prev.finishMs !== null) return prev;
  return next.wordsDone >= prev.wordsDone ? next : prev;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "subscribed":
      return {
        ...state,
        status: "ready",
        members: action.players.map((p) => p.id),
        roster: { ...state.roster, ...Object.fromEntries(action.players.map((p) => [p.id, p])) },
      };
    case "member-added":
      return {
        ...state,
        members: state.members.includes(action.player.id) ? state.members : [...state.members, action.player.id],
        roster: { ...state.roster, [action.player.id]: action.player },
      };
    case "member-removed":
      return { ...state, members: state.members.filter((id) => id !== action.id) };
    case "online":
      return { ...state, online: action.online };
    case "error":
      return { ...state, status: "error", error: action.message };
    case "start":
      return {
        ...state,
        round: {
          id: action.event.roundId,
          words: canon(action.event.words).split(" "),
          participants: action.event.participants,
          startsAt: Date.now() + action.event.countdownMs,
        },
        progress: {},
      };
    case "progress": {
      if (state.round?.id !== action.roundId) return state;
      return {
        ...state,
        progress: { ...state.progress, [action.playerId]: mergeProgress(state.progress[action.playerId], action.progress) },
      };
    }
    case "sync": {
      const { event, meId } = action;
      if (state.round?.id === event.roundId) {
        const progress = { ...state.progress };
        for (const [id, p] of Object.entries(event.progress)) progress[id] = mergeProgress(progress[id], p);
        return { ...state, progress };
      }
      // Vào giữa ván (hoặc tải lại trang khi đang đua) → chỉ được xem, không tính là tay đua.
      return {
        ...state,
        round: {
          id: event.roundId,
          words: canon(event.words).split(" "),
          participants: event.participants.filter((id) => id !== meId),
          startsAt: Date.now(),
        },
        progress: event.progress,
      };
    }
    case "reset":
      return { ...state, round: null, progress: {} };
  }
}

async function post(action: string, data: object) {
  const res = await fetch("/api/pusher", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? "Có lỗi xảy ra, em thử lại nhé!");
  return json;
}

const toPlayer = (id: string, info: unknown): Player => {
  const i = (info ?? {}) as Partial<Player>;
  return { id, name: i.name ?? "Bạn ẩn danh", avatar: i.avatar ?? "🚗" };
};

/** Kết nối vào phòng đua qua Pusher presence channel và đồng bộ trạng thái ván đua. */
export function useRaceRoom(session: RaceSession) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  const clientRef = useRef<PusherClient | null>(null);
  const { ticket, roomId, player: me, pusher } = session;
  const { key: pusherKey, cluster } = pusher;

  const socketId = () => clientRef.current?.connection.socket_id;

  useEffect(() => {
    const client = createPusherClient({ ticket, pusher: { key: pusherKey, cluster } });
    clientRef.current = client;
    const channelName = roomChannel(roomId);
    const channel = client.subscribe(channelName) as PresenceChannel;

    client.connection.bind("state_change", ({ current }: { current: string }) =>
      dispatch({ type: "online", online: current === "connected" }),
    );

    channel.bind("pusher:subscription_succeeded", (members: Members) => {
      const players: Player[] = [];
      members.each((m: { id: string; info: unknown }) => players.push(toPlayer(m.id, m.info)));
      dispatch({ type: "subscribed", players });
    });
    channel.bind("pusher:subscription_error", () =>
      dispatch({ type: "error", message: "Không vào được phòng – vé đã hết hạn hoặc phòng không còn nữa." }),
    );
    channel.bind("pusher:member_added", (m: { id: string; info: unknown }) => {
      dispatch({ type: "member-added", player: toPlayer(m.id, m.info) });

      // Chủ phòng gửi lại trạng thái ván đang chạy cho người mới vào.
      const s = stateRef.current;
      if (s.round && pickHost(s.members) === me.id) {
        const event: RoomStateEvent = {
          roundId: s.round.id,
          words: s.round.words.join(" "),
          participants: s.round.participants,
          progress: s.progress,
        };
        post("sync-state", { ticket, socketId: socketId(), state: event }).catch(() => {});
      }
    });
    channel.bind("pusher:member_removed", (m: { id: string }) => dispatch({ type: "member-removed", id: m.id }));

    channel.bind(RACE_EVENTS.start, (event: GameStartEvent) => dispatch({ type: "start", event }));
    channel.bind(RACE_EVENTS.progress, ({ roundId, playerId, ...progress }: ProgressEvent) =>
      dispatch({ type: "progress", roundId, playerId, progress }),
    );
    channel.bind(RACE_EVENTS.state, (event: RoomStateEvent) => dispatch({ type: "sync", event, meId: me.id }));
    channel.bind(RACE_EVENTS.reset, () => dispatch({ type: "reset" }));

    return () => {
      channel.unbind_all();
      client.unsubscribe(channelName);
      client.disconnect();
      clientRef.current = null;
    };
  }, [ticket, roomId, me.id, pusherKey, cluster]);

  const startGame = useCallback(() => post("start-game", { ticket }), [ticket]);
  const resetGame = useCallback(() => post("reset-game", { ticket }), [ticket]);

  /** Cập nhật tiến độ của chính mình ngay trên máy, rồi báo cho cả phòng (không chờ phản hồi). */
  const reportProgress = useCallback(
    (progress: Progress) => {
      const roundId = stateRef.current.round?.id;
      if (!roundId) return;
      dispatch({ type: "progress", roundId, playerId: me.id, progress });

      const send = () => post("update-progress", { ticket, socketId: socketId(), roundId, ...progress });
      // Lượt về đích quan trọng nhất → thử lại một lần nếu mạng chập chờn.
      send().catch(() => {
        if (progress.finishMs !== null) setTimeout(() => send().catch(() => {}), 1500);
      });
    },
    [ticket, me.id],
  );

  const hostId = pickHost(state.members);

  return { ...state, me, hostId, isHost: hostId === me.id, startGame, resetGame, reportProgress };
}

export type RaceRoom = ReturnType<typeof useRaceRoom>;
