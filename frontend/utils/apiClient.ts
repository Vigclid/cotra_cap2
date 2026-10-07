import type { QuizQuestion, SpellingRound, TypingPassage } from "@/lib/games-data";
import type {
  Draft,
  DraftInput,
  ExpResult,
  LessonDetail,
  LessonQuote,
  LessonSummary,
  LessonText,
  LoginResponse,
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
        .sort((a, b) => a.lessonId - b.lessonId);
    },
    async get(lessonId: number, signal?: AbortSignal): Promise<LessonDetail> {
      const data = await apiFetch<{ lesson?: Raw }>(`/api/lessons/${lessonId}`, { signal });
      return normalizeLessonDetail(data?.lesson);
    },
  },

  progress: {
    async drafts(lessonId: number, signal?: AbortSignal): Promise<Draft[]> {
      const data = await apiFetch<{ drafts?: unknown }>(`/api/progress/draft/${lessonId}`, { signal });
      return asList(data?.drafts).map((d) => ({
        lessonId: num(d?.lessonId),
        textIndex: num(d?.textIndex),
        questionIndex: num(d?.questionIndex),
        draftContent: str(d?.draftContent),
        updatedAt: str(d?.updatedAt),
      }));
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
};
