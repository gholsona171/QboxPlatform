import type { LevelCurve } from "./types.js";
import { LEVEL_CAP } from "./types.js";

/** Total XP needed to reach `level`: `base * level^exponent + linear * level`, rounded. */
export function xpForLevel(level: number, curve: LevelCurve): number {
  if (level <= 0) return 0;
  return Math.round(curve.base * level ** curve.exponent + curve.linear * level);
}

/** Highest level whose XP requirement is met, optionally capped at `maxLevel` (0 = no cap). */
export function levelForXp(xp: number, curve: LevelCurve, maxLevel = 0): number {
  const cap = maxLevel > 0 ? Math.min(maxLevel, LEVEL_CAP) : LEVEL_CAP;
  let low = 0;
  let high = cap;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (xpForLevel(middle, curve) <= xp) low = middle;
    else high = middle - 1;
  }
  return low;
}

/** Progress inside the current level, for rank cards. */
export function levelProgress(xp: number, curve: LevelCurve, maxLevel = 0): { readonly level: number; readonly currentLevelXp: number; readonly nextLevelXp?: number } {
  const level = levelForXp(xp, curve, maxLevel);
  const capped = (maxLevel > 0 && level >= maxLevel) || level >= LEVEL_CAP;
  return { level, currentLevelXp: xpForLevel(level, curve), ...(capped ? {} : { nextLevelXp: xpForLevel(level + 1, curve) }) };
}

export function defaultCurve(): LevelCurve {
  return { base: 50, exponent: 2, linear: 50 };
}
