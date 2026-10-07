import { NextResponse } from "next/server";
import { customAlphabet, nanoid } from "nanoid";
import {
  getPusher,
  getRoomMemberIds,
  hasPusherConfig,
  issueTicket,
  pusherPublicConfig,
  readTicket,
} from "@/lib/pusher-server";
import {
  COUNTDOWN_MS,
  MAX_NAME_LENGTH,
  MAX_PLAYERS,
  RACE_AVATARS,
  RACE_EVENTS,
  RACE_WORD_COUNT,
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  isRoomCode,
  pickHost,
  roomChannel,
  type GameStartEvent,
  type Player,
  type Progress,
  type ProgressEvent,
  type RaceSession,
  type RoomStateEvent,
} from "@/lib/race-shared";
import { generateWords } from "@/lib/race-words";

/**
 * Endpoint dùng chung cho "Đua Tốc Độ Gõ": POST /api/pusher
 * Body: { action, ...payload }
 *   create-room     { name, avatar }                       → RaceSession { roomId, ticket, player, pusher }
 *   join-room       { roomId, name, avatar }               → RaceSession
 *   auth            { ticket, socketId, channelName }      → chữ kí presence channel cho pusher-js
 *   start-game      { ticket }                    (chủ phòng) → phát "game-start"
 *   update-progress { ticket, socketId, roundId, ...Progress } → phát "update-progress"
 *   sync-state      { ticket, socketId, state }   (chủ phòng) → phát "room-state" cho người vào giữa ván
 *   reset-game      { ticket }                    (chủ phòng) → phát "game-reset"
 */
export async function POST(req: Request) {
  if (!hasPusherConfig()) {
    return fail("Đường đua chưa được cắm điện 🔌 – admin cần điền PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER.", 503);
  }

  const body = await req.json().catch(() => null);
  const action = body?.action;

  try {
    switch (action) {
      case "create-room": {
        const player = makePlayer(body);
        if (typeof player === "string") return fail(player);
        // Mã 5 kí tự có ~28 triệu tổ hợp – thử lại vài lần cho chắc không trùng phòng đang chơi.
        for (let i = 0; i < 5; i++) {
          const roomId = makeRoomCode();
          if ((await getRoomMemberIds(roomId)).length === 0) {
            return NextResponse.json(session(roomId, player));
          }
        }
        return fail("Không tạo được phòng, em thử lại nhé!", 503);
      }

      case "join-room": {
        const roomId = String(body.roomId ?? "").trim().toUpperCase();
        if (!isRoomCode(roomId)) return fail(`Mã phòng gồm ${ROOM_CODE_LENGTH} kí tự, em kiểm tra lại nhé!`);
        const player = makePlayer(body);
        if (typeof player === "string") return fail(player);

        const members = await getRoomMemberIds(roomId);
        if (members.length === 0) return fail("Không tìm thấy phòng này – có thể chủ phòng đã rời đi rồi.", 404);
        if (members.length >= MAX_PLAYERS) return fail(`Phòng đã đủ ${MAX_PLAYERS} tay đua rồi!`, 409);
        return NextResponse.json(session(roomId, player));
      }

      case "auth": {
        const t = readTicket(body.ticket);
        if (!t) return fail("Vé vào phòng không hợp lệ hoặc đã hết hạn.", 403);
        if (body.channelName !== roomChannel(t.roomId)) return fail("Sai phòng.", 403);
        if (typeof body.socketId !== "string") return fail("Thiếu socketId.");
        const { id, name, avatar } = t.player;
        return NextResponse.json(
          getPusher().authorizeChannel(body.socketId, body.channelName, { user_id: id, user_info: { name, avatar } }),
        );
      }

      case "start-game": {
        const t = readTicket(body.ticket);
        if (!t) return fail("Vé vào phòng không hợp lệ.", 403);
        const members = await getRoomMemberIds(t.roomId);
        if (pickHost(members) !== t.player.id) return fail("Chỉ chủ phòng mới bắt đầu được cuộc đua.", 403);

        const event: GameStartEvent = {
          roundId: nanoid(8),
          words: generateWords(RACE_WORD_COUNT),
          participants: members,
          countdownMs: COUNTDOWN_MS,
        };
        await getPusher().trigger(roomChannel(t.roomId), RACE_EVENTS.start, event);
        return NextResponse.json({ ok: true });
      }

      case "update-progress": {
        const t = readTicket(body.ticket);
        if (!t) return fail("Vé vào phòng không hợp lệ.", 403);
        const progress = cleanProgress(body);
        if (!progress || typeof body.roundId !== "string") return fail("Dữ liệu tiến độ không hợp lệ.");

        const event: ProgressEvent = { ...progress, roundId: body.roundId.slice(0, 16), playerId: t.player.id };
        await getPusher().trigger(roomChannel(t.roomId), RACE_EVENTS.progress, event, socketParam(body));
        return NextResponse.json({ ok: true });
      }

      case "sync-state": {
        const t = readTicket(body.ticket);
        if (!t) return fail("Vé vào phòng không hợp lệ.", 403);
        const state = cleanRoomState(body.state);
        if (!state) return fail("Dữ liệu phòng không hợp lệ.");
        if (pickHost(await getRoomMemberIds(t.roomId)) !== t.player.id) return fail("Chỉ chủ phòng mới đồng bộ được.", 403);

        await getPusher().trigger(roomChannel(t.roomId), RACE_EVENTS.state, state, socketParam(body));
        return NextResponse.json({ ok: true });
      }

      case "reset-game": {
        const t = readTicket(body.ticket);
        if (!t) return fail("Vé vào phòng không hợp lệ.", 403);
        if (pickHost(await getRoomMemberIds(t.roomId)) !== t.player.id) return fail("Chỉ chủ phòng mới mở ván mới được.", 403);

        await getPusher().trigger(roomChannel(t.roomId), RACE_EVENTS.reset, {});
        return NextResponse.json({ ok: true });
      }

      default:
        return fail("action không hợp lệ.");
    }
  } catch (err) {
    console.error(`[api/pusher] ${action}:`, err);
    return fail("Đường truyền đang chập chờn, em thử lại sau giây lát nhé!", 502);
  }
}

/* ------------------------------------------------------------------ */

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

const session = (roomId: string, player: Player): RaceSession => ({
  roomId,
  player,
  ticket: issueTicket(roomId, player),
  pusher: pusherPublicConfig(),
});

const makeRoomCode = customAlphabet(ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH);

/** Id sắp xếp được theo thời gian vào phòng → `pickHost` chọn đúng người vào sớm nhất. */
const makePlayerId = () => Date.now().toString(36).padStart(9, "0") + nanoid(6);

function makePlayer(body: Record<string, unknown>): Player | string {
  const name = String(body.name ?? "")
    .replace(/[\u0000-\u001f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LENGTH);
  if (name.length < 2) return "Em nhập tên (ít nhất 2 kí tự) để các bạn nhận ra nhé!";
  const avatar = (RACE_AVATARS as readonly string[]).includes(String(body.avatar)) ? String(body.avatar) : RACE_AVATARS[0];
  return { id: makePlayerId(), name, avatar };
}

const socketParam = (body: Record<string, unknown>) =>
  typeof body.socketId === "string" ? { socket_id: body.socketId } : undefined;

const clamp = (v: unknown, min: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : min;
};

function cleanProgress(raw: unknown): Progress | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  const total = clamp(p.total, 1, 500);
  return {
    total,
    wordsDone: clamp(p.wordsDone, 0, total),
    wpm: clamp(p.wpm, 0, 400),
    accuracy: clamp(p.accuracy, 0, 100),
    finishMs: p.finishMs == null ? null : clamp(p.finishMs, 0, 60 * 60 * 1000),
  };
}

function cleanRoomState(raw: unknown): RoomStateEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.roundId !== "string" || typeof s.words !== "string" || !Array.isArray(s.participants)) return null;

  const participants = s.participants.filter((id): id is string => typeof id === "string").slice(0, MAX_PLAYERS * 2);
  const progress: Record<string, Progress> = {};
  for (const [id, p] of Object.entries((s.progress as Record<string, unknown>) ?? {})) {
    const clean = participants.includes(id) && cleanProgress(p);
    if (clean) progress[id] = clean;
  }
  return { roundId: s.roundId.slice(0, 16), words: s.words.slice(0, 2000), participants, progress };
}
