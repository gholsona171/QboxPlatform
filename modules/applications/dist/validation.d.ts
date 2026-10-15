import type { ApplicationFormInput, ApplicationPanelInput } from "./types.js";
export type ApplicationErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe application failure. Messages are shown to members and staff. */
export declare class ApplicationError extends Error {
    readonly code: ApplicationErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: ApplicationErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
/** Longest text answer Discord forms accept. */
export declare const MAX_ANSWER_LENGTH = 4000;
export declare const MAX_FORMS = 25;
export declare const MAX_PANELS = 25;
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
export declare function requireLength(name: string, value: string, min: number, max: number): void;
export declare function validateForm(input: ApplicationFormInput): void;
export declare function validatePanel(input: ApplicationPanelInput): void;
//# sourceMappingURL=validation.d.ts.map