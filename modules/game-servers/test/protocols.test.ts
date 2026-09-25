import { PassThrough } from "node:stream";
import { describe, expect, it } from "vitest";

import {
  MinecraftBedrockClient,
  MinecraftJavaClient,
  PacketAssembler,
  ProtocolQueryClient,
  RAKNET_MAGIC,
  SteamQueryClient,
  TimeoutError,
  buildChallenge,
  buildStatusResponse,
  buildUnconnectedPong,
  chatToText,
  decodeVarInt,
  encodeVarInt,
  parseInfo,
  parsePlayers,
  splitPackets,
  type TcpDialer,
  type UdpDialer,
} from "../src/index.js";

const now = () => new Date("2026-09-25T12:00:00Z");

function fakeTcp(respond: (request: Buffer) => Buffer[], seen: Buffer[] = []): TcpDialer {
  return async () => {
    const stream = new PassThrough();
    return {
      write: (data) => {
        seen.push(data);
        for (const chunk of respond(data)) stream.write(chunk);
        stream.end();
      },
      destroy: () => stream.destroy(),
      [Symbol.asyncIterator]: () => stream[Symbol.asyncIterator](),
    };
  };
}

function fakeUdp(respond: (request: Buffer) => Buffer[], seen: Buffer[] = []): UdpDialer {
  return async () => {
    const queue: Buffer[] = [];
    return {
      send: async (data) => {
        seen.push(data);
        queue.push(...respond(data));
      },
      receive: async () => {
        const next = queue.shift();
        if (!next) throw new TimeoutError();
        return next;
      },
      close: () => undefined,
    };
  };
}

const cstring = (text: string) => Buffer.from(`${text}\0`, "utf8");
const u8 = (value: number) => Buffer.from([value]);
const i16 = (value: number) => { const buffer = Buffer.alloc(2); buffer.writeInt16LE(value); return buffer; };
const i32 = (value: number) => { const buffer = Buffer.alloc(4); buffer.writeInt32LE(value); return buffer; };
const f32 = (value: number) => { const buffer = Buffer.alloc(4); buffer.writeFloatLE(value); return buffer; };
const single = (payload: Buffer) => Buffer.concat([Buffer.from("ffffffff", "hex"), payload]);

/** A2S_INFO reply payload as a Rust server sends it, including the EDF keywords with real counts. */
const rustInfo = Buffer.concat([
  u8(0x49), u8(17),
  cstring("Rusty Shores | Weekly"), cstring("Procedural Map"), cstring("rust"), cstring("Rust"),
  i16(-9654), u8(45), u8(200), u8(0), u8(0x64), u8(0x6c), u8(0), u8(1),
  cstring("2511"),
  u8(0x80 | 0x20 | 0x01), i16(28015), cstring("mp300,cp301,qp0,v2511,h1234,oxide"), Buffer.alloc(8),
]);
const csInfo = Buffer.concat([
  u8(0x49), u8(17),
  cstring("Counter-Strike 2 Community"), cstring("de_dust2"), cstring("csgo"), cstring("Counter-Strike 2"),
  i16(730), u8(12), u8(24), u8(2), u8(0x64), u8(0x6c), u8(0), u8(1),
  cstring("1.40.1.5"),
]);
const playersPayload = Buffer.concat([
  u8(0x44), u8(2),
  u8(0), cstring("Amy"), i32(12), f32(3600.4),
  u8(1), cstring("Zed"), i32(3), f32(59),
]);

describe("Steam A2S", () => {
  it("parses A2S_INFO, using the keyword counts Rust reports past 255 players", () => {
    const info = parseInfo(rustInfo);
    expect(info).toMatchObject({ name: "Rusty Shores | Weekly", map: "Procedural Map", game: "Rust", players: 45, maxPlayers: 200, version: "2511", keywords: "mp300,cp301,qp0,v2511,h1234,oxide" });
    expect(parseInfo(csInfo)).toMatchObject({ name: "Counter-Strike 2 Community", map: "de_dust2", players: 12, maxPlayers: 24, bots: 2, version: "1.40.1.5" });
    expect(parseInfo(csInfo).keywords).toBeUndefined();
  });

  it("parses A2S_PLAYER", () => {
    expect(parsePlayers(playersPayload)).toEqual([{ name: "Amy", score: 12, duration: 3600 }, { name: "Zed", score: 3, duration: 59 }]);
  });

  it("answers the challenge round trip for INFO and PLAYER and subtracts bots", async () => {
    const challenge = Buffer.from("deadbeef", "hex");
    const seen: Buffer[] = [];
    const dial = fakeUdp((request) => {
      const kind = String.fromCharCode(request[4] as number);
      const withChallenge = request.subarray(-4).equals(challenge);
      if (kind === "T") return [withChallenge ? single(csInfo) : buildChallenge(challenge)];
      if (kind === "U") return [withChallenge ? single(playersPayload) : buildChallenge(challenge)];
      return [];
    }, seen);
    const status = await new SteamQueryClient(dial, 500, now).query("1.2.3.4:27015");
    expect(status).toMatchObject({ online: true, name: "Counter-Strike 2 Community", map: "de_dust2", playerCount: 10, maxPlayers: 24, version: "1.40.1.5" });
    expect(status.players.map((player) => player.name)).toEqual(["Amy", "Zed"]);
    expect(seen).toHaveLength(4);
    expect(seen[0]?.subarray(0, 5)).toEqual(Buffer.from("ffffffff54", "hex"));
    expect(seen[0]?.subarray(5).toString("latin1")).toBe("Source Engine Query\0");
    expect(seen[2]).toEqual(Buffer.from("ffffffff55ffffffff", "hex"));
    expect(seen[3]).toEqual(Buffer.from("ffffffff55deadbeef", "hex"));
  });

  it("reassembles split packets in any order", async () => {
    const packets = splitPackets(rustInfo, 40);
    expect(packets.length).toBeGreaterThan(2);
    const assembler = new PacketAssembler();
    for (const packet of [...packets].reverse().slice(0, -1)) expect(assembler.add(packet)).toBeUndefined();
    expect(assembler.add(packets[0] as Buffer)).toEqual(rustInfo);
    const dial = fakeUdp((request) => (String.fromCharCode(request[4] as number) === "T" ? [...packets].reverse() : []));
    const status = await new SteamQueryClient(dial, 500, now).query("1.2.3.4:28015");
    expect(status).toMatchObject({ online: true, playerCount: 301, maxPlayers: 300, players: [] });
  });

  it("reports offline on timeouts and needs a port", async () => {
    const status = await new SteamQueryClient(fakeUdp(() => []), 500, now).query("1.2.3.4:28015");
    expect(status).toMatchObject({ online: false, error: "The server did not answer in time." });
    expect(await new SteamQueryClient(fakeUdp(() => []), 500, now).query("1.2.3.4")).toMatchObject({ online: false, error: "The query port is missing." });
  });
});

describe("Minecraft Java server list ping", () => {
  const statusJson = {
    version: { name: "Paper 1.21.1", protocol: 767 },
    players: { max: 100, online: 2, sample: [{ name: "Steve", id: "1" }, { name: "Alex", id: "2" }] },
    description: { text: "§aWelcome to ", extra: [{ text: "Blockland", color: "gold" }, " §7(SMP)"] },
    favicon: "data:image/png;base64,AAAA",
  };

  it("encodes and decodes VarInts", () => {
    expect(encodeVarInt(-1)).toEqual(Buffer.from("ffffffff0f", "hex"));
    expect(encodeVarInt(300)).toEqual(Buffer.from([0xac, 0x02]));
    expect(decodeVarInt(Buffer.from([0xac, 0x02, 0x00]), 0)).toEqual({ value: 300, size: 2 });
    expect(decodeVarInt(Buffer.from([0xac]), 0)).toBeUndefined();
  });

  it("flattens chat components", () => {
    expect(chatToText(statusJson.description)).toBe("Welcome to Blockland (SMP)");
    expect(chatToText("§lPlain§r text")).toBe("Plain text");
  });

  it("sends the handshake and status request, then reads a response split across chunks", async () => {
    const seen: Buffer[] = [];
    const response = buildStatusResponse(statusJson);
    const dial = fakeTcp(() => [response.subarray(0, 7), response.subarray(7)], seen);
    const status = await new MinecraftJavaClient(dial, async () => undefined, 500, now).query("play.example.com:25566");
    expect(status).toMatchObject({ online: true, name: "Welcome to Blockland (SMP)", version: "Paper 1.21.1", playerCount: 2, maxPlayers: 100 });
    expect(status.players).toEqual([{ name: "Steve" }, { name: "Alex" }]);
    const request = seen[0] as Buffer;
    const handshakeLength = decodeVarInt(request, 0) as { value: number; size: number };
    const handshake = request.subarray(handshakeLength.size, handshakeLength.size + handshakeLength.value);
    expect(handshake.subarray(0, 6)).toEqual(Buffer.from("00ffffffff0f", "hex"));
    expect(handshake.subarray(6, 7)[0]).toBe("play.example.com".length);
    expect(handshake.subarray(7, 7 + 16).toString()).toBe("play.example.com");
    expect(handshake.readUInt16BE(23)).toBe(25566);
    expect(handshake[25]).toBe(1);
    expect(request.subarray(handshakeLength.size + handshakeLength.value)).toEqual(Buffer.from([0x01, 0x00]));
  });

  it("uses the SRV record when no port is given", async () => {
    const targets: string[] = [];
    const dial: TcpDialer = async (host, port) => {
      targets.push(`${host}:${port}`);
      return (await fakeTcp(() => [buildStatusResponse(statusJson)])(host, port, 0));
    };
    const client = new MinecraftJavaClient(dial, async (name) => (name === "example.com" ? { host: "mc.example.net", port: 25570 } : undefined), 500, now);
    expect((await client.query("example.com")).online).toBe(true);
    expect((await client.query("example.com:25565")).online).toBe(true);
    expect((await client.query("other.example")).online).toBe(true);
    expect(targets).toEqual(["mc.example.net:25570", "example.com:25565", "other.example:25565"]);
  });

  it("reports offline when the connection fails or closes early", async () => {
    const refused: TcpDialer = async () => { throw Object.assign(new Error("connect ECONNREFUSED"), { code: "ECONNREFUSED" }); };
    expect(await new MinecraftJavaClient(refused, async () => undefined, 500, now).query("1.2.3.4")).toMatchObject({ online: false, error: "The server refused the connection." });
    const closed = fakeTcp(() => [Buffer.from([0x05])]);
    expect(await new MinecraftJavaClient(closed, async () => undefined, 500, now).query("1.2.3.4")).toMatchObject({ online: false, error: "The server closed the connection." });
  });
});

describe("Minecraft Bedrock unconnected ping", () => {
  it("sends the RakNet ping and parses the MOTD fields", async () => {
    const seen: Buffer[] = [];
    const pong = buildUnconnectedPong(1n, "MCPE;§bBedrock Realm;686;1.21.30;7;40;123456789;Skyblock;Survival;1;19132;19133;");
    const status = await new MinecraftBedrockClient(fakeUdp(() => [pong], seen), 500, now).query("bedrock.example.com");
    expect(status).toMatchObject({ online: true, name: "Bedrock Realm", version: "1.21.30", map: "Skyblock", playerCount: 7, maxPlayers: 40, players: [] });
    const ping = seen[0] as Buffer;
    expect(ping[0]).toBe(0x01);
    expect(ping.subarray(9, 25)).toEqual(RAKNET_MAGIC);
    expect(ping).toHaveLength(33);
  });

  it("reports offline when nothing answers", async () => {
    expect(await new MinecraftBedrockClient(fakeUdp(() => []), 500, now).query("1.2.3.4:19132")).toMatchObject({ online: false, error: "The server did not answer in time." });
  });
});

describe("ProtocolQueryClient", () => {
  it("routes each kind to its protocol", async () => {
    const java = new MinecraftJavaClient(fakeTcp(() => [buildStatusResponse({ players: { online: 1, max: 5 } })]), async () => undefined, 500, now);
    const bedrock = new MinecraftBedrockClient(fakeUdp(() => [buildUnconnectedPong(1n, "MCPE;X;1;1;2;6")]), 500, now);
    const steam = new SteamQueryClient(fakeUdp((request) => (String.fromCharCode(request[4] as number) === "T" ? [single(csInfo)] : [])), 500, now);
    const client = new ProtocolQueryClient(java, bedrock, steam);
    expect((await client.query("minecraft-java", "a.example")).maxPlayers).toBe(5);
    expect((await client.query("minecraft-bedrock", "b.example")).maxPlayers).toBe(6);
    expect((await client.query("steam", "c.example:27015")).maxPlayers).toBe(24);
  });
});
