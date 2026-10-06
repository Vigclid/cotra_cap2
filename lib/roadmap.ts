/**
 * Lộ trình 10 chặng = dữ liệu bài học (`data/lessons.ts`) + phần trang trí (emoji, màu, học kì).
 * Màu được viết thành chuỗi class đầy đủ để Tailwind quét được.
 */

import { lessonsData, type Lesson } from "@/data/lessons";

type StageStyle = {
  emoji: string;
  semester: 1 | 2;
  summary: string;
  /** Nút khi chưa hoàn thành (pastel). */
  idle: string;
  /** Nút khi đã hoàn thành (màu sáng) + bóng đáy kiểu 3D. */
  done: string;
  /** Gradient đậm hơn – dùng cho ảnh minh hoạ, huy hiệu. */
  gradient: string;
  /** Gradient pastel rất nhạt – nền cột "Khám phá" của LessonModal. */
  soft: string;
  /** Màu nét đường đi khi chặng đã hoàn thành. */
  stroke: string;
};

export type RoadmapStage = Lesson &
  StageStyle & {
    /** Tên chủ điểm, bỏ tiền tố "Bài N:" – dùng cho nhãn ngắn. */
    name: string;
  };

export const ROADMAP_EXP = 50;

const STYLES: Record<number, StageStyle> = {
  1: {
    emoji: "🦗",
    semester: 1,
    summary: "Làm quen với truyện đồng thoại, ngôi kể thứ nhất và bài học về tình bạn, cách ứng xử với mọi người.",
    idle: "bg-lime-200 text-lime-900 shadow-[0_6px_0_#bef264]",
    done: "bg-lime-400 text-lime-950 shadow-[0_6px_0_#65a30d]",
    gradient: "from-lime-200 to-green-300",
    soft: "from-lime-100 via-green-50 to-emerald-100",
    stroke: "#84cc16",
  },
  2: {
    emoji: "💌",
    semester: 1,
    summary: "Cảm nhận thơ có yếu tố tự sự, miêu tả; khám phá tình cảm gia đình qua những vần thơ trong trẻo.",
    idle: "bg-sky-200 text-sky-900 shadow-[0_6px_0_#7dd3fc]",
    done: "bg-sky-400 text-sky-950 shadow-[0_6px_0_#0284c7]",
    gradient: "from-sky-200 to-blue-300",
    soft: "from-sky-100 via-cyan-50 to-blue-100",
    stroke: "#38bdf8",
  },
  3: {
    emoji: "🕯️",
    semester: 1,
    summary: "Tìm hiểu cốt truyện, nhân vật, lời người kể chuyện; lan tỏa lòng nhân ái và sự sẻ chia.",
    idle: "bg-orange-200 text-orange-900 shadow-[0_6px_0_#fdba74]",
    done: "bg-orange-400 text-orange-950 shadow-[0_6px_0_#ea580c]",
    gradient: "from-orange-200 to-amber-300",
    soft: "from-orange-100 via-amber-50 to-rose-100",
    stroke: "#fb923c",
  },
  4: {
    emoji: "🌾",
    semester: 1,
    summary: "Nhận biết thể thơ lục bát (vần, nhịp, số tiếng) và tình yêu quê hương, đất nước trong ca dao.",
    idle: "bg-yellow-200 text-yellow-900 shadow-[0_6px_0_#fde047]",
    done: "bg-yellow-400 text-yellow-950 shadow-[0_6px_0_#ca8a04]",
    gradient: "from-yellow-200 to-amber-200",
    soft: "from-yellow-100 via-lime-50 to-amber-100",
    stroke: "#facc15",
  },
  5: {
    emoji: "🏝️",
    semester: 1,
    summary: "Theo chân người viết kí khám phá cảnh sắc đất nước; học cách kể lại một trải nghiệm đáng nhớ.",
    idle: "bg-cyan-200 text-cyan-900 shadow-[0_6px_0_#67e8f9]",
    done: "bg-cyan-400 text-cyan-950 shadow-[0_6px_0_#0891b2]",
    gradient: "from-cyan-200 to-teal-300",
    soft: "from-cyan-100 via-teal-50 to-sky-100",
    stroke: "#22d3ee",
  },
  6: {
    emoji: "🐎",
    semester: 2,
    summary: "Nhận biết yếu tố kì ảo và cốt lõi lịch sử trong truyền thuyết; tự hào về những người anh hùng dân tộc.",
    idle: "bg-amber-200 text-amber-900 shadow-[0_6px_0_#fcd34d]",
    done: "bg-amber-400 text-amber-950 shadow-[0_6px_0_#d97706]",
    gradient: "from-amber-200 to-orange-300",
    soft: "from-amber-100 via-orange-50 to-yellow-100",
    stroke: "#f59e0b",
  },
  7: {
    emoji: "🏰",
    semester: 2,
    summary: "Bước vào thế giới cổ tích: nhân vật thiện – ác, yếu tố thần kì và ước mơ công bằng của nhân dân.",
    idle: "bg-violet-200 text-violet-900 shadow-[0_6px_0_#c4b5fd]",
    done: "bg-violet-400 text-violet-950 shadow-[0_6px_0_#7c3aed]",
    gradient: "from-violet-200 to-fuchsia-300",
    soft: "from-violet-100 via-purple-50 to-fuchsia-100",
    stroke: "#a78bfa",
  },
  8: {
    emoji: "🤝",
    semester: 2,
    summary: "Làm quen văn nghị luận: ý kiến, lí lẽ, bằng chứng; biết tôn trọng sự khác biệt của mỗi người.",
    idle: "bg-indigo-200 text-indigo-900 shadow-[0_6px_0_#a5b4fc]",
    done: "bg-indigo-400 text-indigo-950 shadow-[0_6px_0_#4f46e5]",
    gradient: "from-indigo-200 to-violet-300",
    soft: "from-indigo-100 via-blue-50 to-violet-100",
    stroke: "#818cf8",
  },
  9: {
    emoji: "🌍",
    semester: 2,
    summary: "Đọc hiểu văn bản thông tin (nhan đề, sa-pô, hình ảnh minh họa); chung tay bảo vệ hành tinh xanh.",
    idle: "bg-emerald-200 text-emerald-900 shadow-[0_6px_0_#6ee7b7]",
    done: "bg-emerald-400 text-emerald-950 shadow-[0_6px_0_#059669]",
    gradient: "from-emerald-200 to-teal-300",
    soft: "from-emerald-100 via-green-50 to-teal-100",
    stroke: "#34d399",
  },
  10: {
    emoji: "📚",
    semester: 2,
    summary: "Tự chọn, đọc và giới thiệu cuốn sách mình yêu thích; cùng cả lớp tổ chức một ngày hội đọc sách.",
    idle: "bg-rose-200 text-rose-900 shadow-[0_6px_0_#fda4af]",
    done: "bg-rose-400 text-rose-950 shadow-[0_6px_0_#e11d48]",
    gradient: "from-rose-200 to-pink-300",
    soft: "from-rose-100 via-pink-50 to-orange-100",
    stroke: "#fb7185",
  },
};

const FALLBACK_STYLE: StageStyle = {
  emoji: "📖",
  semester: 2,
  summary: "",
  idle: "bg-slate-200 text-slate-900 shadow-[0_6px_0_#cbd5e1]",
  done: "bg-slate-400 text-slate-950 shadow-[0_6px_0_#475569]",
  gradient: "from-slate-200 to-slate-300",
  soft: "from-slate-100 to-slate-50",
  stroke: "#94a3b8",
};

export const ROADMAP_STAGES: RoadmapStage[] = lessonsData.map((lesson) => ({
  ...lesson,
  ...(STYLES[lesson.id] ?? FALLBACK_STYLE),
  name: lesson.title.replace(/^Bài\s*\d+\s*:\s*/i, ""),
}));

export const getStage = (id: number) => ROADMAP_STAGES.find((s) => s.id === id);
