import { describe, expect, it } from "vitest";

import {
  InMemoryScheduledMessageRepository,
  ScheduledMessageService,
  type OutgoingMessage,
  type ScheduledMessageGateway,
  type ScheduledMessageInput,
} from "../src/index.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";
const ROLE = "400000000000000001";
const STAFF = "300000000000000001";

class FakeGateway implements ScheduledMessageGateway {
  public readonly posts: OutgoingMessage[] = [];
  public readonly calls: string[] = [];
  public failing = false;
  private next = 1;
  public async post(_channelId: string, message: OutgoingMessage) {
    if (this.failing) throw new Error("Missing Permissions");
    this.posts.push(message);
    return { messageId: `70000000000000000${this.next++}` };
  }
  public async deleteMessage(_c: string, messageId: string) { this.calls.push(`delete ${messageId}`); }
  public async pin(_c: string, messageId: string) { this.calls.push(`pin ${messageId}`); }
}

function input(overrides: Partial<ScheduledMessageInput> = {}): ScheduledMessageInput {
  return {
    guildId: GUILD,
    name: "Daily reminder",
    channelId: CHANNEL,
    content: "Vote for the server!",
    pingRoleIds: [ROLE],
    schedule: { type: "DAILY", timeZone: "Europe/London", time: "09:00" },
    enabled: true,
    deletePrevious: false,
    pin: false,
    ...overrides,
  };
}

function setup(start = "2026-09-25T12:00:00.000Z") {
  let clock = new Date(start);
  const now = () => clock;
  const gateway = new FakeGateway();
  const repository = new InMemoryScheduledMessageRepository(now);
  const service = new ScheduledMessageService(repository, gateway, now);
  return { service, gateway, repository, at: (iso: string) => { clock = new Date(iso); } };
}

describe("ScheduledMessageService", () => {
  it("validates messages with readable errors", async () => {
    const { service } = setup();
    await expect(service.create(input({ content: " ", embed: undefined }), STAFF)).rejects.toThrow("Add message text or an embed.");
    await expect(service.create(input({ schedule: { type: "INTERVAL", timeZone: "UTC", intervalMinutes: 5 } }), STAFF)).rejects.toThrow("between 10 and");
    await expect(service.create(input({ schedule: { type: "DAILY", timeZone: "Nowhere/City", time: "09:00" } }), STAFF)).rejects.toThrow("not a time zone");
    await expect(service.create(input({ schedule: { type: "WEEKLY", timeZone: "UTC", time: "09:00", weekdays: [] } }), STAFF)).rejects.toThrow("day of the week");
    await expect(service.create(input({ schedule: { type: "ONCE", timeZone: "UTC", runAt: "2026-01-01T09:00" } }), STAFF)).rejects.toThrow("no future posts");
    const fields = Array.from({ length: 11 }, (_, index) => ({ name: `F${index}`, value: "v", inline: false }));
    await expect(service.create(input({ embed: { title: "Hi", fields } }), STAFF)).rejects.toThrow("at most 10 fields");
    await expect(service.create(input({ embed: { title: "Hi", color: "blue", fields: [] } }), STAFF)).rejects.toThrow("hex color");
  });

  it("creates with the next run, keeps names unique, and pauses and resumes", async () => {
    const { service } = setup();
    const created = await service.create(input({ embed: { title: " Rules ", fields: [{ name: "One", value: "Be kind", inline: true }] } }), STAFF);
    expect(created.nextRunAt?.toISOString()).toBe("2026-09-26T08:00:00.000Z");
    expect(created.embed).toEqual({ title: "Rules", fields: [{ name: "One", value: "Be kind", inline: true }] });
    await expect(service.create(input({ name: "daily REMINDER" }), STAFF)).rejects.toThrow("already called");
    expect((await service.byName(GUILD, "DAILY reminder")).id).toBe(created.id);
    const paused = await service.setEnabled(GUILD, created.id, false);
    expect(paused.nextRunAt).toBeUndefined();
    await expect(service.setEnabled(GUILD, created.id, false)).rejects.toMatchObject({ code: "INVALID_STATE" });
    expect((await service.setEnabled(GUILD, created.id, true)).nextRunAt?.toISOString()).toBe("2026-09-26T08:00:00.000Z");
    const updated = await service.update(GUILD, created.id, input({ content: undefined, embed: { description: "New", fields: [] }, schedule: { type: "ONCE", timeZone: "UTC", runAt: "2026-10-01T10:00" } }));
    expect(updated).toMatchObject({ embed: { description: "New" }, nextRunAt: new Date("2026-10-01T10:00:00.000Z") });
    expect(updated.content).toBeUndefined();
  });

  it("posts due messages once, deletes the previous post, pins, and stops at the maximum", async () => {
    const { service, gateway, repository, at } = setup();
    const created = await service.create(input({ deletePrevious: true, pin: true, maxRuns: 2 }), STAFF);
    expect(await service.runDue()).toEqual({ sent: 0, failed: 0 });
    at("2026-09-26T08:00:30.000Z");
    expect(await service.runDue()).toEqual({ sent: 1, failed: 0 });
    expect(await service.runDue()).toEqual({ sent: 0, failed: 0 });
    expect(gateway.posts[0]).toMatchObject({ content: "Vote for the server!", pingRoleIds: [ROLE] });
    expect(repository.messages[0]).toMatchObject({ runCount: 1, lastMessageId: "700000000000000001", nextRunAt: new Date("2026-09-27T08:00:00.000Z") });
    at("2026-09-27T08:00:00.000Z");
    await service.runDue();
    expect(gateway.calls).toEqual(["pin 700000000000000001", "delete 700000000000000001", "pin 700000000000000002"]);
    expect(repository.messages[0]?.runCount).toBe(2);
    expect(repository.messages[0]?.nextRunAt).toBeUndefined();
    await expect(service.setEnabled(GUILD, created.id, false).then(() => service.setEnabled(GUILD, created.id, true))).rejects.toThrow("maximum number of times");
    expect((await service.runs(GUILD, created.id)).map((run) => run.success)).toEqual([true, true]);
  });

  it("records failures and skips missed posts after downtime", async () => {
    const { service, gateway, at } = setup();
    const created = await service.create(input({ schedule: { type: "INTERVAL", timeZone: "UTC", intervalMinutes: 60 } }), STAFF);
    gateway.failing = true;
    at("2026-09-25T16:30:00.000Z");
    expect(await service.runDue()).toEqual({ sent: 0, failed: 1 });
    const [run] = await service.runs(GUILD);
    expect(run).toMatchObject({ success: false, error: "Missing Permissions", manual: false });
    expect((await service.get(GUILD, created.id)).nextRunAt?.toISOString()).toBe("2026-09-25T17:00:00.000Z");
  });

  it("sends now without changing the schedule", async () => {
    const { service, gateway } = setup();
    const created = await service.create(input(), STAFF);
    const run = await service.sendNow(GUILD, created.id);
    expect(run).toMatchObject({ success: true, manual: true, discordMessageId: "700000000000000001" });
    expect(gateway.posts).toHaveLength(1);
    expect(await service.get(GUILD, created.id)).toMatchObject({ runCount: 0, nextRunAt: created.nextRunAt });
    await service.delete(GUILD, created.id);
    await expect(service.get(GUILD, created.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
