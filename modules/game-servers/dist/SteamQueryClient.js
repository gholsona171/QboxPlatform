import { dialUdp, failureReason, withTimeout } from "./transport.js";
import { splitAddress } from "./validation.js";
const DEFAULT_TIMEOUT_MS = 5_000;
const MAX_PLAYERS_KEPT = 1024;
const SINGLE_HEADER = Buffer.from("ffffffff", "hex");
const SPLIT_HEADER = -2;
const HEADER_INFO = 0x49;
const HEADER_PLAYER = 0x44;
const HEADER_CHALLENGE = 0x41;
const THE_SHIP_APP_ID = 2400;
const EDF_PORT = 0x80;
const EDF_STEAM_ID = 0x10;
const EDF_SPECTATOR = 0x40;
const EDF_KEYWORDS = 0x20;
/** `A2S_INFO` request; `challenge` is appended after the server asks for one. */
export function buildInfoRequest(challenge) {
    const base = Buffer.concat([SINGLE_HEADER, Buffer.from("T"), Buffer.from("Source Engine Query\0", "latin1")]);
    return challenge ? Buffer.concat([base, challenge]) : base;
}
/** `A2S_PLAYER` request with `challenge` (`FF FF FF FF` asks for one). */
export function buildPlayerRequest(challenge = SINGLE_HEADER) {
    return Buffer.concat([SINGLE_HEADER, Buffer.from("U"), challenge]);
}
/** `S2C_CHALLENGE` packet (used by tests). */
export function buildChallenge(challenge) {
    return Buffer.concat([SINGLE_HEADER, Buffer.from([HEADER_CHALLENGE]), challenge]);
}
class Reader {
    buffer;
    offset = 0;
    constructor(buffer) {
        this.buffer = buffer;
    }
    byte() {
        const value = this.buffer[this.offset];
        if (value === undefined)
            throw new Error("The server sent a truncated response.");
        this.offset += 1;
        return value;
    }
    short() {
        this.need(2);
        const value = this.buffer.readInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    int() {
        this.need(4);
        const value = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    float() {
        this.need(4);
        const value = this.buffer.readFloatLE(this.offset);
        this.offset += 4;
        return value;
    }
    string() {
        const end = this.buffer.indexOf(0, this.offset);
        if (end < 0)
            throw new Error("The server sent a truncated response.");
        const value = this.buffer.subarray(this.offset, end).toString("utf8");
        this.offset = end + 1;
        return value;
    }
    skip(count) {
        this.need(count);
        this.offset += count;
    }
    get done() {
        return this.offset >= this.buffer.length;
    }
    need(count) {
        if (this.offset + count > this.buffer.length)
            throw new Error("The server sent a truncated response.");
    }
}
/** Parses an `A2S_INFO` reply payload (after the `FF FF FF FF` header). */
export function parseInfo(payload) {
    const reader = new Reader(payload);
    if (reader.byte() !== HEADER_INFO)
        throw new Error("The server sent an unexpected packet.");
    reader.byte();
    const name = reader.string();
    const map = reader.string();
    const folder = reader.string();
    const game = reader.string();
    const appId = reader.short();
    const players = reader.byte();
    const maxPlayers = reader.byte();
    const bots = reader.byte();
    reader.skip(4);
    if (appId === THE_SHIP_APP_ID)
        reader.skip(3);
    const version = reader.string();
    let keywords;
    if (!reader.done) {
        const edf = reader.byte();
        if (edf & EDF_PORT)
            reader.skip(2);
        if (edf & EDF_STEAM_ID)
            reader.skip(8);
        if (edf & EDF_SPECTATOR) {
            reader.skip(2);
            reader.string();
        }
        if (edf & EDF_KEYWORDS)
            keywords = reader.string();
    }
    return { name, map, folder, game, appId, players, maxPlayers, bots, version, ...(keywords === undefined ? {} : { keywords }) };
}
/** Parses an `A2S_PLAYER` reply payload (after the header). */
export function parsePlayers(payload) {
    const reader = new Reader(payload);
    if (reader.byte() !== HEADER_PLAYER)
        throw new Error("The server sent an unexpected packet.");
    const count = reader.byte();
    const players = [];
    for (let index = 0; index < count && !reader.done; index += 1) {
        reader.byte();
        const name = reader.string().trim().slice(0, 100);
        const score = reader.int();
        const duration = Math.max(0, Math.round(reader.float()));
        if (name)
            players.push({ name, score, duration });
    }
    return players.slice(0, MAX_PLAYERS_KEPT);
}
/**
 * Collects datagrams into one reply payload. Handles the Source split header
 * (`FE FF FF FF`) for uncompressed packets.
 */
export class PacketAssembler {
    parts = new Map();
    expected;
    id;
    /** Adds a datagram; returns the complete payload once every part arrived. */
    add(datagram) {
        if (datagram.length < 4)
            throw new Error("The server sent a malformed packet.");
        const header = datagram.readInt32LE(0);
        if (header === -1)
            return datagram.subarray(4);
        if (header !== SPLIT_HEADER)
            throw new Error("The server sent an unexpected packet.");
        const id = datagram.readInt32LE(4);
        if ((id & 0x80000000) !== 0)
            throw new Error("The server sent a compressed response, which is not supported.");
        const total = datagram.readUInt8(8);
        const number = datagram.readUInt8(9);
        if (this.id !== undefined && this.id !== id)
            return undefined;
        this.id = id;
        this.expected = total;
        this.parts.set(number, datagram.subarray(12));
        if (this.parts.size < total)
            return undefined;
        const joined = Buffer.concat(Array.from({ length: total }, (_, index) => this.parts.get(index) ?? Buffer.alloc(0)));
        if (joined.readInt32LE(0) !== -1)
            throw new Error("The server sent a malformed packet.");
        return joined.subarray(4);
    }
}
/** Builds Source split packets for a payload (used by tests). */
export function splitPackets(payload, size, id = 42) {
    const whole = Buffer.concat([SINGLE_HEADER, payload]);
    const total = Math.ceil(whole.length / size);
    return Array.from({ length: total }, (_, number) => {
        const chunk = whole.subarray(number * size, (number + 1) * size);
        const header = Buffer.alloc(12);
        header.writeInt32LE(SPLIT_HEADER, 0);
        header.writeInt32LE(id, 4);
        header.writeUInt8(total, 8);
        header.writeUInt8(number, 9);
        header.writeUInt16LE(size, 10);
        return Buffer.concat([header, chunk]);
    });
}
/**
 * Steam server query (`A2S_INFO` and `A2S_PLAYER` over UDP) for Rust, ARK,
 * Valheim, Palworld, CS2, Garry's Mod, 7 Days to Die, and other Source-query games.
 */
export class SteamQueryClient {
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
        const { host, port } = splitAddress("steam", address);
        if (port === undefined)
            return { online: false, players: [], playerCount: 0, maxPlayers: 0, latencyMs: 0, error: "The query port is missing.", checkedAt: this.now() };
        try {
            const channel = await this.dial(host, port);
            try {
                const info = parseInfo(await withTimeout(this.exchange(channel, "info"), this.timeoutMs));
                const latencyMs = Date.now() - started;
                const players = await withTimeout(this.exchange(channel, "players"), this.timeoutMs).then(parsePlayers, () => []);
                return toStatus(info, players, latencyMs, this.now());
            }
            finally {
                channel.close();
            }
        }
        catch (error) {
            return { online: false, players: [], playerCount: 0, maxPlayers: 0, latencyMs: Date.now() - started, error: failureReason(error), checkedAt: this.now() };
        }
    }
    async exchange(channel, kind) {
        const request = (challenge) => (kind === "info" ? buildInfoRequest(challenge) : buildPlayerRequest(challenge));
        await channel.send(request());
        let payload = await this.receive(channel);
        for (let attempt = 0; attempt < 2 && payload[0] === HEADER_CHALLENGE; attempt += 1) {
            await channel.send(request(payload.subarray(1, 5)));
            payload = await this.receive(channel);
        }
        return payload;
    }
    async receive(channel) {
        const assembler = new PacketAssembler();
        for (;;) {
            const payload = assembler.add(await channel.receive(this.timeoutMs));
            if (payload)
                return payload;
        }
    }
}
/** Rust reports real counts in keywords (`mp200,cp45,...`) because the byte fields cap at 255. */
function keywordCount(keywords, prefix) {
    const match = keywords ? new RegExp(`(?:^|,)${prefix}(\\d+)(?:,|$)`).exec(keywords) : null;
    return match ? Number(match[1]) : undefined;
}
export function toStatus(info, players, latencyMs, checkedAt) {
    const playerCount = keywordCount(info.keywords, "cp") ?? Math.max(0, info.players - info.bots);
    const maxPlayers = keywordCount(info.keywords, "mp") ?? info.maxPlayers;
    return {
        online: true,
        ...(info.name.trim() ? { name: info.name.trim().slice(0, 200) } : {}),
        ...(info.map.trim() ? { map: info.map.trim().slice(0, 100) } : {}),
        ...(info.version.trim() ? { version: info.version.trim().slice(0, 100) } : {}),
        players,
        playerCount: Math.max(playerCount, players.length),
        maxPlayers,
        latencyMs,
        checkedAt,
    };
}
//# sourceMappingURL=SteamQueryClient.js.map