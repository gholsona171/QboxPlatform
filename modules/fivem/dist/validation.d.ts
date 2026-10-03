import type { FivemSettingsInput } from "./types.js";
export type FivemErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe FiveM failure. Messages are shown to staff and members. */
export declare class FivemError extends Error {
    readonly code: FivemErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: FivemErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
/** Checks `host:port` and returns it trimmed and lowercased. */
export declare function normalizeAddress(value: string): string;
export declare function isValidTimeZone(timeZone: string): boolean;
export declare function validateSettings(input: FivemSettingsInput): void;
//# sourceMappingURL=validation.d.ts.map