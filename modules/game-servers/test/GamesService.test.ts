import type { MessageTemplates, OutgoingMessage } from "@qbox/shared/messages";
import { describe, expect, it } from "vitest";

import {
  GamesService,
  InMemoryGamesRepository,
  MAX_SERVERS,
  formatDuration,
  gameLabel,
  playerLines,
  statusMessage,
  type GameServerQueryClient,
  type GameServerStatus,
  type GamesGateway,
  type GamesServerInput,
} from "../src/index.js";

const GUILD = "100000000000000001";
const STATUS_CHANNEL = "500000000000000001";
const ALERT_CHANNEL = "500000000000000002";
const COUNT_CHANNEL = "500000000000000003";
const ROLE = "400000000000000001";

class FakeGateway implements GamesGateway {
  public readonly upserts: { messageId: string | undefined; message: OutgoingMessage; connectUrl: string | undefined }[] = [];
  public readonly alerts: { message: OutgoingMessage; roleId: string | undefined }[] = [];
  public readonly renames: string[] = [];
  public async upsertStatusMessage(_channelId: string, messageId: string | undefined, message: OutgoingMessage, connectUrl: string | undefined) {
    this.upserts.push({ messageId, message, connectUrl });
    return messageId ?? "700000000000000001";
  }
  public async postAlert(_channelId: string, message: OutgoingMessage, roleId: string | undefined) { this.alerts.push({ message, roleId }); }
  public async renameChannel(_channelId: string, name: string) { this.renames.push(name); }
}

class FakeQuery implements GameServerQueryClient {
  public online = true;
  public players = 3;
  public readonly queried: string[] = [];
  public constructor(private readonly now: () => Date) {}
  public async query(kind: string, address: string): Promise<GameServerStatus> {
    this.queried.push(`${kind} ${address}`);
    return this.online
      ? { online: true, name: "Rusty Shores", map: "Procedural Map", version: "2511", players: Array.from({ length: this.players }, (_, index) => ({ name: `P${index + 1}`, score: index, duration: 60 })), playerCount: this.players, maxPlayers: 200, latencyMs: 42, checkedAt: this.now() }
      : { online: false, players: [], playerCount: 0, maxPlayers: 0, latencyMs: 5000, error: "The server did not answer in time.", checkedAt: this.now() };
  }
}

function input(overrides: Partial<GamesServerInput> = {}): GamesServerInput {
  return { name: "Rust Main", kind: "steam", address: "1.2.3.4:28015", game: "Rust", connectUrl: "steam://connect/1.2.3.4:28015", statusChannelId: STATUS_CHANNEL, updateIntervalSeconds: 60, alertChannelId: ALERT_CHANNEL, alertRoleId: ROLE, enabled: true, ...overrides };
}

async function setup(overrides: Partial<GamesServerInput> = {}, templates?: MessageTemplates) {
  let clock = new Date("2026-09-25T05:40:00.000Z");
  const now = () => clock;
  const repository = new InMemoryGamesRepository();
  const gateway = new FakeGateway();
  const query = new FakeQuery(now);
  const service = new GamesService(repository, query, gateway, templates, now);
  const { server } = await service.createServer(GUILD, input(overrides));
  return { service, repository, gateway, query, server, advance: (seconds: number) => { clock = new Date(clock.getTime() + seconds * 1000); } };
}

describe("GamesService servers", () => {
  it("validates, normalizes, and queries once on create", async () => {
    const { service, query, server } = await setup({ address: " 1.2.3.4:28015/ " });
    expect(server).toMatchObject({ name: "Rust Main", address: "1.2.3.4:28015", game: "Rust" });
    expect(query.queried).toEqual(["steam 1.2.3.4:28015"]);
    const java = await service.createServer(GUILD, input({ name: "SMP", kind: "minecraft-java", address: "Play.Example.com", game: "ignored" }));
    expect(java.server).toMatchObject({ address: "play.example.com", game: undefined });
    expect(java.status.online).toBe(true);
    await expect(service.createServer(GUILD, input({ name: "SMP" }))).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(service.createServer(GUILD, input({ name: "x", address: "1.2.3.4" }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.createServer(GUILD, input({ name: "x", address: "bad host!:1" }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.createServer(GUILD, input({ name: "x", updateIntervalSeconds: 30 }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.createServer(GUILD, input({ name: "x", connectUrl: "ftp://nope" }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.createServer(GUILD, input({ name: "x", kind: "quake" as "steam" }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.createServer(GUILD, input({ name: "" }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });

  it("caps servers per guild, updates, and deletes", async () => {
    const { service, repository, server } = await setup();
    for (let index = 1; index < MAX_SERVERS; index += 1) await service.createServer(GUILD, input({ name: `S${index}` }));
    await expect(service.createServer(GUILD, input({ name: "one too many" }))).rejects.toMatchObject({ code: "LIMIT_REACHED" });
    await service.tick();
    expect((await repository.getServer(GUILD, server.id))?.state.statusMessageId).toBe("700000000000000001");
    const updated = await service.updateServer(GUILD, server.id, input({ statusChannelId: "500000000000000009" }));
    expect(updated.statusChannelId).toBe("500000000000000009");
    expect((await repository.getServer(GUILD, server.id))?.state.statusMessageId).toBeUndefined();
    await expect(service.updateServer(GUILD, server.id, input({ name: "S1" }))).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(service.updateServer("100000000000000002", server.id, input())).rejects.toMatchObject({ code: "NOT_FOUND" });
    await service.deleteServer(GUILD, server.id);
    await expect(service.server(GUILD, server.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect((await service.servers(GUILD)).length).toBe(MAX_SERVERS - 1);
  });

  it("finds servers by name for the slash command", async () => {
    const { service } = await setup();
    await service.createServer(GUILD, input({ name: "Valheim Weekend", kind: "steam", address: "1.2.3.4:2457", enabled: false }));
    expect((await service.findServer(GUILD)).server.name).toBe("Rust Main");
    expect((await service.findServer(GUILD, "val")).server.name).toBe("Valheim Weekend");
    expect((await service.findServer(GUILD, "RUST MAIN")).server.name).toBe("Rust Main");
    await expect(service.findServer(GUILD, "ark")).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(service.findServer("100000000000000002")).rejects.toMatchObject({ code: "INVALID_STATE" });
  });

  it("keeps settings with a revision", async () => {
    const { service } = await setup();
    expect(await service.settings(GUILD)).toMatchObject({ playerCountTemplate: "🎮 {online}/{max} online", revision: 0 });
    const saved = await service.saveSettings({ guildId: GUILD, playerCountTemplate: "Players: {online}/{max}", playerCountOfflineTemplate: "Down", expectedRevision: 0 });
    expect(saved.revision).toBe(1);
    await expect(service.saveSettings({ guildId: GUILD, playerCountTemplate: "x", playerCountOfflineTemplate: "y", expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(service.saveSettings({ guildId: GUILD, playerCountTemplate: "", playerCountOfflineTemplate: "y" })).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });
});

describe("GamesService monitoring", () => {
  it("posts and then edits the status message, recording snapshots", async () => {
    const { service, gateway, repository, advance, server } = await setup();
    await service.tick();
    expect(gateway.upserts[0]?.messageId).toBeUndefined();
    expect(gateway.upserts[0]?.connectUrl).toBeUndefined();
    const embed = gateway.upserts[0]?.message.embeds?.[0];
    expect(embed?.title).toBe("Rusty Shores");
    expect(embed?.description).toContain("3/200 players");
    expect(embed?.description).toMatch(/Updated <t:\d+:R>/);
    expect(embed?.fields?.map((field) => field.name)).toEqual(["Players (3)", "Map", "Version", "Latency", "Connect"]);
    await service.tick();
    expect(gateway.upserts).toHaveLength(1);
    advance(60);
    await service.tick();
    expect(gateway.upserts[1]?.messageId).toBe("700000000000000001");
    expect(repository.snapshots.filter((item) => item.serverId === server.id)).toHaveLength(2);
    expect(gateway.alerts).toHaveLength(0);
  });

  it("uses a link button for https connect links", async () => {
    const { service, gateway } = await setup({ connectUrl: "https://example.com/join" });
    await service.tick();
    expect(gateway.upserts[0]?.connectUrl).toBe("https://example.com/join");
    expect(gateway.upserts[0]?.message.embeds?.[0]?.fields?.some((field) => field.name === "Connect")).toBe(false);
  });

  it("alerts after three failed polls and when the server returns", async () => {
    const { service, gateway, query, advance, repository, server } = await setup();
    await service.tick();
    query.online = false;
    for (let index = 0; index < 2; index += 1) {
      advance(60);
      await service.tick();
    }
    expect(gateway.alerts).toHaveLength(0);
    expect(gateway.upserts).toHaveLength(1);
    advance(60);
    await service.tick();
    expect(gateway.alerts).toHaveLength(1);
    expect(gateway.alerts[0]).toMatchObject({ roleId: ROLE });
    expect(gateway.alerts[0]?.message.content).toBe("🔴 **Rust Main** is down.");
    expect(gateway.upserts.at(-1)?.message.embeds?.[0]?.description).toContain("Offline");
    expect((await repository.getServer(GUILD, server.id))?.state).toMatchObject({ lastOnline: false, failureStreak: 3, lastError: "The server did not answer in time." });
    query.online = true;
    advance(30 * 60);
    await service.tick();
    expect(gateway.alerts[1]?.message.content).toBe("🟢 **Rust Main** is back online after 30m.");
    expect((await repository.getServer(GUILD, server.id))?.state).toMatchObject({ lastOnline: true, failureStreak: 0, lastPlayerCount: 3, lastMaxPlayers: 200 });
  });

  it("renames the player-count channel at most every five minutes", async () => {
    const { service, gateway, query, advance } = await setup({ playerCountChannelId: COUNT_CHANNEL });
    await service.tick();
    expect(gateway.renames).toEqual(["🎮 3/200 online"]);
    query.players = 4;
    advance(60);
    await service.tick();
    expect(gateway.renames).toHaveLength(1);
    advance(4 * 60);
    await service.tick();
    expect(gateway.renames).toEqual(["🎮 3/200 online", "🎮 4/200 online"]);
    advance(5 * 60);
    await service.tick();
    expect(gateway.renames).toHaveLength(2);
    query.online = false;
    for (let index = 0; index < 3; index += 1) {
      advance(5 * 60);
      await service.tick();
    }
    expect(gateway.renames.at(-1)).toBe("🔴 Offline");
  });

  it("passes every message through the templates port", async () => {
    const calls: { key: string; values: Record<string, unknown> }[] = [];
    const templates: MessageTemplates = {
      apply: async (_guildId, key, values, fallback) => {
        calls.push({ key, values: { ...values } });
        return { content: `custom ${key}`, embeds: fallback.embeds };
      },
    };
    const { service, gateway, query, advance } = await setup({}, templates);
    await service.tick();
    expect(gateway.upserts[0]?.message.content).toBe("custom games.status");
    expect(calls[0]).toMatchObject({ key: "games.status", values: { name: "Rusty Shores", server: "Rust Main", game: "Rust", address: "1.2.3.4:28015", players: 3, maxPlayers: 200, map: "Procedural Map", version: "2511", latency: 42, connectUrl: "steam://connect/1.2.3.4:28015", downFor: "" } });
    expect(String(calls[0]?.values.playerList)).toContain("P1");
    query.online = false;
    for (let index = 0; index < 3; index += 1) {
      advance(60);
      await service.tick();
    }
    expect(gateway.alerts[0]?.message.content).toBe("custom games.down");
    query.online = true;
    advance(60);
    await service.tick();
    expect(gateway.alerts[1]?.message.content).toBe("custom games.up");
    expect(calls.at(-1)).toMatchObject({ key: "games.status" });
    expect(calls.filter((call) => call.key === "games.up")[0]?.values.downFor).toBe("1m");
  });

  it("skips disabled servers", async () => {
    const { service, gateway, query } = await setup({ enabled: false });
    await service.tick();
    expect(gateway.upserts).toHaveLength(0);
    expect(query.queried).toHaveLength(1);
  });

  it("buckets player history and uptime, and prunes old snapshots", async () => {
    const { service, query, advance, repository, server } = await setup();
    for (let index = 0; index < 4; index += 1) {
      query.players = index * 2;
      query.online = index !== 2;
      await service.tick();
      advance(60);
    }
    const history = await service.history(GUILD, server.id, "24h");
    expect(history.points).toHaveLength(96);
    expect(history.peak).toBe(6);
    expect(history.uptimePercent).toBe(75);
    expect(history.points.at(-1)).toMatchObject({ players: 6, online: false });
    expect((await service.history(GUILD, server.id, "7d")).points).toHaveLength(84);
    advance(8 * 86_400);
    await service.tick();
    expect(repository.snapshots).toHaveLength(1);
  });
});

describe("helpers", () => {
  it("formats durations, labels, and player lists", () => {
    expect(formatDuration(125 * 60_000)).toBe("2h 5m");
    expect(formatDuration(3 * 86_400_000 + 4 * 3_600_000)).toBe("3d 4h");
    expect(gameLabel({ kind: "minecraft-java" })).toBe("Minecraft");
    expect(gameLabel({ kind: "minecraft-bedrock" })).toBe("Minecraft Bedrock");
    expect(gameLabel({ kind: "steam", game: " Rust " })).toBe("Rust");
    expect(gameLabel({ kind: "steam" })).toBe("Steam game");
    const status: GameServerStatus = { online: true, players: Array.from({ length: 25 }, (_, index) => ({ name: index === 0 ? "*bold*" : "x" })), playerCount: 25, maxPlayers: 64, latencyMs: 1, checkedAt: new Date() };
    expect(playerLines(status)).toContain("\\*bold\\*");
    expect(playerLines(status)).toContain("and 5 more");
    expect(playerLines({ ...status, players: [] })).toBe("The player list is hidden on this server.");
    expect(playerLines({ ...status, players: [], playerCount: 0 })).toBe("Nobody is online.");
    const server = { id: "s", guildId: GUILD, createdAt: new Date(), ...input({ connectUrl: undefined }) };
    expect(statusMessage(server, { ...status, online: false, error: "Nope" }).embeds?.[0]?.description).toContain("Nope");
  });
});
