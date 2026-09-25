import { PrismaClientFactory } from "@qbox/prisma";
import { LevelService, defaultLevelSettings, type LevelGateway } from "@qbox/levels";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaLevelRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for level repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing level cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaLevelRepository(client);
const guildId = "1257928923048837201";
const alex = "804859666655739996";
const sam = "804859666655739997";
const reward = "1262656532902842425";
const roles = new Map<string, Set<string>>();

const gateway: LevelGateway = {
  guildName: async () => "Qbox",
  memberRoleIds: async (_guild, userId) => [...(roles.get(userId) ?? [])],
  addRole: async (_guild, userId, roleId) => void roles.set(userId, new Set([...(roles.get(userId) ?? []), roleId])),
  removeRole: async (_guild, userId, roleId) => void roles.get(userId)?.delete(roleId),
  sendMessage: async () => undefined,
  directMessage: async () => true,
};

const service = new LevelService(repository, gateway, () => new Date("2026-09-25T12:00:00.000Z"), () => 0);

beforeAll(async () => client.$connect());
beforeEach(async () => {
  roles.clear();
  await client.$executeRawUnsafe('TRUNCATE TABLE "level_members", "level_settings"');
});
afterAll(async () => client.$disconnect());

describe("PrismaLevelRepository", () => {
  it("round-trips settings with multipliers and rewards", async () => {
    const { revision: _revision, ...defaults } = defaultLevelSettings(guildId);
    const saved = await service.saveSettings({
      ...defaults,
      enabled: true,
      curve: { base: 40, exponent: 1.5, linear: 10 },
      roleMultipliers: [{ id: reward, multiplier: 1.5 }],
      levelUpMode: "CHANNEL",
      levelUpChannelId: "1262656532902842426",
      rewards: [{ level: 2, roleId: reward }],
      rewardMode: "HIGHEST",
      expectedRevision: 0,
    });
    expect(saved.revision).toBe(1);
    const loaded = await service.settings(guildId);
    expect(loaded).toMatchObject({ curve: { base: 40, exponent: 1.5, linear: 10 }, roleMultipliers: [{ id: reward, multiplier: 1.5 }], levelUpChannelId: "1262656532902842426", rewards: [{ level: 2, roleId: reward }], rewardMode: "HIGHEST" });
    await expect(service.saveSettings({ ...defaults, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("adds XP atomically, ranks members, and never goes below zero", async () => {
    await Promise.all(Array.from({ length: 10 }, () => repository.addActivity(guildId, alex, { xp: 10, messages: 1, displayName: "Alex" })));
    await repository.addActivity(guildId, sam, { xp: 50, voiceMinutes: 5, displayName: "Sam" });
    expect(await repository.getMember(guildId, alex)).toMatchObject({ xp: 100, messages: 10, displayName: "Alex" });
    expect(await repository.rank(guildId, alex)).toBe(1);
    expect(await repository.rank(guildId, sam)).toBe(2);
    expect((await repository.leaderboard(guildId, 1, 10)).members.map((member) => member.userId)).toEqual([sam]);
    expect((await repository.search(guildId, "sa", 10))[0]?.userId).toBe(sam);
    expect((await repository.addActivity(guildId, sam, { xp: -500 })).xp).toBe(0);
  });

  it("levels up with rewards and resets everyone", async () => {
    await service.setLevel(guildId, alex, 3);
    await service.give(guildId, sam, 10);
    const { revision: _revision, ...defaults } = defaultLevelSettings(guildId);
    await service.saveSettings({ ...defaults, rewards: [{ level: 2, roleId: reward }] });
    await service.give(guildId, alex, 1);
    expect([...(roles.get(alex) ?? [])]).toEqual([reward]);
    expect(await service.resetAll(guildId)).toEqual({ members: 1, rewardsRemoved: true });
    expect(roles.get(alex)?.size).toBe(0);
    expect((await service.leaderboard(guildId)).total).toBe(0);
  });
});
