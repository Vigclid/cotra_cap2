"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fireConfetti } from "@/lib/confetti";
import type { ExpResult } from "@/types/api";
import { api } from "@/utils/apiClient";

export const EXP_PER_ACTION = 10;
/** Trần EXP mỗi request phía backend (MAX_EXP_PER_REQUEST trong progress.controller.ts). */
const MAX_EXP_PER_REQUEST = 50;

export type Level = { index: number; name: string; emoji: string; min: number; max: number };

/** Ngưỡng EXP của từng cấp: [min, max). Cấp cuối không giới hạn. Giữ đồng bộ với backend/src/utils/levels.ts. */
export const LEVELS: Level[] = [
  { index: 0, name: "Tân binh", emoji: "🐣", min: 0, max: 50 },
  { index: 1, name: "Cây bút trẻ", emoji: "✏️", min: 50, max: 150 },
  { index: 2, name: "Nhà văn nhí", emoji: "📖", min: 150, max: 300 },
  { index: 3, name: "Văn sĩ tài ba", emoji: "🎖️", min: 300, max: 500 },
  { index: 4, name: "Đại thi hào", emoji: "👑", min: 500, max: Infinity },
];

export const getLevel = (exp: number) => LEVELS.findLast((l) => exp >= l.min) ?? LEVELS[0];

/** EXP & cấp độ lấy từ user trong AuthContext; mọi lần cộng EXP đều đi qua POST /api/progress/exp. */
export function useGamification() {
  const { user, patchUser } = useAuth();
  const [levelUp, setLevelUp] = useState<Level | null>(null);
  const [gainKey, setGainKey] = useState(0); // đổi giá trị mỗi lần +EXP để kích hoạt animation
  const [lastGain, setLastGain] = useState(EXP_PER_ACTION);

  const enabled = user?.role === "student";
  const exp = user?.exp ?? 0;
  const level = getLevel(exp);
  const progress =
    level.max === Infinity ? 100 : Math.round(((exp - level.min) / (level.max - level.min)) * 100);

  /** Trả về kết quả từ backend, hoặc null nếu không phải học sinh / gọi API lỗi (không ném lỗi ra game). */
  const addExp = useCallback(
    async (amount = EXP_PER_ACTION, lessonId?: number): Promise<ExpResult | null> => {
      const value = Math.min(Math.round(amount), MAX_EXP_PER_REQUEST);
      if (!enabled || value <= 0) return null;
      try {
        const res = await api.progress.addExp({ amount: value, lessonId });
        patchUser({ exp: res.exp, level: res.level, badges: res.badges ?? [] });
        if (res.gained > 0) {
          setLastGain(res.gained);
          setGainKey((k) => k + 1);
        }
        if (res.leveledUp) {
          setLevelUp(getLevel(res.exp));
          fireConfetti();
        }
        return res;
      } catch (err) {
        console.warn("[useGamification] Không cộng được EXP:", err);
        return null;
      }
    },
    [enabled, patchUser],
  );

  return {
    enabled,
    exp,
    level,
    nextLevel: LEVELS[level.index + 1] ?? null,
    progress,
    addExp,
    gainKey,
    lastGain,
    levelUp,
    dismissLevelUp: () => setLevelUp(null),
  };
}
