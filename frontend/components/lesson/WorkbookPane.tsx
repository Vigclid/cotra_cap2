"use client";

import { BookOpen, Check, ChevronDown, ChevronRight, PartyPopper, Sparkles, Target } from "lucide-react";
import { CHARACTERS } from "@/lib/characters";
import { ROADMAP_EXP, type LessonStage } from "@/lib/roadmap";
import { MAX_DRAFT_CHARS } from "@/lib/types";
import { BouncyButton } from "../ui";
import { QuestionCard } from "./QuestionCard";
import { questionKey, splitTextName, type SaveDraftFn, type SaveFn, type Store } from "./shared";

const ASIDE_CLASS =
  "relative h-full flex-col overflow-y-auto overscroll-contain bg-white dark:bg-surface lg:border-l lg:border-stone-200 lg:shadow-[-16px_0_40px_-20px_rgb(63_61_86/0.35)] dark:lg:border-white/10";

/** Cột "Vở bài tập": câu hỏi theo từng văn bản, gợi ý AI, vở nháp và nút hoàn thành chặng. */
export function WorkbookPane({
  stage,
  done,
  preview,
  hasNext,
  completing,
  completeError,
  progress,
  openText,
  drafts,
  hints,
  onToggleText,
  onReadText,
  onSaveDraft,
  onSaveHint,
  onDraftChange,
  onComplete,
  onNext,
  onClose,
  className = "",
}: {
  stage: LessonStage;
  done: boolean;
  preview: boolean;
  hasNext: boolean;
  completing: boolean;
  completeError: string | null;
  progress: { drafted: number; total: number };
  openText: number | null;
  drafts: Store;
  hints: Store;
  onToggleText: (index: number) => void;
  /** Chỉ hiện dưới lg: chuyển sang tab Đọc sách tại văn bản tương ứng. */
  onReadText: (index: number) => void;
  onSaveDraft: SaveDraftFn;
  onSaveHint: SaveFn;
  onDraftChange: SaveFn;
  onComplete: () => void;
  onNext: () => void;
  onClose: () => void;
  className?: string;
}) {
  return (
    <aside aria-label="Vở bài tập" className={`${ASIDE_CLASS} ${className}`}>
      <div className="flex-1 space-y-5 p-5 sm:p-8">
        <div>
          <h2 className="text-2xl font-black">📝 Vở bài tập</h2>
          <p className="mt-1 text-sm font-semibold text-ink/55">
            Đọc kĩ văn bản, nhờ Cô Cú gợi ý rồi tự viết câu trả lời vào vở nháp nhé!
          </p>
        </div>

        <Objectives objectives={stage.objectives} />

        <div className="space-y-3">
          {stage.texts.map((text, ti) => (
            <TextSection
              key={`${ti}-${text.name}`}
              stage={stage}
              textIndex={ti}
              expanded={openText === ti}
              drafts={drafts}
              hints={hints}
              onToggle={() => onToggleText(ti)}
              onRead={() => onReadText(ti)}
              onSaveDraft={onSaveDraft}
              onSaveHint={onSaveHint}
              onDraftChange={onDraftChange}
            />
          ))}
        </div>

        <StageCharacters lessonId={stage.id} />
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-ink/5 bg-white/90 p-4 backdrop-blur dark:bg-surface/90 sm:px-8">
        <p className="mb-3 flex items-center justify-between text-xs font-extrabold text-ink/55">
          <span>
            📒 Vở nháp: {progress.drafted}/{progress.total} câu
          </span>
          <span>{preview ? "Chế độ xem trước – không lưu" : "Tự động lưu vào tài khoản của em"}</span>
        </p>
        {completeError && (
          <p role="alert" className="mb-3 rounded-2xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 dark:bg-red-950/50 dark:text-red-300">
            {completeError}
          </p>
        )}
        {preview ? (
          <BouncyButton
            type="button"
            onClick={hasNext ? onNext : onClose}
            className="w-full bg-violet-400 py-3 text-base hover:bg-violet-500"
            icon={<ChevronRight className="h-5 w-5" />}
          >
            {hasNext ? "Xem chặng tiếp theo" : "Về bản đồ"}
          </BouncyButton>
        ) : done ? (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="flex items-center gap-2 font-extrabold text-emerald-600 dark:text-emerald-300">
              <PartyPopper className="h-5 w-5" /> Tuyệt vời! Em đã nhận +{ROADMAP_EXP} EXP
            </p>
            <BouncyButton
              type="button"
              onClick={hasNext ? onNext : onClose}
              className="bg-violet-400 py-3 text-base hover:bg-violet-500"
              icon={<ChevronRight className="h-5 w-5" />}
            >
              {hasNext ? "Chặng tiếp theo" : "Về bản đồ"}
            </BouncyButton>
          </div>
        ) : (
          <>
            {progress.drafted < progress.total && (
              <p className="mb-2 text-center text-xs font-bold text-ink/50">
                Viết câu trả lời vào đủ các vở nháp (tối đa {MAX_DRAFT_CHARS} ký tự mỗi câu) để hoàn thành chặng.
              </p>
            )}
            <BouncyButton
              type="button"
              onClick={onComplete}
              disabled={progress.total === 0 || progress.drafted < progress.total}
              loading={completing}
              loadingText="Đang lưu tiến độ..."
              className="w-full bg-emerald-400 hover:bg-emerald-500"
              icon={<Sparkles className="h-5 w-5" />}
            >
              Hoàn thành chặng này
              <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-sm">+{ROADMAP_EXP} EXP</span>
            </BouncyButton>
          </>
        )}
      </footer>
    </aside>
  );
}

/** Khung vở bài tập trong lúc chờ tải bài học + vở nháp từ server. */
export function WorkbookSkeleton({ className = "" }: { className?: string }) {
  return (
    <aside aria-label="Vở bài tập đang tải" className={`${ASIDE_CLASS} ${className}`}>
      <div className="flex-1 space-y-5 p-5 sm:p-8">
        <div>
          <h2 className="text-2xl font-black">📝 Vở bài tập</h2>
          <p className="mt-1 text-sm font-semibold text-ink/55">Cô Cú đang mở vở nháp của em...</p>
        </div>
        <div className="h-14 animate-pulse rounded-3xl bg-mint-pastel/50" />
        {[0, 1].map((i) => (
          <div key={i} className="space-y-3 rounded-3xl border border-ink/10 p-4">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 animate-pulse rounded-full bg-cream" />
              <span className="h-5 flex-1 animate-pulse rounded-full bg-cream" />
            </div>
            <div className="h-40 animate-pulse rounded-2xl bg-cream" style={{ animationDelay: `${i * 150}ms` }} />
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */

function TextSection({
  stage,
  textIndex,
  expanded,
  drafts,
  hints,
  onToggle,
  onRead,
  onSaveDraft,
  onSaveHint,
  onDraftChange,
}: {
  stage: LessonStage;
  textIndex: number;
  expanded: boolean;
  drafts: Store;
  hints: Store;
  onToggle: () => void;
  onRead: () => void;
  onSaveDraft: SaveDraftFn;
  onSaveHint: SaveFn;
  onDraftChange: SaveFn;
}) {
  const text = stage.texts[textIndex];
  const total = text.questions.length;
  const count = text.questions.filter((_, qi) => drafts[questionKey(stage.id, textIndex, qi)]?.trim()).length;
  const { title, author } = splitTextName(text.name);

  return (
    <div
      className={`overflow-hidden rounded-3xl border transition-colors ${
        expanded ? "border-amber-200 bg-white shadow-soft dark:border-amber-900/60 dark:bg-surface" : "border-ink/10 bg-white dark:bg-surface"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="group flex w-full items-center gap-3 p-4 text-left transition hover:bg-lemon-pastel/40"
      >
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${stage.idle}`}>
          <BookOpen className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold leading-snug">{title}</span>
          <span className="mt-0.5 block text-xs font-bold text-ink/50">
            {author && <>{author} · </>}
            {total} câu hỏi ·{" "}
            <span className={count === total ? "text-emerald-600 dark:text-emerald-300" : ""}>
              đã nháp {count}/{total}
            </span>
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-ink/40 transition duration-300 ease-bounce ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden" inert={!expanded}>
          <button
            type="button"
            onClick={onRead}
            className="mx-4 mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-amber-900 transition hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200 lg:hidden"
          >
            <BookOpen className="h-3.5 w-3.5" /> Đọc lại văn bản
          </button>
          <ol className="space-y-3 px-4 pb-4">
            {text.questions.map((question, qi) => {
              const key = questionKey(stage.id, textIndex, qi);
              return (
                <QuestionCard
                  key={key}
                  storageKey={key}
                  lessonId={stage.id}
                  textIndex={textIndex}
                  questionIndex={qi}
                  question={question}
                  saved={drafts[key] ?? ""}
                  hint={hints[key]}
                  onSaveDraft={onSaveDraft}
                  onSaveHint={onSaveHint}
                  onDraftChange={(value) => onDraftChange(key, value)}
                />
              );
            })}
            {total === 0 && <li className="text-sm font-semibold text-ink/50">Văn bản này chưa có câu hỏi.</li>}
          </ol>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Objectives({ objectives }: { objectives: string[] }) {
  return (
    <details className="group rounded-3xl bg-mint-pastel/50 p-4 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-black uppercase tracking-widest text-ink/60">
        <Target className="h-4 w-4" /> Yêu cầu cần đạt
        <ChevronDown className="ml-auto h-4 w-4 transition group-open:rotate-180" />
      </summary>
      <ul className="mt-3 space-y-2">
        {objectives.map((objective) => (
          <li key={objective} className="flex items-start gap-2.5 text-sm font-bold leading-relaxed">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400 text-white">
              <Check className="h-3 w-3" strokeWidth={3.5} />
            </span>
            {objective}
          </li>
        ))}
      </ul>
    </details>
  );
}

function StageCharacters({ lessonId }: { lessonId: number }) {
  const characters = CHARACTERS.filter((c) => c.lesson === lessonId);
  if (characters.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-ink/50">🎭 Nhân vật đang chờ em</h3>
      <div className="flex flex-wrap gap-2">
        {characters.map((c) => (
          <span
            key={c.id}
            className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br px-3 py-1.5 text-sm font-extrabold text-slate-800 ${c.gradient}`}
          >
            <span aria-hidden>{c.emoji}</span> {c.name}
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-xs font-semibold text-ink/50">Ghé tab “Nhân vật” để trò chuyện cùng các bạn ấy nhé!</p>
    </section>
  );
}
