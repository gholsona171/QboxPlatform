import type { RankInput, StaffSettingsInput } from "./types.js";
export type StaffErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe staff failure. Messages are shown to staff and members. */
export declare class StaffError extends Error {
    readonly code: StaffErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: StaffErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
export declare function requireLength(name: string, value: string, min: number, max: number): void;
/** Trims optional text, returning undefined when empty, and checks its length. */
export declare function optionalText(name: string, value: string | undefined, max: number): string | undefined;
export declare function validateSettings(input: StaffSettingsInput): void;
export declare function validateRank(input: RankInput): void;
//# sourceMappingURL=validation.d.ts.map