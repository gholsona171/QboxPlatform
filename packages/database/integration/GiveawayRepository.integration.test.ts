import { PrismaClientFactory } from "@qbox/prisma";
import { GiveawayService, type GiveawayGateway } from "@qbox/giveaways";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaGiveawayRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for giveaway repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing giveaway cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaGiveawayRepository(client);
const guildId = "1257928923048837201";
const channelId = "1262656532902842425";
const booster = "1262656532902842499";
const staff = { userId: "804859666655739997", displayName: "Jay" };
const member = (index: number, roleIds: string[] = []) => ({ userId: `80485966665573990${index}`, displayName: `Member ${index}`, roleIds });

const gateway: GiveawayGateway = {
  postMessage: async () => ({ messageId: "1432100000000000001" }),
  editMessage: async () => undefined,
  directMessage: async () => true,
};

let clock = new Date("2026-09-25T12:00:00.000Z");
const service = new GiveawayService(repository, gateway, () => clock, { refreshDelayMs: 0 });

beforeAll(async () => client.$connect());
beforeEach(async () => {
  clock = new Date("2026-09-25T12:00:00.000Z");
  await client.$executeRawUnsafe('TRUNCATE TABLE "giveaway_entries", "giveaways", "giveaway_counters"');
});
afterAll(async () => client.$disconnect());

describe("PrismaGiveawayRepository", () => {
  it("numbers giveaways without gaps under concurrency", async () => {
    const numbers = await Promise.all(Array.from({ length: 12 }, () => repository.allocateNumber(guildId)));
    expect([...numbers].sort((a, b) => a - b)).toEqual(Array.from({ length: 12 }, (_, index) => index + 1));
  });

  it("stores giveaways and weighted entries, pauses, and ends on time", async () => {
    const giveaway = await service.start({ guildId, prize: "VIP", channelId, winnerCount: 2, durationMinutes: 60, bonusEntries: [{ roleId: booster, entries: 2 }] }, staff);
    expect((await service.get(guildId, "1")).bonusEntries).toEqual([{ roleId: booster, entries: 2 }]);
    expect(await service.toggleEntry(guildId, giveaway.id, member(1, [booster]))).toEqual({ entered: true, entries: 3 });
    await service.toggleEntry(guildId, giveaway.id, member(2));
    await service.toggleEntry(guildId, giveaway.id, member(3));
    expect(await service.toggleEntry(guildId, giveaway.id, member(3))).toEqual({ entered: false, entries: 0 });
    const detail = await service.detail(guildId, giveaway.id);
    expect(detail.totalEntries).toBe(4);
    expect((await service.list(guildId, "active"))[0]?.entrantCount).toBe(2);
    await service.pause(guildId, giveaway.id);
    clock = new Date(clock.getTime() + 30 * 60_000);
    const resumed = await service.resume(guildId, giveaway.id);
    expect(resumed.endsAt.toISOString()).toBe("2026-09-25T13:30:00.000Z");
    clock = new Date("2026-09-25T13:31:00.000Z");
    expect(await service.sweepDue()).toBe(1);
    const ended = await service.get(guildId, giveaway.id);
    expect(ended.status).toBe("ENDED");
    expect([...ended.winnerIds].sort()).toEqual([member(1).userId, member(2).userId]);
    expect(ended.endedById).toBe("0");
  });
});
