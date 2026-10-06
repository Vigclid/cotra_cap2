/**
 * Chuyển chữ tiếng Việt sang chuỗi phím gõ kiểu Telex để gợi ý cho học sinh.
 * Ví dụ: "Có" → "Cos", "đau" → "ddau", "Chẳng" → "Chawngr".
 * Dấu thanh luôn được gợi ý gõ ở cuối tiếng (cách gõ phổ biến nhất), nhưng khi kiểm tra
 * tiến độ thì chấp nhận cả trường hợp em gõ dấu sớm hơn – bộ gõ vẫn tự đặt dấu đúng chỗ.
 */

export type TelexRule = { keys: string; result: string };

export type TelexStep = {
  key: string;
  /** Tên dấu thanh nếu đây là phím bỏ dấu, VD "sắc". */
  tone?: string;
  done: boolean;
};

export type WordHint = {
  word: string;
  /** Vị trí từ trong đoạn văn (đã chuẩn hoá) – dùng để gạch chân từ đang gõ. */
  start: number;
  end: number;
  steps: TelexStep[];
  /** Phím cần bấm tiếp: một kí tự, " " (phím cách) hoặc "Backspace". `null` khi đã gõ xong cả đoạn. */
  next: string | null;
  /** Phần đã gõ của từ hiện tại không khớp với từ mẫu. */
  offTrack: boolean;
  rules: TelexRule[];
};

const TONES: Record<string, { key: string; name: string }> = {
  "\u0301": { key: "s", name: "sắc" },
  "\u0300": { key: "f", name: "huyền" },
  "\u0309": { key: "r", name: "hỏi" },
  "\u0303": { key: "x", name: "ngã" },
  "\u0323": { key: "j", name: "nặng" },
};
const CIRCUMFLEX = "\u0302"; // â ê ô
const BREVE = "\u0306"; // ă
const HORN = "\u031B"; // ơ ư

type Tone = { key: string; name: string } | null;

/** Một cụm chữ cái liền nhau → phím Telex (chưa gồm dấu thanh) + dấu thanh của cụm. */
function lettersToTelex(letters: string, rules: Map<string, string>): { keys: string; tone: Tone } {
  let keys = "";
  let tone: Tone = null;
  let base = "";
  for (const cp of letters.normalize("NFD")) {
    if (cp === "đ" || cp === "Đ") {
      keys += cp === "đ" ? "dd" : "DD";
      rules.set("dd", "đ");
      base = cp;
    } else if (TONES[cp]) {
      tone = TONES[cp];
      rules.set(tone.key, `dấu ${tone.name}`);
    } else if (cp === CIRCUMFLEX) {
      keys += base;
      rules.set(base.toLowerCase().repeat(2), (base + cp).normalize("NFC").toLowerCase());
    } else if (cp === BREVE || cp === HORN) {
      keys += "w";
      rules.set(`${base.toLowerCase()}w`, (base + cp).normalize("NFC").toLowerCase());
    } else {
      keys += cp;
      base = cp;
    }
  }
  return { keys, tone };
}

type ParsedWord = { lead: string; base: string; tone: Tone; trail: string };

/** Tách một "từ" (cắt theo dấu cách) thành: dấu câu đầu + phần chữ + dấu câu/phần còn lại. */
function parseWord(word: string, rules = new Map<string, string>()): ParsedWord {
  const [, lead = "", letters = "", rest = ""] = word.match(/^(\P{L}*)(\p{L}*)([\s\S]*)$/u) ?? [];
  const { keys, tone } = lettersToTelex(letters, rules);
  const trail = rest.replace(/\p{L}+/gu, (run) => {
    const r = lettersToTelex(run, rules);
    return r.keys + (r.tone?.key ?? "");
  });
  return { lead, base: keys, tone, trail };
}

/**
 * Gợi ý cho từ đang gõ. Từ hiện tại được xác định theo số dấu cách em đã gõ
 * (không theo vị trí kí tự) để gõ thừa/thiếu chữ ở một từ không làm lệch gợi ý.
 * `target` và `typed` cần được chuẩn hoá NFC giống nhau.
 */
export function getWordHint(target: string, typed: string): WordHint | null {
  if (typed.length >= target.length) return null;

  const words = target.split(" ");
  const typedWords = typed.split(" ");
  const index = typedWords.length - 1;
  if (index >= words.length) return null;

  const word = words[index];
  const start = words.slice(0, index).reduce((sum, w) => sum + w.length + 1, 0);
  const end = start + word.length;

  const rules = new Map<string, string>();
  const t = parseWord(word, rules);
  const u = parseWord(typedWords[index]);

  const offTrack = !(
    t.lead.startsWith(u.lead) &&
    (u.lead === t.lead || !(u.base || u.tone || u.trail)) &&
    t.base.startsWith(u.base) &&
    (u.base === t.base || !u.trail) &&
    (!u.tone || u.tone.key === t.tone?.key) &&
    t.trail.startsWith(u.trail) &&
    (!u.trail || !t.tone || !!u.tone)
  );

  const progress = (typedPart: string, i: number) => !offTrack && i < typedPart.length;
  const steps: TelexStep[] = [
    ...[...t.lead].map((key, i) => ({ key, done: progress(u.lead, i) })),
    ...[...t.base].map((key, i) => ({ key, done: progress(u.base, i) })),
    ...(t.tone ? [{ key: t.tone.key, tone: t.tone.name, done: !offTrack && !!u.tone }] : []),
    ...[...t.trail].map((key, i) => ({ key, done: progress(u.trail, i) })),
  ];

  const pending = steps.find((s) => !s.done);
  const next = offTrack ? "Backspace" : (pending?.key ?? (index < words.length - 1 ? " " : null));

  return {
    word,
    start,
    end,
    steps,
    next,
    offTrack,
    rules: [...rules].map(([keys, result]) => ({ keys, result })),
  };
}
