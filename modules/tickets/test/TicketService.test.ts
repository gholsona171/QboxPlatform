import { describe, expect, it } from "vitest";

import {
  DiscordRestTicketGateway,
  InMemoryTicketRepository,
  TicketService,
  defaultTicketSettings,
  type DiscordRestClient,
  type DiscordRestRequest,
  type TicketAccessInput,
  type TicketActor,
  type TicketCloseSpaceInput,
  type TicketDirectMessage,
  type TicketDiscordGateway,
  type TicketNotice,
  type TicketOpeningMessage,
  type TicketPanelPublishInput,
  type TicketSettingsInput,
  type TicketSpaceInput,
  type TicketTranscriptPost,
} from "../src/index.js";

const GUILD = "100000000000000001";
const USER = "200000000000000001";
const OTHER_USER = "200000000000000002";
const STAFF = "300000000000000001";
const STAFF_2 = "300000000000000002";
const SUPPORT_ROLE = "400000000000000001";
const VIP_ROLE = "400000000000000002";
const CATEGORY_CHANNEL = "500000000000000001";
const CLOSED_CATEGORY = "500000000000000002";
const TRANSCRIPTS = "500000000000000003";
const LOGS = "500000000000000004";
const PANEL_CHANNEL = "500000000000000005";

class FakeGateway implements TicketDiscordGateway {
  public readonly spaces: TicketSpaceInput[] = [];
  public readonly openings: TicketOpeningMessage[] = [];
  public readonly notices: TicketNotice[] = [];
  public readonly access: TicketAccessInput[] = [];
  public readonly closed: TicketCloseSpaceInput[] = [];
  public readonly transcripts: TicketTranscriptPost[] = [];
  public readonly dms: TicketDirectMessage[] = [];
  public readonly panels: TicketPanelPublishInput[] = [];
  public failCreate = false;
  private channel = 600000000000000000n;

  public async createTicketSpace(input: TicketSpaceInput) {
    if (this.failCreate) throw new Error("Missing Permissions");
    this.spaces.push(input);
    this.channel += 1n;
    return { channelId: String(this.channel) };
  }
  public async postOpening(input: TicketOpeningMessage) { this.openings.push(input); }
  public async postNotice(input: TicketNotice) { this.notices.push(input); return { messageId: "700000000000000001" }; }
  public async setAccess(input: TicketAccessInput) { this.access.push(input); }
  public async closeSpace(input: TicketCloseSpaceInput) { this.closed.push(input); }
  public async reopenSpace() {}
  public async deleteSpace() {}
  public async renameSpace() {}
  public async publishPanel(input: TicketPanelPublishInput) { this.panels.push(input); return { messageId: "800000000000000001" }; }
  public async deletePanelMessage() {}
  public async postTranscript(input: TicketTranscriptPost) { this.transcripts.push(input); return { messageId: "900000000000000001" }; }
  public async directMessage(input: TicketDirectMessage) { this.dms.push(input); return true; }
}

function actor(userId: string, roleIds: readonly string[] = [], elevated = false): TicketActor {
  return { userId, displayName: `user-${userId.slice(-2)}`, roleIds, elevated, source: "DISCORD" };
}

function settingsInput(overrides: Partial<TicketSettingsInput> = {}): TicketSettingsInput {
  const { nextNumber: _n, revision: _r, ...defaults } = defaultTicketSettings(GUILD);
  return {
    ...defaults,
    enabled: true,
    openCategoryChannelId: CATEGORY_CHANNEL,
    closedCategoryChannelId: CLOSED_CATEGORY,
    transcriptChannelId: TRANSCRIPTS,
    logChannelId: LOGS,
    supportRoleIds: [SUPPORT_ROLE],
    source: "WEB",
    ...overrides,
  };
}

async function setup(overrides: Partial<TicketSettingsInput> = {}) {
  let clock = new Date("2026-09-25T12:00:00.000Z");
  const now = () => clock;
  const repository = new InMemoryTicketRepository(now);
  const gateway = new FakeGateway();
  const service = new TicketService(repository, gateway, now);
  await service.saveSettings(settingsInput(overrides));
  return { repository, gateway, service, advance: (hours: number) => { clock = new Date(clock.getTime() + hours * 3600_000); } };
}

describe("TicketService settings", () => {
  it("returns disabled defaults before setup", async () => {
    const service = new TicketService(new InMemoryTicketRepository());
    const settings = await service.settings(GUILD);
    expect(settings.enabled).toBe(false);
    expect(settings.maxOpenPerUser).toBe(1);
  });

  it("rejects stale revisions and invalid values", async () => {
    const { service } = await setup();
    await expect(service.saveSettings(settingsInput({ expectedRevision: 0 }))).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(service.saveSettings(settingsInput({ embedColor: "blue" }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.saveSettings(settingsInput({ autoCloseHours: 24, autoCloseWarningHours: 24 }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.saveSettings(settingsInput({ mode: "THREAD" }))).rejects.toThrow(/parent channel/);
  });
});

describe("TicketService opening", () => {
  it("creates a private channel, posts the opening message, and logs", async () => {
    const { service, gateway } = await setup();
    const category = await service.saveCategory({
      guildId: GUILD,
      name: "Ban Appeal",
      buttonStyle: "DANGER",
      enabled: true,
      supportRoleIds: [VIP_ROLE],
      defaultPriority: "HIGH",
      nameTemplate: "appeal-{number}-{username}",
      questions: [{ id: "ban-reason", label: "Why were you banned?", style: "PARAGRAPH", required: true }],
      requiredRoleIds: [],
    });
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER), categoryId: category.id, answers: { "ban-reason": "Mistake" } });
    expect(ticket.number).toBe(1);
    expect(ticket.priority).toBe("HIGH");
    expect(ticket.channelId).toBeDefined();
    expect(gateway.spaces[0]).toMatchObject({ name: "appeal-1-user-01", parentChannelId: CATEGORY_CHANNEL, supportRoleIds: [SUPPORT_ROLE, VIP_ROLE] });
    expect(gateway.openings[0]?.body).toContain("Mistake");
    expect(gateway.openings[0]?.mentionRoleIds).toEqual([SUPPORT_ROLE, VIP_ROLE]);
    expect(gateway.notices.some((notice) => notice.channelId === LOGS)).toBe(true);
  });

  it("enforces enablement, blocks, required roles, answers, and limits", async () => {
    const { service } = await setup({ blockedUserIds: [OTHER_USER], maxOpenPerUser: 1 });
    await expect(service.openTicket({ guildId: GUILD, actor: actor(OTHER_USER) })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const vip = await service.saveCategory({
      guildId: GUILD, name: "VIP", buttonStyle: "PRIMARY", enabled: true, supportRoleIds: [], defaultPriority: "NORMAL",
      questions: [{ id: "details", label: "Details", style: "SHORT", required: true }], requiredRoleIds: [VIP_ROLE],
    });
    await expect(service.openTicket({ guildId: GUILD, actor: actor(USER), categoryId: vip.id, answers: { details: "x" } })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(service.openTicket({ guildId: GUILD, actor: actor(USER, [VIP_ROLE]), categoryId: vip.id })).rejects.toThrow(/Details/);
    await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    await expect(service.openTicket({ guildId: GUILD, actor: actor(USER) })).rejects.toMatchObject({ code: "LIMIT_REACHED" });
  });

  it("closes the record when Discord channel creation fails", async () => {
    const { service, gateway, repository } = await setup();
    gateway.failCreate = true;
    await expect(service.openTicket({ guildId: GUILD, actor: actor(USER) })).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE" });
    expect([...repository.tickets.values()][0]?.status).toBe("CLOSED");
    expect(await repository.countActiveTickets(GUILD, USER)).toBe(0);
  });

  it("rejects when tickets are disabled", async () => {
    const { service } = await setup({ enabled: false });
    await expect(service.openTicket({ guildId: GUILD, actor: actor(USER) })).rejects.toMatchObject({ code: "DISABLED" });
  });
});

describe("TicketService staff actions", () => {
  it("claims, blocks double claims, restricts replies, and unclaims", async () => {
    const { service, gateway } = await setup({ claimRestrictsReplies: true });
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    await expect(service.claim(GUILD, ticket.id, actor(USER))).rejects.toMatchObject({ code: "FORBIDDEN" });
    const claimed = await service.claim(GUILD, ticket.id, actor(STAFF, [SUPPORT_ROLE]));
    expect(claimed).toMatchObject({ status: "CLAIMED", claimedById: STAFF });
    expect(claimed.firstResponseAt).toBeDefined();
    expect(gateway.access).toContainEqual(expect.objectContaining({ targetType: "ROLE", targetId: SUPPORT_ROLE, access: "READ_ONLY" }));
    await expect(service.claim(GUILD, ticket.id, actor(STAFF_2, [SUPPORT_ROLE]))).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(service.unclaim(GUILD, ticket.id, actor(STAFF_2, [SUPPORT_ROLE]))).rejects.toMatchObject({ code: "FORBIDDEN" });
    const released = await service.unclaim(GUILD, ticket.id, actor(STAFF, [SUPPORT_ROLE]));
    expect(released.status).toBe("OPEN");
    expect(released.claimedById).toBeUndefined();
  });

  it("adds and removes members, sets priority, tags, and pending state", async () => {
    const { service, gateway } = await setup();
    const staff = actor(STAFF, [SUPPORT_ROLE]);
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    const added = await service.addParticipant(GUILD, ticket.id, staff, OTHER_USER);
    expect(added.participantIds).toEqual([OTHER_USER]);
    await expect(service.removeParticipant(GUILD, ticket.id, staff, USER)).rejects.toMatchObject({ code: "INVALID_STATE" });
    expect((await service.removeParticipant(GUILD, ticket.id, staff, OTHER_USER)).participantIds).toEqual([]);
    expect(gateway.access.filter((item) => item.targetId === OTHER_USER).map((item) => item.access)).toEqual(["FULL", "NONE"]);
    expect((await service.setPriority(GUILD, ticket.id, staff, "URGENT")).priority).toBe("URGENT");
    expect((await service.setTags(GUILD, ticket.id, staff, ["Billing", "billing", " refund "])).tags).toEqual(["billing", "refund"]);
    expect((await service.setPending(GUILD, ticket.id, staff, true)).status).toBe("PENDING");
    await service.recordMessage({ channelId: ticket.channelId ?? "", discordMessageId: "710000000000000001", authorId: USER, authorName: "user", authorRoleIds: [], content: "here", attachments: [] });
    expect((await service.ticket(GUILD, ticket.id)).status).toBe("OPEN");
  });

  it("keeps internal notes out of the requester transcript", async () => {
    const { service } = await setup();
    const staff = actor(STAFF, [SUPPORT_ROLE]);
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    await service.recordMessage({ channelId: ticket.channelId ?? "", discordMessageId: "710000000000000002", authorId: STAFF, authorName: "staff", authorRoleIds: [SUPPORT_ROLE], content: "Hello!", attachments: ["https://cdn.example/a.png"] });
    await service.addNote(GUILD, ticket.id, staff, "Known troublemaker");
    const staffCopy = await service.transcript(GUILD, ticket.id, true);
    const publicCopy = await service.transcript(GUILD, ticket.id, false);
    expect(staffCopy.content).toContain("[internal note]");
    expect(publicCopy.content).not.toContain("Known troublemaker");
    expect(publicCopy.content).toContain("attachment: https://cdn.example/a.png");
    expect((await service.ticket(GUILD, ticket.id)).firstResponseAt).toBeDefined();
  });
});

describe("TicketService closing", () => {
  it("closes with transcript, DM feedback, access revocation, and archive move", async () => {
    const { service, gateway } = await setup({ transcriptDmUser: true });
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    const closed = await service.close(GUILD, ticket.id, actor(USER), "Solved");
    expect(closed).toMatchObject({ status: "CLOSED", closeReason: "Solved", transcriptMessageId: "900000000000000001" });
    expect(gateway.transcripts[0]?.file.fileName).toBe("ticket-1-transcript.txt");
    expect(gateway.dms[0]).toMatchObject({ userId: USER, feedbackTicketId: ticket.id });
    expect(gateway.access).toContainEqual(expect.objectContaining({ targetId: USER, access: "READ_ONLY" }));
    expect(gateway.closed[0]).toMatchObject({ action: "ARCHIVE", closedParentChannelId: CLOSED_CATEGORY });
    await expect(service.close(GUILD, ticket.id, actor(USER))).rejects.toMatchObject({ code: "INVALID_STATE" });
  });

  it("respects user-close and close-reason settings", async () => {
    const { service } = await setup({ allowUserClose: false, requireCloseReason: true });
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    await expect(service.close(GUILD, ticket.id, actor(USER), "done")).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(service.close(GUILD, ticket.id, actor(STAFF, [SUPPORT_ROLE]))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect((await service.close(GUILD, ticket.id, actor(STAFF, [SUPPORT_ROLE]), "Resolved")).status).toBe("CLOSED");
  });

  it("clears the channel when the close action deletes it", async () => {
    const { service } = await setup({ closeAction: "DELETE" });
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    const closed = await service.close(GUILD, ticket.id, actor(STAFF, [SUPPORT_ROLE]));
    expect(closed.channelId).toBeUndefined();
    await expect(service.reopen(GUILD, ticket.id, actor(STAFF, [SUPPORT_ROLE]))).rejects.toThrow(/deleted/);
  });

  it("reopens archived tickets and accepts opener ratings", async () => {
    const { service } = await setup();
    const staff = actor(STAFF, [SUPPORT_ROLE]);
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    await service.close(GUILD, ticket.id, staff);
    await expect(service.rate(ticket.id, OTHER_USER, 5)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect((await service.rate(ticket.id, USER, 4, "Quick help")).rating).toBe(4);
    await expect(service.rate(ticket.id, USER, 9)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect((await service.reopen(GUILD, ticket.id, staff)).status).toBe("OPEN");
  });

  it("closes tickets whose channel was deleted", async () => {
    const { service } = await setup();
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    await service.handleChannelDeleted(ticket.channelId ?? "");
    const updated = await service.ticket(GUILD, ticket.id);
    expect(updated).toMatchObject({ status: "CLOSED", closeReason: "Ticket channel was deleted." });
    expect(updated.channelId).toBeUndefined();
  });

  it("warns and then auto-closes inactive tickets", async () => {
    const { service, advance, gateway } = await setup({ autoCloseHours: 48, autoCloseWarningHours: 12 });
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    advance(30);
    expect(await service.sweepAutoClose()).toEqual({ warned: 0, closed: 0 });
    advance(7);
    expect(await service.sweepAutoClose()).toEqual({ warned: 1, closed: 0 });
    expect(gateway.notices.at(-1)?.content).toContain("close automatically");
    advance(12);
    expect(await service.sweepAutoClose()).toEqual({ warned: 0, closed: 1 });
    expect((await service.ticket(GUILD, ticket.id)).closeReason).toContain("48 hours");
  });
});

describe("TicketService panels", () => {
  it("validates categories and publishes panels", async () => {
    const { service, gateway } = await setup();
    const general = await service.saveCategory({ guildId: GUILD, name: "General", buttonStyle: "PRIMARY", enabled: true, supportRoleIds: [], defaultPriority: "NORMAL", questions: [], requiredRoleIds: [] });
    await expect(service.saveCategory({ guildId: GUILD, name: "general", buttonStyle: "PRIMARY", enabled: true, supportRoleIds: [], defaultPriority: "NORMAL", questions: [], requiredRoleIds: [] })).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(service.savePanel({ guildId: GUILD, name: "Main", channelId: PANEL_CHANNEL, title: "Support", description: "Open a ticket", color: "#5865F2", style: "BUTTONS", placeholder: "Pick", categoryIds: ["missing"] })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    const panel = await service.savePanel({ guildId: GUILD, name: "Main", channelId: PANEL_CHANNEL, title: "Support", description: "Open a ticket", color: "5865f2", style: "BUTTONS", placeholder: "Pick", categoryIds: [general.id] });
    const published = await service.publishPanel(GUILD, panel.id);
    expect(published.messageId).toBe("800000000000000001");
    expect(gateway.panels[0]?.categories.map((category) => category.name)).toEqual(["General"]);
  });
});

describe("DiscordRestTicketGateway", () => {
  class RecordingRest implements DiscordRestClient {
    public readonly calls: { method: string; route: string; options?: DiscordRestRequest | undefined }[] = [];
    private record(method: string, route: string, options?: DiscordRestRequest) {
      this.calls.push({ method, route, options });
      return Promise.resolve(route === "/users/@me" ? { id: "999999999999999999" } : { id: "123456789012345678" });
    }
    public get(route: `/${string}`, options?: DiscordRestRequest) { return this.record("GET", route, options); }
    public post(route: `/${string}`, options?: DiscordRestRequest) { return this.record("POST", route, options); }
    public patch(route: `/${string}`, options?: DiscordRestRequest) { return this.record("PATCH", route, options); }
    public put(route: `/${string}`, options?: DiscordRestRequest) { return this.record("PUT", route, options); }
    public delete(route: `/${string}`, options?: DiscordRestRequest) { return this.record("DELETE", route, options); }
  }

  it("creates private channels that hide the ticket from everyone", async () => {
    const rest = new RecordingRest();
    const gateway = new DiscordRestTicketGateway(rest);
    await gateway.createTicketSpace({ guildId: GUILD, mode: "CHANNEL", parentChannelId: CATEGORY_CHANNEL, name: "ticket-1", openerId: USER, supportRoleIds: [SUPPORT_ROLE], topic: "t" });
    const create = rest.calls.find((call) => call.route === `/guilds/${GUILD}/channels`);
    const overwrites = (create?.options?.body as { permission_overwrites: { id: string; deny: string; allow: string }[] }).permission_overwrites;
    expect(overwrites.find((item) => item.id === GUILD)?.deny).toBe(String(1n << 10n));
    expect(overwrites.map((item) => item.id)).toEqual([GUILD, USER, SUPPORT_ROLE, "999999999999999999"]);
  });

  it("creates private threads and adds the opener", async () => {
    const rest = new RecordingRest();
    await new DiscordRestTicketGateway(rest).createTicketSpace({ guildId: GUILD, mode: "THREAD", parentChannelId: PANEL_CHANNEL, name: "ticket-1", openerId: USER, supportRoleIds: [], topic: "t" });
    expect(rest.calls.map((call) => `${call.method} ${call.route}`)).toEqual([
      `POST /channels/${PANEL_CHANNEL}/threads`,
      `PUT /channels/123456789012345678/thread-members/${USER}`,
    ]);
  });

  it("renders panels as button rows or a select menu", async () => {
    const rest = new RecordingRest();
    const gateway = new DiscordRestTicketGateway(rest);
    const categories = Array.from({ length: 7 }, (_, index) => ({
      id: `cat-${index}`, guildId: GUILD, name: `Type ${index}`, buttonStyle: "PRIMARY" as const, enabled: true, position: index,
      supportRoleIds: [], defaultPriority: "NORMAL" as const, questions: [], requiredRoleIds: [], emoji: "<:qb:123456789012345678>",
    }));
    const panel = { id: "p", guildId: GUILD, name: "Main", channelId: PANEL_CHANNEL, title: "Support", description: "d", color: "#5865F2", style: "BUTTONS" as const, placeholder: "Pick", categoryIds: [] };
    await gateway.publishPanel({ panel, categories });
    const buttons = (rest.calls[0]?.options?.body as { components: { components: { custom_id: string; emoji: { id: string } }[] }[] }).components;
    expect(buttons.map((row) => row.components.length)).toEqual([5, 2]);
    expect(buttons[0]?.components[0]).toMatchObject({ custom_id: "qbox:ticket:open:cat-0", emoji: { id: "123456789012345678" } });
    await gateway.publishPanel({ panel: { ...panel, style: "SELECT_MENU" }, categories });
    const select = (rest.calls[1]?.options?.body as { components: { components: { type: number; options: unknown[] }[] }[] }).components[0]?.components[0];
    expect(select).toMatchObject({ type: 3 });
    expect(select?.options).toHaveLength(7);
  });

  it("sets read-only overwrites and schedules delayed deletes", async () => {
    const rest = new RecordingRest();
    const scheduled: number[] = [];
    const gateway = new DiscordRestTicketGateway(rest, (_callback, delay) => scheduled.push(delay));
    await gateway.setAccess({ guildId: GUILD, channelId: PANEL_CHANNEL, mode: "CHANNEL", targetType: "USER", targetId: USER, access: "READ_ONLY" });
    expect(rest.calls[0]).toMatchObject({ method: "PUT", options: { body: { type: 1, deny: String((1n << 11n) | (1n << 6n) | (1n << 15n)) } } });
    await gateway.closeSpace({ guildId: GUILD, channelId: PANEL_CHANNEL, mode: "CHANNEL", action: "DELETE", deleteDelaySeconds: 10 });
    expect(scheduled).toEqual([10_000]);
  });
});
