"use client";

import { useEffect, useRef } from "react";
import { BookOpenText } from "lucide-react";
import type { LessonStage, RoadmapStage } from "@/lib/roadmap";
import { Mascot } from "../Mascot";
import { splitTextName } from "./shared";

/** Cột "Sách giáo khoa": giấy kem, chữ có chân, cuộn độc lập với vở bài tập. */
export function TextbookPane({
  stage,
  activeText,
  onSelectText,
  className = "",
}: {
  stage: LessonStage;
  activeText: number;
  onSelectText: (index: number) => void;
  className?: string;
}) {
  const scrollRef = useRef<HTMLElement>(null);
  const text = stage.texts[activeText] ?? stage.texts[0];
  const { title, author } = splitTextName(text?.name ?? stage.title);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeText]);

  return (
    <section
      ref={scrollRef}
      aria-label="Sách giáo khoa"
      className={`h-full overflow-y-auto overscroll-contain bg-paper text-stone-800 selection:bg-amber-200/70 dark:text-stone-200 dark:selection:bg-amber-700/50 ${className}`}
    >
      <article key={activeText} className="mx-auto max-w-4xl animate-fade-in px-5 pb-24 pt-8 sm:px-8 lg:px-10 lg:pt-12 2xl:max-w-5xl">
        {stage.texts.length > 1 && (
          <TextSwitcher stage={stage} activeText={activeText} onSelectText={onSelectText} />
        )}

        <header className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-800/60 dark:text-amber-300/60">
            Bài {stage.id} · Văn bản {activeText + 1} · {stage.theme}
          </p>
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-stone-900 sm:text-4xl dark:text-stone-50">
            {title}
          </h1>
          {author && <p className="mt-3 font-serif text-lg italic text-stone-500 dark:text-stone-400">{author}</p>}
          <Ornament />
        </header>

        {text && text.fullText.length > 0 ? (
          <div className="font-serif text-lg leading-relaxed">
            {text.fullText.map((paragraph, i) => (
              <p
                key={i}
                className={`mb-5 text-justify hyphens-auto ${
                  i === 0
                    ? "first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-amber-800 dark:first-letter:text-amber-300"
                    : "indent-8"
                }`}
              >
                {paragraph}
              </p>
            ))}
            <p className="mt-12 text-center font-serif text-sm italic tracking-widest text-stone-400">— Hết —</p>
          </div>
        ) : (
          <EmptyText />
        )}
      </article>
    </section>
  );
}

/** Giữ đúng khung giấy kem của sách, các dòng chữ "hiện dần" trong lúc chờ GET /api/lessons/:id. */
export function TextbookSkeleton({ stage, className = "" }: { stage: RoadmapStage; className?: string }) {
  const lines = ["w-full", "w-11/12", "w-full", "w-10/12", "w-full", "w-9/12"];
  return (
    <section aria-label="Sách giáo khoa đang tải" className={`h-full overflow-hidden bg-paper ${className}`}>
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-8 sm:px-8 lg:px-10 lg:pt-12 2xl:max-w-5xl">
        <header className="flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-800/60 dark:text-amber-300/60">
            Bài {stage.id} · {stage.theme}
          </p>
          <div className="mt-5 h-9 w-2/3 animate-pulse rounded-full bg-stone-200/80 dark:bg-white/10" />
          <div className="mt-4 h-5 w-40 animate-pulse rounded-full bg-stone-200/60 dark:bg-white/5" />
          <Ornament />
        </header>
        <div className="mb-8 flex justify-center">
          <Mascot loading size="sm" messages={["Cô Cú đang lật tới trang sách... 📖", "Đang chép văn bản vào vở cho em ✍️"]} />
        </div>
        {[0, 1, 2].map((p) => (
          <div key={p} className="mb-7 space-y-3">
            {lines.map((w, i) => (
              <div
                key={i}
                className={`h-4 ${w} animate-pulse rounded-full bg-stone-200/70 dark:bg-white/10`}
                style={{ animationDelay: `${(p * lines.length + i) * 80}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function TextSwitcher({
  stage,
  activeText,
  onSelectText,
}: {
  stage: LessonStage;
  activeText: number;
  onSelectText: (index: number) => void;
}) {
  return (
    <nav aria-label="Chọn văn bản" className="mb-10 flex flex-wrap justify-center gap-2">
      {stage.texts.map((t, i) => {
        const active = i === activeText;
        return (
          <button
            key={`${i}-${t.name}`}
            type="button"
            onClick={() => onSelectText(i)}
            aria-pressed={active}
            title={t.name}
            className={`max-w-full truncate rounded-full border px-4 py-1.5 text-sm font-extrabold transition duration-300 ease-bounce hover:-translate-y-0.5 ${
              active
                ? "border-amber-800 bg-amber-800 text-amber-50 dark:border-amber-300 dark:bg-amber-300 dark:text-stone-900"
                : "border-stone-300 bg-white/60 text-stone-600 hover:border-amber-700 dark:border-stone-600 dark:bg-white/5 dark:text-stone-300"
            }`}
          >
            Văn bản {i + 1}: {splitTextName(t.name).title}
          </button>
        );
      })}
    </nav>
  );
}

function Ornament() {
  return (
    <div className="my-8 flex items-center justify-center gap-4 text-amber-800/40 dark:text-amber-300/40" aria-hidden>
      <span className="h-px w-16 bg-current" />
      <span className="font-serif text-xl">❦</span>
      <span className="h-px w-16 bg-current" />
    </div>
  );
}

function EmptyText() {
  return (
    <div className="mx-auto mt-4 flex max-w-sm flex-col items-center rounded-3xl border-2 border-dashed border-stone-300 px-6 py-12 text-center dark:border-stone-600">
      <BookOpenText className="h-10 w-10 text-stone-400" />
      <p className="mt-4 font-serif text-lg italic text-stone-500 dark:text-stone-400">
        Nội dung văn bản đang được cập nhật.
      </p>
      <p className="mt-1 text-sm font-semibold text-stone-400">Em mở sách giáo khoa giấy để đọc song song nhé!</p>
    </div>
  );
}
