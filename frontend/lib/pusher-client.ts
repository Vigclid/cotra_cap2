/**
 * Pusher phía client. Key + cluster (công khai) đến từ server qua RaceSession, không đọc biến môi trường.
 * Xác thực presence channel đi qua POST /api/pusher (action "auth") kèm vé vào phòng.
 */
import PusherClient from "pusher-js";
import type { RaceSession } from "./race-shared";

export function createPusherClient({ ticket, pusher }: Pick<RaceSession, "ticket" | "pusher">) {
  return new PusherClient(pusher.key, {
    cluster: pusher.cluster,
    forceTLS: true,
    channelAuthorization: {
      customHandler: async ({ socketId, channelName }, callback) => {
        try {
          const res = await fetch("/api/pusher", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "auth", ticket, socketId, channelName }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error ?? "Không vào được phòng.");
          callback(null, data);
        } catch (err) {
          callback(err instanceof Error ? err : new Error(String(err)), null);
        }
      },
    },
  });
}
