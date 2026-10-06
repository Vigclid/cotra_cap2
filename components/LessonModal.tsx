"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpenText, Check, NotebookPen, X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { RoadmapStage } from "@/lib/roadmap";
import { TextbookPane } from "./lesson/TextbookPane";
import { WorkbookPane } from "./lesson/WorkbookPane";
import { questionKey, type DeskTab, type SaveFn, type Store } from "./lesson/shared";

const CLOSE_MS = 260;

/**
 * "Bàn học ảo" phủ kín viewport (h-screen, không cuộn trang):
 * - lg trở lên: Sách giáo khoa 60% | Vở bài tập 40%, mỗi cột tự cuộn.
 * - Dưới lg: hai Tab "Đọc sách" / "Làm bài tập", cả hai cột vẫn được mount để giữ vị trí cuộn và nội dung đang gõ.
 */
export function LessonModal({
  stage,
  done,
  onClose,
  onComplete,
  onNext,
}: {
  stage: RoadmapStage;
  done: boolean;
  onClose: () => void;
  onComplete: () => void;
  onNext: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [drafts, setDrafts, draftsLoaded] = useLocalStorage<Store>("tram-sac-drafts", {});
  const [hints, setHints] = useLocalStorage<Store>("tram-sac-hints", {});

  const [tab, setTab] = useState<DeskTab>("read");
  const [readingText, setReadingText] = useState(0);
  const [openText, setOpenText] = useState<number | null>(0);

  // Sang chặng khác → về văn bản đầu tiên, tab Đọc sách.
  const [stageId, setStageId] = useState(stage.id);
  if (stageId !== stage.id) {
    setStageId(stage.id);
    setTab("read");
    setReadingText(0);
    setOpenText(0);
  }

  const requestClose = useCallback(() => setClosing(true), []);
  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(onClose, CLOSE_MS);
    return () => clearTimeout(timer);
  }, [closing, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && requestClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [requestClose]);

  const saveDraft = useCallback<SaveFn>((key, value) => setDrafts((prev) => ({ ...prev, [key]: value })), [setDrafts]);
  const saveHint = useCallback<SaveFn>((key, value) => setHints((prev) => ({ ...prev, [key]: value })), [setHints]);

  const selectText = (index: number) => {
    setReadingText(index);
    setOpenText(index);
  };
  const toggleText = (index: number) => (openText === index ? setOpenText(null) : selectText(index));
  const readText = (index: number) => {
    selectText(index);
    setTab("read");
  };

  const allKeys = stage.texts.flatMap((t, ti) => t.questions.map((_, qi) => questionKey(stage.id, ti, qi)));
  const progress = { drafted: allKeys.filter((k) => drafts[k]?.trim()).length, total: allKeys.length };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-title"
      className={`fixed inset-0 z-50 flex h-screen flex-col overflow-hidden bg-paper supports-[height:100dvh]:h-dvh ${
        closing ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      <DeskHeader stage={stage} done={done} onClose={requestClose}>
        <DeskTabs tab={tab} onChange={setTab} progress={progress} />
      </DeskHeader>

      <div className="flex min-h-0 flex-1">
        <TextbookPane
          key={`textbook-${stage.id}`}
          stage={stage}
          activeText={readingText}
          onSelectText={selectText}
          className={`${tab === "read" ? "block" : "hidden"} w-full lg:block lg:w-3/5`}
        />
        <WorkbookPane
          key={`workbook-${stage.id}`}
          stage={stage}
          done={done}
          progress={progress}
          openText={openText}
          drafts={drafts}
          draftsLoaded={draftsLoaded}
          hints={hints}
          onToggleText={toggleText}
          onReadText={readText}
          onSaveDraft={saveDraft}
          onSaveHint={saveHint}
          onComplete={onComplete}
          onNext={onNext}
          onClose={requestClose}
          className={`${tab === "practice" ? "flex" : "hidden"} w-full lg:flex lg:w-2/5 ${
            closing ? "lg:animate-slide-out-right" : "lg:animate-slide-in-right"
          }`}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function DeskHeader({
  stage,
  done,
  onClose,
  children,
}: {
  stage: RoadmapStage;
  done: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <header className="relative z-20 shrink-0 border-b border-stone-200/80 bg-paper/95 backdrop-blur dark:border-white/10">
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-5">
        <button
          onClick={onClose}
          aria-label="Đóng, quay lại Lộ trình"
          className="group flex h-11 shrink-0 items-center gap-2 rounded-full bg-white pl-1.5 pr-4 text-slate-700 shadow-soft transition duration-300 ease-bounce hover:scale-105 active:scale-95 dark:bg-surface dark:text-ink"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-800 text-white transition duration-300 ease-bounce group-hover:rotate-90">
            <X className="h-4 w-4" strokeWidth={3} />
          </span>
          <span className="text-sm font-extrabold">Lộ trình</span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-black uppercase tracking-widest text-ink/45">
            {stage.emoji} Chặng {stage.id} · Học kì {stage.semester === 1 ? "I" : "II"} · {stage.theme}
          </p>
          <p id="lesson-title" className="truncate font-black leading-tight sm:text-lg">
            {stage.title}
          </p>
        </div>

        {done && (
          <span className="hidden shrink-0 animate-pop-in items-center gap-1 rounded-full bg-emerald-400 px-3 py-1 text-xs font-extrabold text-white shadow-soft sm:inline-flex">
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Đã hoàn thành
          </span>
        )}
      </div>
      {children}
    </header>
  );
}

const TABS: { id: DeskTab; label: string; icon: typeof BookOpenText }[] = [
  { id: "read", label: "Đọc sách", icon: BookOpenText },
  { id: "practice", label: "Làm bài tập", icon: NotebookPen },
];

function DeskTabs({
  tab,
  onChange,
  progress,
}: {
  tab: DeskTab;
  onChange: (tab: DeskTab) => void;
  progress: { drafted: number; total: number };
}) {
  return (
    <div className="px-3 pb-2.5 sm:px-5 lg:hidden">
      <div role="tablist" aria-label="Chế độ học" className="relative grid grid-cols-2 rounded-full bg-stone-200/60 p-1 dark:bg-white/10">
        <span
          aria-hidden
          className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-soft transition-transform duration-300 ease-bounce dark:bg-surface ${
            tab === "practice" ? "translate-x-full" : ""
          }`}
        />
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(id)}
              className={`relative flex items-center justify-center gap-2 rounded-full py-2 text-sm font-extrabold transition-colors ${
                active ? "text-ink" : "text-ink/50 hover:text-ink/80"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === "practice" && (
                <span className="rounded-full bg-violet-200 px-2 py-0.5 text-[11px] font-black text-violet-900">
                  {progress.drafted}/{progress.total}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
