import type { LevelCurve } from "./types.js";
/** Total XP needed to reach `level`: `base * level^exponent + linear * level`, rounded. */
export declare function xpForLevel(level: number, curve: LevelCurve): number;
/** Highest level whose XP requirement is met, optionally capped at `maxLevel` (0 = no cap). */
export declare function levelForXp(xp: number, curve: LevelCurve, maxLevel?: number): number;
/** Progress inside the current level, for rank cards. */
export declare function levelProgress(xp: number, curve: LevelCurve, maxLevel?: number): {
    readonly level: number;
    readonly currentLevelXp: number;
    readonly nextLevelXp?: number;
};
export declare function defaultCurve(): LevelCurve;
//# sourceMappingURL=curve.d.ts.map