import { type StreamPlatform, type StreamsSettingsInput, type StreamsSubscriptionPatch } from "./types.js";
export type StreamsErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe streams failure. Messages are shown to staff. */
export declare class StreamsError extends Error {
    readonly code: StreamsErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: StreamsErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare const MESSAGE_TEXT_LIMIT = 1000;
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function isPlatform(value: string): value is StreamPlatform;
export declare function platformLabel(platform: StreamPlatform): string;
/**
 * Cleans a handle as staff typed it: trims, strips a pasted profile URL and a
 * leading `@`, and lowercases Twitch and Kick names. Throws when it cannot be a handle.
 */
export declare function normalizeHandle(platform: StreamPlatform, raw: string): string;
export declare function validateSettings(input: StreamsSettingsInput): void;
export declare function validateSubscriptionFields(input: StreamsSubscriptionPatch): void;
//# sourceMappingURL=validation.d.ts.map