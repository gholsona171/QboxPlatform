import { type SrvResolver, type TcpDialer } from "./transport.js";
import type { GameServerStatus } from "./types.js";
/** Minecraft VarInt (LEB128, 32-bit). */
export declare function encodeVarInt(value: number): Buffer;
/** Reads a VarInt at `offset`; undefined when the buffer ends first. */
export declare function decodeVarInt(buffer: Buffer, offset: number): {
    readonly value: number;
    readonly size: number;
} | undefined;
/** Handshake (state 1 = status) followed by the status request. */
export declare function buildStatusRequest(host: string, port: number): Buffer;
/** Frames a status response the way a server sends it (used by tests). */
export declare function buildStatusResponse(json: unknown): Buffer;
/** Chat component (string or object tree) to plain text without `§` color codes. */
export declare function chatToText(value: unknown): string;
/** Parses the JSON of a status response into a status; `latencyMs` and `checkedAt` come from the caller. */
export declare function parseStatusJson(json: unknown, latencyMs: number, checkedAt: Date): GameServerStatus;
/** Takes one complete status packet off the front of `buffer`, or undefined when more bytes are needed. */
export declare function readStatusPacket(buffer: Buffer): string | undefined;
/**
 * Minecraft Java Edition Server List Ping over TCP. Resolves the
 * `_minecraft._tcp` SRV record when the address has no port.
 */
export declare class MinecraftJavaClient {
    private readonly dial;
    private readonly resolveSrv;
    private readonly timeoutMs;
    private readonly now;
    constructor(dial?: TcpDialer, resolveSrv?: SrvResolver, timeoutMs?: number, now?: () => Date);
    query(address: string): Promise<GameServerStatus>;
    private target;
    private exchange;
}
//# sourceMappingURL=MinecraftJavaClient.d.ts.map