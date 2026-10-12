"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Lock, PartyPopper, RefreshCw } from "lucide-react";
import { useStudentGrade } from "@/hooks/useStudentGrade";
import { markLessonsCompleted, useLessons } from "@/hooks/useLessons";
import { popConfetti } from "@/lib/confetti";
import { gradeLockMessage, groupByGrade, isGradeLocked } from "@/lib/grades";
import { ROADMAP_EXP, toStage, type RoadmapStage } from "@/lib/roadmap";
import type { ExpResult } from "@/types/api";
import { LessonModal } from "./LessonModal";
import { Mascot } from "./Mascot";
import { BouncyButton, Card, CuteLock, ErrorBox, LockToast } from "./ui";

const NODE = 84;
const ROW_H = 150;
/** Chừa chỗ cho bong bóng "Bắt đầu" phía trên nút đầu tiên. */
const TOP_PAD = 64;
const TROPHY = 104;

type Point = { x: number; y: number };

/**
 * Lộ trình học tập kiểu Duolingo – danh sách chặng & cờ hoàn thành lấy từ GET /api/lessons.
 * `preview` (giáo viên/admin): mở mọi chặng để xem, không ghi tiến độ.
 */
export function Roadmap({
  onReward,
  preview = false,
}: {
  onReward: (exp: number, lessonId?: number) => Promise<ExpResult | null>;
  preview?: boolean;
}) {
  const { lessons, error, reload } = useLessons();
  const { ready, grade: studentGrade } = useStudentGrade();

  if (!ready || (!lessons && !error)) return <RoadmapSkeleton />;
  if (error && !lessons) return <RoadmapError message={error} onRetry={reload} />;
  if (!lessons || lessons.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-12 text-center">
        <span className="text-5xl">🗺️</span>
        <p className="text-lg font-extrabold">Lộ trình đang được thầy cô chuẩn bị</p>
        <p className="text-sm font-semibold text-ink/55">Chưa có chặng học nào, em quay lại sau nhé!</p>
      </Card>
    );
  }
  return <RoadmapBoard lessons={lessons} preview={preview} studentGrade={studentGrade} onReward={onReward} />;
}

function RoadmapBoard({
  lessons,
  preview,
  studentGrade,
  onReward,
}: {
  lessons: NonNullable<ReturnType<typeof useLessons>["lessons"]>;
  preview: boolean;
  studentGrade: number | null;
  onReward: (exp: number, lessonId?: number) => Promise<ExpResult | null>;
}) {
  const stages = useMemo(() => lessons.map(toStage), [lessons]);
  const completed = useMemo(() => lessons.filter((l) => l.completed).map((l) => l.lessonId), [lessons]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  const sections = useMemo(
    () =>
      groupByGrade(stages).map(([grade, sectionStages]) => {
        const gradeLocked = !preview && isGradeLocked(studentGrade, grade);
        const current = preview || gradeLocked ? null : (sectionStages.find((stage) => !completed.includes(stage.id)) ?? null);
        const currentStep = current ? sectionStages.findIndex((stage) => stage.id === current.id) + 1 : 0;
        return { grade, stages: sectionStages, gradeLocked, current, currentStep };
      }),
    [stages, completed, preview, studentGrade],
  );

  const playable = stages.filter((stage) => preview || !isGradeLocked(studentGrade, stage.grade));
  const doneCount = playable.filter((stage) => completed.includes(stage.id)).length;
  const focus = sections.find((section) => section.grade === studentGrade && section.current) ?? sections.find((section) => section.current);
  const openIndex = stages.findIndex((stage) => stage.id === openId);
  const openStage = stages[openIndex] ?? null;
  const openSection = openStage ? sections.find((section) => section.grade === openStage.grade) : null;
  const nextStage = openSection && openIndex >= 0 ? (openSection.stages[openSection.stages.findIndex((stage) => stage.id === openId) + 1] ?? null) : null;

  /** Trong một khối đã mở: chỉ học chặng đã xong hoặc chặng đang tới. Khối cao hơn thì khoá cả section. */
  const canOpen = (stage: RoadmapStage) => {
    if (preview) return true;
    if (isGradeLocked(studentGrade, stage.grade)) return false;
    const section = sections.find((item) => item.grade === stage.grade);
    return completed.includes(stage.id) || stage.id === section?.current?.id;
  };

  const open = (stage: RoadmapStage) => {
    if (!canOpen(stage)) {
      if (isGradeLocked(studentGrade, stage.grade)) showToast(gradeLockMessage(stage.grade));
      return;
    }
    setCompleteError(null);
    setOpenId(stage.id);
  };
  const closePanel = useCallback(() => setOpenId(null), []);

  const complete = async (id: number) => {
    const stage = stages.find((item) => item.id === id);
    if (preview || completing || !stage || completed.includes(id) || !canOpen(stage)) return;
    setCompleting(true);
    setCompleteError(null);
    const res = await onReward(ROADMAP_EXP, id);
    setCompleting(false);
    if (!res) {
      setCompleteError("Chưa lưu được tiến độ, em thử bấm lại nhé!");
      return;
    }
    markLessonsCompleted(res.completedLessons ?? [id]);
    popConfetti();
  };

  const jumpTo = (grade: number) => {
    document.getElementById(`lo-trinh-lop-${grade}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold">🗺️ Lộ trình Học tập</h2>
          <p className="text-sm font-semibold text-ink/60">
            {preview
              ? `${sections.length} khối lớp, ${stages.length} chặng. Thầy cô xem trước được mọi lộ trình.`
              : `Em đang học Lớp ${studentGrade}. Chặng từ Lớp ${studentGrade} trở xuống đã mở. Mỗi chặng được `}
            {!preview && <span className="font-extrabold text-amber-600 dark:text-amber-300">+{ROADMAP_EXP} EXP</span>}
            {!preview && "!"}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime-300 via-amber-300 to-pink-300 transition-[width] duration-700 ease-bounce"
                style={{ width: `${playable.length === 0 ? 0 : Math.max((doneCount / playable.length) * 100, doneCount > 0 ? 3 : 0)}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-extrabold text-ink/70">
              {doneCount}/{playable.length} chặng
            </span>
          </div>
        </div>
        {preview ? (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-sky-pastel px-5 py-3 font-extrabold text-sky-800 dark:text-sky-200">
            👀 Chế độ xem trước
          </span>
        ) : focus?.current ? (
          <button
            onClick={() => open(focus.current!)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-lime-300 px-5 py-3 font-extrabold text-lime-950 shadow-[0_5px_0_#84cc16] transition duration-300 ease-bounce hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
          >
            Tiếp tục: Lớp {focus.grade} · Chặng {focus.currentStep} <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-lemon-pastel px-5 py-3 font-extrabold text-amber-700 dark:text-amber-300">
            <PartyPopper className="h-5 w-5" /> Đã về đích các lớp đang mở!
          </span>
        )}
      </Card>

      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.grade}
            type="button"
            onClick={() => jumpTo(section.grade)}
            className={`rounded-full px-4 py-2 text-sm font-extrabold transition duration-300 ease-bounce hover:-translate-y-0.5 ${
              section.gradeLocked ? "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300" : "bg-lime-200 text-lime-950"
            }`}
          >
            {section.gradeLocked ? "🔒" : "📖"} Lộ trình Lớp {section.grade}
          </button>
        ))}
      </div>

      {sections.map((section) => {
        const sectionDone = section.stages.filter((stage) => completed.includes(stage.id)).length;
        return (
          <section key={section.grade} id={`lo-trinh-lop-${section.grade}`} className="scroll-mt-28 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2 px-1">
              <div>
                <h3 className="text-lg font-black">Lộ trình Lớp {section.grade}</h3>
                <p className="text-sm font-semibold text-ink/55">
                  {section.gradeLocked
                    ? gradeLockMessage(section.grade)
                    : `${sectionDone}/${section.stages.length} chặng · xong chặng trước mới mở chặng sau`}
                </p>
              </div>
              {section.gradeLocked && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">Đang khoá</span>
              )}
            </div>
            <div className={`rounded-[2rem] bg-surface/60 px-2 py-6 shadow-soft sm:px-6 ${section.gradeLocked ? "grayscale-[0.35]" : ""}`}>
              <RoadmapPath
                stages={section.stages}
                completed={completed}
                currentId={section.current?.id ?? null}
                allDone={!preview && !section.gradeLocked && !section.current}
                preview={preview}
                gradeLocked={section.gradeLocked}
                gradeHint={gradeLockMessage(section.grade)}
                lockHint={section.current ? `Xong Chặng ${section.currentStep} để mở khóa nhé!` : ""}
                onOpen={open}
                onGradeLock={() => showToast(gradeLockMessage(section.grade))}
              />
            </div>
          </section>
        );
      })}

      {openStage && (
        <LessonModal
          stage={openStage}
          done={completed.includes(openStage.id)}
          preview={preview}
          hasNext={nextStage !== null && canOpen(nextStage)}
          completing={completing}
          completeError={completeError}
          onClose={closePanel}
          onComplete={() => complete(openStage.id)}
          onNext={() => (nextStage && canOpen(nextStage) ? open(nextStage) : focus?.current && open(focus.current))}
        />
      )}
      <LockToast message={toast} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function RoadmapSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Card className="space-y-3">
        <div className="h-6 w-56 animate-pulse rounded-full bg-cream" />
        <div className="h-4 w-full max-w-md animate-pulse rounded-full bg-cream" />
        <div className="h-3 w-full animate-pulse rounded-full bg-cream" />
      </Card>
      <div className="flex flex-col items-center gap-8 rounded-[2rem] bg-surface/60 px-2 py-10 shadow-soft sm:px-6">
        <Mascot
          loading
          messages={["Cô Cú đang vẽ bản đồ lộ trình... 🗺️", "Đang mở khóa các chặng học ✨", "Sắp xong rồi, chờ xíu nhé! 🚀"]}
        />
        <div className="relative h-[420px] w-full max-w-xl">
          {Array.from({ length: 4 }, (_, i) => (
            <span
              key={i}
              className="absolute h-[84px] w-[84px] -translate-x-1/2 animate-pulse rounded-full bg-ink/10"
              style={{ left: `${50 + Math.sin((i * Math.PI) / 4) * 26}%`, top: i * 110, animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RoadmapError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-4 py-10 text-center">
      <Mascot emoji="🦉" message="Ối, Cô Cú chưa tải được bản đồ lộ trình!" />
      <ErrorBox message={message} />
      <BouncyButton type="button" onClick={onRetry} className="bg-violet-400 hover:bg-violet-500" icon={<RefreshCw className="h-5 w-5" />}>
        Thử lại
      </BouncyButton>
    </Card>
  );
}

/* ------------------------------------------------------------------ */

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(360);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Đường cong chữ S nối tâm 2 nút: tiếp tuyến dọc ở cả hai đầu nên đường đi "chui" gọn vào nút. */
const curve = (a: Point, b: Point) => {
  const mid = (b.y - a.y) / 2;
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + mid}, ${b.x} ${b.y - mid}, ${b.x} ${b.y}`;
};

function RoadmapPath({
  stages,
  completed,
  currentId,
  allDone,
  preview,
  gradeLocked,
  gradeHint,
  lockHint,
  onOpen,
  onGradeLock,
}: {
  stages: RoadmapStage[];
  completed: number[];
  currentId: number | null;
  allDone: boolean;
  preview: boolean;
  gradeLocked: boolean;
  gradeHint: string;
  lockHint: string;
  onOpen: (stage: RoadmapStage) => void;
  onGradeLock: () => void;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const center = width / 2;
  const amplitude = Math.min(width * 0.26, 140);

  // Zic-zac theo hình sin: giữa → phải → giữa → trái → ...
  const points: Point[] = stages.map((_, i) => ({
    x: center + Math.sin((i * Math.PI) / 4) * amplitude,
    y: TOP_PAD + NODE / 2 + i * ROW_H,
  }));
  const lastY = points.at(-1)?.y ?? TOP_PAD;
  const trophy: Point = { x: center, y: lastY + ROW_H + 10 };
  const height = trophy.y + TROPHY / 2 + 48;

  const semester2 = stages.findIndex((s) => s.semester === 2);
  const dividerY = semester2 > 0 ? (points[semester2 - 1].y + points[semester2].y) / 2 : null;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-xl" style={{ height }}>
      <svg className="absolute inset-0 overflow-visible" width={width} height={height} aria-hidden>
        {stages.map((stage, i) => {
          const d = curve(points[i], points[i + 1] ?? trophy);
          const done = completed.includes(stage.id);
          return (
            <g key={stage.id}>
              <path
                d={d}
                fill="none"
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray="14 12"
                className="stroke-ink/15"
              />
              {done && (
                <path
                  d={d}
                  fill="none"
                  stroke={stage.stroke}
                  strokeWidth={9}
                  strokeLinecap="round"
                  strokeDasharray="14 12"
                  className="animate-dash-flow"
                />
              )}
            </g>
          );
        })}
      </svg>

      {dividerY !== null && (
        <div className="absolute inset-x-0 flex -translate-y-1/2 items-center gap-3 px-2" style={{ top: dividerY }}>
          <span className="h-0.5 flex-1 rounded-full bg-ink/10" />
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-ink/50 shadow-soft">
            📘 Học kì II
          </span>
          <span className="h-0.5 flex-1 rounded-full bg-ink/10" />
        </div>
      )}

      {stages.map((stage, i) => (
        <StageNode
          key={stage.id}
          stage={stage}
          index={i}
          point={points[i]}
          width={width}
          done={completed.includes(stage.id) && !gradeLocked}
          current={stage.id === currentId}
          unlocked={preview}
          gradeLocked={gradeLocked}
          gradeHint={gradeHint}
          lockHint={lockHint}
          onOpen={() => onOpen(stage)}
          onGradeLock={onGradeLock}
        />
      ))}

      <div
        className="absolute flex animate-pop-in flex-col items-center text-center"
        style={{ left: trophy.x, top: trophy.y - TROPHY / 2, width: 200, marginLeft: -100, animationDelay: "650ms" }}
      >
        <div
          className={`grid place-items-center rounded-full text-5xl transition duration-500 ease-bounce ${
            allDone
              ? "bg-gradient-to-br from-amber-200 to-yellow-400 shadow-[0_8px_0_#d97706] ring-8 ring-amber-200/50 hover:scale-110"
              : "bg-ink/10 grayscale"
          }`}
          style={{ width: TROPHY, height: TROPHY }}
        >
          <span className={allDone ? "animate-float" : "opacity-50"}>🏆</span>
        </div>
        <p className="mt-3 font-black">Kho báu Tri thức</p>
        <p className="text-xs font-bold text-ink/50">
          {allDone ? `Em đã chinh phục cả ${stages.length} chặng! 🎉` : `Hoàn thành ${stages.length} chặng để mở khóa`}
        </p>
      </div>
    </div>
  );
}

function StageNode({
  stage,
  index,
  point,
  width,
  done,
  current,
  unlocked,
  gradeLocked,
  gradeHint,
  lockHint,
  onOpen,
  onGradeLock,
}: {
  stage: RoadmapStage;
  index: number;
  point: Point;
  width: number;
  done: boolean;
  current: boolean;
  /** Chế độ xem trước: không khóa nhưng vẫn giữ màu "chưa hoàn thành". */
  unlocked: boolean;
  gradeLocked: boolean;
  gradeHint: string;
  lockHint: string;
  onOpen: () => void;
  onGradeLock: () => void;
}) {
  const locked = gradeLocked || (!done && !current && !unlocked);
  const [shaking, setShaking] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(hintTimer.current), []);

  const handleClick = () => {
    if (gradeLocked) {
      onGradeLock();
      return;
    }
    if (!locked) return onOpen();
    setShaking(true);
    setHintVisible(true);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHintVisible(false), 1800);
  };

  // Nhãn nằm phía còn trống: nút lệch phải (hoặc ở giữa) → nhãn bên trái, và ngược lại.
  const labelLeft = point.x >= width / 2 - 1;
  const gap = NODE / 2 + 14;
  const labelWidth = Math.max(Math.min(labelLeft ? point.x - gap - 4 : width - point.x - gap - 4, 210), 80);

  const tone = gradeLocked
    ? "cursor-not-allowed bg-slate-200 text-slate-500 grayscale shadow-[0_6px_0_#cbd5e1] dark:bg-slate-700 dark:text-slate-300 dark:shadow-[0_6px_0_#475569]"
    : done
      ? stage.done
      : current || unlocked
        ? stage.idle
        : "cursor-not-allowed bg-slate-200 text-slate-500 shadow-[0_6px_0_#cbd5e1] dark:bg-slate-700 dark:text-slate-300 dark:shadow-[0_6px_0_#475569]";

  return (
    <div className="absolute animate-pop-in" style={{ left: 0, top: 0, animationDelay: `${index * 60}ms` }}>
      {locked && hintVisible && lockHint && (
        <span
          role="status"
          className="absolute z-20 -translate-x-1/2 animate-pop-in whitespace-nowrap rounded-xl bg-ink px-3 py-1.5 text-xs font-extrabold text-cream shadow-pop after:absolute after:left-1/2 after:top-full after:-ml-1.5 after:border-6 after:border-transparent after:border-t-ink"
          style={{ left: point.x, top: point.y - NODE / 2 - 46 }}
        >
          🔒 {lockHint}
        </span>
      )}
      {current && (
        <span
          className="absolute z-10 -translate-x-1/2 animate-float whitespace-nowrap rounded-xl border-2 border-ink/10 bg-surface px-3 py-1.5 text-xs font-black uppercase tracking-wider text-lime-600 shadow-soft after:absolute after:left-1/2 after:top-full after:-ml-1.5 after:border-6 after:border-transparent after:border-t-surface dark:text-lime-300"
          style={{ left: point.x, top: point.y - NODE / 2 - 50 }}
        >
          {index === 0 ? "Bắt đầu" : "Học tiếp"}
        </span>
      )}

      <button
        type="button"
        onClick={handleClick}
        onAnimationEnd={(e) => e.animationName === "shake" && setShaking(false)}
        disabled={gradeLocked}
        aria-disabled={locked}
        aria-label={`Chặng ${index + 1}: ${stage.name}${done ? " – đã hoàn thành" : locked ? " – đang khóa" : ""}`}
        className={`group absolute grid place-items-center rounded-full transition-[background-color,box-shadow,scale,translate] duration-300 ease-bounce focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-violet-300 disabled:cursor-not-allowed ${
          locked ? "" : "hover:scale-110 active:translate-y-1.5 active:shadow-none"
        } ${shaking ? "animate-shake" : ""} ${tone}`}
        style={{ left: point.x - NODE / 2, top: point.y - NODE / 2, width: NODE, height: NODE }}
      >
        {current && (
          <span className="pointer-events-none absolute -inset-2 animate-halo rounded-full border-4 border-lime-300" aria-hidden />
        )}
        <span
          className={`text-4xl transition duration-300 ease-bounce ${
            locked ? "opacity-40 grayscale" : "drop-shadow group-hover:rotate-12"
          }`}
          aria-hidden
        >
          {stage.emoji}
        </span>
        {locked && !gradeLocked && (
          <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-white text-slate-400 shadow-soft ring-4 ring-slate-100 dark:bg-slate-600 dark:text-slate-200 dark:ring-slate-800">
            <Lock className="h-4 w-4" strokeWidth={3} />
          </span>
        )}
        {done && (
          <span className="absolute -right-1 -top-1 grid h-8 w-8 animate-pop-in place-items-center rounded-full bg-white text-emerald-500 shadow-soft ring-4 ring-emerald-100 dark:ring-emerald-900">
            <Check className="h-5 w-5" strokeWidth={3.5} />
          </span>
        )}
      </button>

      {gradeLocked && (
        <button
          type="button"
          onClick={onGradeLock}
          aria-label={gradeHint}
          className="absolute z-20 cursor-not-allowed rounded-full"
          style={{ left: point.x - NODE / 2, top: point.y - NODE / 2, width: NODE, height: NODE }}
        >
          <CuteLock hint={gradeHint} className="-right-1.5 -top-1.5" />
        </button>
      )}

      <button
        type="button"
        onClick={handleClick}
        tabIndex={-1}
        className={`absolute -translate-y-1/2 rounded-2xl px-2 py-1 transition duration-300 ease-bounce ${
          locked ? "cursor-not-allowed opacity-60" : "hover:bg-surface/80"
        } ${labelLeft ? "text-right" : "text-left"}`}
        style={{
          top: point.y,
          width: labelWidth,
          left: labelLeft ? point.x - gap - labelWidth : point.x + gap,
        }}
      >
        <span className={`block text-[11px] font-black uppercase tracking-widest ${done ? "text-emerald-500" : "text-ink/40"}`}>
          Chặng {index + 1} {done && "✓"}
        </span>
        <span className="block text-sm font-extrabold leading-snug sm:text-base">{stage.name}</span>
        <span className="mt-0.5 inline-block rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-ink/60">
          {stage.theme}
        </span>
      </button>
    </div>
  );
}
