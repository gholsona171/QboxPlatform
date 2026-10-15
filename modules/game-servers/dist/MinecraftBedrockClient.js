import { dialUdp, failureReason } from "./transport.js";
import { splitAddress } from "./validation.js";
const DEFAULT_TIMEOUT_MS = 5_000;
const ID_UNCONNECTED_PING = 0x01;
const ID_UNCONNECTED_PONG = 0x1c;
/** RakNet offline message ID. */
export const RAKNET_MAGIC = Buffer.from("00ffff00fefefefefdfdfdfd12345678", "hex");
const CLIENT_GUID = Buffer.from("0000000051d1a7e5", "hex");
/** RakNet unconnected ping. */
export function buildUnconnectedPing(time) {
    const packet = Buffer.alloc(1 + 8 + 16 + 8);
    packet.writeUInt8(ID_UNCONNECTED_PING, 0);
    packet.writeBigInt64BE(time, 1);
    RAKNET_MAGIC.copy(packet, 9);
    CLIENT_GUID.copy(packet, 25);
    return packet;
}
/** RakNet unconnected pong carrying a server ID string (used by tests). */
export function buildUnconnectedPong(time, serverId) {
    const text = Buffer.from(serverId, "utf8");
    const packet = Buffer.alloc(1 + 8 + 8 + 16 + 2 + text.length);
    packet.writeUInt8(ID_UNCONNECTED_PONG, 0);
    packet.writeBigInt64BE(time, 1);
    packet.writeBigInt64BE(0x1234n, 9);
    RAKNET_MAGIC.copy(packet, 17);
    packet.writeUInt16BE(text.length, 33);
    text.copy(packet, 35);
    return packet;
}
/**
 * Parses the pong's `;`-separated server ID:
 * `edition;motd;protocol;version;online;max;serverId;subMotd;gamemode;...`.
 */
export function parseUnconnectedPong(packet, latencyMs, checkedAt) {
    if (packet.length < 35 || packet.readUInt8(0) !== ID_UNCONNECTED_PONG)
        throw new Error("The server sent an unexpected packet.");
    if (!packet.subarray(17, 33).equals(RAKNET_MAGIC))
        throw new Error("The server sent a malformed pong.");
    const length = packet.readUInt16BE(33);
    const fields = packet.subarray(35, 35 + length).toString("utf8").split(";");
    const motd = (fields[1] ?? "").replace(/§[0-9a-fk-or]/gi, "").trim().slice(0, 200);
    const version = (fields[3] ?? "").trim().slice(0, 100);
    const map = (fields[7] ?? "").replace(/§[0-9a-fk-or]/gi, "").trim().slice(0, 100);
    return {
        online: true,
        ...(motd ? { name: motd } : {}),
        ...(version ? { version } : {}),
        ...(map ? { map } : {}),
        players: [],
        playerCount: count(fields[4]),
        maxPlayers: count(fields[5]),
        latencyMs,
        checkedAt,
    };
}
function count(value) {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
/** Minecraft Bedrock Edition status through the RakNet unconnected ping (UDP). */
export class MinecraftBedrockClient {
    dial;
    timeoutMs;
    now;
    constructor(dial = dialUdp, timeoutMs = DEFAULT_TIMEOUT_MS, now = () => new Date()) {
        this.dial = dial;
        this.timeoutMs = timeoutMs;
        this.now = now;
    }
    async query(address) {
        const started = Date.now();
        const { host, port } = splitAddress("minecraft-bedrock", address);
        try {
            const channel = await this.dial(host, port ?? 19_132);
            try {
                await channel.send(buildUnconnectedPing(BigInt(started)));
                const pong = await channel.receive(this.timeoutMs);
                return parseUnconnectedPong(pong, Date.now() - started, this.now());
            }
            finally {
                channel.close();
            }
        }
        catch (error) {
            return { online: false, players: [], playerCount: 0, maxPlayers: 0, latencyMs: Date.now() - started, error: failureReason(error), checkedAt: this.now() };
        }
    }
}
//# sourceMappingURL=MinecraftBedrockClient.js.map