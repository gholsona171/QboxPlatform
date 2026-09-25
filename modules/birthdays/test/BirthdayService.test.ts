import { describe, expect, it } from "vitest";
import type { MessageTemplates, TemplateValues } from "@qbox/shared/messages";

import {
  BirthdayService,
  InMemoryBirthdayRepository,
  defaultBirthdaySettings,
  isBirthdayOn,
  nextBirthday,
  renderBirthdayMessage,
  type BirthdayActor,
  type BirthdayAnnouncement,
  type BirthdayGateway,
  type BirthdaySettingsInput,
} from "../src/index.js";

const GUILD = "100000000000000001";
const ALEX = "200000000000000001";
const SAM = "200000000000000002";
const CHANNEL = "500000000000000001";
const ROLE = "400000000000000001";
const PING = "400000000000000002";
const alex: BirthdayActor = { userId: ALEX, displayName: "Alex", manager: false };
const staff: BirthdayActor = { userId: "300000000000000001", displayName: "Jay", manager: true };

class FakeGateway implements BirthdayGateway {
  public readonly posts: { channelId: string; announcement: BirthdayAnnouncement }[] = [];
  public readonly calls: string[] = [];
  public async guildName() { return "Qbox City"; }
  public async post(channelId: string, announcement: BirthdayAnnouncement) { this.posts.push({ channelId, announcement }); return { messageId: "700000000000000001" }; }
  public async addRole(_g: string, userId: string, roleId: string) { this.calls.push(`add ${userId} ${roleId}`); }
  public async removeRole(_g: string, userId: string, roleId: string) { this.calls.push(`remove ${userId} ${roleId}`); }
}

function settings(overrides: Partial<BirthdaySettingsInput> = {}): BirthdaySettingsInput {
  const { revision: _revision, ...defaults } = defaultBirthdaySettings(GUILD);
  return { ...defaults, enabled: true, channelId: CHANNEL, roleId: ROLE, pingRoleId: PING, message: "Happy birthday {user}, you are {age} today! Love, {server}", ...overrides };
}

/** Records every template request and answers with a marked message. */
function markedTemplates(seen: { key: string; values: TemplateValues }[]): MessageTemplates {
  return { apply: async (_guildId, key, values) => { seen.push({ key, values }); return { content: `custom ${key}` }; } };
}

async function setup(start: string, overrides: Partial<BirthdaySettingsInput> = {}, templates?: MessageTemplates) {
  let clock = new Date(start);
  const now = () => clock;
  const gateway = new FakeGateway();
  const repository = new InMemoryBirthdayRepository(now);
  const service = new BirthdayService(repository, gateway, now, templates);
  await service.saveSettings(settings(overrides));
  return { service, gateway, repository, at: (iso: string) => { clock = new Date(iso); } };
}

describe("birthday dates", () => {
  it("validates dates, years, and time zones", async () => {
    const { service } = await setup("2026-09-25T12:00:00.000Z");
    await expect(service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 2, day: 30 }, alex)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 2, day: 29, year: 2001 }, alex)).rejects.toThrow("did not exist in 2001");
    await expect(service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 5, day: 1, year: 2030 }, alex)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 5, day: 1, timeZone: "Mars/Olympus" }, alex)).rejects.toThrow("not a time zone");
    const saved = await service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 2, day: 29, year: 2000, showAge: true, timeZone: "europe/london" }, alex);
    expect(saved).toMatchObject({ month: 2, day: 29, year: 2000, showAge: true, timeZone: "Europe/London" });
  });

  it("lets members change only their own birthday and staff anyone's", async () => {
    const { service } = await setup("2026-09-25T12:00:00.000Z");
    await expect(service.set({ guildId: GUILD, userId: SAM, displayName: "Sam", month: 1, day: 1 }, alex)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await service.set({ guildId: GUILD, userId: SAM, displayName: "Sam", month: 1, day: 1 }, staff);
    await expect(service.remove(GUILD, SAM, alex)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await service.remove(GUILD, SAM, staff);
    await expect(service.remove(GUILD, ALEX, alex)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("honors the year and confirmation settings", async () => {
    const { service } = await setup("2026-09-25T12:00:00.000Z", { allowYear: false, requireConfirmation: true });
    await expect(service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 5, day: 1, year: 1999 }, alex)).rejects.toThrow("birth years");
    await expect(service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 5, day: 1 }, alex)).rejects.toMatchObject({ code: "INVALID_STATE" });
    expect((await service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 5, day: 1, confirmed: true }, alex)).day).toBe(1);
    expect((await service.set({ guildId: GUILD, userId: SAM, displayName: "Sam", month: 5, day: 2 }, staff)).day).toBe(2);
  });

  it("lists upcoming birthdays soonest first with the age they turn", async () => {
    const { service } = await setup("2026-09-25T12:00:00.000Z");
    await service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 9, day: 24, year: 2000, showAge: true }, alex);
    await service.set({ guildId: GUILD, userId: SAM, displayName: "Sam", month: 10, day: 3 }, staff);
    const list = await service.list(GUILD);
    expect(list.map((item) => [item.birthday.displayName, item.date, item.daysUntil, item.turning])).toEqual([
      ["Sam", "2026-10-03", 8, undefined],
      ["Alex", "2027-09-24", 364, 27],
    ]);
    expect((await service.upcoming(GUILD, 30)).map((item) => item.birthday.userId)).toEqual([SAM]);
    expect((await service.next(GUILD))[0]?.birthday.userId).toBe(SAM);
    expect((await service.list(GUILD, "ale")).map((item) => item.birthday.userId)).toEqual([ALEX]);
  });

  it("moves February 29 to February 28 in other years", () => {
    expect(isBirthdayOn({ month: 2, day: 29 }, { year: 2027, month: 2, day: 28 })).toBe(true);
    expect(isBirthdayOn({ month: 2, day: 29 }, { year: 2028, month: 2, day: 28 })).toBe(false);
    const birthday = { id: "x", guildId: GUILD, userId: ALEX, displayName: "A", month: 2, day: 29, showAge: false, timeZone: "UTC", createdAt: new Date(), updatedAt: new Date() };
    expect(nextBirthday(birthday, { year: 2027, month: 3, day: 1 }).date).toBe("2028-02-29");
    expect(nextBirthday(birthday, { year: 2026, month: 3, day: 1 }).date).toBe("2027-02-28");
  });

  it("fills message placeholders", () => {
    expect(renderBirthdayMessage("Happy birthday {user}, you are {age} today! {server}", ALEX, 30, "Qbox")).toBe(`Happy birthday <@${ALEX}>, you are 30 today! Qbox`);
    expect(renderBirthdayMessage("Happy birthday {user} {age}!", ALEX, undefined, "Qbox")).toBe(`Happy birthday <@${ALEX}>!`);
  });
});

describe("birthday timer", () => {
  it("announces once per year at the hour in the member's time zone and removes the role after their day", async () => {
    const { service, gateway, repository, at } = await setup("2026-09-24T12:00:00.000Z", { announceHour: 9 });
    await service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 9, day: 25, year: 2000, showAge: true, timeZone: "Asia/Tokyo" }, alex);
    // 23:00 UTC on the 24th is 08:00 on the 25th in Tokyo: before the hour.
    at("2026-09-24T23:00:00.000Z");
    expect(await service.tick()).toEqual({ announced: 0, rolesRemoved: 0 });
    at("2026-09-25T00:05:00.000Z");
    expect(await service.tick()).toEqual({ announced: 1, rolesRemoved: 0 });
    expect(gateway.posts[0]?.channelId).toBe(CHANNEL);
    expect(gateway.posts[0]?.announcement).toEqual({ content: `<@${ALEX}> <@&${PING}>`, embeds: [{ description: `Happy birthday <@${ALEX}>, you are 26 today! Love, Qbox City`, color: 0xf47fff }], mentionUserIds: [ALEX], mentionRoleIds: [PING] });
    expect(gateway.calls).toEqual([`add ${ALEX} ${ROLE}`]);
    expect(repository.birthdays[0]).toMatchObject({ lastAnnouncedYear: 2026, grantedRoleId: ROLE, roleRemoveAt: new Date("2026-09-25T15:00:00.000Z") });
    at("2026-09-25T06:00:00.000Z");
    expect(await service.tick()).toEqual({ announced: 0, rolesRemoved: 0 });
    at("2026-09-25T15:01:00.000Z");
    expect(await service.tick()).toEqual({ announced: 0, rolesRemoved: 1 });
    expect(gateway.calls).toEqual([`add ${ALEX} ${ROLE}`, `remove ${ALEX} ${ROLE}`]);
    expect(gateway.posts).toHaveLength(1);
  });

  it("uses local dates west of UTC and skips disabled servers", async () => {
    const { service, gateway, at } = await setup("2026-09-25T12:00:00.000Z", { announceHour: 20, roleId: undefined });
    await service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 9, day: 25, timeZone: "America/Los_Angeles" }, alex);
    at("2026-09-26T02:30:00.000Z");
    expect((await service.tick()).announced).toBe(0);
    at("2026-09-26T03:10:00.000Z");
    expect((await service.tick()).announced).toBe(1);
    expect(gateway.posts[0]?.announcement.embeds?.[0]?.description).toBe(`Happy birthday <@${ALEX}>, you are today! Love, Qbox City`);
    await service.saveSettings(settings({ enabled: false }));
    await service.set({ guildId: GUILD, userId: SAM, displayName: "Sam", month: 9, day: 25, timeZone: "America/Los_Angeles" }, staff);
    expect((await service.tick()).announced).toBe(0);
  });

  it("requires a channel or role before turning on and posts a test message", async () => {
    const { service, gateway } = await setup("2026-09-25T12:00:00.000Z");
    await expect(service.saveSettings(settings({ channelId: undefined, roleId: undefined, expectedRevision: 1 }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.saveSettings(settings({ expectedRevision: 0 }))).rejects.toMatchObject({ code: "CONFLICT" });
    await service.sendTest(GUILD, ALEX);
    expect(gateway.posts[0]?.announcement.embeds?.[0]?.description).toContain("21");
  });

  it("posts the server's custom birthday message, keeping the pings", async () => {
    const seen: { key: string; values: TemplateValues }[] = [];
    const { service, gateway, at } = await setup("2026-09-25T12:00:00.000Z", { announceHour: 0 }, markedTemplates(seen));
    await service.set({ guildId: GUILD, userId: ALEX, displayName: "Alex", month: 9, day: 25, year: 2000, showAge: true, timeZone: "UTC" }, alex);
    at("2026-09-25T13:00:00.000Z");
    expect((await service.tick()).announced).toBe(1);
    expect(gateway.posts[0]?.announcement).toEqual({ content: "custom birthdays.announcement", embeds: undefined, mentionUserIds: [ALEX], mentionRoleIds: [PING] });
    expect(seen).toEqual([{ key: "birthdays.announcement", values: { user: `<@${ALEX}>`, username: "Alex", age: 26, date: "September 25", server: "Qbox City" } }]);
  });
});
