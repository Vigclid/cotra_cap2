"use client";

import { useCallback, useEffect, useState } from "react";
import type { QuizQuestion, SpellingRound, TypingPassage } from "@/lib/games-data";
import { api, apiErrorMessage } from "@/utils/apiClient";

type GameKind = "spelling" | "typing" | "quiz";

const loaders = {
  spelling: (signal: AbortSignal) => api.games.spelling(signal),
  typing: (signal: AbortSignal) => api.games.typing(signal),
  quiz: (signal: AbortSignal) => api.games.quiz(signal),
};

/** Tải đề mini-game từ backend. `items === null` là đang chờ. */
export function useGameQuestions(kind: GameKind) {
  const [items, setItems] = useState<SpellingRound[] | TypingPassage[] | QuizQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    loaders[kind](ctrl.signal)
      .then((list) => {
        setItems(list);
        setError(null);
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        setError(apiErrorMessage(err));
      });
    return () => ctrl.abort();
  }, [kind, attempt]);

  const retry = useCallback(() => {
    setItems(null);
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { items, error, retry };
}
