import { PrismaClientFactory } from "@qbox/prisma";
import { ModerationService, defaultModerationSettings, type ModerationGateway } from "@qbox/moderation";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaModerationRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for moderation repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing moderation cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaModerationRepository(client);
const guildId = "1257928923048837201";
const member = { userId: "804859666655739996", displayName: "Member" };
const moderator = { userId: "804859666655739997", displayName: "Mod", source: "WEB" as const };

const gateway: ModerationGateway = {
  guildName: async () => "Qbox",
  checkHierarchy: async () => ({ allowed: true, targetRoleIds: [], targetIsMember: true }),
  timeout: async () => undefined,
  kick: async () => undefined,
  ban: async () => undefined,
  unban: async () => undefined,
  directMessage: async () => true,
  postEmbed: async () => ({ messageId: "1432100000000000001" }),
  postMessage: async () => ({ messageId: "1432100000000000001" }),
  purge: async () => 0,
  setLocked: async () => undefined,
  setSlowmode: async () => undefined,
  deleteMessage: async () => undefined,
};

let clock = new Date("2026-09-25T12:00:00.000Z");
const service = new ModerationService(repository, gateway, () => clock);

beforeAll(async () => client.$connect());
beforeEach(async () => {
  clock = new Date("2026-09-25T12:00:00.000Z");
  await client.$executeRawUnsafe('TRUNCATE TABLE "moderation_cases", "moderation_settings"');
});
afterAll(async () => client.$disconnect());

describe("PrismaModerationRepository", () => {
  it("round-trips settings including automod and escalation", async () => {
    const { revision: _revision, ...defaults } = defaultModerationSettings(guildId);
    const saved = await service.saveSettings({
      ...defaults,
      logChannelId: "1262656532902842425",
      escalation: [{ warnings: 3, action: "KICK", durationMinutes: 0 }],
      automod: { ...defaults.automod, enabled: true, words: { ...defaults.automod.words, enabled: true, words: ["Bad"] } },
      expectedRevision: 0,
    });
    expect(saved.revision).toBe(1);
    const loaded = await service.settings(guildId);
    expect(loaded.automod.words.words).toEqual(["bad"]);
    expect(loaded.escalation).toEqual([{ warnings: 3, action: "KICK", durationMinutes: 0 }]);
    await expect(service.saveSettings({ ...defaults, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("numbers cases without gaps under concurrency", async () => {
    const numbers = await Promise.all(Array.from({ length: 12 }, () => repository.allocateCaseNumber(guildId)));
    expect([...numbers].sort((a, b) => a - b)).toEqual(Array.from({ length: 12 }, (_, index) => index + 1));
  });

  it("stores cases, counts warnings, expires bans, and reports stats", async () => {
    await service.act({ guildId, type: "WARN", target: member, moderator, reason: "Spam" });
    await service.act({ guildId, type: "WARN", target: member, moderator, reason: "Spam again" });
    await service.act({ guildId, type: "BAN", target: member, moderator, reason: "Cool off", durationMinutes: 30 });
    expect((await service.history(guildId, member.userId)).activeWarnings).toBe(2);
    expect((await service.list({ guildId, search: "cool" }))[0]?.type).toBe("BAN");
    expect((await service.list({ guildId, search: "#1" }))[0]?.number).toBe(1);
    clock = new Date(clock.getTime() + 31 * 60_000);
    expect(await service.sweepExpired()).toEqual({ unbanned: 1, timeoutsEnded: 0 });
    const stats = await service.stats(guildId);
    expect(stats).toMatchObject({ total: 4, activeBans: 0, byType: { WARN: 2, BAN: 1, UNBAN: 1 }, automodActions: 1 });
    expect(stats.topModerators[0]).toMatchObject({ userId: moderator.userId, cases: 3 });
    const pardoned = await service.revoke(guildId, 1, moderator, "Mistake");
    expect(pardoned.revokedAt).toBeInstanceOf(Date);
    expect((await service.history(guildId, member.userId)).activeWarnings).toBe(1);
  });
});
