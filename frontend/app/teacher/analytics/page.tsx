"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { BookOpen, Flame, Pencil, RefreshCw, Search, Sparkles, Users, X, Zap } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { AiEvaluationModal } from "@/components/AiEvaluationModal";
import { Background } from "@/components/Background";
import { BouncyButton, ErrorBox } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { buildClassSnapshot, foldText, type ClassSnapshot, type ClassStudent, type CompletionBand, type GradeFilter, type LessonBar } from "@/lib/classAnalytics";
import { CLASS_GRADES } from "@/lib/grades";
import type { AnalyticsOverview, AnalyticsStudent } from "@/types/api";
import { api, apiErrorMessage } from "@/utils/apiClient";

const percent = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat("vi-VN");
const PAGE_SIZE = 8;
const INPUT =
  "block w-full rounded-2xl border-2 border-violet-100 bg-cream/70 px-4 py-3 text-base font-semibold outline-none transition placeholder:text-ink/35 focus:border-violet-300 focus:bg-surface dark:border-white/10";

const SECTIONS = [
  { id: "overview", emoji: "📊", label: "Tổng quan" },
  { id: "students", emoji: "🎒", label: "Học sinh" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];
type SortId = "exp" | "risk" | "name";

const GRADE_COLORS = ["bg-sky-400", "bg-violet-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400"];

export default function TeacherAnalyticsPage() {
  return (
    <AuthGate>
      <AnalyticsScreen />
    </AuthGate>
  );
}

function AnalyticsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState<SectionId>("overview");
  const [grade, setGrade] = useState<GradeFilter>("all");
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<AnalyticsStudent | null>(null);
  const [editing, setEditing] = useState<ClassStudent | null>(null);
  const allowed = Boolean(user && user.role !== "student");

  useEffect(() => {
    if (user && user.role === "student") router.replace("/roadmap");
  }, [user, router]);

  useEffect(() => {
    if (!allowed) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    api.teacher
      .analytics(ctrl.signal)
      .then((overview) => {
        if (!ctrl.signal.aborted) setData(overview);
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [allowed, version]);

  const snapshot = useMemo(() => (data ? buildClassSnapshot(data, grade) : null), [data, grade]);
  const chips = snapshot?.gradeCounts ?? CLASS_GRADES.map((item) => ({ grade: item, count: 0 }));

  if (!user || user.role === "student") return null;

  return (
    <div className="min-h-screen">
      <Background />
      <header className="sticky top-0 z-20 border-b border-ink/5 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/roadmap" className="group flex items-center gap-2.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-300 to-sky-300 text-2xl shadow-soft">🚀</span>
            <span className="leading-tight">
              <span className="block font-black">Trạm Sạc Ngữ Văn</span>
              <span className="block text-xs font-bold text-ink/50">Tổng quan lớp học</span>
            </span>
          </Link>
          <span className="ml-auto hidden text-sm font-extrabold text-ink/60 sm:block">{user.fullName}</span>
          <Link href="/teacher/dashboard" className="rounded-full bg-violet-200 px-4 py-2 text-sm font-extrabold text-violet-950">
            Quản lý game
          </Link>
          <Link href="/roadmap" className="rounded-full bg-surface px-4 py-2 text-sm font-extrabold shadow-soft">
            Về lớp học
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Mục lớp học">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              aria-current={section === item.id ? "page" : undefined}
              className={`min-w-40 rounded-2xl px-4 py-3 text-left font-extrabold transition lg:min-w-0 ${
                section === item.id ? "bg-sky-200 text-sky-950 shadow-soft" : "bg-surface text-ink/70"
              }`}
            >
              <span className="mr-2" aria-hidden>
                {item.emoji}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black">{section === "overview" ? "Tổng quan lớp học" : "Quản lý học sinh"}</h1>
              <p className="mt-1 max-w-2xl text-sm font-semibold text-ink/55">
                {section === "overview"
                  ? "Tiến độ, cấp độ và chặng học sinh đang tập trung."
                  : "Sửa họ tên, nâng khối lớp, rồi xem tiến độ của từng em."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVersion((n) => n + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-extrabold shadow-soft"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>

          <GradeFilter grade={grade} chips={chips} onChange={setGrade} />
          {snapshot && <p className="text-sm font-semibold text-ink/50">{snapshot.scopeNote}</p>}
          {error && <ErrorBox message={error} />}

          {loading && !snapshot ? (
            <p className="rounded-[2rem] bg-surface px-4 py-16 text-center text-sm font-bold text-ink/50 shadow-soft">Đang mở sổ lớp...</p>
          ) : snapshot && section === "overview" ? (
            <Overview snapshot={snapshot} onAnalyze={setSelected} onOpenStudents={() => setSection("students")} />
          ) : snapshot ? (
            <StudentBoard students={snapshot.students} onEdit={setEditing} onAnalyze={setSelected} />
          ) : null}
        </div>
      </main>

      {selected && <AiEvaluationModal key={selected.id} student={selected} onClose={() => setSelected(null)} />}
      {editing && (
        <EditStudentModal
          key={editing.id}
          student={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setVersion((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}

function GradeFilter({
  grade,
  chips,
  onChange,
}: {
  grade: GradeFilter;
  chips: { grade: number; count: number }[];
  onChange: (grade: GradeFilter) => void;
}) {
  const options: { id: GradeFilter; label: string; count?: number }[] = [
    { id: "all", label: "Tất cả" },
    ...chips.map((chip) => ({ id: chip.grade as GradeFilter, label: `Lớp ${chip.grade}`, count: chip.count })),
  ];
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo khối lớp">
      {options.map((option) => {
        const active = grade === option.id;
        return (
          <button
            key={String(option.id)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition ${
              active ? "bg-ink text-cream shadow-soft" : "bg-surface text-ink/70 shadow-soft"
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20" : "bg-cream text-ink/50"}`}>{option.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Overview({
  snapshot,
  onAnalyze,
  onOpenStudents,
}: {
  snapshot: ClassSnapshot;
  onAnalyze: (student: ClassStudent) => void;
  onOpenStudents: () => void;
}) {
  const spotlight = snapshot.spotlight;
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Users className="h-6 w-6" />} tone="bg-sky-100 text-sky-700" label="Sĩ số đang xem" value={integer.format(snapshot.totalStudents)} hint="Học sinh trong bộ lọc" />
        <MetricCard
          icon={<BookOpen className="h-6 w-6" />}
          tone="bg-emerald-100 text-emerald-700"
          label="Hoàn thành trung bình"
          value={`${percent.format(snapshot.avgCompletion)}%`}
          hint="Trên các chặng trong phạm vi"
        />
        <MetricCard icon={<Zap className="h-6 w-6" />} tone="bg-amber-100 text-amber-700" label="EXP trung bình" value={integer.format(snapshot.avgExp)} hint="Điểm thưởng của nhóm đang xem" />
        <MetricCard
          icon={<Flame className="h-6 w-6" />}
          tone="bg-rose-100 text-rose-700"
          label="Chặng sôi nổi nhất"
          value={spotlight ? spotlight.title : "Chưa có"}
          hint={spotlight ? `${integer.format(spotlight.reached)} học sinh đã học hoặc ghi vở` : "Hiện khi có em hoàn thành hoặc ghi nháp"}
          compact
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Phổ hoàn thành" hint={snapshot.totalStudents === 0 ? "Chưa có học sinh trong bộ lọc." : `${integer.format(snapshot.needsHelpCount)} em dưới 50% chặng.`}>
          <Donut bands={snapshot.bands} total={snapshot.totalStudents} />
        </Panel>
        <Panel title="So sánh khối lớp" hint="Cột là tỉ lệ hoàn thành trung bình. Khối chưa có chặng riêng tính trên chặng được mở.">
          <GradeColumns bars={snapshot.gradeBars} />
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Mức độ từng chặng" hint="Phần trăm học sinh trong bộ lọc đã hoàn thành chặng.">
          <LessonBars lessons={snapshot.lessonBars} />
        </Panel>
        <Panel title="Phân bố cấp độ" hint={`${integer.format(snapshot.totalDrafts)} bản nháp đã lưu trong nhóm này.`}>
          <LevelBars bars={snapshot.levelBars} total={snapshot.totalStudents} />
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Cần kèm thêm"
          hint="Các em dưới 50% chặng trong phạm vi đang xem."
          action={
            <button type="button" onClick={onOpenStudents} className="rounded-full bg-cream px-3 py-1.5 text-xs font-extrabold">
              Mở sổ học sinh
            </button>
          }
        >
          {snapshot.needsHelp.length === 0 ? (
            <p className="rounded-2xl bg-cream px-4 py-8 text-center font-bold text-ink/55">Nhóm này đang trên 50% chặng được mở.</p>
          ) : (
            <ul className="space-y-2">
              {snapshot.needsHelp.map((student) => (
                <li key={student.id} className="flex items-center gap-3 rounded-2xl bg-cream px-3 py-2.5">
                  <span className="text-2xl" aria-hidden>
                    {student.levelEmoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">{student.fullName}</p>
                    <p className="text-xs font-bold text-ink/45">
                      Lớp {student.grade} · {student.scopedCompletion}% · {student.draftCount} nháp
                    </p>
                  </div>
                  <button type="button" onClick={() => onAnalyze(student)} className="rounded-full bg-violet-500 px-3 py-1.5 text-xs font-extrabold text-white">
                    Phân tích AI
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Dẫn đầu EXP" hint="Ba học sinh có nhiều điểm thưởng nhất trong bộ lọc.">
          {snapshot.leaders.length === 0 ? (
            <p className="rounded-2xl bg-cream px-4 py-8 text-center font-bold text-ink/55">Chưa có học sinh trong bộ lọc này.</p>
          ) : (
            <ol className="space-y-2">
              {snapshot.leaders.map((student, index) => (
                <li key={student.id} className="flex items-center gap-3 rounded-2xl bg-cream px-3 py-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-200 text-sm font-black text-amber-950">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">
                      <span className="mr-1" aria-hidden>
                        {student.levelEmoji}
                      </span>
                      {student.fullName}
                    </p>
                    <p className="text-xs font-bold text-ink/45">
                      Lớp {student.grade} · {student.levelName} · {student.scopedCompletion}%
                    </p>
                  </div>
                  <span className="font-black tabular-nums">{integer.format(student.exp)} EXP</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </section>
    </>
  );
}

function StudentBoard({
  students,
  onEdit,
  onAnalyze,
}: {
  students: ClassStudent[];
  onEdit: (student: ClassStudent) => void;
  onAnalyze: (student: ClassStudent) => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("exp");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const needle = foldText(query.trim());
    const matched = needle
      ? students.filter((student) => foldText(`${student.fullName} ${student.username}`).includes(needle))
      : students;
    return [...matched].sort((a, b) => {
      if (sort === "name") return a.fullName.localeCompare(b.fullName, "vi");
      if (sort === "risk") return a.scopedCompletion - b.scopedCompletion || a.exp - b.exp;
      return b.exp - a.exp || b.scopedCompletion - a.scopedCompletion;
    });
  }, [students, query, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, sort, students]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <section className="rounded-[2rem] bg-surface p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-56 flex-1">
          <span className="mb-1.5 block text-sm font-extrabold">Tìm học sinh</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên hoặc tên đăng nhập" className={`${INPUT} pl-11`} />
          </span>
        </label>
        <label className="min-w-44">
          <span className="mb-1.5 block text-sm font-extrabold">Sắp xếp</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortId)} className={INPUT}>
            <option value="exp">EXP cao nhất</option>
            <option value="risk">Cần kèm trước</option>
            <option value="name">Tên A–Z</option>
          </select>
        </label>
      </div>
      <p className="mt-3 text-sm font-bold text-ink/45">{integer.format(rows.length)} học sinh</p>

      {rows.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-cream px-4 py-8 text-center font-bold text-ink/55">Không có học sinh khớp bộ lọc này.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="text-xs font-black uppercase tracking-wider text-ink/45">
                <th className="px-3 py-2">Học sinh</th>
                <th className="px-3 py-2">Khối</th>
                <th className="px-3 py-2">Cấp</th>
                <th className="px-3 py-2">EXP</th>
                <th className="px-3 py-2">Hoàn thành</th>
                <th className="px-3 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((student) => (
                <tr key={student.id} className="border-t border-ink/5">
                  <td className="px-3 py-3">
                    <p className="font-extrabold">{student.fullName}</p>
                    <p className="text-xs font-bold text-ink/45">@{student.username}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-lime-100 px-3 py-1 font-extrabold text-lime-900">Lớp {student.grade}</span>
                  </td>
                  <td className="px-3 py-3 font-bold">
                    <span className="mr-1" aria-hidden>
                      {student.levelEmoji}
                    </span>
                    {student.levelName}
                  </td>
                  <td className="px-3 py-3 font-black tabular-nums">{integer.format(student.exp)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-2.5 w-24 overflow-hidden rounded-full bg-cream"
                        role="progressbar"
                        aria-valuenow={student.scopedCompletion}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Tỉ lệ hoàn thành của ${student.fullName}`}
                      >
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-sky-400" style={{ width: `${student.scopedCompletion}%` }} />
                      </div>
                      <span className="font-black tabular-nums">{student.scopedCompletion}%</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-ink/45">
                      {student.scopedCompleted}/{student.scopedTotal} chặng · {student.draftCount} nháp
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button type="button" onClick={() => onEdit(student)} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 font-extrabold text-amber-900">
                        <Pencil className="h-3.5 w-3.5" /> Sửa
                      </button>
                      <button type="button" onClick={() => onAnalyze(student)} className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1.5 font-extrabold text-white">
                        <Sparkles className="h-3.5 w-3.5" /> AI
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm font-extrabold">
              <span className="text-ink/50">
                Trang {current}/{pageCount}
              </span>
              <div className="flex gap-2">
                <button type="button" disabled={current <= 1} onClick={() => setPage(current - 1)} className="rounded-full bg-cream px-4 py-2 disabled:opacity-40">
                  Trước
                </button>
                <button type="button" disabled={current >= pageCount} onClick={() => setPage(current + 1)} className="rounded-full bg-cream px-4 py-2 disabled:opacity-40">
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function EditStudentModal({ student, onClose, onSaved }: { student: ClassStudent; onClose: () => void; onSaved: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const grades = [...new Set<number>([...CLASS_GRADES, student.grade])].sort((a, b) => a - b);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ fullName: string; grade: number }>({
    defaultValues: { fullName: student.fullName, grade: student.grade },
  });

  const onSubmit: SubmitHandler<{ fullName: string; grade: number }> = async (values) => {
    setFormError(null);
    try {
      await api.adminStudents.update(student.id, { fullName: values.fullName.trim(), grade: Number(values.grade) });
      onSaved();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  };

  return (
    <Modal title={`Sửa hồ sơ · ${student.username}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Họ và tên" error={errors.fullName?.message}>
          <input className={INPUT} {...register("fullName", { required: "Nhập họ tên học sinh" })} />
        </Field>
        <Field label="Khối lớp" hint="Lộ trình và nhân vật từ lớp này trở xuống sẽ mở khi em đăng nhập lại hoặc tải lại trang.">
          <select className={INPUT} {...register("grade", { required: true, valueAsNumber: true })}>
            {grades.map((item) => (
              <option key={item} value={item}>
                Lớp {item}
              </option>
            ))}
          </select>
        </Field>
        {formError && <ErrorBox message={formError} />}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-full bg-cream px-5 py-2.5 font-extrabold">
            Huỷ
          </button>
          <BouncyButton loading={isSubmitting} loadingText="Đang lưu..." className="bg-violet-400 px-5 py-2.5 text-base hover:bg-violet-500">
            Lưu thay đổi
          </BouncyButton>
        </div>
      </form>
    </Modal>
  );
}

function Panel({ title, hint, action, children }: { title: string; hint?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] bg-surface p-5 shadow-soft sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">{title}</h2>
          {hint && <p className="mt-1 text-sm font-semibold text-ink/55">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Donut({ bands, total }: { bands: CompletionBand[]; total: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const active = bands.filter((band) => band.count > 0);
  let cursor = 0;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative mx-auto h-44 w-44 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Biểu đồ phổ hoàn thành">
          <circle cx="50" cy="50" r={radius} fill="none" className="text-cream" stroke="currentColor" strokeWidth="14" />
          {total > 0 &&
            active.map((band) => {
              const length = (band.count / total) * circumference;
              const full = active.length === 1;
              const node = (
                <circle
                  key={band.key}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="14"
                  className={band.stroke}
                  strokeDasharray={full ? undefined : `${length} ${circumference - length}`}
                  strokeDashoffset={full ? undefined : -cursor}
                  transform="rotate(-90 50 50)"
                />
              );
              cursor += length;
              return node;
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-3xl font-black tabular-nums">{integer.format(total)}</p>
            <p className="text-xs font-bold text-ink/45">học sinh</p>
          </div>
        </div>
      </div>
      <ul className="min-w-48 flex-1 space-y-2">
        {bands.map((band) => (
          <li key={band.key} className="flex items-center gap-3">
            <span className={`h-3 w-3 shrink-0 rounded-full ${band.color}`} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold">{band.label}</span>
              <span className="block text-xs font-bold text-ink/45">{band.hint}</span>
            </span>
            <span className="font-black tabular-nums">{band.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GradeColumns({ bars }: { bars: ClassSnapshot["gradeBars"] }) {
  if (bars.length === 0) {
    return <p className="rounded-2xl bg-cream px-4 py-8 text-center font-bold text-ink/55">Chưa có dữ liệu khối lớp.</p>;
  }
  return (
    <div className="flex items-end gap-3" role="img" aria-label="Biểu đồ hoàn thành theo khối lớp">
      {bars.map((bar, index) => (
        <div key={bar.grade} className="min-w-0 flex-1">
          <p className="mb-1 text-center text-xs font-black tabular-nums">{percent.format(bar.avgCompletion)}%</p>
          <div className="relative h-32 rounded-2xl bg-cream">
            <div
              className={`absolute inset-x-1.5 bottom-1.5 rounded-xl ${GRADE_COLORS[index % GRADE_COLORS.length]}`}
              style={{ height: `${bar.students === 0 ? 0 : Math.min(88, Math.max(bar.avgCompletion, 6))}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm font-extrabold">{bar.label}</p>
          <p className="text-center text-xs font-bold text-ink/45">{bar.students} em · {integer.format(bar.avgExp)} EXP</p>
        </div>
      ))}
    </div>
  );
}

function LessonBars({ lessons }: { lessons: LessonBar[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? lessons : lessons.slice(0, 6);
  if (lessons.length === 0) {
    return <p className="rounded-2xl bg-cream px-4 py-8 text-center font-bold text-ink/55">Chưa có chặng trong phạm vi này.</p>;
  }
  return (
    <div>
      <ul className="space-y-3">
        {visible.map((lesson) => (
          <li key={lesson.lessonId}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm font-extrabold">
              <span className="truncate">
                Lớp {lesson.grade} · {lesson.title}
              </span>
              <span className="shrink-0 tabular-nums">{lesson.completionRate}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-cream" role="presentation">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-300 to-sky-400" style={{ width: `${lesson.completionRate}%` }} />
            </div>
            <p className="mt-1 text-xs font-bold text-ink/45">
              {lesson.completions} hoàn thành · {lesson.drafts} có nháp · {lesson.reached} đã học
            </p>
          </li>
        ))}
      </ul>
      {lessons.length > 6 && (
        <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-4 text-sm font-extrabold text-sky-700">
          {expanded ? "Thu gọn" : `Xem tất cả ${lessons.length} chặng`}
        </button>
      )}
    </div>
  );
}

function LevelBars({ bars, total }: { bars: ClassSnapshot["levelBars"]; total: number }) {
  const peak = Math.max(...bars.map((bar) => bar.count), 1);
  return (
    <ul className="space-y-3" role="img" aria-label="Biểu đồ số học sinh theo cấp độ">
      {bars.map((bar) => (
        <li key={bar.index} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3">
          <span className="truncate text-sm font-extrabold">
            <span className="mr-1" aria-hidden>
              {bar.emoji}
            </span>
            {bar.name}
          </span>
          <span className="h-3 overflow-hidden rounded-full bg-cream">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-amber-300 to-pink-300"
              style={{ width: `${total === 0 ? 0 : Math.max((bar.count / peak) * 100, bar.count > 0 ? 8 : 0)}%` }}
            />
          </span>
          <span className="text-right text-sm font-black tabular-nums">{bar.count}</span>
        </li>
      ))}
    </ul>
  );
}

function MetricCard({
  icon,
  tone,
  label,
  value,
  hint,
  compact = false,
}: {
  icon: ReactNode;
  tone: string;
  label: string;
  value: string;
  hint: string;
  compact?: boolean;
}) {
  return (
    <article className="rounded-[1.75rem] bg-surface p-5 shadow-soft">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tone}`}>{icon}</div>
      <p className="mt-4 text-sm font-extrabold text-ink/50">{label}</p>
      <p className={`mt-1 font-black tracking-tight ${compact ? "line-clamp-2 text-xl leading-snug" : "text-3xl"}`}>{value}</p>
      <p className="mt-1 text-sm font-semibold text-ink/55">{hint}</p>
    </article>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-surface p-6 shadow-pop">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-black">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="grid h-9 w-9 place-items-center rounded-full bg-cream">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-extrabold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-bold text-ink/45">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}
