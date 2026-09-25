import { PrismaClientFactory } from "@qbox/prisma";
import { BirthdayService, defaultBirthdaySettings, type BirthdayGateway } from "@qbox/birthdays";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaBirthdayRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for birthday repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing birthday cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaBirthdayRepository(client);
const guildId = "1257928923048837201";
const member = "804859666655739996";
const other = "804859666655739997";
const staff = { userId: "804859666655739998", displayName: "Staff", manager: true };
const posts: string[] = [];
const roles: string[] = [];

const gateway: BirthdayGateway = {
  guildName: async () => "Qbox",
  post: async (_channel, announcement) => { posts.push(announcement.description); return { messageId: "1432100000000000001" }; },
  addRole: async (_guild, userId) => { roles.push(`add ${userId}`); },
  removeRole: async (_guild, userId) => { roles.push(`remove ${userId}`); },
};

let clock = new Date("2026-09-25T12:00:00.000Z");
const service = new BirthdayService(repository, gateway, () => clock);

beforeAll(async () => client.$connect());
beforeEach(async () => {
  clock = new Date("2026-09-25T12:00:00.000Z");
  posts.length = 0;
  roles.length = 0;
  await client.$executeRawUnsafe('TRUNCATE TABLE "birthdays", "birthday_settings"');
});
afterAll(async () => client.$disconnect());

describe("PrismaBirthdayRepository", () => {
  it("round-trips settings with revisions", async () => {
    const { revision: _revision, ...defaults } = defaultBirthdaySettings(guildId);
    const saved = await service.saveSettings({ ...defaults, enabled: true, channelId: "1262656532902842425", pingRoleId: "1262656532902842426", expectedRevision: 0 });
    expect(saved).toMatchObject({ revision: 1, enabled: true, pingRoleId: "1262656532902842426" });
    expect((await repository.listEnabledSettings()).map((item) => item.guildId)).toEqual([guildId]);
    await expect(service.saveSettings({ ...defaults, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("saves, searches, and removes birthdays", async () => {
    await service.set({ guildId, userId: member, displayName: "Alex Stone", month: 10, day: 3, year: 1999, showAge: true, timeZone: "Europe/Paris" }, staff);
    await service.set({ guildId, userId: other, displayName: "Sam", month: 9, day: 30 }, staff);
    expect((await service.list(guildId)).map((item) => [item.birthday.displayName, item.daysUntil, item.turning])).toEqual([["Sam", 5, undefined], ["Alex Stone", 8, 27]]);
    expect((await service.list(guildId, "stone")).map((item) => item.birthday.userId)).toEqual([member]);
    expect((await service.get(guildId, member))?.timeZone).toBe("Europe/Paris");
    await service.remove(guildId, other, staff);
    expect(await service.get(guildId, other)).toBeUndefined();
  });

  it("announces once, gives the role, removes it later, and resets when the date changes", async () => {
    const { revision: _revision, ...defaults } = defaultBirthdaySettings(guildId);
    await service.saveSettings({ ...defaults, enabled: true, channelId: "1262656532902842425", roleId: "1262656532902842427", announceHour: 0 });
    await service.set({ guildId, userId: member, displayName: "Alex", month: 9, day: 25, timeZone: "UTC" }, staff);
    expect(await service.tick()).toEqual({ announced: 1, rolesRemoved: 0 });
    expect(await service.tick()).toEqual({ announced: 0, rolesRemoved: 0 });
    expect((await service.get(guildId, member))?.roleRemoveAt?.toISOString()).toBe("2026-09-26T00:00:00.000Z");
    clock = new Date("2026-09-26T00:01:00.000Z");
    expect(await service.tick()).toEqual({ announced: 0, rolesRemoved: 1 });
    expect(roles).toEqual([`add ${member}`, `remove ${member}`]);
    await service.set({ guildId, userId: member, displayName: "Alex", month: 9, day: 25, timeZone: "UTC" }, staff);
    expect((await service.get(guildId, member))?.lastAnnouncedYear).toBe(2026);
    await service.set({ guildId, userId: member, displayName: "Alex", month: 9, day: 26, timeZone: "UTC" }, staff);
    expect((await service.get(guildId, member))?.lastAnnouncedYear).toBeUndefined();
    expect(posts).toHaveLength(1);
  });
});
