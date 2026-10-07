/**
 * Bảng cấp độ – giữ đồng bộ với frontend/hooks/useGamification.ts.
 * `level` lưu trong DB là `index` (0 → 4).
 */
export const LEVELS = [
  { index: 0, name: "Tân binh", emoji: "🐣", min: 0 },
  { index: 1, name: "Cây bút trẻ", emoji: "✏️", min: 50 },
  { index: 2, name: "Nhà văn nhí", emoji: "📖", min: 150 },
  { index: 3, name: "Văn sĩ tài ba", emoji: "🎖️", min: 300 },
  { index: 4, name: "Đại thi hào", emoji: "👑", min: 500 },
] as const;

export type LevelInfo = (typeof LEVELS)[number];

export const getLevel = (exp: number): LevelInfo => LEVELS.findLast((l) => exp >= l.min) ?? LEVELS[0];
