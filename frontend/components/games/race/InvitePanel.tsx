"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Share2 } from "lucide-react";
import { inviteUrl } from "@/lib/race-shared";
import { CopyButton } from "../../ui";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/** Mời bạn vào phòng: mã phòng to rõ + mã QR (quét bằng camera điện thoại) + chia sẻ / chép link. */
export function InvitePanel({ roomId }: { roomId: string }) {
  const [origin, setOrigin] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanShare(typeof navigator.share === "function");
  }, []);

  const link = origin ? inviteUrl(origin, roomId) : "";
  const isLocal = origin ? LOCAL_HOSTS.has(new URL(origin).hostname) : false;

  const share = () =>
    navigator
      .share({ title: "Đua Tốc Độ Gõ 🏁", text: `Vào phòng ${roomId} đua gõ chữ với tớ nhé!`, url: link })
      .catch(() => {});

  return (
    <div className="grid items-center gap-5 rounded-3xl bg-gradient-to-br from-lemon-pastel via-peach-pastel to-pink-pastel p-6 sm:grid-cols-[1fr_auto]">
      <div className="space-y-3 text-center sm:text-left">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-ink/50">Mã phòng – gửi cho bạn bè nhé</p>
        <p className="font-mono text-5xl font-black tracking-[0.3em] text-ink sm:text-6xl">{roomId}</p>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface/80 py-0.5 pl-3 pr-0.5 text-xs font-bold text-ink/60 shadow-sm">
            Mã phòng <CopyButton text={roomId} />
          </span>
          {link && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface/80 py-0.5 pl-3 pr-0.5 text-xs font-bold text-ink/60 shadow-sm">
              Link mời <CopyButton text={link} />
            </span>
          )}
          {canShare && link && (
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-1 rounded-full bg-sky-400 px-3 py-1 text-xs font-bold text-white shadow-sm transition duration-300 ease-bounce hover:-translate-y-0.5"
            >
              <Share2 className="h-3.5 w-3.5" /> Chia sẻ
            </button>
          )}
        </div>
        {isLocal && (
          <p className="rounded-2xl bg-surface/70 px-3 py-2 text-xs font-semibold text-orange-700 dark:text-orange-300">
            ⚠️ Trang đang mở bằng <b>localhost</b> nên điện thoại khác quét QR sẽ không vào được. Hãy mở trang bằng địa chỉ
            mạng LAN (VD <code>http://192.168.1.5:3000</code>) hoặc tên miền thật.
          </p>
        )}
      </div>

      {link && (
        <figure className="mx-auto flex flex-col items-center gap-2">
          <div className="rounded-3xl bg-white p-3 shadow-pop ring-4 ring-white/70">
            <QRCode value={link} size={148} level="M" fgColor="#3f3d56" title={`Mã QR vào phòng ${roomId}`} />
          </div>
          <figcaption className="text-xs font-extrabold text-ink/60">📷 Quét để vào phòng</figcaption>
        </figure>
      )}
    </div>
  );
}
