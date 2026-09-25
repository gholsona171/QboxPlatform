import { PrismaClientFactory } from "@qbox/prisma";
import { VerificationService, defaultVerificationSettings, type GuildMemberInfo, type VerificationGateway } from "@qbox/verification";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaVerificationRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for verification repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing verification cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaVerificationRepository(client);
const guildId = "1257928923048837201";
const verifiedRole = "1262656532902842401";
const unverifiedRole = "1262656532902842402";
const staff = { userId: "804859666655739997", displayName: "Mod", source: "WEB" as const };
const members = new Map<string, GuildMemberInfo>();

const gateway: VerificationGateway = {
  member: async (_guild, userId) => members.get(userId),
  guildName: async () => "Qbox",
  addRole: async (_guild, userId, roleId) => {
    const member = members.get(userId);
    if (member) members.set(userId, { ...member, roleIds: [...member.roleIds, roleId] });
  },
  removeRole: async (_guild, userId, roleId) => {
    const member = members.get(userId);
    if (member) members.set(userId, { ...member, roleIds: member.roleIds.filter((id) => id !== roleId) });
  },
  kick: async (_guild, userId) => {
    members.delete(userId);
  },
  directMessage: async () => true,
  sendMessage: async () => undefined,
  postEmbed: async () => undefined,
  publishPanel: async () => ({ messageId: "1432100000000000001" }),
};

let clock = new Date("2026-09-25T12:00:00.000Z");
const service = new VerificationService(repository, gateway, () => clock);
const { revision: _revision, ...defaults } = defaultVerificationSettings(guildId);
const input = { ...defaults, enabled: true, verifiedRoleIds: [verifiedRole], unverifiedRoleId: unverifiedRole, channelId: "1262656532902842425" };

function member(userId: string, roleIds: string[] = []) {
  members.set(userId, { userId, displayName: `User ${userId.slice(-2)}`, roleIds });
  return { userId, displayName: `User ${userId.slice(-2)}`, roleIds };
}

beforeAll(async () => client.$connect());
beforeEach(async () => {
  clock = new Date("2026-09-25T12:00:00.000Z");
  members.clear();
  await client.$executeRawUnsafe('TRUNCATE TABLE "verification_attempts", "verification_pending_members", "verification_settings"');
});
afterAll(async () => client.$disconnect());

describe("PrismaVerificationRepository", () => {
  it("round-trips settings with questions, panel, and revisions", async () => {
    const saved = await service.saveSettings({
      ...input,
      mode: "QUESTION",
      questions: [{ id: "word", prompt: "Secret word?", answers: ["Pineapple"] }],
      welcomeChannelId: "1262656532902842426",
      welcomeMessage: "Welcome {user}!",
      expectedRevision: 0,
    });
    expect(saved.revision).toBe(1);
    await service.publishPanel(guildId);
    const loaded = await service.settings(guildId);
    expect(loaded).toMatchObject({ mode: "QUESTION", questions: [{ id: "word", answers: ["pineapple"] }], panelMessageId: "1432100000000000001", welcomeMessage: "Welcome {user}!", revision: 1 });
    await expect(service.saveSettings({ ...input, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
    const cleared = await service.saveSettings({ ...input, expectedRevision: 1 });
    expect(cleared.welcomeMessage).toBeUndefined();
    expect(cleared.panelMessageId).toBe("1432100000000000001");
  });

  it("records attempts, cools down, filters, kicks unverified members, and reports stats", async () => {
    await service.saveSettings({ ...input, mode: "CAPTCHA", maxAttempts: 2, kickUnverifiedMinutes: 30 });
    const alex = member("804859666655739901");
    const sam = member("804859666655739902");
    await service.memberJoined(guildId, alex);
    await service.memberJoined(guildId, sam);
    for (let index = 0; index < 2; index += 1) {
      await service.startCaptcha(guildId, member(alex.userId, [unverifiedRole]));
      await service.submitCaptcha(guildId, member(alex.userId, [unverifiedRole]), "wrong");
    }
    await expect(service.startCaptcha(guildId, member(alex.userId, [unverifiedRole]))).rejects.toMatchObject({ code: "LIMIT_REACHED" });
    const challenge = await service.startCaptcha(guildId, member(sam.userId, [unverifiedRole]));
    expect(await service.submitCaptcha(guildId, member(sam.userId, [unverifiedRole]), challenge.code)).toMatchObject({ passed: true });

    expect(await service.attempts({ guildId, results: ["FAILED"] })).toHaveLength(2);
    expect((await service.attempts({ guildId, search: "39902" }))[0]?.result).toBe("PASSED");
    expect((await service.status(guildId, alex.userId)).pending).toMatchObject({ flagged: false });

    clock = new Date(clock.getTime() + 31 * 60_000);
    expect(await service.sweepUnverified()).toEqual({ kicked: 1 });
    clock = new Date(clock.getTime() + 1_000);
    await service.manualVerify(guildId, member("804859666655739903").userId, staff);
    expect(await service.stats(guildId)).toEqual({ verified24h: 2, failed24h: 2, deniedAge24h: 0, kicked24h: 1, verifiedTotal: 2, pending: 0 });
    const latest = await service.attempts({ guildId, limit: 1 });
    expect(latest[0]).toMatchObject({ result: "MANUAL", staffId: staff.userId, source: "WEB" });
  });
});
