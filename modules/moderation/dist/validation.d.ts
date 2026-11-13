import type { ModerationSettingsInput } from "./types.js";
export type ModerationErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe moderation failure. Messages are shown to staff. */
export declare class ModerationError extends Error {
    readonly code: ModerationErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: ModerationErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
export declare function requireLength(name: string, value: string, min: number, max: number): void;
export declare function validateSettings(input: ModerationSettingsInput): void;
//# sourceMappingURL=validation.d.ts.map