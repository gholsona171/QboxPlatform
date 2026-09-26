import { describe, expect, it, vi } from "vitest";

import {
  DiscordRestTicketGateway,
  InMemoryTicketRepository,
  TicketService,
  defaultTicketSettings,
  type DiscordRestClient,
  type DiscordRestRequest,
  type TicketAccessInput,
  type TicketActor,
  type TicketCategoryInput,
  type TicketCloseSpaceInput,
  type TicketDirectMessage,
  type TicketDiscordGateway,
  type TicketNotice,
  type TicketOpeningMessage,
  type TicketSettingsInput,
  type TicketSpaceInput,
  type TicketStaffThreadInput,
  type TicketTranscriptPost,
} from "../src/index.js";

const GUILD = "100000000000000001";
const USER = "200000000000000001";
const FRIEND = "200000000000000002";
const STAFF = "300000000000000001";
const STAFF_2 = "300000000000000002";
const ALERTED = "300000000000000003";
const SUPPORT_ROLE = "400000000000000001";
const CATEGORY_CHANNEL = "500000000000000001";
const THREAD_PARENT = "500000000000000002";
const TRANSCRIPTS = "500000000000000003";

/** Records every Discord call, in order, including the staff thread operations. */
class ThreadGateway implements TicketDiscordGateway {
  public readonly log: string[] = [];
  public readonly spaces: TicketSpaceInput[] = [];
  public readonly openings: TicketOpeningMessage[] = [];
  public readonly notices: TicketNotice[] = [];
  public readonly access: TicketAccessInput[] = [];
  public readonly closed: TicketCloseSpaceInput[] = [];
  public readonly deleted: string[] = [];
  public readonly transcripts: TicketTranscriptPost[] = [];
  public readonly dms: TicketDirectMessage[] = [];
  public readonly threads: TicketStaffThreadInput[] = [];
  public readonly members: { threadId: string; userId: string }[] = [];
  public readonly archived: { threadId: string; archived: boolean }[] = [];
  public threadError: Error | undefined;
  public dmsOpen = true;
  private channel = 600000000000000000n;

  public async guildName() { return "Guildhall HQ"; }
  public async createTicketSpace(input: TicketSpaceInput) {
    this.spaces.push(input);
    this.channel += 1n;
    this.log.push(`space ${this.channel}`);
    return { channelId: String(this.channel) };
  }
  public async postOpening(input: TicketOpeningMessage) { this.openings.push(input); this.log.push("opening"); }
  public async postNotice(input: TicketNotice) { this.notices.push(input); this.log.push(`notice ${input.channelId}`); return { messageId: "700000000000000001" }; }
  public async setAccess(input: TicketAccessInput) { this.access.push(input); }
  public async closeSpace(input: TicketCloseSpaceInput) { this.closed.push(input); this.log.push(`close-space ${input.channelId}`); }
  public async reopenSpace() { this.log.push("reopen-space"); }
  public async deleteSpace(channelId: string) { this.deleted.push(channelId); }
  public async renameSpace() {}
  public async publishPanel() { return { messageId: "800000000000000001" }; }
  public async deletePanelMessage() {}
  public async postTranscript(input: TicketTranscriptPost) { this.transcripts.push(input); return { messageId: "900000000000000001" }; }
  public async directMessage(input: TicketDirectMessage) { this.dms.push(input); this.log.push("dm"); return this.dmsOpen; }
  public async createStaffThread(input: TicketStaffThreadInput) {
    if (this.threadError) throw this.threadError;
    this.threads.push(input);
    this.channel += 1n;
    this.log.push(`staff-thread ${this.channel}`);
    return { threadId: String(this.channel) };
  }
  public async addThreadMember(threadId: string, userId: string) { this.members.push({ threadId, userId }); }
  public async setThreadArchived(threadId: string, archived: boolean) { this.archived.push({ threadId, archived }); this.log.push(`archive-thread ${archived}`); }
}

function actor(userId: string, roleIds: readonly string[] = [], source: TicketActor["source"] = "DISCORD"): TicketActor {
  // Portal actors are elevated, as the API makes them.
  return { userId, displayName: `user-${userId.slice(-2)}`, roleIds, elevated: source === "WEB", source };
}
const staff = actor(STAFF, [SUPPORT_ROLE]);

function settingsInput(overrides: Partial<TicketSettingsInput> = {}): TicketSettingsInput {
  const { nextNumber: _n, revision: _r, ...defaults } = defaultTicketSettings(GUILD);
  return { ...defaults, enabled: true, openCategoryChannelId: CATEGORY_CHANNEL, transcriptChannelId: TRANSCRIPTS, supportRoleIds: [SUPPORT_ROLE], source: "WEB", ...overrides };
}

function reason(overrides: Partial<TicketCategoryInput> = {}): TicketCategoryInput {
  return { guildId: GUILD, name: "Donations", buttonStyle: "PRIMARY", enabled: true, supportRoleIds: [], alertUserIds: [], defaultPriority: "NORMAL", questions: [], requiredRoleIds: [], ...overrides };
}

async function setup(overrides: Partial<TicketSettingsInput> = {}, options: { transcriptByteLimit?: number } = {}) {
  let clock = new Date("2026-09-25T12:00:00.000Z");
  const now = () => clock;
  const repository = new InMemoryTicketRepository(now);
  const gateway = new ThreadGateway();
  const service = new TicketService(repository, gateway, now, undefined, options);
  await service.saveSettings(settingsInput(overrides));
  return { repository, gateway, service, setClock: (date: Date) => { clock = date; }, advanceDays: (days: number) => { clock = new Date(clock.getTime() + days * 86_400_000); } };
}

const message = (channelId: string, id: string, authorId: string, content: string, roleIds: readonly string[] = []) => ({
  channelId, discordMessageId: id, authorId, authorName: `user-${authorId.slice(-2)}`, authorRoleIds: roleIds, content, attachments: [],
});

describe("staff thread creation", () => {
  it("opens a private staff thread inside the ticket channel, pings support roles, and never adds the opener", async () => {
    const { service, gateway, repository } = await setup();
    const donations = await service.saveCategory(reason({ alertUserIds: [ALERTED] }));
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER), categoryId: donations.id });
    expect(gateway.openings[0]?.staffChatButton).toBe(true);
    expect(gateway.threads).toHaveLength(1);
    const thread = gateway.threads[0];
    expect(thread).toMatchObject({ parentChannelId: ticket.channelId, name: "🔒 staff-donations-1", mentionRoleIds: [SUPPORT_ROLE] });
    expect(thread?.content).toContain(`Staff-only chat for Ticket #1 – Donations. <@${USER}> cannot see this thread.`);
    expect(thread?.content).toContain(`<@&${SUPPORT_ROLE}>`);
    // Opening message first, then the thread.
    expect(gateway.log.slice(0, 3)).toEqual([`space ${ticket.channelId}`, "opening", expect.stringMatching(/^staff-thread /)]);
    expect(ticket.staffThreadId).toBeDefined();
    expect((await repository.getTicket(ticket.id))?.staffThreadId).toBe(ticket.staffThreadId);
    expect(gateway.members).toEqual([{ threadId: ticket.staffThreadId, userId: ALERTED }]);
    expect(gateway.members.some((member) => member.userId === USER)).toBe(false);
    expect(repository.events.map((event) => event.action)).toContain("staff-thread-created");
  });

  it("keeps thread names within 100 characters", async () => {
    const { service, gateway } = await setup({ nameTemplate: "x".repeat(90) });
    await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    expect([...(gateway.threads[0]?.name ?? "")].length).toBeLessThanOrEqual(100);
    expect(gateway.threads[0]?.name.startsWith("🔒 staff-")).toBe(true);
  });

  it("creates the staff thread next to the ticket thread in thread mode and links the ticket", async () => {
    const { service, gateway } = await setup({ mode: "THREAD", threadParentChannelId: THREAD_PARENT });
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    expect(gateway.threads[0]).toMatchObject({ parentChannelId: THREAD_PARENT, name: "🔒 staff-ticket-1" });
    expect(gateway.threads[0]?.content).toContain(`Ticket: <#${ticket.channelId}>`);
    expect(ticket.staffThreadId).not.toBe(ticket.channelId);
    expect(gateway.members).toEqual([]);
  });

  it("follows the per-reason override", async () => {
    const { service, gateway } = await setup({ staffThreadEnabled: false, maxOpenPerUser: 5 });
    const inherit = await service.saveCategory(reason({ name: "Inherit" }));
    const on = await service.saveCategory(reason({ name: "On", staffThread: "ON" }));
    expect((await service.openTicket({ guildId: GUILD, actor: actor(USER), categoryId: inherit.id })).staffThreadId).toBeUndefined();
    expect(gateway.openings[0]?.staffChatButton).toBe(false);
    expect((await service.openTicket({ guildId: GUILD, actor: actor(USER), categoryId: on.id })).staffThreadId).toBeDefined();
    await service.saveSettings(settingsInput({ staffThreadEnabled: true, maxOpenPerUser: 5, expectedRevision: 1 }));
    const off = await service.saveCategory(reason({ name: "Off", staffThread: "OFF" }));
    expect((await service.openTicket({ guildId: GUILD, actor: actor(USER), categoryId: off.id })).staffThreadId).toBeUndefined();
    // Saving a reason without the field keeps its override.
    const { id, position: _p, staffThread: _s, ...rest } = off;
    expect((await service.saveCategory({ ...rest, id })).staffThread).toBe("OFF");
  });

  it("still opens the ticket when Discord refuses, and records why", async () => {
    const { service, gateway, repository } = await setup();
    gateway.threadError = Object.assign(new Error("Missing Permissions"), { code: 50013 });
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    expect(ticket).toMatchObject({ status: "OPEN" });
    expect(ticket.channelId).toBeDefined();
    expect(ticket.staffThreadId).toBeUndefined();
    const failed = repository.events.find((event) => event.action === "staff-thread-failed");
    expect(failed?.details).toEqual({ reason: "the bot needs Create Private Threads and Manage Threads." });
  });
});

describe("staff thread members", () => {
  it("adds the claimer, staff on their first message, and anyone staff who presses the button", async () => {
    const { service, gateway } = await setup({ maxOpenPerUser: 5 });
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    const channel = ticket.channelId ?? "";
    const threadId = ticket.staffThreadId;
    await service.addParticipant(GUILD, ticket.id, staff, FRIEND);
    await service.recordMessage(message(channel, "710000000000000001", USER, "hi"));
    await service.recordMessage(message(channel, "710000000000000002", FRIEND, "me too"));
    await service.recordMessage(message(channel, "710000000000000003", STAFF_2, "Looking", [SUPPORT_ROLE]));
    await service.recordMessage(message(channel, "710000000000000004", STAFF_2, "Still looking", [SUPPORT_ROLE]));
    expect(gateway.members).toEqual([{ threadId, userId: STAFF_2 }]);
    await service.claim(GUILD, ticket.id, staff);
    expect(gateway.members.at(-1)).toEqual({ threadId, userId: STAFF });

    const link = await service.openStaffChat(GUILD, ticket.id, actor("300000000000000009", [SUPPORT_ROLE]));
    expect(link).toEqual({ threadId, url: `https://discord.com/channels/${GUILD}/${threadId}` });
    expect(gateway.members.at(-1)).toEqual({ threadId, userId: "300000000000000009" });
    await expect(service.openStaffChat(GUILD, ticket.id, actor(FRIEND))).rejects.toMatchObject({ code: "FORBIDDEN", message: "Only staff can open the staff chat." });
    await expect(service.openStaffChat(GUILD, ticket.id, actor(USER))).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(gateway.members.some((member) => member.userId === USER || member.userId === FRIEND)).toBe(false);
  });
});

describe("staff chat", () => {
  it("records staff thread messages as staff chat and posts portal notes into the thread", async () => {
    const { service, gateway, repository } = await setup();
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    const threadId = ticket.staffThreadId ?? "";
    const recorded = await service.recordMessage(message(threadId, "720000000000000001", STAFF, "He was warned before", [SUPPORT_ROLE]));
    expect(recorded).toMatchObject({ ticketId: ticket.id, internal: true, source: "DISCORD" });
    // Staff chat does not count as activity the member sees.
    expect((await repository.getTicket(ticket.id))?.firstResponseAt).toBeUndefined();

    await service.addNote(GUILD, ticket.id, actor(STAFF, [], "WEB"), "Refund approved");
    const posted = gateway.notices.find((notice) => notice.channelId === threadId);
    expect(posted).toMatchObject({ content: "**user-01 (from portal):**\nRefund approved", silent: true });

    await service.recordMessage(message(ticket.channelId ?? "", "720000000000000002", USER, "Any news?"));
    const member = await service.transcript(GUILD, ticket.id, false);
    const staffCopy = await service.transcript(GUILD, ticket.id, true);
    expect(member.content).toContain("Any news?");
    expect(member.content).not.toContain("He was warned before");
    expect(member.content).not.toContain("Refund approved");
    expect(member.content).not.toContain("[staff chat]");
    expect(staffCopy.content).toContain("[staff chat] user-01: He was warned before");
    expect(staffCopy.content).toContain("[staff chat] user-01: Refund approved");
  });

  it("archives the staff thread on close, unarchives on reopen, and ignores messages while closed", async () => {
    const { service, gateway } = await setup();
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    const threadId = ticket.staffThreadId;
    await service.close(GUILD, ticket.id, staff);
    expect(gateway.archived).toEqual([{ threadId, archived: true }]);
    expect(await service.recordMessage(message(threadId ?? "", "730000000000000001", STAFF, "late", [SUPPORT_ROLE]))).toBeUndefined();
    await service.reopen(GUILD, ticket.id, staff);
    expect(gateway.archived.at(-1)).toEqual({ threadId, archived: false });
  });

  it("deletes the staff thread with the ticket: with the channel in channel mode, separately in thread mode", async () => {
    const channelMode = await setup({ closeAction: "DELETE" });
    const inChannel = await channelMode.service.openTicket({ guildId: GUILD, actor: actor(USER) });
    const closedChannel = await channelMode.service.close(GUILD, inChannel.id, staff);
    expect(channelMode.gateway.deleted).toEqual([]);
    expect(closedChannel.staffThreadId).toBeUndefined();

    const threadMode = await setup({ mode: "THREAD", threadParentChannelId: THREAD_PARENT, closeAction: "DELETE" });
    const inThread = await threadMode.service.openTicket({ guildId: GUILD, actor: actor(USER) });
    const closedThread = await threadMode.service.close(GUILD, inThread.id, staff);
    expect(threadMode.gateway.deleted).toEqual([inThread.staffThreadId]);
    expect(closedThread.staffThreadId).toBeUndefined();

    const manual = await setup({ mode: "THREAD", threadParentChannelId: THREAD_PARENT });
    const kept = await manual.service.openTicket({ guildId: GUILD, actor: actor(USER) });
    await manual.service.close(GUILD, kept.id, staff);
    expect((await manual.service.deleteChannel(GUILD, kept.id, staff)).staffThreadId).toBeUndefined();
    expect(manual.gateway.deleted).toEqual([kept.channelId, kept.staffThreadId]);
  });

  it("forgets a staff thread that was deleted in Discord", async () => {
    const { service, repository } = await setup();
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    await service.handleChannelDeleted(ticket.staffThreadId ?? "");
    const updated = await repository.getTicket(ticket.id);
    expect(updated?.staffThreadId).toBeUndefined();
    expect(updated?.status).toBe("OPEN");
  });
});

describe("transcript to the member", () => {
  it("DMs a summary embed with the .txt and .html transcripts, without staff chat", async () => {
    const { service, gateway } = await setup();
    const donations = await service.saveCategory(reason());
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER), categoryId: donations.id });
    await service.recordMessage(message(ticket.channelId ?? "", "740000000000000001", USER, "Where is my perk?"));
    await service.recordMessage(message(ticket.staffThreadId ?? "", "740000000000000002", STAFF, "secret staff talk", [SUPPORT_ROLE]));
    await service.addNote(GUILD, ticket.id, actor(STAFF, [], "WEB"), "portal secret");
    await service.close(GUILD, ticket.id, staff, "Perk granted");
    const dm = gateway.dms[0];
    expect(dm?.files?.map((file) => [file.fileName, file.contentType])).toEqual([
      ["ticket-1-transcript.txt", "text/plain; charset=utf-8"],
      ["ticket-1-transcript.html", "text/html; charset=utf-8"],
    ]);
    const summary = dm?.message.embeds?.at(-1);
    const field = (name: string) => summary?.fields?.find((item) => item.name === name)?.value;
    expect(summary?.title).toBe("Ticket #1 transcript");
    expect(summary?.fields?.map((item) => item.name)).toEqual(["Ticket", "Server", "Reason", "Opened", "Closed", "Closed by", "Close reason", "Messages"]);
    expect(field("Ticket")).toBe("#1 · Reason #1");
    expect(field("Server")).toBe("Guildhall HQ");
    expect(field("Reason")).toBe("Donations");
    expect(field("Opened")).toBe(`<t:${Date.parse("2026-09-25T12:00:00.000Z") / 1000}:f>`);
    expect(field("Closed by")).toBe(`<@${STAFF}>`);
    expect(field("Close reason")).toBe("Perk granted");
    expect(field("Messages")).toBe("1");
    for (const file of dm?.files ?? []) {
      expect(file.content).toContain("Where is my perk?");
      expect(file.content).not.toContain("secret staff talk");
      expect(file.content).not.toContain("portal secret");
    }
    // The staff copy in the transcript channel has both files and the staff chat.
    const posted = gateway.transcripts[0];
    expect(posted?.files.map((file) => file.fileName)).toEqual(["ticket-1-transcript.txt", "ticket-1-transcript.html"]);
    expect(posted?.files[1]?.content).toContain("secret staff talk");
    expect(posted?.files[0]?.content).toContain("[staff chat]");
  });

  it("truncates transcripts that exceed the size limit and says until when the portal keeps the ticket", async () => {
    const limit = 4000;
    const { service, repository } = await setup({}, { transcriptByteLimit: limit });
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    for (let index = 0; index < 50; index += 1)
      await repository.addMessage({ ticketId: ticket.id, authorId: USER, authorName: "member", content: `message ${index} ${"x".repeat(200)}`, attachments: [], source: "DISCORD", internal: false });
    const closed = await service.close(GUILD, ticket.id, staff);
    const [text, html] = await service.transcriptFiles(closed, await service.settings(GUILD), false);
    for (const file of [text, html]) {
      expect(Buffer.byteLength(file.content, "utf8")).toBeLessThanOrEqual(limit);
      expect(file.content).toContain("Transcript truncated; the full ticket is in the portal until 2027-09-25");
      expect(file.content).toContain("message 0 ");
      expect(file.content).not.toContain("message 49 ");
    }
    expect(text.content.trimEnd().split("\n").at(-1)).toBe("Transcript truncated; the full ticket is in the portal until 2027-09-25");
    expect(html.content.trimEnd().endsWith("</html>")).toBe(true);
  });

  it("escapes HTML so a message stays text, and has no scripts or external requests", async () => {
    const { service, repository } = await setup();
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER), subject: "<b>bold</b>" });
    await repository.addMessage({
      ticketId: ticket.id, authorId: USER, authorName: "<img src=x onerror=alert(1)>", content: "<script>alert('hi')</script> & \"quotes\"",
      attachments: ["https://cdn.discordapp.com/attachments/1/2/proof.png", "javascript:alert(1)"], source: "DISCORD", internal: false,
    });
    const [, html] = await service.transcriptFiles(await service.ticket(GUILD, ticket.id), await service.settings(GUILD), false);
    expect(html.content).toContain("&lt;script&gt;alert(&#39;hi&#39;)&lt;/script&gt; &amp; &quot;quotes&quot;");
    expect(html.content).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html.content).toContain("&lt;b&gt;bold&lt;/b&gt;");
    expect(html.content).not.toMatch(/<script/i);
    expect(html.content).not.toMatch(/<img|<link|<iframe|src=["']?http|@import|url\(/i);
    expect(html.content).toContain('<a href="https://cdn.discordapp.com/attachments/1/2/proof.png" rel="noreferrer noopener">proof.png</a>');
    expect(html.content).not.toContain('href="javascript');
    expect(html.content).toContain("<style>");
  });

  it("tells the member in the ticket before archiving when their DMs are closed, and staff can retry from the portal", async () => {
    const { service, gateway, repository } = await setup();
    gateway.dmsOpen = false;
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    await service.close(GUILD, ticket.id, staff);
    expect(repository.events.map((event) => event.action)).toContain("transcript-dm-failed");
    const notice = gateway.notices.find((item) => item.content.includes("your DMs are closed"));
    expect(notice).toMatchObject({ channelId: ticket.channelId, content: `<@${USER}>, your DMs are closed, so the transcript could not be sent. Staff can send it to you from the portal.` });
    const order = gateway.log;
    expect(order.indexOf(`notice ${ticket.channelId}`, order.indexOf("dm"))).toBeLessThan(order.indexOf(`close-space ${ticket.channelId}`));
    expect(order.indexOf("archive-thread true")).toBeGreaterThan(order.indexOf("dm"));

    await expect(service.sendTranscriptToMember(GUILD, ticket.id, actor(STAFF, [], "WEB"))).rejects.toMatchObject({ code: "INVALID_STATE", message: "The member's DMs are closed, so the transcript could not be sent." });
    const noticesBefore = gateway.notices.length;
    gateway.dmsOpen = true;
    expect(await service.sendTranscriptToMember(GUILD, ticket.id, staff)).toEqual({ sent: true });
    expect(gateway.notices).toHaveLength(noticesBefore);
    const retry = gateway.dms.at(-1);
    expect(retry?.feedbackTicketId).toBeUndefined();
    expect(retry?.files).toHaveLength(2);
    expect(retry?.message.embeds?.at(-1)?.title).toBe("Ticket #1 transcript");
    expect(repository.events.at(-1)?.action).toBe("transcript-dm-sent");
    await expect(service.sendTranscriptToMember(GUILD, ticket.id, actor(FRIEND))).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("only sends the transcript to open tickets' members after closing", async () => {
    const { service } = await setup();
    const ticket = await service.openTicket({ guildId: GUILD, actor: actor(USER) });
    await expect(service.sendTranscriptToMember(GUILD, ticket.id, staff)).rejects.toMatchObject({ code: "INVALID_STATE" });
  });
});

describe("settings", () => {
  it("defaults to staff threads on, 12 months, and transcript DMs on for new servers", () => {
    expect(defaultTicketSettings(GUILD)).toMatchObject({ staffThreadEnabled: true, retentionMonths: 12, transcriptDmUser: true });
  });

  it("validates the retention and keeps saved values when a caller leaves them out", async () => {
    const { service } = await setup({ retentionMonths: 6, staffThreadEnabled: false });
    await expect(service.saveSettings(settingsInput({ retentionMonths: 5, expectedRevision: 1 }))).rejects.toMatchObject({ code: "INVALID_INPUT" });
    const { retentionMonths: _r, staffThreadEnabled: _s, ...rest } = settingsInput({ expectedRevision: 1 });
    expect(await service.saveSettings(rest)).toMatchObject({ retentionMonths: 6, staffThreadEnabled: false });
    expect(await service.saveSettings(settingsInput({ retentionMonths: 0, expectedRevision: 2 }))).toMatchObject({ retentionMonths: 0 });
  });
});

describe("retention", () => {
  async function seed(repository: InMemoryTicketRepository, number: number, closedAt: Date | undefined) {
    const ticket = await repository.createTicket({ guildId: GUILD, number, openerId: USER, openerName: "member", answers: [], priority: "NORMAL" });
    await repository.addMessage({ ticketId: ticket.id, authorId: USER, authorName: "member", content: "hi", attachments: [], source: "DISCORD", internal: false });
    await repository.addEvent({ ticketId: ticket.id, action: "opened", actorId: USER, source: "DISCORD", details: {} });
    return closedAt ? repository.updateTicket(ticket.id, { status: "CLOSED", closedAt }) : ticket;
  }

  it("deletes only closed tickets older than the retention, with their messages and events", async () => {
    const { service, repository } = await setup({ retentionMonths: 6 });
    const old = await seed(repository, 1, new Date("2026-03-01T00:00:00.000Z"));
    const recent = await seed(repository, 2, new Date("2026-06-01T00:00:00.000Z"));
    const openOld = await seed(repository, 3, undefined);
    expect(await service.sweepRetention()).toEqual({ deleted: 1, guilds: 1 });
    expect(await repository.getTicket(old.id)).toBeUndefined();
    expect(repository.messages.some((item) => item.ticketId === old.id)).toBe(false);
    expect(repository.events.some((item) => item.ticketId === old.id)).toBe(false);
    expect(await repository.getTicket(recent.id)).toBeDefined();
    expect(await repository.getTicket(openOld.id)).toBeDefined();
    expect(repository.messages.some((item) => item.ticketId === recent.id)).toBe(true);
  });

  it("works in batches of 200", async () => {
    const { service, repository } = await setup();
    for (let number = 1; number <= 450; number += 1) await seed(repository, number, new Date("2025-01-01T00:00:00.000Z"));
    const spy = vi.spyOn(repository, "deleteClosedTickets");
    expect((await service.sweepRetention()).deleted).toBe(450);
    expect(spy.mock.calls.map((call) => call[2])).toEqual([200, 200, 200]);
    expect(spy.mock.calls[0]?.[1]).toEqual(new Date("2025-09-25T12:00:00.000Z"));
    expect(repository.tickets.size).toBe(0);
  });

  it("keeps everything when retention is forever (0)", async () => {
    const { service, repository } = await setup({ retentionMonths: 0 });
    await seed(repository, 1, new Date("2020-01-01T00:00:00.000Z"));
    expect(await service.sweepRetention()).toEqual({ deleted: 0, guilds: 0 });
    expect(repository.tickets.size).toBe(1);
  });
});

describe("DiscordRestTicketGateway staff thread", () => {
  class RecordingRest implements DiscordRestClient {
    public readonly calls: { method: string; route: string; options?: DiscordRestRequest | undefined }[] = [];
    private record(method: string, route: string, options?: DiscordRestRequest) {
      this.calls.push({ method, route, options });
      return Promise.resolve({ id: "123456789012345678" });
    }
    public get(route: `/${string}`, options?: DiscordRestRequest) { return this.record("GET", route, options); }
    public post(route: `/${string}`, options?: DiscordRestRequest) { return this.record("POST", route, options); }
    public patch(route: `/${string}`, options?: DiscordRestRequest) { return this.record("PATCH", route, options); }
    public put(route: `/${string}`, options?: DiscordRestRequest) { return this.record("PUT", route, options); }
    public delete(route: `/${string}`, options?: DiscordRestRequest) { return this.record("DELETE", route, options); }
  }

  it("creates a private non-invitable thread and pings only the roles", async () => {
    const rest = new RecordingRest();
    const gateway = new DiscordRestTicketGateway(rest);
    const result = await gateway.createStaffThread({ guildId: GUILD, parentChannelId: CATEGORY_CHANNEL, name: "🔒 staff-ticket-1", content: `Staff only <@${USER}> <@&${SUPPORT_ROLE}>`, mentionRoleIds: [SUPPORT_ROLE], reason: "r" });
    expect(result).toEqual({ threadId: "123456789012345678" });
    expect(rest.calls[0]).toMatchObject({ method: "POST", route: `/channels/${CATEGORY_CHANNEL}/threads`, options: { body: { name: "🔒 staff-ticket-1", type: 12, invitable: false, auto_archive_duration: 10080 } } });
    expect(rest.calls[1]).toMatchObject({ method: "POST", route: "/channels/123456789012345678/messages", options: { body: { allowed_mentions: { parse: [], roles: [SUPPORT_ROLE] } } } });
    await gateway.addThreadMember("123456789012345678", STAFF);
    await gateway.setThreadArchived("123456789012345678", true);
    await gateway.setThreadArchived("123456789012345678", false);
    expect(rest.calls.slice(2).map((call) => [call.method, call.route, call.options?.body])).toEqual([
      ["PUT", `/channels/123456789012345678/thread-members/${STAFF}`, undefined],
      ["PATCH", "/channels/123456789012345678", { archived: true, locked: true }],
      ["PATCH", "/channels/123456789012345678", { archived: false, locked: false }],
    ]);
  });

  it("adds the staff chat button to the staff controls row and attaches both transcript files", async () => {
    const rest = new RecordingRest();
    const gateway = new DiscordRestTicketGateway(rest);
    const repository = new InMemoryTicketRepository();
    const ticket = await repository.createTicket({ guildId: GUILD, number: 1, openerId: USER, openerName: "m", answers: [], priority: "NORMAL" });
    await gateway.postOpening({ channelId: CATEGORY_CHANNEL, ticket, message: { content: "hi" }, mentionUserIds: [], mentionRoleIds: [], claimButton: true, staffChatButton: true });
    const row = (rest.calls[0]?.options?.body as { components: { components: { custom_id: string; label: string }[] }[] }).components;
    expect(row).toHaveLength(1);
    expect(row[0]?.components.map((item) => item.custom_id)).toEqual([`qbox:ticket:close:${ticket.id}`, `qbox:ticket:claim:${ticket.id}`, `qbox:tickets:staffchat:${ticket.id}`]);
    await gateway.directMessage({ userId: USER, message: { content: "closed" }, files: [
      { fileName: "ticket-1-transcript.txt", content: "t", contentType: "text/plain; charset=utf-8" },
      { fileName: "ticket-1-transcript.html", content: "<p>h</p>", contentType: "text/html; charset=utf-8" },
    ] });
    const files = rest.calls.at(-1)?.options?.files;
    expect(files?.map((file) => [file.name, file.contentType])).toEqual([["ticket-1-transcript.txt", "text/plain; charset=utf-8"], ["ticket-1-transcript.html", "text/html; charset=utf-8"]]);
  });
});
