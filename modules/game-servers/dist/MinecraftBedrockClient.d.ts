import { type UdpDialer } from "./transport.js";
import type { GameServerStatus } from "./types.js";
/** RakNet offline message ID. */
export declare const RAKNET_MAGIC: Buffer<ArrayBuffer>;
/** RakNet unconnected ping. */
export declare function buildUnconnectedPing(time: bigint): Buffer;
/** RakNet unconnected pong carrying a server ID string (used by tests). */
export declare function buildUnconnectedPong(time: bigint, serverId: string): Buffer;
/**
 * Parses the pong's `;`-separated server ID:
 * `edition;motd;protocol;version;online;max;serverId;subMotd;gamemode;...`.
 */
export declare function parseUnconnectedPong(packet: Buffer, latencyMs: number, checkedAt: Date): GameServerStatus;
/** Minecraft Bedrock Edition status through the RakNet unconnected ping (UDP). */
export declare class MinecraftBedrockClient {
    private readonly dial;
    private readonly timeoutMs;
    private readonly now;
    constructor(dial?: UdpDialer, timeoutMs?: number, now?: () => Date);
    query(address: string): Promise<GameServerStatus>;
}
//# sourceMappingURL=MinecraftBedrockClient.d.ts.map