import type { LevelSettingsInput } from "./types.js";
export type LevelErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe levels failure. Messages are shown to members and staff. */
export declare class LevelError extends Error {
    readonly code: LevelErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: LevelErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
export declare function validateSettings(input: LevelSettingsInput): void;
//# sourceMappingURL=validation.d.ts.map