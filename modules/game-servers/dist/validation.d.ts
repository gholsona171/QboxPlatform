import { type GamesServerInput, type GamesServerKind, type GamesSettingsInput } from "./types.js";
export type GamesErrorCode = "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN" | "INVALID_STATE" | "CONFLICT" | "LIMIT_REACHED" | "DEPENDENCY_UNAVAILABLE";
/** Stable, user-safe game server failure. Messages are shown to staff and members. */
export declare class GamesError extends Error {
    readonly code: GamesErrorCode;
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: GamesErrorCode, message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
/** Default query ports for the Minecraft kinds; Steam games differ, so their port is required. */
export declare const DEFAULT_PORTS: Readonly<Record<GamesServerKind, number | undefined>>;
export declare function invalid(message: string): never;
export declare function requireSnowflake(name: string, value: string | undefined): void;
export declare function requireRange(name: string, value: number, min: number, max: number): void;
export declare function isServerKind(value: string): value is GamesServerKind;
/** Splits `host:port` into its parts, using the kind's default port when none is given. */
export declare function splitAddress(kind: GamesServerKind, address: string): {
    readonly host: string;
    readonly port: number | undefined;
};
/** Checks `host` or `host:port` for the kind and returns it trimmed and lowercased. */
export declare function normalizeAddress(kind: GamesServerKind, value: string): string;
export declare function validateServerInput(input: GamesServerInput): void;
export declare function validateSettings(input: GamesSettingsInput): void;
//# sourceMappingURL=validation.d.ts.map