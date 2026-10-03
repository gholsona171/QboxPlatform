export type GiveawayErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe giveaway failure. Messages are shown to members and staff. */
export declare class GiveawayError extends Error {
    readonly code: GiveawayErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: GiveawayErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
export declare function requireLength(name: string, value: string, min: number, max: number): void;
export declare function requireIds(name: string, values: readonly string[], max: number): void;
/** `10m`, `2h`, `3d`, `1w`, or plain minutes. Returns minutes, or undefined when invalid. */
export declare function parseDuration(text: string): number | undefined;
//# sourceMappingURL=validation.d.ts.map