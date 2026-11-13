import { type UdpDialer } from "./transport.js";
import type { GameServerPlayer, GameServerStatus } from "./types.js";
/** `A2S_INFO` request; `challenge` is appended after the server asks for one. */
export declare function buildInfoRequest(challenge?: Buffer): Buffer;
/** `A2S_PLAYER` request with `challenge` (`FF FF FF FF` asks for one). */
export declare function buildPlayerRequest(challenge?: Buffer): Buffer;
/** `S2C_CHALLENGE` packet (used by tests). */
export declare function buildChallenge(challenge: Buffer): Buffer;
export interface A2sInfo {
    readonly name: string;
    readonly map: string;
    readonly folder: string;
    readonly game: string;
    readonly appId: number;
    readonly players: number;
    readonly maxPlayers: number;
    readonly bots: number;
    readonly version: string;
    readonly keywords?: string | undefined;
}
/** Parses an `A2S_INFO` reply payload (after the `FF FF FF FF` header). */
export declare function parseInfo(payload: Buffer): A2sInfo;
/** Parses an `A2S_PLAYER` reply payload (after the header). */
export declare function parsePlayers(payload: Buffer): GameServerPlayer[];
/**
 * Collects datagrams into one reply payload. Handles the Source split header
 * (`FE FF FF FF`) for uncompressed packets.
 */
export declare class PacketAssembler {
    private readonly parts;
    private expected;
    private id;
    /** Adds a datagram; returns the complete payload once every part arrived. */
    add(datagram: Buffer): Buffer | undefined;
}
/** Builds Source split packets for a payload (used by tests). */
export declare function splitPackets(payload: Buffer, size: number, id?: number): Buffer[];
/**
 * Steam server query (`A2S_INFO` and `A2S_PLAYER` over UDP) for Rust, ARK,
 * Valheim, Palworld, CS2, Garry's Mod, 7 Days to Die, and other Source-query games.
 */
export declare class SteamQueryClient {
    private readonly dial;
    private readonly timeoutMs;
    private readonly now;
    constructor(dial?: UdpDialer, timeoutMs?: number, now?: () => Date);
    query(address: string): Promise<GameServerStatus>;
    private exchange;
    private receive;
}
export declare function toStatus(info: A2sInfo, players: readonly GameServerPlayer[], latencyMs: number, checkedAt: Date): GameServerStatus;
//# sourceMappingURL=SteamQueryClient.d.ts.map