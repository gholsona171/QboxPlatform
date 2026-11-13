import type { VoiceHubInput } from "./types.js";
export type VoiceErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe voice room failure. Messages are shown to members and staff. */
export declare class VoiceError extends Error {
    readonly code: VoiceErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: VoiceErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
/** Checks a room name: 1-100 characters after trimming. */
export declare function requireRoomName(name: string): string;
export declare function validateHub(input: VoiceHubInput): void;
//# sourceMappingURL=validation.d.ts.map