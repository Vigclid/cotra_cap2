"use client";

import { useEffect, useSyncExternalStore } from "react";
import { CHARACTERS } from "@/lib/characters";
import type { CharacterSummary } from "@/types/api";
import { api } from "@/utils/apiClient";

/**
 * Danh sách nhân vật dùng chung. Nguồn chính là GET /api/characters.
 * Collection trống hoặc máy chủ cũ chưa có route → dùng bộ Lớp 6 gắn sẵn để lớp học không bị trống.
 */
type CharactersState = { characters: CharacterSummary[] | null; loading: boolean; error: string | null };

const INITIAL: CharactersState = { characters: null, loading: false, error: null };
let state = INITIAL;
let controller: AbortController | null = null;
const listeners = new Set<() => void>();

function setState(patch: Partial<CharactersState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function fallbackCharacters(): CharacterSummary[] {
  return CHARACTERS.map((character) => ({
    id: character.id,
    name: character.name,
    work: character.work,
    author: character.author,
    grade: Number(character.grade.replace(/\D/g, "")) || 6,
    lesson: character.lesson,
    emoji: character.emoji,
    gradient: character.gradient,
    tagline: character.tagline,
    sampleQuestions: character.sampleQuestions,
  }));
}

export function loadCharacters(force = false) {
  if (state.loading || (state.characters && !force)) return;
  const ctrl = new AbortController();
  controller = ctrl;
  setState({ loading: true, error: null });
  api.characters
    .list(ctrl.signal)
    .then((characters) => {
      if (controller !== ctrl) return;
      setState({ characters: characters.length > 0 ? characters : fallbackCharacters(), loading: false, error: null });
    })
    .catch((err) => {
      if (controller !== ctrl) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState({ characters: fallbackCharacters(), loading: false, error: null });
    });
}

export function resetCharacters() {
  controller?.abort();
  controller = null;
  setState(INITIAL);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useCharacters() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => INITIAL);
  useEffect(() => loadCharacters(), []);
  return { ...snapshot, reload: () => loadCharacters(true) };
}
