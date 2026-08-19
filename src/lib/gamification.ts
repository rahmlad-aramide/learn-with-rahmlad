export const XP_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 4000, 7500, 15000, 30000,
];

export interface LevelInfo {
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number | null;
  progressInLevel: number; // 0–1 fraction
}

export function getLevelFromXP(xp: number): LevelInfo {
  let level = 1;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  const xpForCurrentLevel = XP_THRESHOLDS[level - 1];
  const xpForNextLevel = XP_THRESHOLDS[level] ?? null;
  const progressInLevel = xpForNextLevel
    ? (xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)
    : 1;
  return { level, xpForCurrentLevel, xpForNextLevel, progressInLevel };
}
