import type { TicketCategoryInput, TicketPanelInput, TicketSettingsInput } from "./types.js";
export type TicketErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "DISABLED" | "FORBIDDEN" | "LIMIT_REACHED" | "INVALID_STATE" | "CONFLICT" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe ticket failure. Messages are shown to members. */
export declare class TicketError extends Error {
    readonly code: TicketErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: TicketErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string): void;
export declare function optionalSnowflake(name: string, value: string | undefined): void;
export declare function requireLength(name: string, value: string, min: number, max: number): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
export declare function validateSettings(input: TicketSettingsInput): void;
export declare function validateCategory(input: TicketCategoryInput): void;
export declare function validatePanel(input: TicketPanelInput): void;
/** Discord limits: at most 5 rows of at most 5 buttons. */
export declare const TICKET_PANEL_MAX_ROWS = 5;
export declare const TICKET_PANEL_MAX_ROW_BUTTONS = 5;
/**
 * Button rows must place every reason the panel offers exactly once, in 1 to 5
 * rows of 1 to 5 buttons.
 */
export declare function validatePanelRows(rows: readonly (readonly string[])[], categoryIds: readonly string[]): void;
/** Turns a name template into a Discord-safe channel name. */
export declare function channelName(template: string, values: Readonly<Record<string, string>>): string;
/** Replaces `{placeholder}` tokens in member-facing text. */
export declare function renderText(template: string, values: Readonly<Record<string, string>>): string;
//# sourceMappingURL=validation.d.ts.map