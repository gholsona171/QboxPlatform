import type { AutomodMessage, AutomodSettings, AutomodViolation } from "./types.js";
export declare function defaultAutomod(): AutomodSettings;
/** Tracks recent message times per member to detect spam bursts. */
export declare class SpamTracker {
    private readonly recent;
    /** Records a message and returns how many the member sent inside the window. */
    record(key: string, at: number, windowSeconds: number): number;
    reset(key: string): void;
    private prune;
}
/**
 * Checks one message against the automod rules. Returns the first violation,
 * or undefined. Exempt roles and channels are never checked.
 */
export declare function evaluateAutomod(settings: AutomodSettings, message: AutomodMessage, spam: SpamTracker): AutomodViolation | undefined;
/** Parses durations like `30m`, `2h`, `7d`, `1w`, or a number of minutes. */
export declare function parseDuration(value: string): number | undefined;
/** Formats minutes as a short human duration, e.g. `2 hours`. */
export declare function formatDuration(minutes: number): string;
//# sourceMappingURL=automod.d.ts.map