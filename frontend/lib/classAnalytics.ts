import { CLASS_GRADES } from "@/lib/grades";
import type { AnalyticsLesson, AnalyticsOverview, AnalyticsStudent } from "@/types/api";

export type GradeFilter = "all" | number;

export interface ClassStudent extends AnalyticsStudent {
  scopedCompleted: number;
  scopedTotal: number;
  scopedCompletion: number;
}

export interface GradeBar {
  grade: number;
  label: string;
  students: number;
  avgCompletion: number;
  avgExp: number;
}

export interface LessonBar {
  lessonId: number;
  title: string;
  grade: number;
  completions: number;
  drafts: number;
  reached: number;
  completionRate: number;
}

export interface LevelBar {
  index: number;
  name: string;
  emoji: string;
  count: number;
}

export interface CompletionBand {
  key: "idle" | "start" | "mid" | "done";
  label: string;
  hint: string;
  count: number;
  color: string;
  stroke: string;
}

export interface ClassSnapshot {
  students: ClassStudent[];
  gradeCounts: { grade: number; count: number }[];
  totalStudents: number;
  avgCompletion: number;
  avgExp: number;
  totalDrafts: number;
  needsHelpCount: number;
  scopeNote: string;
  bands: CompletionBand[];
  gradeBars: GradeBar[];
  lessonBars: LessonBar[];
  levelBars: LevelBar[];
  leaders: ClassStudent[];
  needsHelp: ClassStudent[];
  spotlight: LessonBar | null;
}

const LEVELS: LevelBar[] = [
  { index: 0, name: "Tân binh", emoji: "🐣", count: 0 },
  { index: 1, name: "Cây bút trẻ", emoji: "✏️", count: 0 },
  { index: 2, name: "Nhà văn nhí", emoji: "📖", count: 0 },
  { index: 3, name: "Văn sĩ tài ba", emoji: "🎖️", count: 0 },
  { index: 4, name: "Đại thi hào", emoji: "👑", count: 0 },
];

const BAND_META: Omit<CompletionBand, "count">[] = [
  { key: "idle", label: "Chưa vào học", hint: "Chưa xong chặng, chưa ghi nháp", color: "bg-ink/20", stroke: "text-ink/25" },
  { key: "start", label: "Đang khởi động", hint: "Dưới 40% chặng trong phạm vi", color: "bg-amber-400", stroke: "text-amber-400" },
  { key: "mid", label: "Đang tiến bộ", hint: "Từ 40% đến dưới 80%", color: "bg-sky-400", stroke: "text-sky-400" },
  { key: "done", label: "Về đích", hint: "Từ 80% trở lên", color: "bg-emerald-400", stroke: "text-emerald-400" },
];

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function bandKey(student: ClassStudent): CompletionBand["key"] {
  if (student.scopedCompletion === 0 && student.draftCount === 0) return "idle";
  if (student.scopedCompletion < 40) return "start";
  if (student.scopedCompletion < 80) return "mid";
  return "done";
}

function countIn(ids: number[], allowed: Set<number>) {
  let count = 0;
  for (const id of ids) if (allowed.has(id)) count += 1;
  return count;
}

/** Tỉ lệ hoàn thành theo khối đang xem. Khối chưa có chặng riêng thì tính trên chặng em được mở. */
export function buildClassSnapshot(data: AnalyticsOverview, grade: GradeFilter): ClassSnapshot {
  const lessons = data.lessons;
  const gradeLessons = grade === "all" ? lessons : lessons.filter((lesson) => lesson.grade === grade);
  const fallback = grade !== "all" && gradeLessons.length === 0;
  const roster = grade === "all" ? data.students : data.students.filter((student) => student.grade === grade);

  const students: ClassStudent[] = roster.map((student) => {
    const scoped =
      grade === "all"
        ? lessons.filter((lesson) => lesson.grade <= student.grade)
        : fallback
          ? lessons.filter((lesson) => lesson.grade <= grade)
          : gradeLessons;
    const allowed = new Set(scoped.map((lesson) => lesson.lessonId));
    const scopedCompleted = allowed.size === 0 ? 0 : countIn(student.completedLessonIds, allowed);
    const scopedTotal = allowed.size || data.totalLessons;
    const scopedCompletion =
      allowed.size === 0 ? student.completionRate : Math.round((scopedCompleted / allowed.size) * 100);
    return { ...student, scopedCompleted, scopedTotal, scopedCompletion };
  });

  const gradeCounts = CLASS_GRADES.map((item) => ({
    grade: item,
    count: data.students.filter((student) => student.grade === item).length,
  }));

  const presentGrades = [
    ...new Set([...data.students.map((student) => student.grade), ...lessons.map((lesson) => lesson.grade)]),
  ].sort((a, b) => a - b);

  const gradeBars: GradeBar[] = presentGrades.map((item) => {
    const members = data.students.filter((student) => student.grade === item);
    const ownLessons = lessons.filter((lesson) => lesson.grade === item);
    const measured = ownLessons.length > 0 ? ownLessons : lessons.filter((lesson) => lesson.grade <= item);
    const allowed = new Set(measured.map((lesson) => lesson.lessonId));
    const rates = members.map((student) =>
      allowed.size === 0 ? student.completionRate : Math.round((countIn(student.completedLessonIds, allowed) / allowed.size) * 100),
    );
    return {
      grade: item,
      label: `Lớp ${item}`,
      students: members.length,
      avgCompletion: average(rates),
      avgExp: members.length === 0 ? 0 : Math.round(members.reduce((sum, student) => sum + student.exp, 0) / members.length),
    };
  });

  const lessonSource = grade === "all" ? lessons : fallback ? lessons.filter((lesson) => lesson.grade <= grade) : gradeLessons;
  const lessonBars = lessonStats(students, lessonSource);
  const levelBars = LEVELS.map((level) => ({
    ...level,
    count: students.filter((student) => student.level === level.index).length,
  }));
  const bands = BAND_META.map((band) => ({
    ...band,
    count: students.filter((student) => bandKey(student) === band.key).length,
  }));
  const needsHelp = [...students]
    .filter((student) => student.scopedCompletion < 50)
    .sort((a, b) => a.scopedCompletion - b.scopedCompletion || a.draftCount - b.draftCount || a.fullName.localeCompare(b.fullName, "vi"))
    .slice(0, 5);
  const leaders = [...students].sort((a, b) => b.exp - a.exp || b.scopedCompletion - a.scopedCompletion).slice(0, 3);

  const scopeNote =
    grade === "all"
      ? "Mỗi em được tính trên các chặng từ khối của em trở xuống."
      : fallback
        ? `Lớp ${grade} chưa có chặng riêng. Tỉ lệ tính trên các chặng em được mở.`
        : `Đang xem các chặng thuộc Lớp ${grade}.`;

  return {
    students,
    gradeCounts,
    totalStudents: students.length,
    avgCompletion: average(students.map((student) => student.scopedCompletion)),
    avgExp: students.length === 0 ? 0 : Math.round(students.reduce((sum, student) => sum + student.exp, 0) / students.length),
    totalDrafts: students.reduce((sum, student) => sum + student.draftCount, 0),
    needsHelpCount: students.filter((student) => student.scopedCompletion < 50).length,
    scopeNote,
    bands,
    gradeBars,
    lessonBars,
    levelBars,
    leaders,
    needsHelp,
    spotlight: lessonBars.find((lesson) => lesson.reached > 0) ?? null,
  };
}

function lessonStats(students: ClassStudent[], lessons: AnalyticsLesson[]): LessonBar[] {
  const total = students.length;
  return lessons
    .map((lesson) => {
      let completions = 0;
      let drafts = 0;
      let reached = 0;
      for (const student of students) {
        const done = student.completedLessonIds.includes(lesson.lessonId);
        const drafted = student.draftLessonIds.includes(lesson.lessonId);
        if (done) completions += 1;
        if (drafted) drafts += 1;
        if (done || drafted) reached += 1;
      }
      return {
        ...lesson,
        completions,
        drafts,
        reached,
        completionRate: total === 0 ? 0 : Math.round((completions / total) * 100),
      };
    })
    .sort((a, b) => b.reached - a.reached || b.completions - a.completions || a.lessonId - b.lessonId);
}

export function foldText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}
