import { PrismaClientFactory } from "@qbox/prisma";
import { PollService, type PollGateway } from "@qbox/polls";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaPollRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for poll repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing poll cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaPollRepository(client);
const guildId = "1257928923048837201";
const channelId = "1262656532902842425";
const creator = { userId: "804859666655739997", displayName: "Kim", canManage: true };
const voter = (index: number) => ({ userId: `80485966665573990${index}`, displayName: `Voter ${index}`, roleIds: [] });

const gateway: PollGateway = {
  postMessage: async () => ({ messageId: "1432100000000000001" }),
  editMessage: async () => undefined,
  deleteMessage: async () => undefined,
};

let clock = new Date("2026-09-25T12:00:00.000Z");
const service = new PollService(repository, gateway, () => clock, { refreshDelayMs: 0 });

beforeAll(async () => client.$connect());
beforeEach(async () => {
  clock = new Date("2026-09-25T12:00:00.000Z");
  await client.$executeRawUnsafe('TRUNCATE TABLE "poll_votes", "polls", "poll_counters"');
});
afterAll(async () => client.$disconnect());

describe("PrismaPollRepository", () => {
  it("numbers polls without gaps under concurrency", async () => {
    const numbers = await Promise.all(Array.from({ length: 12 }, () => repository.allocateNumber(guildId)));
    expect([...numbers].sort((a, b) => a - b)).toEqual(Array.from({ length: 12 }, (_, index) => index + 1));
  });

  it("stores polls with options, votes, counts, and closes ended polls", async () => {
    const poll = await service.create({
      guildId,
      question: "Best map?",
      options: [{ label: "Paleto", emoji: "🌲" }, { label: "Sandy" }, { label: "City" }],
      maxChoices: 2,
      anonymous: false,
      resultsVisibility: "LIVE",
      allowedRoleIds: [],
      channelId,
      durationMinutes: 30,
    }, creator);
    expect((await service.get(guildId, "#1")).options[0]).toEqual({ id: "1", label: "Paleto", emoji: "🌲" });
    await service.vote(guildId, poll.id, voter(1), ["1", "2"]);
    await service.vote(guildId, poll.id, voter(2), ["2"]);
    await service.vote(guildId, poll.id, voter(2), ["3"]);
    const results = await service.results(guildId, poll.id, creator);
    expect(results).toMatchObject({ voters: 2, counts: { "1": 1, "2": 1, "3": 1 } });
    expect(results.votersByOption["3"]).toEqual([{ userId: voter(2).userId, userName: "Voter 2" }]);
    expect((await service.list(guildId, "OPEN"))[0]?.voterCount).toBe(2);
    await service.removeVote(guildId, poll.id, voter(1).userId);
    clock = new Date(clock.getTime() + 31 * 60_000);
    expect(await service.sweepEnded()).toBe(1);
    expect((await service.get(guildId, poll.id)).status).toBe("CLOSED");
    expect((await service.exportCsv(guildId, poll.id, creator)).content).toContain("3,City,1");
    await service.delete(guildId, poll.id, creator);
    expect(await client.pollVote.count()).toBe(0);
  });
});
