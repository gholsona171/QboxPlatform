import { PrismaClientFactory } from "@qbox/prisma";
import { ScheduledMessageService, type ScheduledMessageGateway, type ScheduledMessageInput } from "@qbox/scheduled-messages";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaScheduledMessageRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for scheduled message repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing scheduled message cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaScheduledMessageRepository(client);
const guildId = "1257928923048837201";
const staff = "804859666655739998";
let failing = false;
let posted = 0;

const gateway: ScheduledMessageGateway = {
  post: async () => {
    if (failing) throw new Error("Unknown Channel");
    posted += 1;
    return { messageId: `14321000000000000${String(posted).padStart(2, "0")}` };
  },
  deleteMessage: async () => undefined,
  pin: async () => undefined,
};

let clock = new Date("2026-09-25T12:00:00.000Z");
const service = new ScheduledMessageService(repository, gateway, () => clock);

function input(overrides: Partial<ScheduledMessageInput> = {}): ScheduledMessageInput {
  return {
    guildId,
    name: "Weekly rules",
    channelId: "1262656532902842425",
    content: "Read the rules",
    embed: { title: "Rules", color: "#5865F2", fields: [{ name: "One", value: "Be kind", inline: false }] },
    pingRoleIds: ["1262656532902842426"],
    schedule: { type: "WEEKLY", timeZone: "America/New_York", time: "18:00", weekdays: [1, 5], endDate: "2026-12-31" },
    enabled: true,
    deletePrevious: true,
    pin: false,
    maxRuns: 5,
    ...overrides,
  };
}

beforeAll(async () => client.$connect());
beforeEach(async () => {
  clock = new Date("2026-09-25T12:00:00.000Z");
  failing = false;
  posted = 0;
  await client.$executeRawUnsafe('TRUNCATE TABLE "scheduled_message_runs", "scheduled_messages"');
});
afterAll(async () => client.$disconnect());

describe("PrismaScheduledMessageRepository", () => {
  it("round-trips messages with embeds and schedules", async () => {
    const created = await service.create(input(), staff);
    expect(created.nextRunAt?.toISOString()).toBe("2026-09-25T22:00:00.000Z");
    const loaded = await service.get(guildId, created.id);
    expect(loaded).toMatchObject({ name: "Weekly rules", pingRoleIds: ["1262656532902842426"], maxRuns: 5, schedule: { type: "WEEKLY", weekdays: [1, 5], endDate: "2026-12-31" } });
    expect(loaded.embed?.fields).toEqual([{ name: "One", value: "Be kind", inline: false }]);
    expect((await service.byName(guildId, "WEEKLY RULES")).id).toBe(created.id);
    const updated = await service.update(guildId, created.id, input({ content: undefined, embed: { description: "Only embed", fields: [] }, maxRuns: undefined, schedule: { type: "DAILY", timeZone: "UTC", time: "13:00" } }));
    expect(updated.content).toBeUndefined();
    expect(updated.maxRuns).toBeUndefined();
    expect(updated.schedule).toEqual({ type: "DAILY", timeZone: "UTC", time: "13:00" });
    expect(updated.nextRunAt?.toISOString()).toBe("2026-09-25T13:00:00.000Z");
    await expect(service.get(guildId, "not-a-uuid")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("claims each due post once and keeps run history", async () => {
    const created = await service.create(input(), staff);
    clock = new Date("2026-09-25T22:00:10.000Z");
    const [first, second] = await Promise.all([service.runDue(), service.runDue()]);
    expect((first?.sent ?? 0) + (second?.sent ?? 0)).toBe(1);
    const after = await service.get(guildId, created.id);
    expect(after).toMatchObject({ runCount: 1, lastMessageId: "1432100000000000001" });
    expect(after.nextRunAt?.toISOString()).toBe("2026-09-28T22:00:00.000Z");
    failing = true;
    clock = new Date("2026-09-25T23:00:00.000Z");
    await service.sendNow(guildId, created.id);
    const runs = await service.runs(guildId, created.id);
    expect(runs.map((run) => [run.success, run.manual, run.error ?? null])).toEqual([[false, true, "Unknown Channel"], [true, false, null]]);
    await service.delete(guildId, created.id);
    expect(await service.runs(guildId)).toEqual([]);
  });
});
