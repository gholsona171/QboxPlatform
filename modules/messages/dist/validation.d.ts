import type { OutgoingEmbed, OutgoingMessage } from "@qbox/shared/messages";
import type { MessagesLookInput } from "./types.js";
export type MessagesErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe messages failure. Messages are shown to staff. */
export declare class MessagesError extends Error {
    readonly code: MessagesErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: MessagesErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
/** Discord's embed limits. */
export declare const EMBED_LIMITS: {
    readonly embeds: 10;
    readonly title: 256;
    readonly description: 4096;
    readonly fields: 25;
    readonly fieldName: 256;
    readonly fieldValue: 1024;
    readonly footer: 2048;
    readonly author: 256;
    readonly total: 6000;
    readonly content: 2000;
    readonly url: 2048;
};
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireMessageKey(key: string): void;
/** `#5865F2` (or `5865F2`) to `#5865F2`. */
export declare function normalizeHexColor(value: string, name: string): string;
export declare function validateLook(input: MessagesLookInput): MessagesLookInput;
/** Accepts an integer or a hex string for an embed color and returns the integer Discord expects. */
export declare function embedColor(value: unknown): number | undefined;
/**
 * Checks one embed against Discord's limits and returns it cleaned: trimmed
 * text, hex colors turned into integers, empty parts dropped. Returns
 * undefined when nothing is left.
 */
export declare function normalizeEmbed(input: unknown, position: number): OutgoingEmbed | undefined;
/**
 * Validates a whole message draft (Discord JSON: `content` and `embeds`) and
 * returns it cleaned. Throws when it is empty or over a limit.
 */
export declare function normalizeMessage(input: unknown): OutgoingMessage;
//# sourceMappingURL=validation.d.ts.map