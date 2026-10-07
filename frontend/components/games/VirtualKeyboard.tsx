"use client";

type KeyDef = { id: string; label: string; shiftLabel?: string; w?: number; caption?: string };

/** Chú thích dưới các phím Telex hay dùng để bé làm quen. */
const CAPTIONS: Record<string, string> = {
  s: "sắc",
  f: "huyền",
  r: "hỏi",
  x: "ngã",
  j: "nặng",
  w: "ă ơ ư",
};

const letters = (row: string): KeyDef[] => [...row].map((c) => ({ id: c, label: c.toUpperCase(), caption: CAPTIONS[c] }));
const symbols = (pairs: string): KeyDef[] =>
  pairs.split(" ").map((pair) => ({ id: pair[0], label: pair[0], shiftLabel: pair[1] }));

const ROWS: KeyDef[][] = [
  [...symbols("`~ 1! 2@ 3# 4$ 5% 6^ 7& 8* 9( 0) -_ =+"), { id: "backspace", label: "⌫ Xoá", w: 2 }],
  [{ id: "tab", label: "Tab", w: 1.5 }, ...letters("qwertyuiop"), ...symbols("[{ ]}"), { id: "\\", label: "\\", shiftLabel: "|", w: 1.5 }],
  [{ id: "caps", label: "Caps", w: 1.75 }, ...letters("asdfghjkl"), ...symbols(";: '\""), { id: "enter", label: "Enter", w: 2.25 }],
  [{ id: "shiftL", label: "⇧ Shift", w: 2.25 }, ...letters("zxcvbnm"), ...symbols(",< .> /?"), { id: "shiftR", label: "⇧ Shift", w: 2.75 }],
];

const SHIFTED: Record<string, string> = Object.fromEntries(
  ROWS.flat().flatMap((k) => (k.shiftLabel ? [[k.shiftLabel, k.id]] : [])),
);

/** Kí tự cần gõ → phím trên bàn phím (+ có cần giữ Shift không). */
export function keyForChar(ch: string | null): { id: string; shift: boolean } | null {
  if (!ch) return null;
  if (ch === " ") return { id: "space", shift: false };
  if (ch === "Backspace") return { id: "backspace", shift: false };
  if (SHIFTED[ch]) return { id: SHIFTED[ch], shift: true };
  const lower = ch.toLowerCase();
  return { id: lower, shift: ch !== lower };
}

const CODE_IDS: Record<string, string> = {
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  Backspace: "backspace",
  Tab: "tab",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  CapsLock: "caps",
  Semicolon: ";",
  Quote: "'",
  Enter: "enter",
  ShiftLeft: "shiftL",
  ShiftRight: "shiftR",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Space: "space",
};

/** `KeyboardEvent.code` → id phím. Dùng `code` vì bộ gõ tiếng Việt có thể thay đổi `key`. */
export function keyIdFromCode(code: string): string | null {
  if (code.startsWith("Key")) return code.slice(3).toLowerCase();
  if (code.startsWith("Digit")) return code.slice(5);
  return CODE_IDS[code] ?? null;
}

export function VirtualKeyboard({
  next,
  pressed,
}: {
  /** Kí tự cần gõ tiếp theo (hoặc " ", "Backspace"). */
  next: string | null;
  /** Các phím em đang nhấn thật trên bàn phím máy tính. */
  pressed: ReadonlySet<string>;
}) {
  const target = keyForChar(next);
  const isTarget = (id: string) =>
    !!target && (id === target.id || (target.shift && (id === "shiftL" || id === "shiftR")));

  return (
    <div
      aria-hidden
      className="select-none space-y-1.5 rounded-3xl bg-slate-100 p-2.5 shadow-inner dark:bg-white/5 sm:p-3"
    >
      {ROWS.map((row, r) => (
        <div key={r} className="flex gap-1.5">
          {row.map((k) => (
            <Key key={k.id} def={k} target={isTarget(k.id)} pressed={pressed.has(k.id)} />
          ))}
        </div>
      ))}
      <div className="flex justify-center">
        <Key
          def={{ id: "space", label: "Phím cách" }}
          target={isTarget("space")}
          pressed={pressed.has("space")}
          className="basis-1/2"
        />
      </div>
    </div>
  );
}

function Key({
  def,
  target,
  pressed,
  className = "",
}: {
  def: KeyDef;
  target: boolean;
  pressed: boolean;
  className?: string;
}) {
  const tone = target
    ? "bg-pink-400 text-white shadow-[0_4px_0_#db2777] dark:bg-pink-500"
    : def.caption
      ? "bg-amber-50 text-ink shadow-[0_4px_0_rgb(0_0_0/0.12)] dark:bg-amber-950/40"
      : "bg-white text-ink shadow-[0_4px_0_rgb(0_0_0/0.12)] dark:bg-surface";

  return (
    <div
      style={def.w ? { flexGrow: def.w } : undefined}
      className={`relative flex h-11 min-w-0 flex-1 basis-0 flex-col items-center justify-center rounded-xl text-sm font-extrabold transition duration-100 sm:h-12 ${tone} ${
        pressed ? "translate-y-1 shadow-none brightness-95" : ""
      } ${className}`}
    >
      {target && <span className="absolute inset-0 animate-halo rounded-xl ring-4 ring-pink-300" />}
      {def.shiftLabel && <span className="text-[10px] leading-none opacity-50">{def.shiftLabel}</span>}
      <span className={`truncate leading-none ${def.w ? "text-xs" : ""}`}>{def.label}</span>
      {def.caption && (
        <span className={`mt-0.5 truncate text-[9px] leading-none ${target ? "text-white/90" : "text-amber-600 dark:text-amber-300"}`}>
          {def.caption}
        </span>
      )}
      {(def.id === "f" || def.id === "j") && (
        <span className="absolute bottom-1 h-0.5 w-3 rounded-full bg-current opacity-40" />
      )}
    </div>
  );
}
