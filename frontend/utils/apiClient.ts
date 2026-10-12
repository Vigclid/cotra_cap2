import type { QuizQuestion, SpellingRound, TypingPassage } from "@/lib/games-data";
import type {
  AiEvaluationReport,
  AnalyticsLesson,
  AnalyticsOverview,
  AnalyticsStudent,
  CharacterSummary,
  Draft,
  DraftInput,
  ExpResult,
  LessonDetail,
  LessonQuote,
  LessonSummary,
  LessonText,
  LoginResponse,
  ManagedStudent,
  ManagedStudentPage,
  QuizItem,
  RegisterInput,
  Role,
  SpellingItem,
  TypingItem,
  User,
} from "@/types/api";

/** Chấp nhận cả "http://localhost:5000" lẫn "http://localhost:5000/api". */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export const TOKEN_KEY = "jwt_token";
/** Phát ra khi backend trả 401 cho một request có token → AuthContext đẩy người dùng về /login. */
export const UNAUTHORIZED_EVENT = "auth:unauthorized";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/* ------------------------- Token (localStorage) ------------------------- */

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

/* ------------------------------ Fetch wrapper ------------------------------ */

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  /** false → không gửi token và không coi 401 là "hết phiên" (dùng cho login). */
  auth?: boolean;
};

export async function apiFetch<T>(path: string, { method = "GET", body, signal, auth = true }: RequestOptions = {}): Promise<T> {
  const token = auth ? getToken() : null;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiError(0, "Không kết nối được máy chủ, em kiểm tra mạng rồi thử lại nhé!");
  }

  const data = await res.json().catch(() => null);

  if (res.status === 401 && auth) {
    clearToken();
    if (typeof window !== "undefined") window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  if (!res.ok) {
    throw new ApiError(res.status, (data && typeof data.message === "string" && data.message) || "Có lỗi xảy ra, em thử lại nhé!");
  }
  return data as T;
}

export const apiErrorMessage = (err: unknown) =>
  err instanceof Error && err.message ? err.message : "Có lỗi xảy ra, em thử lại nhé!";

/* ------------------- Chuẩn hoá dữ liệu (chống null / thiếu field) ------------------- */

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const strArray = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const numList = (v: unknown) =>
  Array.isArray(v)
    ? [
        ...new Set(
          v.flatMap((item) => {
            const value = typeof item === "number" ? item : Number(item);
            return Number.isInteger(value) && value > 0 ? [value] : [];
          }),
        ),
      ]
    : [];
const ROLES: Role[] = ["student", "teacher", "admin"];

type Raw = Record<string, unknown> | null | undefined;

export function normalizeUser(raw: Raw): User {
  const role = ROLES.includes(raw?.role as Role) ? (raw?.role as Role) : "student";
  return {
    id: str(raw?.id),
    username: str(raw?.username),
    fullName: str(raw?.fullName) || str(raw?.username),
    role,
    exp: num(raw?.exp),
    level: num(raw?.level),
    badges: strArray(raw?.badges),
    ...(role === "student" ? { grade: num(raw?.grade, 6) || 6 } : {}),
  };
}

const normalizeQuote = (raw: unknown): LessonQuote => {
  const q = (raw ?? {}) as Raw;
  return { text: str(q?.text), author: str(q?.author) };
};

const normalizeText = (raw: unknown): LessonText => {
  const t = (raw ?? {}) as Raw;
  return { name: str(t?.name) || "Văn bản", fullText: strArray(t?.fullText), questions: strArray(t?.questions) };
};

const normalizeBase = (raw: Raw) => ({
  lessonId: num(raw?.lessonId),
  grade: num(raw?.grade, 6) || 6,
  title: str(raw?.title),
  theme: str(raw?.theme),
  quote: normalizeQuote(raw?.quote),
  objectives: strArray(raw?.objectives),
  heroImage: str(raw?.heroImage) || undefined,
});

export const normalizeLessonSummary = (raw: Raw): LessonSummary => ({
  ...normalizeBase(raw),
  textCount: num(raw?.textCount),
  textNames: strArray(raw?.textNames),
  completed: raw?.completed === true,
});

export const normalizeLessonDetail = (raw: Raw): LessonDetail => ({
  ...normalizeBase(raw),
  texts: Array.isArray(raw?.texts) ? raw.texts.map(normalizeText) : [],
});

const asList = (v: unknown): Raw[] => (Array.isArray(v) ? v : []);

function normalizeSpellingItem(raw: Raw): SpellingItem | null {
  const id = str(raw?.id);
  const distractors = strArray(raw?.distractors);
  if (!id || !str(raw?.sentence) || !str(raw?.wrongWord) || !str(raw?.correctWord)) return null;
  return {
    id,
    sentence: str(raw?.sentence),
    wrongWord: str(raw?.wrongWord),
    correctWord: str(raw?.correctWord),
    distractors,
    tip: str(raw?.tip),
  };
}

function normalizeTypingItem(raw: Raw): TypingItem | null {
  const id = str(raw?.id);
  if (!id || !str(raw?.content)) return null;
  return { id, title: str(raw?.title) || "Trích đoạn", content: str(raw?.content), author: str(raw?.author) };
}

function normalizeQuizItem(raw: Raw): QuizItem | null {
  const id = str(raw?.id);
  const options = strArray(raw?.options);
  const correctIndex = num(raw?.correctIndex, -1);
  if (!id || !str(raw?.question) || options.length !== 4 || correctIndex < 0 || correctIndex > 3) return null;
  return { id, question: str(raw?.question), options, correctIndex, explain: str(raw?.explain) };
}

const toSpellingRound = (item: SpellingItem): SpellingRound => ({
  sentence: item.sentence,
  wrong: item.wrongWord,
  options: [item.correctWord, ...item.distractors],
  tip: item.tip || `Viết đúng là “${item.correctWord}”.`,
});

const toTypingPassage = (item: TypingItem): TypingPassage => ({
  id: item.id,
  title: item.title,
  source: item.author,
  text: item.content,
});

const toQuizQuestion = (item: QuizItem): QuizQuestion => ({
  question: item.question,
  options: item.options,
  answer: item.correctIndex,
  explain: item.explain || `Đáp án đúng là “${item.options[item.correctIndex]}”.`,
});

function gameResource<T>(path: string, normalize: (raw: Raw) => T | null) {
  const list = async (signal?: AbortSignal) => {
    const data = await apiFetch<{ items?: unknown }>(path, { signal });
    return asList(data?.items).map(normalize).filter((item): item is T => item !== null);
  };
  return {
    list,
    create: (body: unknown) => apiFetch<{ message: string; item: Raw }>(path, { method: "POST", body }),
    update: (id: string, body: unknown) => apiFetch<{ message: string; item: Raw }>(`${path}/${id}`, { method: "PUT", body }),
    remove: (id: string) => apiFetch<{ message: string }>(`${path}/${id}`, { method: "DELETE" }),
  };
}

/* ------------------------------ Các endpoint ------------------------------ */

export const api = {
  auth: {
    async login(username: string, password: string): Promise<LoginResponse> {
      const data = await apiFetch<{ token?: string; user?: Raw }>("/api/auth/login", {
        method: "POST",
        body: { username, password },
        auth: false,
      });
      if (!data?.token) throw new ApiError(500, "Máy chủ không trả về token");
      return { token: data.token, user: normalizeUser(data.user) };
    },
    async me(signal?: AbortSignal): Promise<User> {
      const data = await apiFetch<{ user?: Raw }>("/api/auth/me", { signal });
      return normalizeUser(data?.user);
    },
    register: (body: RegisterInput) =>
      apiFetch<{ message: string }>("/api/auth/register", { method: "POST", body, auth: false }),
  },

  lessons: {
    async list(signal?: AbortSignal): Promise<LessonSummary[]> {
      const data = await apiFetch<{ lessons?: unknown }>("/api/lessons", { signal });
      return asList(data?.lessons)
        .map(normalizeLessonSummary)
        .filter((l) => l.lessonId > 0)
        .sort((a, b) => a.grade - b.grade || a.lessonId - b.lessonId);
    },
    async get(lessonId: number, signal?: AbortSignal): Promise<LessonDetail> {
      const data = await apiFetch<{ lesson?: Raw }>(`/api/lessons/${lessonId}`, { signal });
      return normalizeLessonDetail(data?.lesson);
    },
  },

  characters: {
    async list(signal?: AbortSignal): Promise<CharacterSummary[]> {
      const data = await apiFetch<{ characters?: unknown }>("/api/characters", { signal });
      return asList(data?.characters)
        .map(normalizeCharacter)
        .filter((character) => character.id)
        .sort((a, b) => a.grade - b.grade || a.lesson - b.lesson || a.name.localeCompare(b.name, "vi"));
    },
  },

  adminStudents: {
    async list(grade?: number, signal?: AbortSignal, page = 1): Promise<ManagedStudentPage> {
      const params = new URLSearchParams({ page: String(page), limit: "100" });
      if (grade) params.set("grade", String(grade));
      const data = await apiFetch<Raw>(`/api/admin/students?${params}`, { signal });
      return {
        page: num(data?.page, page) || page,
        limit: num(data?.limit, 100) || 100,
        total: num(data?.total),
        students: asList(data?.students).map(normalizeManagedStudent).filter((student) => student.id),
      };
    },
    update: (id: string, body: { fullName: string; grade: number }) =>
      apiFetch<{ message: string }>(`/api/admin/students/${encodeURIComponent(id)}`, { method: "PUT", body }),
  },

  progress: {
    async drafts(lessonId: number, signal?: AbortSignal): Promise<Draft[]> {
      const data = await apiFetch<{ drafts?: unknown }>(`/api/progress/draft/${lessonId}`, { signal });
      return asList(data?.drafts).map(normalizeDraft);
    },
    async allDrafts(signal?: AbortSignal): Promise<Draft[]> {
      const data = await apiFetch<{ drafts?: unknown }>("/api/progress/drafts", { signal });
      return asList(data?.drafts).map(normalizeDraft);
    },
    saveDraft: (draft: DraftInput) => apiFetch<{ message: string }>("/api/progress/draft", { method: "POST", body: draft }),
    addExp: (body: { amount: number; lessonId?: number }) =>
      apiFetch<ExpResult>("/api/progress/exp", { method: "POST", body }),
    addWpm: (body: { wpm: number; accuracy?: number; game?: string }) =>
      apiFetch<{ message: string }>("/api/progress/wpm", { method: "POST", body }),
  },

  /** Đề để học sinh chơi. */
  games: {
    async spelling(signal?: AbortSignal): Promise<SpellingRound[]> {
      const items = await gameResource("/api/games/spelling", normalizeSpellingItem).list(signal);
      return items.map(toSpellingRound);
    },
    async typing(signal?: AbortSignal): Promise<TypingPassage[]> {
      const items = await gameResource("/api/games/typing", normalizeTypingItem).list(signal);
      return items.map(toTypingPassage);
    },
    async quiz(signal?: AbortSignal): Promise<QuizQuestion[]> {
      const items = await gameResource("/api/games/quiz", normalizeQuizItem).list(signal);
      return items.map(toQuizQuestion);
    },
  },

  /** Thêm / sửa / xoá đề – chỉ giáo viên và admin. */
  adminGames: {
    spelling: gameResource("/api/admin/games/spelling", normalizeSpellingItem),
    typing: gameResource("/api/admin/games/typing", normalizeTypingItem),
    quiz: gameResource("/api/admin/games/quiz", normalizeQuizItem),
  },

  teacher: {
    async analytics(signal?: AbortSignal): Promise<AnalyticsOverview> {
      const data = await apiFetch<Raw>("/api/teacher/analytics", { signal });
      const lesson = (data?.mostActiveLesson ?? null) as Raw;
      return {
        totalStudents: num(data?.totalStudents),
        avgCompletionRate: num(data?.avgCompletionRate),
        totalDraftsWritten: num(data?.totalDraftsWritten),
        totalLessons: num(data?.totalLessons),
        mostActiveLesson:
          lesson && num(lesson.lessonId) > 0
            ? { lessonId: num(lesson.lessonId), title: str(lesson.title) || `Chặng ${num(lesson.lessonId)}`, studentCount: num(lesson.studentCount) }
            : null,
        lessons: asList(data?.lessons).map(normalizeAnalyticsLesson).filter((item) => item.lessonId > 0),
        students: asList(data?.students).map(normalizeAnalyticsStudent).filter((student) => student.id),
      };
    },
    async evaluate(studentId: string, signal?: AbortSignal): Promise<AiEvaluationReport> {
      const data = await apiFetch<Raw>(`/api/teacher/ai-evaluate/${encodeURIComponent(studentId)}`, {
        method: "POST",
        signal,
      });
      const student = (data?.student ?? null) as Raw;
      const evaluation = (data?.evaluation ?? null) as Raw;
      const rawSource = data?.source;
      const source = rawSource === "gemini" || rawSource === "openai" || rawSource === "demo" ? rawSource : "demo";
      return {
        student: {
          id: str(student?.id) || studentId,
          fullName: str(student?.fullName) || "Học sinh",
          username: str(student?.username),
          levelName: str(student?.levelName),
          levelEmoji: str(student?.levelEmoji),
          exp: num(student?.exp),
          completionRate: num(student?.completionRate),
        },
        draftsUsed: num(data?.draftsUsed),
        source,
        evaluation: {
          strengths: textList(evaluation?.strengths),
          weaknesses: textList(evaluation?.weaknesses),
          focusAreas: textList(evaluation?.focusAreas),
          actionPlan: textList(evaluation?.actionPlan),
        },
      };
    },
  },
};

function normalizeCharacter(raw: Raw): CharacterSummary {
  return {
    id: str(raw?.id),
    name: str(raw?.name),
    work: str(raw?.work),
    author: str(raw?.author),
    grade: num(raw?.grade, 6) || 6,
    lesson: num(raw?.lesson),
    emoji: str(raw?.emoji) || "📖",
    gradient: str(raw?.gradient) || "from-slate-200 to-slate-300",
    tagline: str(raw?.tagline),
    sampleQuestions: strArray(raw?.sampleQuestions),
  };
}

function normalizeManagedStudent(raw: Raw): ManagedStudent {
  return {
    id: str(raw?.id),
    username: str(raw?.username),
    fullName: str(raw?.fullName) || str(raw?.username) || "Học sinh",
    grade: num(raw?.grade, 6) || 6,
    exp: num(raw?.exp),
    level: num(raw?.level),
    levelName: str(raw?.levelName) || "Tân binh",
    completedCount: num(raw?.completedCount),
    draftCount: num(raw?.draftCount),
    joinedAt: str(raw?.joinedAt),
  };
}

function normalizeDraft(d: Raw): Draft {
  const content = str(d?.content) || str(d?.draftContent);
  return {
    lessonId: num(d?.lessonId),
    textIndex: num(d?.textIndex),
    questionIndex: num(d?.questionIndex),
    draftContent: content,
    content,
    updatedAt: str(d?.updatedAt),
  };
}

function normalizeAnalyticsLesson(raw: Raw): AnalyticsLesson {
  return {
    lessonId: num(raw?.lessonId),
    title: str(raw?.title) || `Chặng ${num(raw?.lessonId)}`,
    grade: num(raw?.grade, 6) || 6,
  };
}

function normalizeAnalyticsStudent(raw: Raw): AnalyticsStudent {
  return {
    id: str(raw?.id),
    fullName: str(raw?.fullName) || str(raw?.username) || "Học sinh",
    username: str(raw?.username),
    grade: num(raw?.grade, 6) || 6,
    level: num(raw?.level),
    levelName: str(raw?.levelName) || "Tân binh",
    levelEmoji: str(raw?.levelEmoji) || "🐣",
    exp: num(raw?.exp),
    completionRate: Math.min(100, Math.max(0, num(raw?.completionRate))),
    completedCount: num(raw?.completedCount),
    draftCount: num(raw?.draftCount),
    completedLessonIds: numList(raw?.completedLessonIds),
    draftLessonIds: numList(raw?.draftLessonIds),
  };
}

function textList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(str).map((item) => item.trim()).filter(Boolean);
  const single = str(value).trim();
  return single ? [single] : [];
}
