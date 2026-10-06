"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Lock, PartyPopper } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { popConfetti } from "@/lib/confetti";
import { ROADMAP_EXP, ROADMAP_STAGES, type RoadmapStage } from "@/lib/roadmap";
import { LessonModal } from "./LessonModal";
import { Card } from "./ui";

const NODE = 84;
const ROW_H = 150;
/** Chừa chỗ cho bong bóng "Bắt đầu" phía trên nút đầu tiên. */
const TOP_PAD = 64;
const TROPHY = 104;

type Point = { x: number; y: number };

/** Lộ trình học tập kiểu Duolingo – tiến độ lưu ở localStorage, thưởng EXP qua `onReward`. */
export function Roadmap({ onReward }: { onReward: (exp: number) => void }) {
  const [completed, setCompleted] = useLocalStorage<number[]>("tram-sac-roadmap", []);
  const [openId, setOpenId] = useState<number | null>(null);

  const doneCount = ROADMAP_STAGES.filter((s) => completed.includes(s.id)).length;
  const current = ROADMAP_STAGES.find((s) => !completed.includes(s.id)) ?? null;
  const openStage = ROADMAP_STAGES.find((s) => s.id === openId) ?? null;

  /** Chỉ mở được chặng đã xong hoặc chặng hiện tại – các chặng sau bị khóa. */
  const isUnlocked = (id: number) => completed.includes(id) || id === current?.id;

  const open = (id: number) => {
    if (isUnlocked(id)) setOpenId(id);
  };
  const closePanel = useCallback(() => setOpenId(null), []);

  const complete = (id: number) => {
    if (completed.includes(id) || !isUnlocked(id)) return;
    setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id]));
    onReward(ROADMAP_EXP);
    popConfetti();
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold">🗺️ Lộ trình Học tập</h2>
          <p className="text-sm font-semibold text-ink/60">
            10 chặng bám sát SGK Ngữ Văn 6 – Kết nối tri thức. Xong chặng trước mới mở khóa chặng sau, mỗi chặng được{" "}
            <span className="font-extrabold text-amber-600 dark:text-amber-300">+{ROADMAP_EXP} EXP</span>!
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime-300 via-amber-300 to-pink-300 transition-[width] duration-700 ease-bounce"
                style={{ width: `${Math.max((doneCount / ROADMAP_STAGES.length) * 100, 3)}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-extrabold text-ink/70">
              {doneCount}/{ROADMAP_STAGES.length} chặng
            </span>
          </div>
        </div>
        {current ? (
          <button
            onClick={() => setOpenId(current.id)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-lime-300 px-5 py-3 font-extrabold text-lime-950 shadow-[0_5px_0_#84cc16] transition duration-300 ease-bounce hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
          >
            Tiếp tục: Chặng {current.id} <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-lemon-pastel px-5 py-3 font-extrabold text-amber-700 dark:text-amber-300">
            <PartyPopper className="h-5 w-5" /> Đã về đích!
          </span>
        )}
      </Card>

      <div className="rounded-[2rem] bg-surface/60 px-2 py-6 shadow-soft sm:px-6">
        <RoadmapPath completed={completed} currentId={current?.id ?? null} allDone={!current} onOpen={open} />
      </div>

      {openStage && (
        <LessonModal
          stage={openStage}
          done={completed.includes(openStage.id)}
          onClose={closePanel}
          onComplete={() => complete(openStage.id)}
          onNext={() => (isUnlocked(openStage.id + 1) ? open(openStage.id + 1) : current && open(current.id))}
        />
      )}
    </div>
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
  completed,
  currentId,
  allDone,
  onOpen,
}: {
  completed: number[];
  currentId: number | null;
  allDone: boolean;
  onOpen: (id: number) => void;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const center = width / 2;
  const amplitude = Math.min(width * 0.26, 140);

  // Zic-zac theo hình sin: giữa → phải → giữa → trái → ...
  const points: Point[] = ROADMAP_STAGES.map((_, i) => ({
    x: center + Math.sin((i * Math.PI) / 4) * amplitude,
    y: TOP_PAD + NODE / 2 + i * ROW_H,
  }));
  const trophy: Point = { x: center, y: points[points.length - 1].y + ROW_H + 10 };
  const height = trophy.y + TROPHY / 2 + 48;

  const semester2 = ROADMAP_STAGES.findIndex((s) => s.semester === 2);
  const dividerY = semester2 > 0 ? (points[semester2 - 1].y + points[semester2].y) / 2 : null;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-xl" style={{ height }}>
      <svg className="absolute inset-0 overflow-visible" width={width} height={height} aria-hidden>
        {ROADMAP_STAGES.map((stage, i) => {
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

      {ROADMAP_STAGES.map((stage, i) => (
        <StageNode
          key={stage.id}
          stage={stage}
          index={i}
          point={points[i]}
          width={width}
          done={completed.includes(stage.id)}
          current={stage.id === currentId}
          lockHint={currentId === null ? "" : `Xong Chặng ${currentId} để mở khóa nhé!`}
          onOpen={() => onOpen(stage.id)}
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
          {allDone ? "Em đã chinh phục cả 10 chặng! 🎉" : "Hoàn thành 10 chặng để mở khóa"}
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
  lockHint,
  onOpen,
}: {
  stage: RoadmapStage;
  index: number;
  point: Point;
  width: number;
  done: boolean;
  current: boolean;
  lockHint: string;
  onOpen: () => void;
}) {
  const locked = !done && !current;
  const [shaking, setShaking] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(hintTimer.current), []);

  const handleClick = () => {
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

  const tone = done
    ? stage.done
    : current
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
        onClick={handleClick}
        onAnimationEnd={(e) => e.animationName === "shake" && setShaking(false)}
        aria-disabled={locked}
        aria-label={`Chặng ${stage.id}: ${stage.name}${done ? " – đã hoàn thành" : locked ? " – đang khóa" : ""}`}
        className={`group absolute grid place-items-center rounded-full transition-[background-color,box-shadow,scale,translate] duration-300 ease-bounce focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-violet-300 ${
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
        {locked && (
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

      <button
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
          Chặng {stage.id} {done && "✓"}
        </span>
        <span className="block text-sm font-extrabold leading-snug sm:text-base">{stage.name}</span>
        <span className="mt-0.5 inline-block rounded-full bg-cream px-2 py-0.5 text-[11px] font-bold text-ink/60">
          {stage.theme}
        </span>
      </button>
    </div>
  );
}
