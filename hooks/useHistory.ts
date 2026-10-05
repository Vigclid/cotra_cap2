"use client";

import { useCallback } from "react";
import type { HistoryItem } from "@/lib/types";
import { useLocalStorage } from "./useLocalStorage";

const HISTORY_LIMIT = 30;

type NewHistoryItem =
  | Pick<Extract<HistoryItem, { kind: "outline" }>, "kind" | "input" | "result">
  | Pick<Extract<HistoryItem, { kind: "rewrite" }>, "kind" | "input" | "result">;

export function useHistory() {
  const [items, setItems] = useLocalStorage<HistoryItem[]>("tram-sac-history", []);

  const add = useCallback(
    (item: NewHistoryItem) =>
      setItems((prev) =>
        [{ ...item, id: crypto.randomUUID(), createdAt: Date.now() } as HistoryItem, ...prev].slice(0, HISTORY_LIMIT),
      ),
    [setItems],
  );
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), [setItems]);
  const clear = useCallback(() => setItems([]), [setItems]);

  return { items, add, remove, clear };
}
