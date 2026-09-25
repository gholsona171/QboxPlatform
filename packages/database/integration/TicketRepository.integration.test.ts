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
});
