import { type MusicActor, type MusicCommand, type MusicCommandResult, type MusicControl, type MusicStateSnapshot } from "./types.js";
import { type MusicErrorCode } from "./validation.js";
export declare const DEFAULT_CONTROL_PORT = 3102;
export declare const SIGNATURE_HEADER = "x-qbox-signature";
export declare const TIMESTAMP_HEADER = "x-qbox-timestamp";
/** Requests older or newer than this are refused. */
export declare const MAX_CLOCK_SKEW_MS = 30000;
/** Connect, Speak, and View Channel. */
export declare const VOICE_BOT_PERMISSIONS = "3146752";
export declare const UNREACHABLE_MESSAGE = "The music player is not running (bot offline).";
/** The HMAC key both processes derive from the bot token they already share. */
export declare function controlKey(discordToken: string): Buffer;
/** Hex HMAC-SHA256 of `<timestamp>.<body>`. */
export declare function signControlRequest(key: Buffer, timestamp: string, body: string): string;
export type ControlVerification = {
    readonly ok: true;
} | {
    readonly ok: false;
    readonly reason: "remote" | "stale" | "signature";
};
export interface ControlRequestParts {
    readonly remoteAddress: string | undefined;
    readonly timestamp: string | undefined;
    readonly signature: string | undefined;
    readonly body: string;
}
/** Checks that a control request comes from this machine, is fresh, and is signed with the shared key. */
export declare function verifyControlRequest(key: Buffer, request: ControlRequestParts, now?: number): ControlVerification;
/** The bot user ID encoded in the first part of a Discord bot token, if it has one. */
export declare function botIdFromToken(token: string): string | undefined;
/** Link to invite a voice-only bot with Connect, Speak and View Channel. */
export declare function voiceBotInviteUrl(botId: string): string;
/** Validates a command from JSON (portal or control request). */
export declare function parseMusicCommand(value: unknown): MusicCommand;
/** Validates the actor sent along with a control command. */
export declare function parseMusicActor(value: unknown): MusicActor;
/** Maps an error code to the HTTP status the control server answers with. */
export declare function controlStatus(code: MusicErrorCode): number;
/** Calls the bot's control server over 127.0.0.1 with signed requests. */
export declare class HttpMusicControlClient implements MusicControl {
    private readonly baseUrl;
    private readonly fetchImpl;
    private readonly timeoutMs;
    private readonly key;
    constructor(discordToken: string, baseUrl?: string, fetchImpl?: typeof fetch, timeoutMs?: number);
    state(guildId: string): Promise<MusicStateSnapshot>;
    command(guildId: string, command: MusicCommand, actor: MusicActor): Promise<MusicCommandResult>;
    private call;
}
//# sourceMappingURL=control.d.ts.map