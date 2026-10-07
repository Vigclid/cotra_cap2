/**
 * Pusher phía server – CHỈ import trong API route (dùng secret + node:crypto).
 * Điền key trong .env.local / Vercel (xem .env.example): PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER.
 * Không dùng tiền tố NEXT_PUBLIC_: key + cluster (vốn công khai) được server gửi cho client khi tạo/vào phòng.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import Pusher from "pusher";
import { roomChannel, type Player, type PusherPublicConfig } from "./race-shared";

const appId = process.env.PUSHER_APP_ID ?? "";
const key = process.env.PUSHER_KEY ?? "";
const secret = process.env.PUSHER_SECRET ?? "";
const cluster = process.env.PUSHER_CLUSTER ?? "";

export const hasPusherConfig = () => Boolean(appId && key && secret && cluster);

/** Phần cấu hình an toàn để gửi xuống trình duyệt (không có secret). */
export const pusherPublicConfig = (): PusherPublicConfig => ({ key, cluster });

let instance: Pusher | null = null;
export function getPusher() {
  instance ??= new Pusher({ appId, key, secret, cluster, useTLS: true });
  return instance;
}

/* ---------------- Vé vào phòng (ticket) ----------------
 * Không có database: server kí HMAC lên { phòng, người chơi } khi tạo/vào phòng.
 * Mọi action sau đó gửi kèm vé → server biết chắc người gửi là ai, không giả mạo được id/tên.
 */

type TicketData = { roomId: string; player: Player; exp: number };

const TICKET_TTL_MS = 6 * 60 * 60 * 1000;
const sign = (payload: string) => createHmac("sha256", secret).update(payload).digest("base64url");

export function issueTicket(roomId: string, player: Player) {
  const data: TicketData = { roomId, player, exp: Date.now() + TICKET_TTL_MS };
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readTicket(ticket: unknown): TicketData | null {
  if (typeof ticket !== "string") return null;
  const [payload, sig] = ticket.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as TicketData;
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

/** Id những người đang kết nối vào phòng (Pusher presence channel). */
export async function getRoomMemberIds(roomId: string): Promise<string[]> {
  const res = await getPusher().get({ path: `/channels/${roomChannel(roomId)}/users` });
  if (!res.ok) throw new Error(`Pusher users API ${res.status}`);
  const body = (await res.json()) as { users?: { id: string }[] };
  return (body.users ?? []).map((u) => u.id);
}
