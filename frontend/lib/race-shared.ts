/** Kiểu dữ liệu & hằng số dùng chung giữa client và server cho "Đua Tốc Độ Gõ". */

export const ROOM_CODE_LENGTH = 5;
/** Bỏ các kí tự dễ nhầm (0/O, 1/I/L) để các bạn đọc mã cho nhau không bị sai. */
export const ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const MAX_PLAYERS = 8;
export const MAX_NAME_LENGTH = 16;
export const RACE_WORD_COUNT = 30;
export const COUNTDOWN_MS = 3000;

export const RACE_AVATARS = ["🚀", "🚗", "🏎️", "🛵", "🚲", "🛸", "🚂", "🦄"] as const;

export const roomChannel = (roomId: string) => `presence-room-${roomId}`;

export const isRoomCode = (v: unknown): v is string =>
  typeof v === "string" && v.length === ROOM_CODE_LENGTH && [...v].every((c) => ROOM_CODE_ALPHABET.includes(c));

/** Link mời dạng `https://.../?race=ABCDE` – dùng cho mã QR và nút chia sẻ. */
export const INVITE_PARAM = "race";
export const inviteUrl = (origin: string, roomId: string) => `${origin}/?${INVITE_PARAM}=${roomId}`;

/** Lấy mã phòng từ chữ em gõ / dán vào – chấp nhận cả nguyên link mời. */
export function extractRoomCode(raw: string) {
  const fromLink = raw.match(new RegExp(`[?&]${INVITE_PARAM}=([^&#\\s]+)`))?.[1] ?? raw;
  return [...fromLink.toUpperCase()]
    .filter((c) => ROOM_CODE_ALPHABET.includes(c))
    .join("")
    .slice(0, ROOM_CODE_LENGTH);
}

export const RACE_EVENTS = {
  start: "game-start",
  progress: "update-progress",
  state: "room-state",
  reset: "game-reset",
} as const;

export type Player = {
  /** Sinh trên server: mốc thời gian vào phòng (base36) + chuỗi ngẫu nhiên → sắp xếp theo chuỗi = thứ tự vào phòng. */
  id: string;
  name: string;
  avatar: string;
};

/** Chủ phòng là người vào phòng sớm nhất trong số người còn ở lại – chủ phòng thoát thì quyền tự chuyển cho người kế tiếp. */
export const pickHost = (ids: Iterable<string>) => [...ids].sort()[0] ?? null;

export type Progress = {
  wordsDone: number;
  total: number;
  wpm: number;
  accuracy: number;
  /** Thời gian (ms) từ lúc xuất phát đến khi gõ xong – `null` khi chưa về đích. */
  finishMs: number | null;
};

export type GameStartEvent = {
  roundId: string;
  words: string;
  /** Id những người có mặt lúc bấm bắt đầu – người vào sau chỉ được xem. */
  participants: string[];
  countdownMs: number;
};

export type ProgressEvent = Progress & { roundId: string; playerId: string };

/** Chủ phòng gửi lại khi có người vào giữa ván, để người mới xem được cuộc đua đang diễn ra. */
export type RoomStateEvent = {
  roundId: string;
  words: string;
  participants: string[];
  progress: Record<string, Progress>;
};

/** Key + cluster Pusher (công khai) do server trả về – client không cần biến môi trường NEXT_PUBLIC_*. */
export type PusherPublicConfig = { key: string; cluster: string };

/** Vé vào phòng do server kí – client giữ nguyên và gửi kèm mọi request. */
export type RaceSession = { roomId: string; ticket: string; player: Player; pusher: PusherPublicConfig };

export const isRaceSession = (v: unknown): v is RaceSession => {
  const s = v as Partial<RaceSession> | null;
  return !!s && typeof s.ticket === "string" && isRoomCode(s.roomId) && !!s.player?.id && !!s.pusher?.key && !!s.pusher?.cluster;
};
