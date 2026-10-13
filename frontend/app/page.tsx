"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Background } from "@/components/Background";
import { useAuth } from "@/contexts/AuthContext";

const CTA =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-400 via-violet-400 to-sky-400 font-extrabold text-white shadow-soft transition duration-300 ease-bounce hover:scale-105 hover:shadow-pop focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 active:scale-95";

const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  {
    id: "roadmap",
    emoji: "🗺️",
    title: "Lộ trình Cá nhân hoá",
    lead: "Em không phải ôm cả chương trình một lúc. Trạm Sạc xếp bài theo khối 6, 7, 8, 9 và chỉ mở chặng khi em tới đúng lớp — học phần đang cần, không lạc giữa hàng chục bài.",
    points: [
      { emoji: "🔓", text: "Chặng của khối trên bị khoá cho đến khi em lên lớp. Bản đồ hiện rõ bài đang học và bài còn chờ." },
      { emoji: "📖", text: "Mỗi bài có văn bản, mục tiêu và chỗ ghi vở nháp, để em đọc rồi mới viết." },
      { emoji: "⚡", text: "Hoàn thành một chặng là nhận EXP. Đường đi trên bản đồ sáng dần sang bài kế tiếp." },
    ],
    band: "bg-peach-pastel/50",
  },
  {
    id: "ai",
    emoji: "✨",
    title: "Cô giáo AI tận tâm",
    lead: "Cô Cú ngồi cạnh 24/7 để gợi ý cách làm, chứ không viết hộ. Ý hay, câu văn và cảm xúc trong bài vẫn là của chính em.",
    points: [
      { emoji: "✨", text: "Máy tạo Dàn Ý: nhập đề, có khung mở bài – thân bài – kết bài để em tự triển khai." },
      { emoji: "🧚‍♀️", text: "Trợ lý Gỡ Bí: chỉ câu dài, từ sáo, chỗ diễn đạt chưa rõ, rồi gợi cách viết lại bằng lời của em." },
      { emoji: "🤝", text: "Cô không nộp một bài văn hoàn chỉnh thay em. Gợi ý dừng lại đúng lúc em có thể tự viết tiếp." },
    ],
    band: "bg-sky-pastel/60",
  },
  {
    id: "characters",
    emoji: "🎭",
    title: "Trò chuyện cùng Nhân vật",
    lead: "Thay vì chỉ học phần tiểu sử, em ngồi nói chuyện với chính người trong bài. Nhân vật kể bằng giọng của mình, rồi em được hỏi lại.",
    points: [
      { emoji: "👴", text: "Hỏi Lão Hạc về cậu Vàng, về những ngày khó và cách ông giữ chữ tín." },
      { emoji: "⚔️", text: "Nghe Thánh Gióng kể làng quê lúc giặc đến, rồi thử phỏng vấn xem ông nghĩ gì khi lên đường." },
      { emoji: "🌹", text: "Trò chuyện với Hoàng tử bé về những vì sao, chú cáo và điều gì làm một chuyện trở nên quan trọng." },
    ],
    band: "bg-pink-pastel/55",
  },
  {
    id: "games",
    emoji: "🎮",
    title: "Góc Giải Trí",
    lead: "Giờ chơi cũng là giờ ôn. Chính tả, tốc độ gõ và kiến thức tác giả nằm trong mấy ván ngắn — xong ván là cộng EXP để thăng cấp.",
    points: [
      { emoji: "👮‍♂️", text: "Cảnh sát Chính tả: tìm từ viết sai giữa các cách viết nhiễu, sửa đúng được +10 EXP." },
      { emoji: "⌨️", text: "Bàn phím Siêu tốc gõ lại một đoạn văn hay. Đua Tốc Độ Gõ thì tạo phòng và đua cùng bạn." },
      { emoji: "🧠", text: "Tác giả – Tác phẩm là vòng trắc nghiệm nhanh. Đúng hết câu còn thêm EXP thưởng." },
    ],
    band: "bg-lemon-pastel/70",
  },
  {
    id: "analytics",
    emoji: "📊",
    title: "Phân tích Năng lực",
    audience: "Dành cho giáo viên",
    lead: "Thầy cô nhìn cả lớp từ những gì học sinh đã viết thật, không chấm cảm tính. AI đọc vở nháp rồi chỉ ra em nào đang vững và em nào cần kèm.",
    points: [
      { emoji: "🎒", text: "Bảng học sinh theo khối, EXP và mức hoàn thành bài — biết ai đang đi đều, ai đang chậm." },
      { emoji: "🌟", text: "Mỗi em có nhận xét điểm mạnh, điểm yếu, trọng tâm ôn và một kế hoạch việc làm tiếp theo." },
      { emoji: "📝", text: "Lời nhận xét bám vở nháp em đã nộp, không đánh giá một bài văn em chưa viết." },
    ],
    band: "bg-mint-pastel/60",
  },
] as const;

export default function HomePage() {
  return (
    <div className="landing-light relative min-h-screen">
      <Background />
      <SiteHeader />
      <main>
        <HeroSection />
        <FeatureStories />
      </main>
      <SiteFooter />
    </div>
  );
}

function useEntryHref() {
  const { status } = useAuth();
  const signedIn = status === "authenticated";
  return {
    href: signedIn ? "/roadmap" : "/login",
    navLabel: signedIn ? "Vào học" : "Đăng nhập / Đăng ký",
    ctaLabel: signedIn ? "Vào lộ trình học" : "Bắt đầu học ngay miễn phí",
  };
}

function SiteHeader() {
  const { href, navLabel } = useEntryHref();

  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink-300 to-sky-300 text-2xl shadow-soft transition duration-300 ease-bounce group-hover:-rotate-12 group-hover:scale-110">
            🚀
          </span>
          <span className="truncate text-lg font-black tracking-tight sm:text-xl">Trạm Sạc Ngữ Văn 🚀</span>
        </Link>

        <Link href={href} className={`${CTA} ml-auto shrink-0 px-5 py-2.5 text-sm sm:px-6 sm:text-base`}>
          {navLabel}
        </Link>
      </div>
    </header>
  );
}

function HeroSection() {
  const reduce = useReducedMotion();
  const { href, ctaLabel } = useEntryHref();

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-3 inline-flex rounded-full bg-pink-pastel px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-pink-600">
          Dành cho học sinh lớp 6 – 9
        </p>
        <h1 className="text-4xl font-black leading-[1.15] tracking-tight sm:text-5xl">
          Đánh thức niềm đam mê Ngữ Văn cùng <span className="whitespace-nowrap">AI <span aria-hidden>🧚‍♀️</span></span>
        </h1>
        <p className="mt-4 max-w-xl text-base font-semibold leading-relaxed text-ink/70 sm:text-lg">
          Nền tảng học tập thông minh, cá nhân hoá lộ trình từ lớp 6 đến lớp 9, giúp em tự tin chinh phục mọi bài văn!
        </p>
        <div className="mt-8">
          <Link href={href} className={`${CTA} px-8 py-4 text-lg`}>
            {ctaLabel}
          </Link>
        </div>
      </motion.div>

      <HeroArt />
    </section>
  );
}

function HeroArt() {
  return (
    <div className="relative mx-auto w-full max-w-lg" aria-hidden>
      <div className="space-y-3 rounded-[2rem] bg-gradient-to-br from-sky-pastel via-lemon-pastel to-pink-pastel p-4 shadow-pop sm:hidden">
        <LessonCard />
        <ChatBubble />
        <div className="flex items-end justify-between px-1">
          <span className="text-6xl">🦉</span>
          <span className="rounded-full bg-lemon-pastel px-4 py-2 text-sm font-black text-amber-800 shadow-soft">+10 EXP ⚡</span>
        </div>
        <CharacterPills />
      </div>

      <div className="relative hidden h-[440px] sm:block">
        <div className="absolute inset-x-6 top-6 bottom-6 rounded-[2.5rem] bg-gradient-to-br from-sky-pastel via-lemon-pastel to-pink-pastel shadow-pop" />
        <div className="absolute left-4 top-4 animate-wiggle text-4xl">🚀</div>
        <div className="absolute left-10 top-16 w-56 -rotate-6">
          <LessonCard />
        </div>
        <div className="absolute right-4 top-24 max-w-[13rem] animate-float">
          <ChatBubble />
        </div>
        <div className="absolute bottom-24 right-8 rounded-full bg-lemon-pastel px-4 py-2 text-sm font-black text-amber-800 shadow-soft">
          +10 EXP ⚡
        </div>
        <div className="absolute bottom-8 left-8 right-8">
          <CharacterPills />
        </div>
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-8xl drop-shadow-md">🦉</div>
      </div>
    </div>
  );
}

function LessonCard() {
  return (
    <div className="rounded-[1.75rem] bg-surface p-4 shadow-soft">
      <p className="text-xs font-extrabold uppercase tracking-widest text-sky-600">Lộ trình lớp 8</p>
      <p className="mt-1 text-lg font-black">Lão Hạc</p>
      <div className="mt-3 space-y-2">
        <div className="h-2.5 rounded-full bg-mint-pastel" />
        <div className="h-2.5 w-4/5 rounded-full bg-lemon-pastel" />
        <div className="h-2.5 w-2/3 rounded-full bg-pink-pastel" />
      </div>
      <p className="mt-3 inline-flex rounded-full bg-mint-pastel px-3 py-1 text-xs font-extrabold text-emerald-800">Đã mở khoá</p>
    </div>
  );
}

function ChatBubble() {
  return (
    <div className="rounded-3xl rounded-br-lg bg-surface px-4 py-3 shadow-soft">
      <p className="text-xs font-extrabold text-pink-500">Lão Hạc</p>
      <p className="text-sm font-bold leading-snug">Cậu muốn nghe chuyện cậu Vàng không?</p>
    </div>
  );
}

function CharacterPills() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {["Lão Hạc", "Thánh Gióng", "Hoàng tử bé"].map((name) => (
        <span key={name} className="rounded-full bg-surface/90 px-3 py-1.5 text-xs font-extrabold shadow-soft">
          {name}
        </span>
      ))}
    </div>
  );
}

function FeatureStories() {
  const reduce = useReducedMotion();

  return (
    <div id="tinh-nang">
      <section className="mx-auto max-w-3xl px-4 pb-4 pt-6 text-center sm:px-6 sm:pt-10">
        <motion.h2
          className="text-3xl font-black tracking-tight sm:text-5xl"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
        >
          Trạm Sạc có gì cho em?
        </motion.h2>
        <motion.p
          className="mt-4 text-base font-semibold leading-relaxed text-ink/65 sm:text-lg"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.1, ease: EASE }}
        >
          Năm trạm trên đường viết văn. Cuộn chậm thôi — mỗi trạm một việc riêng, kể rõ để em biết mình sẽ làm gì khi vào học.
        </motion.p>
      </section>

      {FEATURES.map((feature, index) => (
        <FeatureSection key={feature.id} feature={feature} index={index} />
      ))}
    </div>
  );
}

function FeatureSection({ feature, index }: { feature: (typeof FEATURES)[number]; index: number }) {
  const reduce = useReducedMotion();
  const flipped = index % 2 === 1;
  const audience = "audience" in feature ? feature.audience : null;

  return (
    <section className={`${feature.band} scroll-mt-24`}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <motion.div
          className={flipped ? "lg:order-2" : undefined}
          initial={reduce ? false : { opacity: 0, x: flipped ? 36 : -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
        >
          <p className="text-sm font-extrabold text-ink/45">
            <span className="tabular-nums">0{index + 1}</span> <span aria-hidden>{feature.emoji}</span>
          </p>
          {audience && (
            <p className="mt-3 w-fit rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-sky-800 shadow-soft">{audience}</p>
          )}
          <h3 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{feature.title}</h3>
          <p className="mt-4 text-base font-semibold leading-relaxed text-ink/75 sm:text-lg">{feature.lead}</p>
          <FeaturePoints points={feature.points} />
        </motion.div>

        <ParallaxPanel className={flipped ? "lg:order-1" : undefined} from={flipped ? -48 : 48}>
          <FeatureVisual id={feature.id} />
        </ParallaxPanel>
      </div>
    </section>
  );
}

function FeaturePoints({ points }: { points: readonly { emoji: string; text: string }[] }) {
  const reduce = useReducedMotion();

  return (
    <ul className="mt-6 space-y-3">
      {points.map((point, index) => (
        <motion.li
          key={point.text}
          className="flex gap-3 rounded-2xl bg-surface/90 px-4 py-3 shadow-soft"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.12 + index * 0.1, ease: EASE }}
        >
          <span className="text-xl" aria-hidden>
            {point.emoji}
          </span>
          <span className="font-semibold leading-relaxed text-ink/80">{point.text}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function ParallaxPanel({ children, className, from }: { children: ReactNode; className?: string; from: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [36, -36]);

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={reduce ? false : { opacity: 0, x: from }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
        style={reduce ? undefined : { y }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function FeatureVisual({ id }: { id: (typeof FEATURES)[number]["id"] }) {
  if (id === "roadmap") return <RoadmapVisual />;
  if (id === "ai") return <AiVisual />;
  if (id === "characters") return <CharacterVisual />;
  if (id === "games") return <GameVisual />;
  return <AnalyticsVisual />;
}

function RoadmapVisual() {
  const steps = [
    { grade: "Lớp 6", label: "Đã xong", tone: "bg-mint-pastel text-emerald-800" },
    { grade: "Lớp 7", label: "Đang học", tone: "bg-lemon-pastel text-amber-800" },
    { grade: "Lớp 8", label: "Sắp mở", tone: "bg-surface text-ink/45" },
    { grade: "Lớp 9", label: "Còn khoá", tone: "bg-surface text-ink/45" },
  ];

  return (
    <div className="rounded-[2rem] bg-surface p-6 shadow-pop">
      <p className="text-sm font-extrabold text-ink/50">Bản đồ của em</p>
      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li key={step.grade} className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-peach-pastel text-sm font-black">{index + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-black">{step.grade}</span>
              <span className="mt-1 block h-2 overflow-hidden rounded-full bg-cream">
                <span className="block h-full rounded-full bg-gradient-to-r from-pink-300 to-amber-300" style={{ width: `${100 - index * 28}%` }} />
              </span>
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${step.tone}`}>{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AiVisual() {
  return (
    <div className="space-y-3 rounded-[2rem] bg-gradient-to-br from-sky-pastel to-pink-pastel p-5 shadow-pop">
      <div className="ml-auto max-w-[16rem] rounded-3xl rounded-br-md bg-surface px-4 py-3 shadow-soft">
        <p className="text-sm font-bold">Cô ơi, em bí đoạn mở bài quá.</p>
      </div>
      <div className="max-w-[18rem] rounded-3xl rounded-bl-md bg-surface px-4 py-3 shadow-soft">
        <p className="text-xs font-extrabold text-sky-600">Cô Cú 🦉</p>
        <p className="mt-1 text-sm font-bold leading-snug">
          Em thử mở bằng một hình ảnh quen thuộc, rồi mới nêu vấn đề. Cô không viết hộ đoạn này đâu!
        </p>
      </div>
      <p className="px-1 text-xs font-extrabold text-ink/55">Gợi ý dàn ý · Gỡ bí diễn đạt · Không giải bài hộ</p>
    </div>
  );
}

function CharacterVisual() {
  const people = [
    { name: "Lão Hạc", line: "Cậu muốn nghe chuyện cậu Vàng không?" },
    { name: "Thánh Gióng", line: "Làng ta hôm ấy vó ngựa rung cả đất." },
    { name: "Hoàng tử bé", line: "Điều quan trọng, mắt thường không thấy đâu." },
  ];

  return (
    <div className="space-y-3 rounded-[2rem] bg-gradient-to-br from-pink-pastel to-lemon-pastel p-5 shadow-pop">
      {people.map((person) => (
        <div key={person.name} className="rounded-3xl bg-surface px-4 py-3 shadow-soft">
          <p className="text-xs font-extrabold text-pink-500">{person.name}</p>
          <p className="mt-1 font-bold leading-snug">{person.line}</p>
        </div>
      ))}
    </div>
  );
}

function GameVisual() {
  const games = [
    { emoji: "👮‍♂️", name: "Cảnh sát Chính tả", reward: "+10 EXP" },
    { emoji: "⌨️", name: "Bàn phím Siêu tốc", reward: "5–20 EXP" },
    { emoji: "🏁", name: "Đua Tốc Độ Gõ", reward: "Nhất +20" },
  ];

  return (
    <div className="rounded-[2rem] bg-surface p-6 shadow-pop">
      <ul className="space-y-3">
        {games.map((game) => (
          <li key={game.name} className="flex items-center gap-3 rounded-2xl bg-lemon-pastel/80 px-4 py-3">
            <span className="text-2xl" aria-hidden>
              {game.emoji}
            </span>
            <span className="flex-1 font-black">{game.name}</span>
            <span className="text-xs font-extrabold text-amber-800">{game.reward}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <div className="mb-1 flex justify-between text-xs font-extrabold">
          <span>Cấp 2 · ✏️ Cây bút trẻ</span>
          <span className="text-ink/50">120 / 150 EXP</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-cream">
          <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-pink-300 via-amber-300 to-emerald-300" />
        </div>
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  const notes = [
    { emoji: "🌟", title: "Điểm mạnh", text: "Mở bài có hình ảnh, biết dẫn tác phẩm." },
    { emoji: "⚠️", title: "Điểm yếu", text: "Thân bài còn kể lại, ít lời bình." },
    { emoji: "🎯", title: "Ôn tiếp", text: "Viết một câu nêu cảm nghĩ sau mỗi dẫn chứng." },
  ];

  return (
    <div className="rounded-[2rem] bg-surface p-6 shadow-pop">
      <p className="text-sm font-extrabold text-ink/50">Vở nháp của cả lớp</p>
      <ul className="mt-4 space-y-3">
        {notes.map((note) => (
          <li key={note.title} className="rounded-2xl bg-mint-pastel/70 px-4 py-3">
            <p className="font-black">
              <span aria-hidden>{note.emoji} </span>
              {note.title}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink/70">{note.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-ink/5 bg-surface/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center sm:px-6">
        <p className="text-2xl" aria-hidden>
          🦉 📚 🚀
        </p>
        <p className="max-w-md text-base font-extrabold">Học văn vui như được sạc pin — mỗi ngày một chút, bài văn sáng hơn.</p>
        <p className="text-xs font-semibold text-ink/45">
          © {new Date().getFullYear()} Trạm Sạc Ngữ Văn. AI chỉ gợi ý — bài văn hay nhất là bài em tự viết.
        </p>
      </div>
    </footer>
  );
}
