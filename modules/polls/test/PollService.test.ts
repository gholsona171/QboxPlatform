import { describe, expect, it } from "vitest";

import {
  DiscordRestPollGateway,
  InMemoryPollRepository,
  PollService,
  parseDuration,
  pollMessage,
  resultBar,
  splitOptionText,
  type PollActor,
  type PollCreateInput,
  type PollGateway,
  type PollMessage,
} from "../src/index.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";
const ROLE = "400000000000000001";
const STAFF: PollActor = { userId: "300000000000000001", displayName: "Jay", canManage: true };
const CREATOR: PollActor = { userId: "300000000000000002", displayName: "Kim", canManage: false };
const voter = (index: number, roleIds: string[] = []) => ({ userId: `20000000000000000${index}`, displayName: `Voter ${index}`, roleIds });

class FakeGateway implements PollGateway {
  public readonly posts: { channelId: string; message: PollMessage; replyTo?: string | undefined }[] = [];
  public readonly edits: PollMessage[] = [];
  public readonly deleted: string[] = [];
  public failPost = false;

  public async postMessage(channelId: string, message: PollMessage, replyTo?: string) {
    if (this.failPost) throw new Error("Missing Access");
    this.posts.push({ channelId, message, replyTo });
    return { messageId: `70000000000000000${this.posts.length}` };
  }
  public async editMessage(_c: string, _m: string, message: PollMessage) { this.edits.push(message); }
  public async deleteMessage(_c: string, messageId: string) { this.deleted.push(messageId); }
}

function setup() {
  let clock = new Date("2026-09-25T12:00:00.000Z");
  const now = () => clock;
  const gateway = new FakeGateway();
  const repository = new InMemoryPollRepository(now);
  const service = new PollService(repository, gateway, now, { refreshDelayMs: 0 });
  return { service, gateway, repository, advance: (minutes: number) => { clock = new Date(clock.getTime() + minutes * 60_000); } };
}

const base: PollCreateInput = {
  guildId: GUILD,
  question: "Pizza or tacos?",
  options: [{ label: "Pizza", emoji: "🍕" }, { label: "Tacos", emoji: "🌮" }, { label: "Neither" }],
  channelId: CHANNEL,
};

describe("PollService", () => {
  it("creates a numbered poll, posts it with vote buttons, and pings the role", async () => {
    const { service, gateway } = setup();
    const poll = await service.create({ ...base, pingRoleId: ROLE, durationMinutes: 60 }, CREATOR);
    expect(poll).toMatchObject({ number: 1, status: "OPEN", messageId: "700000000000000001", maxChoices: 1, resultsVisibility: "LIVE" });
    expect(poll.endsAt?.toISOString()).toBe("2026-09-25T13:00:00.000Z");
    const message = gateway.posts[0]?.message;
    expect(message?.content).toBe(`<@&${ROLE}>`);
    expect(message?.mentionRoleIds).toEqual([ROLE]);
    expect(message?.buttonRows[0]?.map((button) => button.label)).toEqual(["Pizza", "Tacos", "Neither"]);
    expect(message?.buttonRows[1]?.[0]?.label).toBe("Remove my vote");
    expect((await service.create(base, CREATOR)).number).toBe(2);
  });

  it("validates options, choices, and end times", async () => {
    const { service } = setup();
    await expect(service.create({ ...base, options: [{ label: "Only" }] }, CREATOR)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.create({ ...base, options: [{ label: "A" }, { label: "a" }] }, CREATOR)).rejects.toThrow(/twice/);
    await expect(service.create({ ...base, maxChoices: 4 }, CREATOR)).rejects.toThrow(/Max choices/);
    await expect(service.create({ ...base, options: [{ label: "A", emoji: "cat" }, { label: "B" }] }, CREATOR)).rejects.toThrow(/emoji/);
    await expect(service.create({ ...base, endsAt: new Date("2026-09-25T11:00:00.000Z") }, CREATOR)).rejects.toThrow(/minute from now/);
    await expect(service.create({ ...base, endsAt: new Date("2026-09-25T14:00:00.000Z"), durationMinutes: 5 }, CREATOR)).rejects.toThrow(/not both/);
  });

  it("removes the poll when it cannot be posted", async () => {
    const { service, gateway, repository } = setup();
    gateway.failPost = true;
    await expect(service.create(base, CREATOR)).rejects.toMatchObject({ code: "INVALID_STATE" });
    expect(repository.polls).toHaveLength(0);
  });

  it("records single-choice votes, allows changes, and refreshes the bars", async () => {
    const { service, gateway } = setup();
    const poll = await service.create(base, CREATOR);
    await service.vote(GUILD, poll.id, voter(1), ["1"]);
    await service.vote(GUILD, poll.id, voter(2), ["1"]);
    await service.vote(GUILD, "#1", voter(2), ["2"]);
    await expect(service.vote(GUILD, poll.id, voter(3), ["1", "2"])).rejects.toThrow(/only one/);
    await expect(service.vote(GUILD, poll.id, voter(3), ["9"])).rejects.toThrow(/not part/);
    const results = await service.results(GUILD, "1", voter(9));
    expect(results).toMatchObject({ voters: 2, counts: { "1": 1, "2": 1, "3": 0 } });
    expect(results.votersByOption["2"]).toEqual([{ userId: voter(2).userId, userName: "Voter 2" }]);
    expect(gateway.edits.at(-1)?.embed.description).toContain(resultBar(1, 2));
    await service.removeVote(GUILD, poll.id, voter(2).userId);
    await expect(service.removeVote(GUILD, poll.id, voter(2).userId)).rejects.toThrow(/not voted/);
  });

  it("enforces multiple choice limits, locked votes, roles, and hidden results", async () => {
    const { service, gateway, repository } = setup();
    const poll = await service.create({ ...base, maxChoices: 2, allowVoteChange: false, allowedRoleIds: [ROLE], resultsVisibility: "AFTER_CLOSE", anonymous: true }, CREATOR);
    expect(gateway.posts[0]?.message.select?.maxValues).toBe(2);
    expect(gateway.posts[0]?.message.buttonRows).toEqual([]);
    await expect(service.vote(GUILD, poll.id, voter(1), ["1"])).rejects.toMatchObject({ code: "FORBIDDEN" });
    await service.vote(GUILD, poll.id, voter(1, [ROLE]), ["3", "1"]);
    expect((await repository.getVote(poll.id, voter(1).userId))?.optionIds).toEqual(["1", "3"]);
    await expect(service.vote(GUILD, poll.id, voter(1, [ROLE]), ["2"])).rejects.toThrow(/already voted/);
    await expect(service.vote(GUILD, poll.id, voter(2, [ROLE]), ["1", "2", "3"])).rejects.toThrow(/up to 2/);
    expect(gateway.edits.at(-1)?.embed.description).not.toContain("%");
    await expect(service.results(GUILD, poll.id, { userId: voter(1).userId, canManage: false })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect((await service.results(GUILD, poll.id, CREATOR)).voters).toBe(1);
    const staffView = await service.results(GUILD, poll.id, STAFF);
    expect(staffView.counts).toEqual({ "1": 1, "2": 0, "3": 1 });
    expect(staffView.votersByOption).toEqual({});
  });

  it("closes, posts final results, reopens, and blocks votes on closed polls", async () => {
    const { service, gateway } = setup();
    const poll = await service.create(base, CREATOR);
    await service.vote(GUILD, poll.id, voter(1), ["2"]);
    await expect(service.close(GUILD, poll.id, { ...CREATOR, userId: "300000000000000009" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const closed = await service.close(GUILD, poll.id, CREATOR);
    expect(closed).toMatchObject({ status: "CLOSED", closedById: CREATOR.userId });
    expect(gateway.edits.at(-1)?.buttonRows).toEqual([]);
    const results = gateway.posts.at(-1);
    expect(results?.replyTo).toBe(poll.messageId);
    expect(results?.message.embed.fields[0]).toMatchObject({ name: "Winner", value: "🌮 Tacos" });
    await expect(service.vote(GUILD, poll.id, voter(2), ["1"])).rejects.toThrow(/closed/);
    await expect(service.close(GUILD, poll.id, STAFF)).rejects.toMatchObject({ code: "INVALID_STATE" });
    const reopened = await service.reopen(GUILD, poll.id, STAFF, undefined, 30);
    expect(reopened.status).toBe("OPEN");
    await service.vote(GUILD, poll.id, voter(2), ["1"]);
  });

  it("closes ended polls on the timer", async () => {
    const { service, advance, gateway } = setup();
    await service.create({ ...base, durationMinutes: 10 }, CREATOR);
    await service.create(base, CREATOR);
    advance(5);
    expect(await service.sweepEnded()).toBe(0);
    advance(6);
    expect(await service.sweepEnded()).toBe(1);
    expect(gateway.posts.at(-1)?.message.embed.title).toBe("Poll #1 results");
    const list = await service.list(GUILD);
    expect(list.map((poll) => [poll.number, poll.status, poll.closedById])).toEqual([[2, "OPEN", undefined], [1, "CLOSED", "0"]]);
  });

  it("exports CSV and deletes only with polls.manage", async () => {
    const { service, gateway } = setup();
    const poll = await service.create({ ...base, options: [{ label: "=cmd" }, { label: "Yes, sure" }] }, CREATOR);
    await service.vote(GUILD, poll.id, { userId: "200000000000000001", displayName: 'Al "Ace"', roleIds: [] }, ["2"]);
    await expect(service.exportCsv(GUILD, poll.id, CREATOR)).rejects.toMatchObject({ code: "FORBIDDEN" });
    const file = await service.exportCsv(GUILD, poll.id, STAFF);
    expect(file.fileName).toBe("poll-1-results.csv");
    expect(file.content.split("\n").slice(0, 3)).toEqual(["option,label,votes", "1,'=cmd,0", '2,"Yes, sure",1']);
    expect(file.content).toContain('200000000000000001,"Al ""Ace""","Yes, sure",2026-09-25T12:00:00.000Z');
    await expect(service.delete(GUILD, poll.id, CREATOR)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await service.delete(GUILD, poll.id, STAFF);
    expect(gateway.deleted).toEqual([poll.messageId]);
    await expect(service.get(GUILD, poll.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("parses durations and option emojis", () => {
    expect(["10m", "2h", "3 days", "1w", "45", "0", "soon"].map(parseDuration)).toEqual([10, 120, 4320, 10080, 45, undefined, undefined]);
    expect(["🍕 Pizza", "1️⃣ First", "<:qbox:123456789012345678> Qbox", "👍🏽 Yes", "Plain text", "10 cats"].map(splitOptionText)).toEqual([
      { label: "Pizza", emoji: "🍕" },
      { label: "First", emoji: "1️⃣" },
      { label: "Qbox", emoji: "<:qbox:123456789012345678>" },
      { label: "Yes", emoji: "👍🏽" },
      { label: "Plain text" },
      { label: "10 cats" },
    ]);
  });
});

describe("DiscordRestPollGateway", () => {
  it("sends embeds, buttons, select menus, and role pings", async () => {
    const calls: { route: string; body: unknown }[] = [];
    const record = async (route: string, options?: { body?: unknown }) => {
      calls.push({ route, body: options?.body });
      return { id: "900000000000000001" };
    };
    const gateway = new DiscordRestPollGateway({ get: record, post: record, patch: record, put: record, delete: record });
    const { service } = setup();
    const poll = await service.create({ ...base, maxChoices: 2, pingRoleId: ROLE }, CREATOR);
    await gateway.postMessage(CHANNEL, pollMessage(poll, { voters: 0, counts: {} }), "800000000000000001");
    const body = calls[0]?.body as { components: { components: { type: number; max_values?: number; emoji?: unknown }[] }[]; allowed_mentions: unknown; message_reference: unknown };
    expect(calls[0]?.route).toBe(`/channels/${CHANNEL}/messages`);
    expect(body.components[0]?.components[0]).toMatchObject({ type: 3, max_values: 2 });
    expect(body.components[1]?.components[0]).toMatchObject({ type: 2 });
    expect(body.allowed_mentions).toEqual({ parse: [], roles: [ROLE] });
    expect(body.message_reference).toEqual({ message_id: "800000000000000001", fail_if_not_exists: false });
  });
});
