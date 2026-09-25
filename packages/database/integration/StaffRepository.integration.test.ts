import { PrismaClientFactory } from "@qbox/prisma";
import { StaffService, defaultStaffSettings, type StaffGateway } from "@qbox/staff";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaStaffRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for staff repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing staff cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaStaffRepository(client);
const guildId = "1257928923048837201";
const alex = { userId: "804859666655739996", displayName: "Alex" };
const boss = { userId: "804859666655739997", displayName: "Boss", source: "WEB" as const };

const gateway: StaffGateway = {
  addRole: async () => undefined,
  removeRole: async () => undefined,
  postEmbed: async () => ({ messageId: "1432100000000000001" }),
  editEmbed: async () => undefined,
};

let clock = new Date("2026-09-23T12:00:00.000Z");
const service = new StaffService(repository, gateway, () => clock);

beforeAll(async () => client.$connect());
beforeEach(async () => {
  clock = new Date("2026-09-23T12:00:00.000Z");
  await client.$executeRawUnsafe('TRUNCATE TABLE "staff_members", "staff_ranks", "staff_records", "staff_strikes", "staff_leaves", "staff_shifts", "staff_settings"');
});
afterAll(async () => client.$disconnect());

describe("PrismaStaffRepository", () => {
  it("round-trips settings with revisions and the roster message", async () => {
    const { revision: _revision, rosterMessageId: _message, ...defaults } = defaultStaffSettings(guildId);
    const saved = await service.saveSettings({ ...defaults, logChannelId: "1262656532902842425", rosterChannelId: "1262656532902842426", autoClockOutHours: 8, expectedRevision: 0 });
    expect(saved).toMatchObject({ revision: 1, autoClockOutHours: 8, rosterMessageId: "1432100000000000001" });
    await expect(service.saveSettings({ ...defaults, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("keeps ranks ordered and runs the roster lifecycle", async () => {
    const chief = await service.createRank(guildId, { name: "Chief", color: "#FF0000", roleId: "1262656532902842430", description: "Top" });
    const officer = await service.createRank(guildId, { name: "Officer", color: "#0000FF" });
    await service.reorderRanks(guildId, [officer.id, chief.id]);
    expect((await service.ranks(guildId)).map((rank) => rank.name)).toEqual(["Officer", "Chief"]);
    await service.reorderRanks(guildId, [chief.id, officer.id]);

    await service.hire(guildId, alex, boss, { callsign: "1A" });
    await service.promote(guildId, alex.userId, boss, undefined, "Good work");
    await service.updateMember(guildId, alex.userId, boss, { notes: "Reliable", callsign: null });
    const strike = await service.strike(guildId, alex.userId, boss, "Late", 7);
    await service.note(guildId, alex.userId, boss, "Talked it through");
    const profile = await service.profile(guildId, alex.userId);
    expect(profile.member).toMatchObject({ rankId: chief.id, notes: "Reliable" });
    expect(profile.member.callsign).toBeUndefined();
    expect(profile.records.map((record) => record.type)).toEqual(expect.arrayContaining(["HIRE", "PROMOTE", "STRIKE", "NOTE"]));
    expect(profile.activeStrikes).toBe(1);
    expect((await service.revokeStrike(guildId, strike.id, boss)).active).toBe(false);
    await expect(service.revokeStrike(guildId, "not-a-uuid", boss)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(service.deleteRank(guildId, chief.id)).rejects.toMatchObject({ code: "INVALID_STATE" });
    await service.fire(guildId, alex.userId, boss, "Moved on");
    expect(await service.member(guildId, alex.userId)).toBeUndefined();
    expect((await service.records(guildId, alex.userId))[0]?.type).toBe("FIRE");
  });

  it("runs leave and shifts through the sweep", async () => {
    await service.createRank(guildId, { name: "Officer", color: "#0000FF" });
    await service.hire(guildId, alex, boss);
    await service.clockIn(guildId, alex);
    clock = new Date(clock.getTime() + 90 * 60_000);
    expect((await service.clockOut(guildId, alex.userId)).durationSeconds).toBe(5400);
    await service.clockIn(guildId, alex);

    const leave = await service.requestLeave(guildId, alex, { startsAt: new Date(clock.getTime() + 3_600_000), endsAt: new Date(clock.getTime() + 2 * 86_400_000), reason: "Trip" });
    await service.reviewLeave(guildId, leave.id, boss, true);
    clock = new Date(clock.getTime() + 2 * 3_600_000);
    expect(await service.sweep()).toMatchObject({ leavesStarted: 1 });
    expect((await service.member(guildId, alex.userId))?.status).toBe("LOA");
    clock = new Date(clock.getTime() + 2 * 86_400_000);
    expect(await service.sweep()).toMatchObject({ leavesEnded: 1 });
    expect((await service.member(guildId, alex.userId))?.status).toBe("ACTIVE");

    const board = await service.leaderboard(guildId);
    expect(board.entries[0]).toMatchObject({ userId: alex.userId, shifts: 2 });
    expect(board.entries[0]?.seconds).toBe(5400 + 7200);
    expect((await service.leaves({ guildId, statuses: ["ENDED"] }))).toHaveLength(1);
  });
});
