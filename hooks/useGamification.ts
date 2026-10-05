"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fireConfetti } from "@/lib/confetti";
import { useLocalStorage } from "./useLocalStorage";

export const EXP_PER_ACTION = 10;

export type Level = { index: number; name: string; emoji: string; min: number; max: number };

/** Ngưỡng EXP của từng cấp: [min, max). Cấp cuối không giới hạn. */
export const LEVELS: Level[] = [
  { index: 0, name: "Tân binh", emoji: "🐣", min: 0, max: 50 },
  { index: 1, name: "Cây bút trẻ", emoji: "✏️", min: 50, max: 150 },
  { index: 2, name: "Nhà văn nhí", emoji: "📖", min: 150, max: 300 },
  { index: 3, name: "Văn sĩ tài ba", emoji: "🎖️", min: 300, max: 500 },
  { index: 4, name: "Đại thi hào", emoji: "👑", min: 500, max: Infinity },
];

export const getLevel = (exp: number) => LEVELS.findLast((l) => exp >= l.min) ?? LEVELS[0];

export function useGamification() {
  const [exp, setExp, loaded] = useLocalStorage<number>("tram-sac-exp", 0);
  const [levelUp, setLevelUp] = useState<Level | null>(null);
  const [gainKey, setGainKey] = useState(0); // đổi giá trị mỗi lần +EXP để kích hoạt animation
  const [lastGain, setLastGain] = useState(EXP_PER_ACTION);

  const level = getLevel(exp);
  const progress =
    level.max === Infinity ? 100 : Math.round(((exp - level.min) / (level.max - level.min)) * 100);

  // Phát hiện lên cấp (bỏ qua lần đọc localStorage đầu tiên).
  const prevLevel = useRef<number | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (prevLevel.current !== null && level.index > prevLevel.current) {
      setLevelUp(level);
      fireConfetti();
    }
    prevLevel.current = level.index;
  }, [level, loaded]);

  const addExp = useCallback(
    (amount = EXP_PER_ACTION) => {
      if (amount <= 0) return;
      setExp((prev) => prev + amount);
      setLastGain(amount);
      setGainKey((k) => k + 1);
    },
    [setExp],
  );

  const reset = useCallback(() => setExp(0), [setExp]);

  return {
    exp,
    level,
    nextLevel: LEVELS[level.index + 1] ?? null,
    progress,
    addExp,
    reset,
    gainKey,
    lastGain,
    levelUp,
    dismissLevelUp: () => setLevelUp(null),
  };
}
