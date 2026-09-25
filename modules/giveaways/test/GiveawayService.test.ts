import { describe, expect, it } from "vitest";
import type { MessageTemplates, TemplateValues } from "@qbox/shared/messages";

import {
  DiscordRestGiveawayGateway,
  GiveawayService,
  InMemoryGiveawayRepository,
  accountCreatedAt,
  drawWinners,
  giveawayMessage,
  type GiveawayActor,
  type GiveawayEntrant,
  type GiveawayGateway,
  type GiveawayMessage,
  type GiveawayStartInput,
} from "../src/index.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";
const VIP = "400000000000000001";
const BOOSTER = "400000000000000002";
const MUTED = "400000000000000003";
const STAFF: GiveawayActor = { userId: "300000000000000001", displayName: "Jay" };
/** A snowflake created in 2021, so the account is years old. */
const OLD_USER = "800000000000000000";
const member = (userId: string, roleIds: string[] = [], joinedDaysAgo = 400): GiveawayEntrant => ({
  userId,
  displayName: `Member ${userId.slice(-2)}`,
  roleIds,
  joinedAt: new Date(Date.parse("2026-09-25T12:00:00.000Z") - joinedDaysAgo * 86_400_000),
});

class FakeGateway implements GiveawayGateway {
  public readonly posts: { message: GiveawayMessage; replyTo?: string | undefined }[] = [];
  public readonly edits: GiveawayMessage[] = [];
  public readonly dms: string[] = [];
  public failPost = false;

  public async guildName() { return "Guildhall HQ"; }
  public async postMessage(_c: string, message: GiveawayMessage, replyTo?: string) {
    if (this.failPost) throw new Error("Missing Access");
    this.posts.push({ message, replyTo });
    return { messageId: `70000000000000000${this.posts.length}` };
  }
  public async editMessage(_c: string, _m: string, message: GiveawayMessage) { this.edits.push(message); }
  public async directMessage(userId: string) { this.dms.push(userId); return true; }
}

/** Always picks the first remaining ticket. */
const firstTicket = () => 0;

/** Records every template request and answers with a marked message. */
function markedTemplates(seen: { key: string; values: TemplateValues }[]): MessageTemplates {
  return { apply: async (_guildId, key, values) => { seen.push({ key, values }); return { content: `custom ${key}` }; } };
}

function setup(random = firstTicket, templates?: MessageTemplates) {
  let clock = new Date("2026-09-25T12:00:00.000Z");
  const now = () => clock;
  const gateway = new FakeGateway();
  const repository = new InMemoryGiveawayRepository(now);
  const service = new GiveawayService(repository, gateway, now, { refreshDelayMs: 0, random, templates });
  return { service, gateway, repository, advance: (minutes: number) => { clock = new Date(clock.getTime() + minutes * 60_000); } };
}

const base: GiveawayStartInput = { guildId: GUILD, prize: "Nitro", channelId: CHANNEL, durationMinutes: 60 };

describe("GiveawayService", () => {
  it("starts a numbered giveaway with an Enter button and role ping", async () => {
    const { service, gateway } = setup();
    const giveaway = await service.start({ ...base, pingRoleId: VIP, winnerCount: 2, bonusEntries: [{ roleId: BOOSTER, entries: 2 }] }, STAFF);
    expect(giveaway).toMatchObject({ number: 1, status: "RUNNING", hostId: STAFF.userId, messageId: "700000000000000001", dmWinners: true });
    const message = gateway.posts[0]?.message;
    expect(message?.content).toBe(`<@&${VIP}>`);
    expect(message?.enterButton?.customId).toBe(`qbox:giveaways:enter:${giveaway.id}`);
    expect(message?.embeds?.[0]?.fields?.map((field) => field.name)).toEqual(["Number of winners", "Entries", "Bonus entries"]);
  });

  it("validates input and rolls back when the message cannot be posted", async () => {
    const { service, gateway, repository } = setup();
    await expect(service.start({ ...base, durationMinutes: undefined }, STAFF)).rejects.toThrow(/end time or a duration/);
    await expect(service.start({ ...base, winnerCount: 0 }, STAFF)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.start({ ...base, requiredRoleIds: [VIP], blockedRoleIds: [VIP] }, STAFF)).rejects.toThrow(/both required and blocked/);
    await expect(service.start({ ...base, bonusEntries: [{ roleId: VIP, entries: 1 }, { roleId: VIP, entries: 2 }] }, STAFF)).rejects.toThrow(/once/);
    gateway.failPost = true;
    await expect(service.start(base, STAFF)).rejects.toMatchObject({ code: "INVALID_STATE" });
    expect(repository.giveaways).toHaveLength(0);
  });

  it("toggles entries, applies bonus entries, and checks requirements", async () => {
    const { service, repository } = setup();
    const giveaway = await service.start({ ...base, requiredRoleIds: [VIP, BOOSTER], blockedRoleIds: [MUTED], minAccountAgeDays: 30, minServerDays: 7, bonusEntries: [{ roleId: BOOSTER, entries: 3 }] }, STAFF);
    expect(await service.toggleEntry(GUILD, "1", member(OLD_USER, [VIP, BOOSTER]))).toEqual({ entered: true, entries: 4 });
    expect(await service.toggleEntry(GUILD, "#1", member(OLD_USER, [VIP, BOOSTER]))).toEqual({ entered: false, entries: 0 });
    await expect(service.toggleEntry(GUILD, giveaway.id, member(OLD_USER))).rejects.toThrow(/role needed/);
    await expect(service.toggleEntry(GUILD, giveaway.id, member(OLD_USER, [VIP, MUTED]))).rejects.toThrow(/cannot enter/);
    await expect(service.toggleEntry(GUILD, giveaway.id, member(OLD_USER, [VIP], 2))).rejects.toThrow(/at least 7 days/);
    const fresh = String((BigInt(Date.parse("2026-09-20T00:00:00.000Z") - 1_420_070_400_000) << 22n));
    expect(accountCreatedAt(fresh).toISOString()).toBe("2026-09-20T00:00:00.000Z");
    await expect(service.toggleEntry(GUILD, giveaway.id, member(fresh, [VIP]))).rejects.toThrow(/30 days old/);
    await service.toggleEntry(GUILD, giveaway.id, member(OLD_USER, [VIP]));
    expect(repository.entries).toHaveLength(1);
    const detail = await service.detail(GUILD, giveaway.id);
    expect(detail.totalEntries).toBe(1);
  });

  it("draws weighted winners at the end time, announces them, and DMs them", async () => {
    const { service, gateway, advance } = setup();
    const giveaway = await service.start({ ...base, winnerCount: 2 }, STAFF);
    for (const id of ["800000000000000001", "800000000000000002", "800000000000000003"]) await service.toggleEntry(GUILD, giveaway.id, member(id));
    advance(59);
    expect(await service.sweepDue()).toBe(0);
    advance(2);
    expect(await service.sweepDue()).toBe(1);
    const ended = await service.get(GUILD, giveaway.id);
    expect(ended).toMatchObject({ status: "ENDED", winnerIds: ["800000000000000001", "800000000000000002"], endedById: "0" });
    expect(gateway.posts.at(-1)?.message.content).toContain("Congratulations: <@800000000000000001>, <@800000000000000002>!");
    expect(gateway.posts.at(-1)?.replyTo).toBe(giveaway.messageId);
    expect(gateway.posts.at(-1)?.message.mentionUserIds).toEqual(["800000000000000001", "800000000000000002"]);
    expect(gateway.dms).toEqual(["800000000000000001", "800000000000000002"]);
    expect(gateway.edits.at(-1)?.enterButton).toBeUndefined();
    await expect(service.toggleEntry(GUILD, giveaway.id, member("800000000000000004"))).rejects.toThrow(/ended/);

    const rerolled = await service.reroll(GUILD, giveaway.id, 1);
    expect(rerolled.winnerIds).toEqual(["800000000000000003"]);
    expect(gateway.posts.at(-1)?.message.content).toContain("New winner: <@800000000000000003>");
    await expect(service.reroll(GUILD, giveaway.id, 1)).resolves.toMatchObject({ winnerIds: ["800000000000000001"] });
  });

  it("ends early with no entries, cancels, and pauses the timer", async () => {
    const { service, gateway, advance } = setup();
    const empty = await service.start(base, STAFF);
    const ended = await service.end(GUILD, empty.id, STAFF);
    expect(ended).toMatchObject({ status: "ENDED", winnerIds: [], endedById: STAFF.userId });
    expect(gateway.posts.at(-1)?.message.content).toContain("no valid entries");
    await expect(service.reroll(GUILD, empty.id)).rejects.toThrow(/nobody else/);
    await expect(service.end(GUILD, empty.id, STAFF)).rejects.toMatchObject({ code: "INVALID_STATE" });

    const paused = await service.pause(GUILD, (await service.start(base, STAFF)).id);
    expect(paused.status).toBe("PAUSED");
    await expect(service.toggleEntry(GUILD, paused.id, member(OLD_USER))).rejects.toThrow(/paused/);
    advance(120);
    expect(await service.sweepDue()).toBe(0);
    const resumed = await service.resume(GUILD, paused.id);
    expect(resumed.endsAt.toISOString()).toBe("2026-09-25T15:00:00.000Z");
    const cancelled = await service.cancel(GUILD, paused.id, STAFF);
    expect(cancelled.status).toBe("CANCELLED");
    expect(gateway.edits.at(-1)?.embeds?.[0]?.title).toBe("🎉 Nitro (cancelled)");
    expect((await service.list(GUILD, "ended")).map((item) => item.number)).toEqual([2, 1]);
    expect(await service.list(GUILD, "active")).toEqual([]);
  });
});

describe("GiveawayService message templates", () => {
  it("posts the built-in giveaway and winner messages when nothing is customized", async () => {
    const { service, gateway, advance } = setup();
    const giveaway = await service.start(base, STAFF);
    expect(gateway.posts[0]?.message).toEqual({
      mentionUserIds: [],
      mentionRoleIds: [],
      embeds: [{
        title: "🎉 Nitro",
        description: `Press **Enter** to join. Press it again to leave.\nEnds <t:1790341200:R> (<t:1790341200:f>)\nHosted by <@${STAFF.userId}>`,
        color: 0xf47fff,
        fields: [{ name: "Number of winners", value: "1", inline: true }, { name: "Entries", value: "0", inline: true }],
        footer: { text: "Giveaway #1" },
      }],
      enterButton: { customId: `qbox:giveaways:enter:${giveaway.id}`, label: "Enter" },
    });
    await service.toggleEntry(GUILD, giveaway.id, member(OLD_USER));
    advance(61);
    await service.sweepDue();
    expect(gateway.posts.at(-1)?.message).toEqual({
      content: `🎉 Congratulations: <@${OLD_USER}>! You won **Nitro**. Contact <@${STAFF.userId}> to claim it.`,
      embeds: undefined,
      mentionUserIds: [OLD_USER],
      mentionRoleIds: [],
    });
  });

  it("posts the server's custom giveaway and winner messages, keeping pings and the Enter button", async () => {
    const seen: { key: string; values: TemplateValues }[] = [];
    const { service, gateway, advance } = setup(firstTicket, markedTemplates(seen));
    const giveaway = await service.start({ ...base, pingRoleId: VIP }, STAFF);
    expect(gateway.posts[0]?.message).toEqual({ content: "custom giveaways.started", embeds: undefined, mentionUserIds: [], mentionRoleIds: [VIP], enterButton: { customId: `qbox:giveaways:enter:${giveaway.id}`, label: "Enter" } });
    expect(seen[0]).toEqual({ key: "giveaways.started", values: { prize: "Nitro", host: `<@${STAFF.userId}>`, entries: 0, server: "Guildhall HQ", winners: 1, endsAt: new Date("2026-09-25T13:00:00.000Z") } });
    await service.toggleEntry(GUILD, giveaway.id, member(OLD_USER));
    expect(gateway.edits.at(-1)?.content).toBe("custom giveaways.started");
    expect(seen.at(-1)?.values.entries).toBe(1);
    advance(61);
    await service.sweepDue();
    expect(gateway.edits.at(-1)?.embeds?.[0]?.title).toBe("🎉 Nitro (ended)");
    expect(gateway.posts.at(-1)?.message).toEqual({ content: "custom giveaways.ended", embeds: undefined, mentionUserIds: [OLD_USER], mentionRoleIds: [] });
    expect(seen.at(-1)).toEqual({ key: "giveaways.ended", values: { prize: "Nitro", host: `<@${STAFF.userId}>`, entries: 1, server: "Guildhall HQ", winners: `<@${OLD_USER}>`, endsAt: new Date("2026-09-25T13:01:00.000Z") } });
  });
});

describe("drawWinners", () => {
  it("never picks the same member twice and respects weights", () => {
    const entries = [{ userId: "a", entries: 1 }, { userId: "b", entries: 3 }, { userId: "c", entries: 0 }];
    expect(drawWinners(entries, 5).sort()).toEqual(["a", "b"]);
    expect(drawWinners(entries, 1, () => 1)).toEqual(["b"]);
    expect(drawWinners(entries, 1, () => 0)).toEqual(["a"]);
    const wins = { a: 0, b: 0 };
    for (let run = 0; run < 2000; run += 1) wins[drawWinners(entries, 1)[0] as "a" | "b"] += 1;
    expect(wins.b).toBeGreaterThan(wins.a * 2);
  });
});

describe("DiscordRestGiveawayGateway", () => {
  it("posts the Enter button and only pings winners and the chosen role", async () => {
    const calls: { route: string; body: unknown }[] = [];
    const record = async (route: string, options?: { body?: unknown }) => {
      calls.push({ route, body: options?.body });
      return { id: "900000000000000001" };
    };
    const gateway = new DiscordRestGiveawayGateway({ get: record, post: record, patch: record, put: record, delete: record });
    const { service } = setup();
    const giveaway = await service.start({ ...base, pingRoleId: VIP }, STAFF);
    await gateway.postMessage(CHANNEL, giveawayMessage(giveaway, 3));
    const body = calls[0]?.body as { components: { components: { custom_id: string }[] }[]; allowed_mentions: unknown };
    expect(body.components[0]?.components[0]?.custom_id).toBe(`qbox:giveaways:enter:${giveaway.id}`);
    expect(body.allowed_mentions).toEqual({ parse: [], users: [], roles: [VIP] });
    expect(await gateway.directMessage(OLD_USER, giveawayMessage(giveaway, 0))).toBe(true);
    expect(calls.map((call) => call.route).slice(1)).toEqual(["/users/@me/channels", "/channels/900000000000000001/messages"]);
  });
});
