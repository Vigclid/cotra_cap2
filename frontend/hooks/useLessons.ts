"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { LessonSummary } from "@/types/api";
import { api, apiErrorMessage } from "@/utils/apiClient";

/**
 * Danh sách chặng học dùng chung (Roadmap, Nhân vật...) – chỉ gọi GET /api/lessons một lần,
 * các component cùng đọc một bản cache. Gọi `resetLessons()` khi đổi tài khoản.
 */
type LessonsState = { lessons: LessonSummary[] | null; loading: boolean; error: string | null };

const INITIAL: LessonsState = { lessons: null, loading: false, error: null };
let state = INITIAL;
let controller: AbortController | null = null;
const listeners = new Set<() => void>();

function setState(patch: Partial<LessonsState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function loadLessons(force = false) {
  if (state.loading || (state.lessons && !force)) return;
  const ctrl = new AbortController();
  controller = ctrl;
  setState({ loading: true, error: null });
  api.lessons
    .list(ctrl.signal)
    .then((lessons) => controller === ctrl && setState({ lessons, loading: false }))
    .catch((err) => controller === ctrl && setState({ loading: false, error: apiErrorMessage(err) }));
}

/** Cập nhật cờ `completed` tại chỗ sau khi backend xác nhận, không cần tải lại cả roadmap. */
export function markLessonsCompleted(ids: number[]) {
  if (!state.lessons) return;
  const done = new Set(ids);
  setState({ lessons: state.lessons.map((l) => (done.has(l.lessonId) ? { ...l, completed: true } : l)) });
}

export function resetLessons() {
  controller?.abort();
  controller = null;
  setState(INITIAL);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useLessons() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => INITIAL);
  useEffect(() => loadLessons(), []);
  return { ...snapshot, reload: () => loadLessons(true) };
}
