import { PrismaClientFactory } from "@qbox/prisma";
import { FivemService, defaultFivemSettings, type FivemGateway, type FivemQueryClient } from "@qbox/fivem";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaFivemRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for FiveM repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing FiveM cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaFivemRepository(client);
const guildId = "1257928923048837201";

let clock = new Date("2026-09-25T12:00:00.000Z");
let online = true;
const query: FivemQueryClient = {
  query: async () => (online
    ? { online: true, hostname: "Qbox", players: [{ id: 1, name: "Amy", ping: 20 }], playerCount: 1, maxPlayers: 32, checkedAt: clock }
    : { online: false, players: [], playerCount: 0, maxPlayers: 0, checkedAt: clock }),
};
const alerts: string[] = [];
const gateway: FivemGateway = {
  upsertStatusMessage: async (_channel, messageId) => messageId ?? "1432100000000000001",
  postAlert: async (_channel, content) => { alerts.push(content); },
};
const service = new FivemService(repository, query, gateway, () => clock);

beforeAll(async () => client.$connect());
beforeEach(async () => {
  clock = new Date("2026-09-25T12:00:00.000Z");
  online = true;
  alerts.length = 0;
  await client.$executeRawUnsafe('TRUNCATE TABLE "fivem_status_snapshots", "fivem_settings"');
});
afterAll(async () => client.$disconnect());

describe("PrismaFivemRepository", () => {
  it("round-trips settings and keeps state out of the revision", async () => {
    const { revision: _revision, ...defaults } = defaultFivemSettings(guildId);
    const saved = await service.saveSettings({ ...defaults, serverAddress: "127.0.0.1:30120", statusChannelId: "1262656532902842425", alertChannelId: "1262656532902842426", restartTimes: ["06:00"], expectedRevision: 0 });
    expect(saved).toMatchObject({ revision: 1, serverAddress: "127.0.0.1:30120", restartTimes: ["06:00"], restartWarningMinutes: [15, 5], showPlayerNames: false, downAfterMinutes: 3, debug: false });
    await service.tick();
    const config = await service.config(guildId);
    expect(config.settings.revision).toBe(1);
    expect(config.state).toMatchObject({ statusMessageId: "1432100000000000001", lastOnline: true, phase: "online", failureStreak: 0, downAlertSent: false });
    expect(config.state.onlineSince).toBeInstanceOf(Date);
    const toggled = await service.saveSettings({ ...config.settings, showPlayerNames: true, debug: true, downAfterMinutes: 5, expectedRevision: 1 });
    expect(toggled).toMatchObject({ revision: 2, showPlayerNames: true, debug: true, downAfterMinutes: 5 });
    await expect(service.saveSettings({ ...defaults, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("records snapshots, alerts on down, and prunes old snapshots", async () => {
    const { revision: _revision, ...defaults } = defaultFivemSettings(guildId);
    await service.saveSettings({ ...defaults, serverAddress: "127.0.0.1:30120", alertChannelId: "1262656532902842426" });
    await service.tick();
    online = false;
    // Not answering: "restarting" first, then a real outage after 3 minutes.
    for (let index = 0; index < 4; index += 1) {
      clock = new Date(clock.getTime() + 60_000);
      await service.tick();
    }
    expect(alerts).toEqual(["🔴 **Server is down**"]);
    expect((await service.config(guildId)).state).toMatchObject({ phase: "offline", downAlertSent: true });
    const history = await service.history(guildId, "24h");
    expect(history).toMatchObject({ peak: 1, uptimePercent: 20 });
    clock = new Date(clock.getTime() + 9 * 86_400_000);
    await service.tick();
    expect(await client.fivemStatusSnapshot.count({ where: { guildId } })).toBe(1);
  });
});
