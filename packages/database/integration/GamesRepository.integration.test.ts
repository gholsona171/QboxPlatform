import { PrismaClientFactory } from "@qbox/prisma";
import { GamesService, type GameServerQueryClient, type GamesGateway } from "@qbox/game-servers";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaGamesRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for game server repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing game server cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaGamesRepository(client);
const guildId = "1257928923048837201";

let clock = new Date("2026-09-25T12:00:00.000Z");
let online = true;
const query: GameServerQueryClient = {
  query: async () => (online
    ? { online: true, name: "Rusty Shores", map: "Procedural Map", players: [{ name: "Amy", score: 1, duration: 30 }], playerCount: 1, maxPlayers: 200, latencyMs: 40, checkedAt: clock }
    : { online: false, players: [], playerCount: 0, maxPlayers: 0, latencyMs: 5000, error: "The server did not answer in time.", checkedAt: clock }),
};
const alerts: string[] = [];
const renames: string[] = [];
const gateway: GamesGateway = {
  upsertStatusMessage: async (_channel, messageId) => messageId ?? "1432100000000000001",
  postAlert: async (_channel, message) => { alerts.push(message.content ?? ""); },
  renameChannel: async (_channel, name) => { renames.push(name); },
};
const service = new GamesService(repository, query, gateway, undefined, () => clock);
const input = { name: "Rust Main", kind: "steam" as const, address: "1.2.3.4:28015", game: "Rust", statusChannelId: "1262656532902842425", playerCountChannelId: "1262656532902842427", alertChannelId: "1262656532902842426", updateIntervalSeconds: 60, enabled: true };

beforeAll(async () => client.$connect());
beforeEach(async () => {
  clock = new Date("2026-09-25T12:00:00.000Z");
  online = true;
  alerts.length = 0;
  renames.length = 0;
  await client.$executeRawUnsafe('TRUNCATE TABLE "games_status_snapshots", "games_servers", "games_settings"');
});
afterAll(async () => client.$disconnect());

describe("PrismaGamesRepository", () => {
  it("round-trips settings with a revision", async () => {
    const saved = await service.saveSettings({ guildId, playerCountTemplate: "Players: {online}/{max}", playerCountOfflineTemplate: "Down", expectedRevision: 0 });
    expect(saved).toMatchObject({ revision: 1, playerCountTemplate: "Players: {online}/{max}" });
    await expect(service.saveSettings({ guildId, playerCountTemplate: "x", playerCountOfflineTemplate: "y", expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
    expect((await service.saveSettings({ guildId, playerCountTemplate: "x", playerCountOfflineTemplate: "y", expectedRevision: 1 })).revision).toBe(2);
  });

  it("creates, updates, monitors, and deletes servers with their state and snapshots", async () => {
    const { server, status } = await service.createServer(guildId, input);
    expect(status.online).toBe(true);
    expect(server).toMatchObject({ kind: "steam", game: "Rust", enabled: true });
    await service.tick();
    let record = await service.server(guildId, server.id);
    expect(record.state).toMatchObject({ statusMessageId: "1432100000000000001", lastOnline: true, failureStreak: 0, lastPlayerCount: 1, lastMaxPlayers: 200, lastChannelName: "🎮 1/200 online" });
    expect(renames).toEqual(["🎮 1/200 online"]);

    const updated = await service.updateServer(guildId, server.id, { ...input, kind: "minecraft-java", address: "play.example.com", statusChannelId: "1262656532902842428" });
    expect(updated).toMatchObject({ kind: "minecraft-java", address: "play.example.com" });
    expect(updated.game).toBeUndefined();
    record = await service.server(guildId, server.id);
    expect(record.state.statusMessageId).toBeUndefined();
    expect(record.state.lastOnline).toBeUndefined();
    expect(record.state.failureStreak).toBe(0);
    clock = new Date(clock.getTime() + 60_000);
    await service.tick();
    expect((await service.server(guildId, server.id)).state.lastOnline).toBe(true);

    online = false;
    for (let index = 0; index < 3; index += 1) {
      clock = new Date(clock.getTime() + 60_000);
      await service.tick();
    }
    expect(alerts).toEqual(["🔴 **Rust Main** is down."]);
    const history = await service.history(guildId, server.id, "24h");
    expect(history).toMatchObject({ peak: 1, uptimePercent: 40 });

    clock = new Date(clock.getTime() + 8 * 86_400_000);
    await service.tick();
    expect(await client.gamesStatusSnapshot.count({ where: { serverId: server.id } })).toBe(1);

    await service.deleteServer(guildId, server.id);
    expect(await repository.getServer(guildId, server.id)).toBeUndefined();
    expect(await client.gamesStatusSnapshot.count({ where: { serverId: server.id } })).toBe(0);
    expect(await repository.getServer(guildId, "not-a-uuid")).toBeUndefined();
  });
});
