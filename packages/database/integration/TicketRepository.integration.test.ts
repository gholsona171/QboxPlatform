import { PrismaClientFactory } from "@qbox/prisma";
import { TicketService, defaultTicketSettings, type TicketActor, type TicketDiscordGateway } from "@qbox/tickets";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaTicketRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error("DATABASE_URL is required for ticket repository integration tests.");
const databaseName = new URL(databaseUrl).pathname.slice(1);
if (!databaseName.toLowerCase().includes("test"))
  throw new Error(`Refusing ticket cleanup for non-test database '${databaseName}'.`);

const configuration = DatabaseConfiguration.from({ databaseUrl, environment: "test" });
const client = new PrismaClientFactory().create(configuration);
const repository = new PrismaTicketRepository(client);

const guildId = "1257928923048837201";
const opener: TicketActor = { userId: "804859666655739996", displayName: "Opener", roleIds: [], elevated: false, source: "DISCORD" };
const staff: TicketActor = { userId: "804859666655739997", displayName: "Staff", roleIds: ["1262656532902842424"], elevated: false, source: "WEB" };

let channelCounter = 1262656532902842500n;
const gateway: TicketDiscordGateway = {
  guildName: async () => "Qbox",
  createTicketSpace: async () => ({ channelId: String((channelCounter += 1n)) }),
  postOpening: async () => undefined,
  postNotice: async () => ({ messageId: "1432100000000000001" }),
  setAccess: async () => undefined,
  closeSpace: async () => undefined,
  reopenSpace: async () => undefined,
  deleteSpace: async () => undefined,
  renameSpace: async () => undefined,
  publishPanel: async () => ({ messageId: "1432100000000000002" }),
  deletePanelMessage: async () => undefined,
  postTranscript: async () => ({ messageId: "1432100000000000003" }),
  directMessage: async () => true,
};
const service = new TicketService(repository, gateway);

beforeAll(async () => client.$connect());
beforeEach(async () => {
  await client.$executeRawUnsafe('TRUNCATE TABLE "ticket_events", "ticket_messages", "tickets", "ticket_panels", "ticket_categories", "ticket_settings", "guilds" CASCADE');
});
afterAll(async () => client.$disconnect());

async function enable(): Promise<void> {
  const { nextNumber: _n, revision: _r, ...defaults } = defaultTicketSettings(guildId);
  await service.saveSettings({ ...defaults, enabled: true, supportRoleIds: ["1262656532902842424"], transcriptChannelId: "1262656532902842425", source: "WEB" });
}

describe("PrismaTicketRepository", () => {
  it("saves settings with optimistic revisions", async () => {
    await enable();
    const settings = await service.settings(guildId);
    expect(settings).toMatchObject({ enabled: true, revision: 1, supportRoleIds: ["1262656532902842424"] });
    const { nextNumber: _n, revision: _r, ...current } = settings;
    await expect(service.saveSettings({ ...current, expectedRevision: 0, source: "WEB" })).rejects.toMatchObject({ code: "CONFLICT" });
    expect((await service.saveSettings({ ...current, maxOpenPerUser: 3, expectedRevision: 1, source: "WEB" })).revision).toBe(2);
  });

  it("allocates sequential ticket numbers without duplicates", async () => {
    await enable();
    const numbers = await Promise.all(Array.from({ length: 10 }, () => repository.allocateNumber(guildId)));
    expect([...numbers].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("counts tickets per reason independently of the server-wide number", async () => {
    await enable();
    const reason = (name: string) =>
      service.saveCategory({ guildId, name, buttonStyle: "PRIMARY", enabled: true, supportRoleIds: [], alertUserIds: [], defaultPriority: "NORMAL", questions: [], requiredRoleIds: [] });
    const donations = await reason("Donations");
    const appeals = await reason("Appeals");
    const numbers = await Promise.all(Array.from({ length: 5 }, () => repository.allocateCategoryNumber(guildId, donations.id)));
    expect([...numbers].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
    expect(await repository.allocateCategoryNumber(guildId, appeals.id)).toBe(1);
    await expect(repository.allocateCategoryNumber(guildId, "00000000-0000-0000-0000-000000000000")).rejects.toMatchObject({ code: "NOT_FOUND" });
    const ticket = await repository.createTicket({ guildId, number: await repository.allocateNumber(guildId), categoryId: donations.id, categoryNumber: 6, openerId: "1", openerName: "one", answers: [], priority: "NORMAL" });
    expect(ticket.categoryNumber).toBe(6);
    expect((await repository.getTicket(ticket.id))?.categoryNumber).toBe(6);
  });

  it("persists categories with questions, panels, and the full ticket lifecycle", async () => {
    await enable();
    const category = await service.saveCategory({
      guildId,
      name: "Billing",
      description: "Payments and refunds",
      emoji: "💳",
      buttonStyle: "SUCCESS",
      enabled: true,
      supportRoleIds: [],
      alertUserIds: [],
      defaultPriority: "HIGH",
      questions: [{ id: "order", label: "Order ID", style: "SHORT", required: true, maxLength: 40 }],
      requiredRoleIds: [],
    });
    expect((await service.categories(guildId))[0]?.questions[0]?.label).toBe("Order ID");
    const panel = await service.savePanel({ guildId, name: "Main", channelId: "1262656532902842426", title: "Support", description: "Pick one", color: "#57F287", style: "SELECT_MENU", placeholder: "Pick", categoryIds: [category.id] });
    expect((await service.publishPanel(guildId, panel.id)).messageId).toBe("1432100000000000002");

    const ticket = await service.openTicket({ guildId, actor: opener, categoryId: category.id, answers: { order: "A-100" }, subject: "Refund" });
    expect(ticket).toMatchObject({ number: 1, categoryName: "Billing", priority: "HIGH", answers: [{ question: "Order ID", answer: "A-100" }] });
    expect(await repository.findTicketByChannel(ticket.channelId ?? "")).toMatchObject({ id: ticket.id });

    await service.recordMessage({ channelId: ticket.channelId ?? "", discordMessageId: "1432100000000000010", authorId: opener.userId, authorName: "Opener", authorRoleIds: [], content: "Hello", attachments: [] });
    await service.recordMessage({ channelId: ticket.channelId ?? "", discordMessageId: "1432100000000000010", authorId: opener.userId, authorName: "Opener", authorRoleIds: [], content: "Hello", attachments: [] });
    await service.claim(guildId, ticket.id, staff);
    await service.addNote(guildId, ticket.id, staff, "VIP customer");
    await service.setTags(guildId, ticket.id, staff, ["refund"]);
    expect((await service.list({ guildId, search: "refund" })).map((item) => item.id)).toEqual([ticket.id]);
    expect((await service.list({ guildId, search: "#1" })).map((item) => item.id)).toEqual([ticket.id]);

    const closed = await service.close(guildId, ticket.id, staff, "Refunded");
    expect(closed).toMatchObject({ status: "CLOSED", closeReason: "Refunded", transcriptMessageId: "1432100000000000003" });
    await service.rate(ticket.id, opener.userId, 5, "Great");

    const detail = await service.detail(guildId, ticket.id);
    expect(detail.messages.filter((message) => !message.internal)).toHaveLength(1);
    expect(detail.events.map((event) => event.action)).toEqual(expect.arrayContaining(["opened", "claimed", "note-added", "closed", "rated"]));

    const stats = await service.stats(guildId);
    expect(stats).toMatchObject({ closed: 1, total: 1, averageRating: 5, ratingCount: 1, topStaff: [{ userId: staff.userId, closed: 1 }] });
    expect(stats.byCategory[0]).toMatchObject({ name: "Billing", total: 1, open: 0 });
    expect(await repository.listAutoCloseGuilds()).toEqual([]);
  });

  it("keeps tickets when their category is deleted", async () => {
    await enable();
    const category = await service.saveCategory({ guildId, name: "Temp", buttonStyle: "PRIMARY", enabled: true, supportRoleIds: [], alertUserIds: [], defaultPriority: "NORMAL", questions: [], requiredRoleIds: [] });
    const ticket = await service.openTicket({ guildId, actor: opener, categoryId: category.id });
    await service.deleteCategory(guildId, category.id);
    const reloaded = await service.ticket(guildId, ticket.id);
    expect(reloaded.categoryId).toBeUndefined();
    expect(reloaded.status).toBe("OPEN");
  });

  it("stores panel button rows and forgets the message when the panel moves channel", async () => {
    await enable();
    const reason = (name: string) => service.saveCategory({ guildId, name, buttonStyle: "PRIMARY", enabled: true, supportRoleIds: [], alertUserIds: [], defaultPriority: "NORMAL", questions: [], requiredRoleIds: [] });
    const [a, b, c] = [await reason("A"), await reason("B"), await reason("C")].map((item) => item.id) as [string, string, string];
    const input = { guildId, name: "Rows", channelId: "1262656532902842426", title: "Support", description: "Pick", color: "#5865F2", style: "BUTTONS" as const, placeholder: "Pick", categoryIds: [a, b, c] };
    const saved = await service.savePanel({ ...input, rows: [[c], [a, b]] });
    expect(saved.rows).toEqual([[c], [a, b]]);
    expect((await repository.listPanels(guildId)).find((panel) => panel.id === saved.id)?.rows).toEqual([[c], [a, b]]);
    const posted = await service.publishPanel(guildId, saved.id);
    expect(posted).toMatchObject({ messageId: "1432100000000000002", rows: [[c], [a, b]] });
    const automatic = await service.savePanel({ ...input, id: saved.id, rows: null });
    expect(automatic.rows).toBeNull();
    expect(automatic.messageId).toBe("1432100000000000002");
    const moved = await service.savePanel({ ...input, id: saved.id, channelId: "1262656532902842427" });
    expect(moved.messageId).toBeUndefined();
    expect(moved.publishedAt).toBeUndefined();
  });

  it("stores the staff thread, retention, and per-reason staff thread columns", async () => {
    await enable();
    expect(await service.settings(guildId)).toMatchObject({ staffThreadEnabled: true, retentionMonths: 12, transcriptDmUser: true });
    const { nextNumber: _n, revision, ...current } = await service.settings(guildId);
    expect(await service.saveSettings({ ...current, staffThreadEnabled: false, retentionMonths: 9, expectedRevision: revision, source: "WEB" })).toMatchObject({ staffThreadEnabled: false, retentionMonths: 9 });
    // Left out: kept.
    const { staffThreadEnabled: _s, retentionMonths: _r, ...older } = current;
    expect(await service.saveSettings({ ...older, expectedRevision: revision + 1, source: "WEB" })).toMatchObject({ staffThreadEnabled: false, retentionMonths: 9 });
    expect(await repository.listRetentionPolicies()).toEqual([{ guildId, retentionMonths: 9 }]);

    const base = { guildId, buttonStyle: "PRIMARY" as const, enabled: true, supportRoleIds: [], alertUserIds: [], defaultPriority: "NORMAL" as const, questions: [], requiredRoleIds: [] };
    const on = await service.saveCategory({ ...base, name: "Appeals", staffThread: "ON" });
    expect(on.staffThread).toBe("ON");
    expect((await service.saveCategory({ ...base, name: "General" })).staffThread).toBe("INHERIT");
    const { id, position: _p, staffThread: _t, ...rest } = on;
    expect((await service.saveCategory({ ...rest, id })).staffThread).toBe("ON");

    const ticket = await service.openTicket({ guildId, actor: opener, categoryId: on.id });
    const withThread = await repository.updateTicket(ticket.id, { staffThreadId: "1262656532902842499" });
    expect(withThread.staffThreadId).toBe("1262656532902842499");
    expect((await repository.findTicketByStaffThread("1262656532902842499"))?.id).toBe(ticket.id);
    await service.recordMessage({ channelId: "1262656532902842499", discordMessageId: "1432100000000000020", authorId: staff.userId, authorName: "Staff", authorRoleIds: [], content: "staff only", attachments: [] });
    expect((await service.detail(guildId, ticket.id)).messages).toMatchObject([{ internal: true, content: "staff only", source: "DISCORD" }]);
    expect((await repository.updateTicket(ticket.id, { staffThreadId: null })).staffThreadId).toBeUndefined();
    expect(await repository.findTicketByStaffThread("1262656532902842499")).toBeUndefined();
  });

  it("deletes old closed tickets with their messages and events, in batches, and never open ones", async () => {
    await enable();
    const make = async (closedAt?: Date) => {
      const ticket = await repository.createTicket({ guildId, number: await repository.allocateNumber(guildId), openerId: opener.userId, openerName: "Opener", answers: [], priority: "NORMAL" });
      await repository.addMessage({ ticketId: ticket.id, authorId: opener.userId, authorName: "Opener", content: "hi", attachments: [], source: "DISCORD", internal: false });
      await repository.addEvent({ ticketId: ticket.id, action: "opened", actorId: opener.userId, source: "DISCORD", details: {} });
      return closedAt ? repository.updateTicket(ticket.id, { status: "CLOSED", closedAt }) : ticket;
    };
    const old = [await make(new Date("2025-01-01T00:00:00Z")), await make(new Date("2025-02-01T00:00:00Z")), await make(new Date("2025-03-01T00:00:00Z"))];
    const recent = await make(new Date("2026-09-01T00:00:00Z"));
    const open = await make();
    const cutoff = new Date("2025-09-26T00:00:00Z");
    expect(await repository.deleteClosedTickets(guildId, cutoff, 2)).toBe(2);
    expect(await repository.deleteClosedTickets(guildId, cutoff, 2)).toBe(1);
    expect(await repository.deleteClosedTickets(guildId, cutoff, 2)).toBe(0);
    for (const ticket of old) expect(await repository.getTicket(ticket.id)).toBeUndefined();
    expect(await client.ticketMessage.count({ where: { ticketId: { in: old.map((ticket) => ticket.id) } } })).toBe(0);
    expect(await client.ticketEvent.count({ where: { ticketId: { in: old.map((ticket) => ticket.id) } } })).toBe(0);
    expect(await repository.getTicket(recent.id)).toBeDefined();
    expect(await repository.getTicket(open.id)).toBeDefined();
    expect(await client.ticketMessage.count({ where: { ticketId: recent.id } })).toBe(1);
  });
});
