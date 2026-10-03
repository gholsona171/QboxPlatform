import type { Schedule, ScheduledEmbed, ScheduledMessageInput } from "./types.js";
export type ScheduledMessageErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe scheduled message failure. Messages are shown to staff. */
export declare class ScheduledMessageError extends Error {
    readonly code: ScheduledMessageErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: ScheduledMessageErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
/** Checks a schedule and returns it with only the fields its type uses. */
export declare function normalizeSchedule(schedule: Schedule): Schedule;
/** Trims the embed, or returns undefined when it has nothing to show. */
export declare function normalizeEmbed(embed: ScheduledEmbed | undefined): ScheduledEmbed | undefined;
/** Checks a message and returns it trimmed and normalized. */
export declare function normalizeMessage(input: ScheduledMessageInput): ScheduledMessageInput;
//# sourceMappingURL=validation.d.ts.map