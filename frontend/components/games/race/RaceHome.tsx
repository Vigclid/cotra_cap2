"use client";

import { useState, type FormEvent } from "react";
import { DoorOpen, Plus } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MAX_NAME_LENGTH, RACE_AVATARS, ROOM_CODE_LENGTH, extractRoomCode, type RaceSession } from "@/lib/race-shared";
import { BouncyButton, Card, ErrorBox } from "../../ui";

type Profile = { name: string; avatar: string };

export function RaceHome({
  onJoined,
  invite = null,
}: {
  onJoined: (session: RaceSession) => void;
  invite?: string | null;
}) {
  const [profile, setProfile] = useLocalStorage<Profile>("tram-sac-racer", { name: "", avatar: RACE_AVATARS[0] });
  const [code, setCode] = useState(invite ?? "");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nameOk = profile.name.trim().length >= 2;

  const submit = async (action: "create-room" | "join-room") => {
    setError(null);
    if (!nameOk) return setError("Em nhập tên (ít nhất 2 kí tự) để các bạn nhận ra nhé!");
    if (action === "join-room" && code.length !== ROOM_CODE_LENGTH) {
      return setError(`Mã phòng gồm ${ROOM_CODE_LENGTH} kí tự, em hỏi lại chủ phòng nhé!`);
    }
    setBusy(action === "create-room" ? "create" : "join");
    try {
      const res = await fetch("/api/pusher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, roomId: code, ...profile }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Có lỗi xảy ra, em thử lại nhé!");
      onJoined(data as RaceSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const onJoin = (e: FormEvent) => {
    e.preventDefault();
    submit("join-room");
  };

  return (
    <Card className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-xl font-extrabold">
          <span className="text-3xl" aria-hidden>
            🏁
          </span>
          Đua Tốc Độ Gõ
        </h3>
        <p className="mt-1 text-sm font-semibold text-ink/60">
          Tạo phòng, gửi mã cho bạn bè rồi cùng thi xem ai gõ tiếng Việt nhanh và chuẩn nhất nhé!
        </p>
      </div>

      {invite && (
        <p className="animate-pop-in rounded-2xl border-2 border-dashed border-sky-300 bg-sky-pastel px-4 py-3 text-center font-bold dark:border-sky-700">
          🎟️ Em được mời vào phòng <span className="font-mono font-black tracking-widest">{invite}</span> – nhập tên rồi bấm{" "}
          <b>Vào Phòng</b> nhé!
        </p>
      )}

      <div className="space-y-4 rounded-3xl bg-cream p-5">
        <label className="block">
          <span className="text-sm font-extrabold">✏️ Tên tay đua</span>
          <input
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value.slice(0, MAX_NAME_LENGTH) }))}
            placeholder="VD: Minh Anh 6A"
            className="mt-1.5 w-full rounded-2xl border-4 border-transparent bg-surface px-4 py-3 text-lg font-bold outline-none transition focus:border-sky-200 dark:focus:border-sky-800"
          />
        </label>
        <div>
          <span className="text-sm font-extrabold">🎨 Chọn xe đua</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {RACE_AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setProfile((p) => ({ ...p, avatar: a }))}
                aria-pressed={profile.avatar === a}
                aria-label={`Chọn ${a}`}
                className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl transition duration-300 ease-bounce hover:-translate-y-1 ${
                  profile.avatar === a ? "scale-110 bg-lemon-pastel ring-4 ring-amber-300" : "bg-surface"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-br from-pink-pastel to-peach-pastel p-5">
          <div>
            <p className="text-lg font-black">🏠 Làm chủ phòng</p>
            <p className="text-sm font-semibold text-ink/60">Tạo phòng mới và nhận mã để mời các bạn vào đua cùng.</p>
          </div>
          <BouncyButton
            type="button"
            onClick={() => submit("create-room")}
            loading={busy === "create"}
            disabled={busy !== null}
            loadingText="Đang tạo phòng..."
            icon={<Plus className="h-5 w-5" />}
            className="bg-pink-400 hover:bg-pink-500"
          >
            Tạo Phòng
          </BouncyButton>
        </div>

        <form onSubmit={onJoin} className="flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-br from-sky-pastel to-mint-pastel p-5">
          <div>
            <p className="text-lg font-black">🎟️ Vào phòng của bạn</p>
            <input
              value={code}
              onChange={(e) => setCode(extractRoomCode(e.target.value))}
              placeholder="MÃ PHÒNG"
              aria-label="Mã phòng hoặc link mời"
              inputMode="text"
              autoCapitalize="characters"
              className={`mt-2 w-full rounded-2xl bg-surface px-4 py-3 text-center font-mono text-2xl font-black uppercase tracking-[0.4em] outline-none ring-sky-300 placeholder:text-base placeholder:tracking-widest placeholder:text-ink/30 focus:ring-4 ${
                invite && code === invite ? "ring-4" : ""
              }`}
            />
            <p className="mt-1.5 text-xs font-semibold text-ink/50">
              📷 Hoặc quét mã QR của chủ phòng bằng camera điện thoại / dán link mời vào đây.
            </p>
          </div>
          <BouncyButton
            loading={busy === "join"}
            disabled={busy !== null}
            loadingText="Đang vào phòng..."
            icon={<DoorOpen className="h-5 w-5" />}
            className="bg-sky-400 hover:bg-sky-500"
          >
            Vào Phòng
          </BouncyButton>
        </form>
      </div>

      {error && <ErrorBox message={error} />}
    </Card>
  );
}
