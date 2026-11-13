import type { VerificationSettingsInput } from "./types.js";
export type VerificationErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe verification failure. Messages are shown to members and staff. */
export declare class VerificationError extends Error {
    readonly code: VerificationErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: VerificationErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
export declare function requireLength(name: string, value: string, min: number, max: number): void;
export declare function validateSettings(input: VerificationSettingsInput): void;
//# sourceMappingURL=validation.d.ts.map