import { dialTcp, failureReason, resolveMinecraftSrv, withTimeout } from "./transport.js";
import { splitAddress } from "./validation.js";
const DEFAULT_TIMEOUT_MS = 5_000;
const MAX_RESPONSE_BYTES = 1_048_576;
const MAX_PLAYERS_KEPT = 1024;
/** `-1` tells the server we only want the status, whatever its protocol version. */
const STATUS_PROTOCOL_VERSION = -1;
/** Minecraft VarInt (LEB128, 32-bit). */
export function encodeVarInt(value) {
    const bytes = [];
    let rest = value >>> 0;
    do {
        let byte = rest & 0x7f;
        rest >>>= 7;
        if (rest !== 0)
            byte |= 0x80;
        bytes.push(byte);
    } while (rest !== 0);
    return Buffer.from(bytes);
}
/** Reads a VarInt at `offset`; undefined when the buffer ends first. */
export function decodeVarInt(buffer, offset) {
    let value = 0;
    for (let size = 0; size < 5; size += 1) {
        const byte = buffer[offset + size];
        if (byte === undefined)
            return undefined;
        value |= (byte & 0x7f) << (7 * size);
        if ((byte & 0x80) === 0)
            return { value, size: size + 1 };
    }
    throw new Error("The server sent a malformed VarInt.");
}
function encodeString(value) {
    const data = Buffer.from(value, "utf8");
    return Buffer.concat([encodeVarInt(data.length), data]);
}
function packet(id, ...parts) {
    const body = Buffer.concat([encodeVarInt(id), ...parts]);
    return Buffer.concat([encodeVarInt(body.length), body]);
}
/** Handshake (state 1 = status) followed by the status request. */
export function buildStatusRequest(host, port) {
    const portBytes = Buffer.alloc(2);
    portBytes.writeUInt16BE(port);
    return Buffer.concat([packet(0x00, encodeVarInt(STATUS_PROTOCOL_VERSION), encodeString(host), portBytes, encodeVarInt(1)), packet(0x00)]);
}
/** Frames a status response the way a server sends it (used by tests). */
export function buildStatusResponse(json) {
    return packet(0x00, encodeString(JSON.stringify(json)));
}
/** Chat component (string or object tree) to plain text without `§` color codes. */
export function chatToText(value) {
    const raw = collect(value);
    return raw.replace(/§[0-9a-fk-or]/gi, "").replace(/\s+/g, " ").trim();
}
function collect(value) {
    if (typeof value === "string")
        return value;
    if (Array.isArray(value))
        return value.map(collect).join("");
    if (!value || typeof value !== "object")
        return "";
    const component = value;
    const own = typeof component.text === "string" ? component.text : typeof component.translate === "string" ? component.translate : "";
    return `${own}${Array.isArray(component.extra) ? component.extra.map(collect).join("") : ""}`;
}
/** Parses the JSON of a status response into a status; `latencyMs` and `checkedAt` come from the caller. */
export function parseStatusJson(json, latencyMs, checkedAt) {
    const data = (json && typeof json === "object" ? json : {});
    const sample = Array.isArray(data.players?.sample) ? data.players.sample : [];
    const players = sample
        .slice(0, MAX_PLAYERS_KEPT)
        .map((entry) => (entry && typeof entry === "object" && typeof entry.name === "string" ? { name: chatToText(entry.name).slice(0, 100) } : undefined))
        .filter((player) => player !== undefined && player.name.length > 0);
    const name = chatToText(data.description).slice(0, 200);
    const version = typeof data.version?.name === "string" ? data.version.name.slice(0, 100) : undefined;
    return {
        online: true,
        ...(name ? { name } : {}),
        ...(version ? { version } : {}),
        players,
        playerCount: numberOf(data.players?.online),
        maxPlayers: numberOf(data.players?.max),
        latencyMs,
        checkedAt,
    };
}
function numberOf(value) {
    return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
/** Takes one complete status packet off the front of `buffer`, or undefined when more bytes are needed. */
export function readStatusPacket(buffer) {
    const length = decodeVarInt(buffer, 0);
    if (!length)
        return undefined;
    if (length.value > MAX_RESPONSE_BYTES)
        throw new Error("The server sent a response that is too large.");
    if (buffer.length < length.size + length.value)
        return undefined;
    const body = buffer.subarray(length.size, length.size + length.value);
    const id = decodeVarInt(body, 0);
    if (!id || id.value !== 0x00)
        throw new Error("The server sent an unexpected packet.");
    const text = decodeVarInt(body, id.size);
    if (!text)
        throw new Error("The server sent a malformed status.");
    return body.subarray(id.size + text.size, id.size + text.size + text.value).toString("utf8");
}
/**
 * Minecraft Java Edition Server List Ping over TCP. Resolves the
 * `_minecraft._tcp` SRV record when the address has no port.
 */
export class MinecraftJavaClient {
    dial;
    resolveSrv;
    timeoutMs;
    now;
    constructor(dial = dialTcp, resolveSrv = resolveMinecraftSrv, timeoutMs = DEFAULT_TIMEOUT_MS, now = () => new Date()) {
        this.dial = dial;
        this.resolveSrv = resolveSrv;
        this.timeoutMs = timeoutMs;
        this.now = now;
    }
    async query(address) {
        const started = Date.now();
        try {
            const target = await this.target(address);
            const status = await withTimeout(this.exchange(target.host, target.port), this.timeoutMs);
            return parseStatusJson(status, Date.now() - started, this.now());
        }
        catch (error) {
            return { online: false, players: [], playerCount: 0, maxPlayers: 0, latencyMs: Date.now() - started, error: failureReason(error), checkedAt: this.now() };
        }
    }
    async target(address) {
        const parts = splitAddress("minecraft-java", address);
        const explicit = /:\d+$/.test(address);
        if (!explicit) {
            const srv = await this.resolveSrv(parts.host);
            if (srv)
                return srv;
        }
        return { host: parts.host, port: parts.port ?? 25_565 };
    }
    async exchange(host, port) {
        const stream = await this.dial(host, port, this.timeoutMs);
        try {
            stream.write(buildStatusRequest(host, port));
            let received = Buffer.alloc(0);
            for await (const chunk of stream) {
                received = Buffer.concat([received, chunk]);
                const text = readStatusPacket(received);
                if (text !== undefined)
                    return JSON.parse(text);
            }
            throw new Error("The server closed the connection.");
        }
        finally {
            stream.destroy();
        }
    }
}
//# sourceMappingURL=MinecraftJavaClient.js.map