import type { BirthdaySettingsInput } from "./types.js";
export type BirthdayErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe birthday failure. Messages are shown to members and staff. */
export declare class BirthdayError extends Error {
    readonly code: BirthdayErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: BirthdayErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare const MONTH_NAMES: readonly ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
/** Canonical IANA time zone name, or an INVALID_INPUT error. */
export declare function requireTimeZone(value: string): string;
/** Checks a month and day (February 29 is allowed), and the year when given. */
export declare function requireDate(month: number, day: number, year: number | undefined, currentYear: number): void;
export declare function validateSettings(input: BirthdaySettingsInput): void;
//# sourceMappingURL=validation.d.ts.map