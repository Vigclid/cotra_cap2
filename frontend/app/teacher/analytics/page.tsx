"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Flame, NotebookPen, RefreshCw, Users } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { AiEvaluationModal } from "@/components/AiEvaluationModal";
import { Background } from "@/components/Background";
import { ErrorBox } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import type { AnalyticsOverview, AnalyticsStudent } from "@/types/api";
import { api, apiErrorMessage } from "@/utils/apiClient";

const percent = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat("vi-VN");

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
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<AnalyticsStudent | null>(null);
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

  if (!user || user.role === "student") return null;

  const lesson = data?.mostActiveLesson;

  return (
    <div className="min-h-screen">
      <Background />
      <header className="sticky top-0 z-20 border-b border-ink/5 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/roadmap" className="group flex items-center gap-2.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-300 to-sky-300 text-2xl shadow-soft">🚀</span>
            <span className="leading-tight">
              <span className="block font-black">Trạm Sạc Ngữ Văn</span>
              <span className="block text-xs font-bold text-ink/50">Phân tích lớp học</span>
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black">Tổng quan lớp học</h1>
            <p className="mt-1 text-sm font-semibold text-ink/55">Tiến độ roadmap và vở nháp của toàn bộ học sinh.</p>
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

        {error && (
          <div className="mb-5">
            <ErrorBox message={error} />
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Users className="h-6 w-6" />}
            tone="bg-sky-100 text-sky-700"
            label="Tổng học sinh"
            value={loading && !data ? "…" : integer.format(data?.totalStudents ?? 0)}
            hint="Tài khoản vai trò học sinh"
          />
          <MetricCard
            icon={<BookOpen className="h-6 w-6" />}
            tone="bg-emerald-100 text-emerald-700"
            label="Hoàn thành roadmap"
            value={loading && !data ? "…" : `${percent.format(data?.avgCompletionRate ?? 0)}%`}
            hint="Tỉ lệ trung bình toàn lớp"
          />
          <MetricCard
            icon={<NotebookPen className="h-6 w-6" />}
            tone="bg-amber-100 text-amber-700"
            label="Bản nháp đã lưu"
            value={loading && !data ? "…" : integer.format(data?.totalDraftsWritten ?? 0)}
            hint="Mỗi câu hỏi tính một bản nháp"
          />
          <MetricCard
            icon={<Flame className="h-6 w-6" />}
            tone="bg-rose-100 text-rose-700"
            label="Chặng sôi nổi nhất"
            value={loading && !data ? "…" : lesson ? lesson.title : "Chưa có"}
            hint={lesson ? `${integer.format(lesson.studentCount)} học sinh đã học hoặc ghi vở` : "Hiện khi có học sinh hoàn thành hoặc ghi nháp"}
            compact
          />
        </section>

        <section className="mt-6 rounded-[2rem] bg-surface p-5 shadow-soft sm:p-6">
          <h2 className="text-xl font-black">Tiến độ học sinh</h2>
          <p className="mt-1 text-sm font-semibold text-ink/55">
            {data ? `${integer.format(data.totalLessons)} chặng trên roadmap.` : "Đang lấy danh sách..."}
          </p>

          {loading && !data ? (
            <p className="mt-8 text-center text-sm font-bold text-ink/50">Đang mở bảng tiến độ...</p>
          ) : data && data.students.length === 0 ? (
            <p className="mt-8 rounded-2xl bg-cream px-4 py-8 text-center font-bold text-ink/55">Chưa có học sinh nào trong hệ thống.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead>
                  <tr className="text-xs font-black uppercase tracking-wider text-ink/45">
                    <th className="px-3 py-2">Học sinh</th>
                    <th className="px-3 py-2">Level</th>
                    <th className="px-3 py-2">EXP</th>
                    <th className="px-3 py-2">Tỉ lệ hoàn thành</th>
                    <th className="px-3 py-2 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.students.map((student) => (
                    <tr key={student.id} className="border-t border-ink/5">
                      <td className="px-3 py-3">
                        <p className="font-extrabold">{student.fullName}</p>
                        <p className="text-xs font-bold text-ink/45">@{student.username}</p>
                      </td>
                      <td className="px-3 py-3 font-bold">
                        <span className="mr-1" aria-hidden>
                          {student.levelEmoji}
                        </span>
                        Cấp {student.level + 1} · {student.levelName}
                      </td>
                      <td className="px-3 py-3 font-black tabular-nums">{integer.format(student.exp)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-2.5 w-28 overflow-hidden rounded-full bg-cream"
                            role="progressbar"
                            aria-valuenow={student.completionRate}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Tỉ lệ hoàn thành của ${student.fullName}`}
                          >
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-sky-400"
                              style={{ width: `${student.completionRate}%` }}
                            />
                          </div>
                          <span className="font-black tabular-nums">{student.completionRate}%</span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-ink/45">
                          {student.completedCount}/{data?.totalLessons ?? 0} chặng · {student.draftCount} nháp
                        </p>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(student)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-violet-500 px-3 py-2 font-extrabold text-white shadow-soft transition duration-300 ease-bounce hover:-translate-y-0.5"
                        >
                          ✨ Phân tích năng lực bằng AI
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selected && <AiEvaluationModal key={selected.id} student={selected} onClose={() => setSelected(null)} />}
    </div>
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
