import { describe, expect, it } from "vitest";

import {
  DiscordRestStaffGateway,
  InMemoryStaffRepository,
  StaffService,
  defaultStaffSettings,
  rosterEmbed,
  weekStart,
  type StaffActor,
  type StaffButton,
  type StaffEmbed,
  type StaffGateway,
  type StaffSettingsInput,
} from "../src/index.js";

const GUILD = "100000000000000001";
const ALEX = { userId: "200000000000000001", displayName: "Alex" };
const SAM = { userId: "200000000000000002", displayName: "Sam" };
const BOSS: StaffActor = { userId: "300000000000000001", displayName: "Jay", source: "DISCORD" };
const LOGS = "500000000000000001";
const ROSTER = "500000000000000002";
const LOA_ROLE = "400000000000000009";
const ROLE = { chief: "400000000000000001", sergeant: "400000000000000002", officer: "400000000000000003" };

class FakeGateway implements StaffGateway {
  public readonly calls: string[] = [];
  public readonly posts: { channelId: string; embed: StaffEmbed; buttons: readonly StaffButton[] }[] = [];
  public readonly edits: { messageId: string; embed: StaffEmbed; buttons: readonly StaffButton[] }[] = [];
  public failRoles = false;
  public missingMessages = new Set<string>();
  private next = 1;

  public async addRole(_g: string, userId: string, roleId: string) {
    if (this.failRoles) throw new Error("Missing Permissions");
    this.calls.push(`add ${userId} ${roleId}`);
  }
  public async removeRole(_g: string, userId: string, roleId: string) { this.calls.push(`remove ${userId} ${roleId}`); }
  public async postEmbed(channelId: string, embed: StaffEmbed, buttons: readonly StaffButton[] = []) {
    this.posts.push({ channelId, embed, buttons });
    return { messageId: `70000000000000000${this.next++}` };
  }
  public async editEmbed(_c: string, messageId: string, embed: StaffEmbed, buttons: readonly StaffButton[] = []) {
    if (this.missingMessages.has(messageId)) throw new Error("Unknown Message");
    this.edits.push({ messageId, embed, buttons });
  }
}

async function setup(overrides: Partial<StaffSettingsInput> = {}) {
  let clock = new Date("2026-09-23T12:00:00.000Z");
  const now = () => clock;
  const gateway = new FakeGateway();
  const repository = new InMemoryStaffRepository(now);
  const service = new StaffService(repository, gateway, now);
  const { revision: _revision, rosterMessageId: _message, ...defaults } = defaultStaffSettings(GUILD);
  await service.saveSettings({ ...defaults, logChannelId: LOGS, loaRoleId: LOA_ROLE, ...overrides });
  const chief = await service.createRank(GUILD, { name: "Chief", roleId: ROLE.chief, color: "#ff0000" });
  const sergeant = await service.createRank(GUILD, { name: "Sergeant", roleId: ROLE.sergeant, color: "#00ff00" });
  const officer = await service.createRank(GUILD, { name: "Officer", roleId: ROLE.officer, color: "#0000ff" });
  return {
    service,
    gateway,
    repository,
    ranks: { chief, sergeant, officer },
    advance: (minutes: number) => { clock = new Date(clock.getTime() + minutes * 60_000); },
    now,
  };
}

describe("StaffService ranks", () => {
  it("orders ranks, rejects duplicates, and reorders", async () => {
    const { service, ranks } = await setup();
    expect((await service.ranks(GUILD)).map((rank) => rank.name)).toEqual(["Chief", "Sergeant", "Officer"]);
    expect(ranks.chief.color).toBe("#FF0000");
    await expect(service.createRank(GUILD, { name: "chief", color: "#000000" })).rejects.toThrow(/already exists/);
    await expect(service.createRank(GUILD, { name: "Cadet", color: "red" })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    const reordered = await service.reorderRanks(GUILD, [ranks.officer.id, ranks.chief.id, ranks.sergeant.id]);
    expect(reordered.map((rank) => rank.name)).toEqual(["Officer", "Chief", "Sergeant"]);
    await expect(service.reorderRanks(GUILD, [ranks.chief.id])).rejects.toThrow(/every rank/);
  });

  it("won't delete a rank with members and swaps roles when a rank's role changes", async () => {
    const { service, gateway, ranks } = await setup();
    await service.hire(GUILD, ALEX, BOSS);
    await expect(service.deleteRank(GUILD, ranks.officer.id)).rejects.toThrow(/Move or remove the 1 member/);
    await service.updateRank(GUILD, ranks.officer.id, { name: "Officer", roleId: "400000000000000004", color: "#0000FF" });
    expect(gateway.calls).toContain(`add ${ALEX.userId} 400000000000000004`);
    expect(gateway.calls).toContain(`remove ${ALEX.userId} ${ROLE.officer}`);
    await service.deleteRank(GUILD, ranks.chief.id);
    expect((await service.ranks(GUILD)).map((rank) => [rank.name, rank.position])).toEqual([["Sergeant", 0], ["Officer", 1]]);
  });
});

describe("StaffService roster changes", () => {
  it("hires at the lowest rank, promotes and demotes with role swaps and history", async () => {
    const { service, gateway, repository, ranks } = await setup();
    const hired = await service.hire(GUILD, ALEX, BOSS, { callsign: "1A-12", reason: "Passed training" });
    expect(hired).toMatchObject({ rankId: ranks.officer.id, callsign: "1A-12", status: "ACTIVE" });
    expect(gateway.calls).toEqual([`add ${ALEX.userId} ${ROLE.officer}`]);
    await expect(service.hire(GUILD, ALEX, BOSS)).rejects.toThrow(/already on the staff roster/);

    await service.promote(GUILD, ALEX.userId, BOSS, undefined, "Great work");
    expect(gateway.calls.slice(1)).toEqual([`add ${ALEX.userId} ${ROLE.sergeant}`, `remove ${ALEX.userId} ${ROLE.officer}`]);
    await service.promote(GUILD, ALEX.userId, BOSS);
    await expect(service.promote(GUILD, ALEX.userId, BOSS)).rejects.toThrow(/highest rank/);
    await expect(service.demote(GUILD, ALEX.userId, BOSS, ranks.chief.id)).rejects.toThrow(/lower rank/);
    const demoted = await service.demote(GUILD, ALEX.userId, BOSS, ranks.officer.id, "Inactive");
    expect(demoted.rankId).toBe(ranks.officer.id);
    await expect(service.promote(GUILD, BOSS.userId, BOSS)).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(repository.records.map((record) => [record.type, record.fromRank, record.toRank])).toEqual([
      ["HIRE", undefined, "Officer"],
      ["PROMOTE", "Officer", "Sergeant"],
      ["PROMOTE", "Sergeant", "Chief"],
      ["DEMOTE", "Chief", "Officer"],
    ]);
    expect(gateway.posts.map((post) => post.embed.title)).toEqual(["Hired", "Promoted", "Promoted", "Demoted"]);
  });

  it("refuses to hire when Discord rejects the role change", async () => {
    const { service, gateway, repository } = await setup();
    gateway.failRoles = true;
    await expect(service.hire(GUILD, ALEX, BOSS)).rejects.toThrow(/Qbox role is above/);
    expect(repository.members).toHaveLength(0);
  });

  it("fires, removing roles, closing shifts and leave, and keeping history", async () => {
    const { service, gateway, repository } = await setup();
    await service.hire(GUILD, ALEX, BOSS);
    await service.clockIn(GUILD, ALEX);
    await expect(service.fire(GUILD, ALEX.userId, { ...BOSS, userId: ALEX.userId })).rejects.toThrow(/yourself/);
    await service.fire(GUILD, ALEX.userId, BOSS, "Left the community");
    expect(gateway.calls).toContain(`remove ${ALEX.userId} ${ROLE.officer}`);
    expect(repository.members).toHaveLength(0);
    expect(repository.shifts[0]?.endedAt).toBeInstanceOf(Date);
    expect((await service.records(GUILD, ALEX.userId)).map((record) => record.type)).toEqual(["FIRE", "HIRE"]);
  });

  it("changes status with a note and blocks manual leave", async () => {
    const { service, repository } = await setup();
    await service.hire(GUILD, ALEX, BOSS);
    const updated = await service.updateMember(GUILD, ALEX.userId, BOSS, { status: "SUSPENDED", callsign: "2B", notes: "Watch" });
    expect(updated).toMatchObject({ status: "SUSPENDED", callsign: "2B", notes: "Watch" });
    expect(repository.records.at(-1)?.reason).toBe("Status changed from Active to Suspended.");
    await expect(service.updateMember(GUILD, ALEX.userId, BOSS, { status: "LOA" })).rejects.toThrow(/leave request/);
    expect((await service.updateMember(GUILD, ALEX.userId, BOSS, { callsign: null })).callsign).toBeUndefined();
    await expect(service.clockIn(GUILD, ALEX)).rejects.toThrow(/suspended/);
  });

  it("gives strikes that expire and can be removed", async () => {
    const { service, advance } = await setup();
    await service.hire(GUILD, ALEX, BOSS);
    const first = await service.strike(GUILD, ALEX.userId, BOSS, "Late to meeting", 7);
    await service.strike(GUILD, ALEX.userId, BOSS, "Rude to member");
    expect((await service.profile(GUILD, ALEX.userId)).activeStrikes).toBe(2);
    advance(8 * 1440);
    expect((await service.profile(GUILD, ALEX.userId)).activeStrikes).toBe(1);
    const strikes = await service.strikes(GUILD, ALEX.userId);
    const permanent = strikes.find((strike) => strike.id !== first.id);
    expect((await service.revokeStrike(GUILD, permanent?.id ?? "", BOSS)).active).toBe(false);
    await expect(service.revokeStrike(GUILD, permanent?.id ?? "", BOSS)).rejects.toThrow(/already removed/);
    await expect(service.strike(GUILD, ALEX.userId, BOSS, "x", 0)).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });
});

describe("StaffService leave", () => {
  it("requests, approves, starts, and ends leave with the LOA role", async () => {
    const { service, gateway, repository, advance, now } = await setup();
    await service.hire(GUILD, ALEX, BOSS);
    await service.hire(GUILD, SAM, BOSS);
    await service.clockIn(GUILD, ALEX);
    const start = new Date(now().getTime() + 60 * 60_000);
    const leave = await service.requestLeave(GUILD, ALEX, { startsAt: start, endsAt: new Date(start.getTime() + 3 * 86_400_000), reason: "Vacation" });
    expect(leave.messageId).toBeDefined();
    const request = gateway.posts.at(-1);
    expect(request?.buttons.map((button) => button.customId)).toEqual([`qbox:staff:loa-approve:${leave.id}`, `qbox:staff:loa-deny:${leave.id}`]);
    await expect(service.requestLeave(GUILD, ALEX, { startsAt: start, endsAt: new Date(start.getTime() + 86_400_000), reason: "Again" })).rejects.toThrow(/already have/);
    await expect(service.reviewLeave(GUILD, leave.id, { ...BOSS, userId: ALEX.userId }, true)).rejects.toThrow(/your own/);

    const approved = await service.reviewLeave(GUILD, leave.id, BOSS, true, "Enjoy");
    expect(approved.status).toBe("APPROVED");
    expect(gateway.edits.at(-1)?.buttons).toEqual([]);

    advance(61);
    expect(await service.sweep()).toMatchObject({ leavesStarted: 1, leavesEnded: 0 });
    expect((await service.member(GUILD, ALEX.userId))?.status).toBe("LOA");
    expect(gateway.calls).toContain(`add ${ALEX.userId} ${LOA_ROLE}`);
    expect(repository.shifts[0]?.autoEnded).toBe(true);
    await expect(service.clockIn(GUILD, ALEX)).rejects.toThrow(/on leave/);

    advance(3 * 1440);
    expect(await service.sweep()).toMatchObject({ leavesEnded: 1 });
    expect((await service.member(GUILD, ALEX.userId))?.status).toBe("ACTIVE");
    expect(gateway.calls).toContain(`remove ${ALEX.userId} ${LOA_ROLE}`);
    expect(repository.records.filter((record) => record.userId === ALEX.userId).map((record) => record.type)).toEqual(["HIRE", "LOA_START", "LOA_END"]);
  });

  it("validates dates, denies, cancels, and ends leave early", async () => {
    const { service, now } = await setup({ maxLeaveDays: 5 });
    await service.hire(GUILD, ALEX, BOSS);
    const at = (days: number) => new Date(now().getTime() + days * 86_400_000);
    await expect(service.requestLeave(GUILD, ALEX, { startsAt: at(0), endsAt: at(10), reason: "Long" })).rejects.toThrow(/at most 5 days/);
    await expect(service.requestLeave(GUILD, ALEX, { startsAt: at(-3), endsAt: at(1), reason: "Past" })).rejects.toThrow(/past/);
    await expect(service.requestLeave(GUILD, SAM, { startsAt: at(0), endsAt: at(1), reason: "x" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const denied = await service.reviewLeave(GUILD, (await service.requestLeave(GUILD, ALEX, { startsAt: at(1), endsAt: at(2), reason: "Trip" })).id, BOSS, false, "Busy week");
    expect(denied).toMatchObject({ status: "DENIED", reviewNote: "Busy week" });
    const cancelled = await service.cancelLeave(GUILD, (await service.requestLeave(GUILD, ALEX, { startsAt: at(1), endsAt: at(2), reason: "Trip" })).id, ALEX.userId);
    expect(cancelled.status).toBe("CANCELLED");
    const now2 = await service.requestLeave(GUILD, ALEX, { startsAt: at(0), endsAt: at(2), reason: "Sick" });
    expect((await service.reviewLeave(GUILD, now2.id, BOSS, true)).status).toBe("ACTIVE");
    const ended = await service.endLeave(GUILD, now2.id, BOSS);
    expect(ended.status).toBe("ENDED");
    expect((await service.member(GUILD, ALEX.userId))?.status).toBe("ACTIVE");
  });
});

describe("StaffService shifts", () => {
  it("clocks in and out, totals the week, and ranks members", async () => {
    const { service, advance } = await setup();
    await service.hire(GUILD, ALEX, BOSS);
    await service.hire(GUILD, SAM, BOSS);
    await expect(service.clockOut(GUILD, ALEX.userId)).rejects.toThrow(/not clocked in/);
    await service.clockIn(GUILD, ALEX);
    await expect(service.clockIn(GUILD, ALEX)).rejects.toThrow(/already clocked in/);
    await service.clockIn(GUILD, SAM);
    advance(30);
    await service.clockOut(GUILD, SAM.userId);
    advance(60);
    const shift = await service.clockOut(GUILD, ALEX.userId);
    expect(shift.durationSeconds).toBe(5400);
    const board = await service.leaderboard(GUILD);
    expect(board.since.toISOString()).toBe("2026-09-21T00:00:00.000Z");
    expect(board.entries.map((entry) => [entry.userName, entry.seconds])).toEqual([["Alex", 5400], ["Sam", 1800]]);
    expect((await service.leaderboard(GUILD, 1)).entries).toEqual([]);
    expect((await service.profile(GUILD, ALEX.userId)).weekSeconds).toBe(5400);
    await expect(service.clockIn(GUILD, { userId: "200000000000000099", displayName: "Nobody" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("auto clocks out after the configured hours", async () => {
    const { service, repository, advance } = await setup({ autoClockOutHours: 2 });
    await service.hire(GUILD, ALEX, BOSS);
    await service.clockIn(GUILD, ALEX);
    advance(90);
    expect((await service.sweep()).clockedOut).toBe(0);
    advance(60);
    expect((await service.sweep()).clockedOut).toBe(1);
    expect(repository.shifts[0]).toMatchObject({ autoEnded: true, durationSeconds: 7200 });
  });

  it("computes week starts on Monday UTC", () => {
    expect(weekStart(new Date("2026-09-27T23:59:00.000Z")).toISOString()).toBe("2026-09-21T00:00:00.000Z");
    expect(weekStart(new Date("2026-09-28T00:00:00.000Z")).toISOString()).toBe("2026-09-28T00:00:00.000Z");
  });
});

describe("roster message", () => {
  it("posts once, edits after, and reposts when deleted", async () => {
    const { service, gateway } = await setup();
    const { revision, rosterMessageId: _message, ...current } = await service.settings(GUILD);
    const saved = await service.saveSettings({ ...current, rosterChannelId: ROSTER, expectedRevision: revision });
    const firstId = saved.rosterMessageId;
    expect(firstId).toBeDefined();
    await service.hire(GUILD, ALEX, BOSS, { callsign: "1A" });
    const edit = gateway.edits.at(-1);
    expect(edit?.messageId).toBe(firstId);
    expect(edit?.embed.description).toContain(`<@${ALEX.userId}> · 1A`);
    gateway.missingMessages.add(firstId ?? "");
    await service.hire(GUILD, SAM, BOSS);
    expect((await service.settings(GUILD)).rosterMessageId).not.toBe(firstId);
    await expect(service.saveSettings({ ...current, expectedRevision: revision })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("lists every rank highest first", () => {
    const embed = rosterEmbed(
      [{ id: "b", guildId: GUILD, name: "Low", color: "#000000", position: 1 }, { id: "a", guildId: GUILD, name: "High", color: "#FF0000", position: 0 }],
      [{ id: "m", guildId: GUILD, userId: ALEX.userId, displayName: "Alex", rankId: "b", joinedAt: new Date(), status: "LOA", createdAt: new Date(), updatedAt: new Date() }],
    );
    expect(embed.description).toBe(`**High** (0)\n_No members_\n\n**Low** (1)\n<@${ALEX.userId}> · On leave`);
    expect(embed.color).toBe("#FF0000");
  });
});

describe("DiscordRestStaffGateway", () => {
  it("uses the member role endpoints and sends buttons", async () => {
    const calls: string[] = [];
    const rest = {
      get: async () => ({}),
      post: async (route: string, options?: { body?: unknown }) => { calls.push(`POST ${route} ${JSON.stringify(options?.body)}`); return { id: "900000000000000001" }; },
      patch: async (route: string) => { calls.push(`PATCH ${route}`); return {}; },
      put: async (route: string) => { calls.push(`PUT ${route}`); return {}; },
      delete: async (route: string) => { calls.push(`DELETE ${route}`); return {}; },
    };
    const gateway = new DiscordRestStaffGateway(rest);
    await gateway.addRole(GUILD, ALEX.userId, ROLE.chief, "x");
    await gateway.removeRole(GUILD, ALEX.userId, ROLE.chief, "x");
    const posted = await gateway.postEmbed(LOGS, { title: "t", description: "d", color: "#5865F2" }, [{ customId: "qbox:staff:loa-approve:1", label: "Approve", style: "success" }]);
    await gateway.editEmbed(LOGS, posted.messageId, { title: "t", description: "d", color: "#5865F2" });
    expect(calls[0]).toBe(`PUT /guilds/${GUILD}/members/${ALEX.userId}/roles/${ROLE.chief}`);
    expect(calls[1]).toBe(`DELETE /guilds/${GUILD}/members/${ALEX.userId}/roles/${ROLE.chief}`);
    expect(calls[2]).toContain('"custom_id":"qbox:staff:loa-approve:1"');
    expect(calls[3]).toBe(`PATCH /channels/${LOGS}/messages/900000000000000001`);
  });
});
