import type {
  Ticket,
  TicketActor,
  TicketAnswer,
  TicketCategory,
  TicketCategoryInput,
  TicketDetail,
  TicketDiscordGateway,
  TicketListFilter,
  TicketMessage,
  TicketPanel,
  TicketPanelInput,
  TicketPatch,
  TicketPriority,
  TicketRepository,
  TicketSettings,
  TicketSettingsInput,
  TicketStats,
  TicketStatus,
  TicketTranscriptFile,
  TicketDirectMessage,
} from "./types.js";
import { TICKET_PRIORITIES } from "./types.js";
import { TRANSCRIPT_BYTE_LIMIT, renderHtmlTranscript, renderTextTranscript, ticketLabel } from "./transcripts.js";
import { BRAND } from "@qbox/shared/brand";
import { colorValue } from "@qbox/shared/discord-rest";
import { passthroughTemplates, type MessageTemplates, type OutgoingMessage } from "@qbox/shared/messages";
import {
  TicketError,
  channelName,
  invalid,
  renderText,
  requireLength,
  requireSnowflake,
  validateCategory,
  validatePanel,
  validateSettings,
} from "./validation.js";

export interface OpenTicketInput {
  readonly guildId: string;
  readonly actor: TicketActor;
  readonly categoryId?: string | undefined;
  readonly subject?: string | undefined;
  /** Answers keyed by question ID from the category form. */
  readonly answers?: Readonly<Record<string, string>> | undefined;
  readonly priority?: TicketPriority | undefined;
}

export interface RecordedDiscordMessage {
  readonly channelId: string;
  readonly discordMessageId: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly authorRoleIds: readonly string[];
  readonly content: string;
  readonly attachments: readonly string[];
}

export interface AutoCloseSweepResult {
  readonly warned: number;
  readonly closed: number;
}

export interface RetentionSweepResult {
  /** Closed tickets deleted, with their messages and events. */
  readonly deleted: number;
  readonly guilds: number;
}

export interface TicketServiceOptions {
  /** Size limit for each transcript file in bytes (default 8 MB). */
  readonly transcriptByteLimit?: number | undefined;
}

/** Where a staff member can open the ticket's staff chat. */
export interface StaffChatLink {
  readonly threadId: string;
  readonly url: string;
}

const ACTIVE_STATUSES: readonly TicketStatus[] = ["OPEN", "CLAIMED", "PENDING"];
const HOUR_MS = 60 * 60 * 1000;
/** Old closed tickets are deleted this many at a time. */
export const RETENTION_BATCH_SIZE = 200;
const STAFF_THREAD_PERMISSION_REASON = "the bot needs Create Private Threads and Manage Threads.";

export function defaultTicketSettings(guildId: string): TicketSettings {
  return {
    guildId,
    enabled: false,
    mode: "CHANNEL",
    supportRoleIds: [],
    pingSupportOnOpen: true,
    maxOpenPerUser: 1,
    nameTemplate: "ticket-{number}",
    openMessage: "Thanks for contacting support, {user}. A team member will be with you shortly.",
    embedColor: "#5865F2",
    allowUserClose: true,
    requireCloseReason: false,
    closeConfirmation: true,
    closeAction: "ARCHIVE",
    deleteDelaySeconds: 10,
    claimEnabled: true,
    claimRestrictsReplies: false,
    transcriptsEnabled: true,
    transcriptDmUser: true,
    feedbackEnabled: true,
    autoCloseHours: 0,
    autoCloseWarningHours: 0,
    autoCloseExcludeClaimed: true,
    blockedUserIds: [],
    blockedRoleIds: [],
    staffThreadEnabled: true,
    retentionMonths: 12,
    nextNumber: 1,
    revision: 0,
  };
}

/**
 * Ticket lifecycle rules shared by the Discord bot, the API, and the portal.
 *
 * Persistence and Discord are injected. Discord side effects after a state
 * change are best-effort: failures are recorded as ticket events so a deleted
 * channel or missing permission never leaves a ticket stuck open.
 */
export class TicketService {
  /** `threadId:userId` pairs already added to a staff thread by this process (adding again is harmless). */
  private readonly staffThreadMembers = new Set<string>();

  public constructor(
    private readonly repository: TicketRepository,
    private readonly gateway?: TicketDiscordGateway,
    private readonly now: () => Date = () => new Date(),
    private readonly templates: MessageTemplates = passthroughTemplates,
    private readonly options: TicketServiceOptions = {},
  ) {}

  public async settings(guildId: string): Promise<TicketSettings> {
    requireSnowflake("guildId", guildId);
    return (await this.repository.getSettings(guildId)) ?? defaultTicketSettings(guildId);
  }

  public async saveSettings(input: TicketSettingsInput): Promise<TicketSettings> {
    validateSettings(input);
    const current = input.staffThreadEnabled === undefined || input.retentionMonths === undefined ? await this.settings(input.guildId) : undefined;
    return this.repository.saveSettings({
      ...input,
      staffThreadEnabled: input.staffThreadEnabled ?? current?.staffThreadEnabled ?? true,
      retentionMonths: input.retentionMonths ?? current?.retentionMonths ?? 12,
      supportRoleIds: unique(input.supportRoleIds),
      blockedRoleIds: unique(input.blockedRoleIds),
      blockedUserIds: unique(input.blockedUserIds),
      embedColor: normalizeColor(input.embedColor),
    });
  }

  public async categories(guildId: string): Promise<readonly TicketCategory[]> {
    requireSnowflake("guildId", guildId);
    return this.repository.listCategories(guildId);
  }

  public async saveCategory(input: TicketCategoryInput): Promise<TicketCategory> {
    validateCategory(input);
    const existing = await this.repository.listCategories(input.guildId);
    if (input.id !== undefined && !existing.some((category) => category.id === input.id))
      throw new TicketError("NOT_FOUND", "Ticket category was not found.");
    if (existing.some((category) => category.id !== input.id && category.name.toLowerCase() === input.name.trim().toLowerCase()))
      throw new TicketError("CONFLICT", "A ticket category with that name already exists.");
    if (input.id === undefined && existing.length >= 25) throw new TicketError("LIMIT_REACHED", "A server can have at most 25 ticket categories.");
    return this.repository.saveCategory({
      ...input,
      name: input.name.trim(),
      supportRoleIds: unique(input.supportRoleIds),
      alertUserIds: unique(input.alertUserIds),
      requiredRoleIds: unique(input.requiredRoleIds),
      staffThread: input.staffThread ?? existing.find((category) => category.id === input.id)?.staffThread ?? "INHERIT",
      position: input.position ?? (input.id === undefined ? existing.length : undefined),
    });
  }

  public async deleteCategory(guildId: string, id: string): Promise<void> {
    await this.requireCategory(guildId, id);
    await this.repository.deleteCategory(guildId, id);
  }

  public async panels(guildId: string): Promise<readonly TicketPanel[]> {
    requireSnowflake("guildId", guildId);
    return this.repository.listPanels(guildId);
  }

  public async savePanel(input: TicketPanelInput): Promise<TicketPanel> {
    validatePanel(input);
    const [panels, categories] = await Promise.all([
      this.repository.listPanels(input.guildId),
      this.repository.listCategories(input.guildId),
    ]);
    if (input.id !== undefined && !panels.some((panel) => panel.id === input.id))
      throw new TicketError("NOT_FOUND", "Ticket panel was not found.");
    if (panels.some((panel) => panel.id !== input.id && panel.name.toLowerCase() === input.name.trim().toLowerCase()))
      throw new TicketError("CONFLICT", "A ticket panel with that name already exists.");
    const known = new Set(categories.map((category) => category.id));
    for (const categoryId of input.categoryIds)
      if (!known.has(categoryId)) invalid("Panels can only offer existing ticket categories.");
    const saved = await this.repository.savePanel({
      ...input,
      name: input.name.trim(),
      color: normalizeColor(input.color),
      categoryIds: unique(input.categoryIds),
      rows: input.rows && input.rows.length > 0 ? input.rows.map((row) => [...row]) : null,
    });
    const previous = panels.find((panel) => panel.id === input.id);
    if (!previous?.messageId || previous.channelId === saved.channelId) return saved;
    // Moved to another channel: the old message is removed (when it still exists) and the next publish posts anew.
    if (this.gateway) await this.gateway.deletePanelMessage(previous.channelId, previous.messageId).catch(() => undefined);
    return this.repository.clearPanelMessage(saved.guildId, saved.id);
  }

  public async publishPanel(guildId: string, id: string): Promise<TicketPanel> {
    const gateway = this.requireGateway();
    const panel = await this.requirePanel(guildId, id);
    const settings = await this.settings(guildId);
    if (!settings.enabled) throw new TicketError("DISABLED", "Enable tickets before publishing a panel.");
    const categories = panelCategories(panel, await this.repository.listCategories(guildId));
    if (categories.length === 0) throw new TicketError("INVALID_STATE", "Add at least one enabled ticket category before publishing a panel.");
    const { messageId } = await gateway.publishPanel({ panel, categories });
    return this.repository.markPanelPublished(guildId, id, messageId);
  }

  public async deletePanel(guildId: string, id: string): Promise<void> {
    const panel = await this.requirePanel(guildId, id);
    if (panel.messageId && this.gateway) await this.gateway.deletePanelMessage(panel.channelId, panel.messageId).catch(() => undefined);
    await this.repository.deletePanel(guildId, id);
  }

  /** True when the actor may handle tickets in this category. */
  public isStaff(settings: TicketSettings, category: TicketCategory | undefined, actor: TicketActor): boolean {
    if (actor.elevated) return true;
    if (category?.alertUserIds.includes(actor.userId)) return true;
    const roles = new Set([...settings.supportRoleIds, ...(category?.supportRoleIds ?? [])]);
    return actor.roleIds.some((roleId) => roles.has(roleId));
  }

  public async openTicket(input: OpenTicketInput): Promise<Ticket> {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("userId", input.actor.userId);
    const settings = await this.settings(input.guildId);
    if (!settings.enabled) throw new TicketError("DISABLED", "Tickets are not enabled on this server.");
    if (settings.blockedUserIds.includes(input.actor.userId) || input.actor.roleIds.some((roleId) => settings.blockedRoleIds.includes(roleId)))
      throw new TicketError("FORBIDDEN", "You are not allowed to open tickets on this server.");
    const categories = await this.repository.listCategories(input.guildId);
    const category = input.categoryId === undefined ? undefined : categories.find((item) => item.id === input.categoryId);
    if (input.categoryId !== undefined && (!category || !category.enabled))
      throw new TicketError("NOT_FOUND", "That ticket type is not available.");
    if (category && category.requiredRoleIds.length > 0 && !input.actor.elevated && !input.actor.roleIds.some((roleId) => category.requiredRoleIds.includes(roleId)))
      throw new TicketError("FORBIDDEN", "You do not have a role required for this ticket type.");
    if (input.subject !== undefined) requireLength("subject", input.subject, 1, 200);
    const answers = collectAnswers(category, input.answers ?? {});

    const active = await this.repository.countActiveTickets(input.guildId, input.actor.userId);
    if (active >= settings.maxOpenPerUser)
      throw new TicketError("LIMIT_REACHED", `You already have ${active} open ticket${active === 1 ? "" : "s"}. Close one before opening another.`);
    if (category?.maxOpenPerUser !== undefined) {
      const inCategory = await this.repository.countActiveTickets(input.guildId, input.actor.userId, category.id);
      if (inCategory >= category.maxOpenPerUser)
        throw new TicketError("LIMIT_REACHED", `You already have an open ${category.name} ticket.`);
    }
    const parentChannelId = category?.parentChannelId ?? (settings.mode === "THREAD" ? settings.threadParentChannelId : settings.openCategoryChannelId);
    if (settings.mode === "THREAD" && !parentChannelId)
      throw new TicketError("INVALID_STATE", "Ticket threads need a parent channel. Ask an administrator to finish ticket setup.");
    const gateway = this.requireGateway();

    const number = await this.repository.allocateNumber(input.guildId);
    const categoryNumber = category ? await this.repository.allocateCategoryNumber(input.guildId, category.id) : undefined;
    const created = await this.repository.createTicket({
      guildId: input.guildId,
      number,
      ...(category ? { categoryId: category.id, categoryNumber } : {}),
      openerId: input.actor.userId,
      openerName: input.actor.displayName,
      ...(input.subject ? { subject: input.subject } : {}),
      answers,
      priority: input.priority ?? category?.defaultPriority ?? "NORMAL",
    });
    const values = placeholderValues(created, category, input.actor);
    const supportRoleIds = unique([...settings.supportRoleIds, ...(category?.supportRoleIds ?? [])]);
    const spaceName = channelName(category?.nameTemplate ?? (category ? DEFAULT_REASON_NAME_TEMPLATE : settings.nameTemplate), values);
    let channelId: string;
    try {
      ({ channelId } = await gateway.createTicketSpace({
        guildId: input.guildId,
        mode: settings.mode,
        ...(parentChannelId ? { parentChannelId } : {}),
        name: spaceName,
        openerId: input.actor.userId,
        supportRoleIds,
        memberIds: (category?.alertUserIds ?? []).filter((userId) => userId !== input.actor.userId),
        topic: `${ticketLabel(created)} opened by ${input.actor.displayName}`,
      }));
    } catch (error) {
      await this.repository.updateTicket(created.id, { status: "CLOSED", closedAt: this.now(), closeReason: "Discord channel could not be created." });
      await this.event(created.id, "open-failed", input.actor, { reason: errorText(error) });
      throw new TicketError("DEPENDENCY_UNAVAILABLE", "The ticket channel could not be created. Check the bot's permissions and try again.");
    }
    let ticket = await this.repository.updateTicket(created.id, { channelId, lastActivityAt: this.now() });
    const staffThread = staffThreadWanted(settings, category) && gateway.createStaffThread !== undefined;
    await this.event(ticket.id, "opened", input.actor, {
      category: category?.name ?? null,
      priority: ticket.priority,
    });
    const server = await gateway.guildName(input.guildId).catch(() => "the server");
    const opening = await this.templates.apply(input.guildId, "tickets.opened", { ...values, server }, {
      embeds: [{
        title: ticketLabel(ticket),
        description: openingBody(renderText(category?.openMessage ?? settings.openMessage, values), ticket),
        color: colorValue(settings.embedColor),
        footer: { text: `Priority: ${ticket.priority.toLowerCase()} | Ticket ID ${ticket.id}` },
        timestamp: ticket.createdAt.toISOString(),
      }],
    });
    await this.attempt(ticket.id, input.actor, "post-opening", () =>
      gateway.postOpening({
        channelId,
        ticket,
        message: opening,
        mentionUserIds: unique([input.actor.userId, ...(category?.alertUserIds ?? [])]),
        mentionRoleIds: settings.pingSupportOnOpen ? supportRoleIds : [],
        claimButton: settings.claimEnabled,
        staffChatButton: staffThread,
      }),
    );
    if (staffThread) {
      // Channel mode: inside the ticket channel. Thread mode: a thread cannot hold a thread, so next to it.
      const threadParent = settings.mode === "CHANNEL" ? channelId : parentChannelId;
      if (threadParent)
        ticket = await this.createStaffThread(ticket, input.actor, {
          parentChannelId: threadParent,
          name: settings.mode === "CHANNEL" ? `🔒 staff-${spaceName}` : `🔒 staff-ticket-${ticket.number}`,
          supportRoleIds,
          alertUserIds: category?.alertUserIds ?? [],
          reason: category?.name ?? "General support",
        });
    }
    await this.log(settings, ticket, `Ticket #${ticket.number} opened`, `<@${ticket.openerId}> opened <#${channelId}>${category ? ` in **${category.name}**` : ""}.`, "#57F287");
    return ticket;
  }

  public async ticketForChannel(channelId: string): Promise<Ticket | undefined> {
    return this.repository.findTicketByChannel(channelId);
  }

  /** The ticket whose staff thread this is. */
  public async ticketForStaffThread(threadId: string): Promise<Ticket | undefined> {
    return this.repository.findTicketByStaffThread(threadId);
  }

  /**
   * "🔒 Staff chat" button: adds a staff member (same rule as claiming) to the
   * ticket's staff thread and returns where it is.
   */
  public async openStaffChat(guildId: string, id: string, actor: TicketActor): Promise<StaffChatLink> {
    const ticket = await this.ticket(guildId, id);
    const settings = await this.settings(guildId);
    if (!this.isStaff(settings, await this.categoryFor(ticket), actor)) throw new TicketError("FORBIDDEN", "Only staff can open the staff chat.");
    if (!ticket.staffThreadId) throw new TicketError("INVALID_STATE", "This ticket has no staff chat.");
    const gateway = this.requireGateway();
    if (ticket.openerId !== actor.userId && gateway.addThreadMember) {
      await gateway.addThreadMember(ticket.staffThreadId, actor.userId);
      this.rememberStaffMember(ticket.staffThreadId, actor.userId);
    }
    return { threadId: ticket.staffThreadId, url: `https://discord.com/channels/${guildId}/${ticket.staffThreadId}` };
  }

  public async ticket(guildId: string, id: string): Promise<Ticket> {
    const ticket = await this.repository.getTicket(id);
    if (!ticket || ticket.guildId !== guildId) throw new TicketError("NOT_FOUND", "Ticket was not found.");
    return ticket;
  }

  public async detail(guildId: string, id: string): Promise<TicketDetail> {
    const ticket = await this.ticket(guildId, id);
    const [messages, events] = await Promise.all([this.repository.listMessages(id), this.repository.listEvents(id)]);
    return { ticket, messages, events };
  }

  public async list(filter: TicketListFilter): Promise<readonly Ticket[]> {
    requireSnowflake("guildId", filter.guildId);
    return this.repository.listTickets({ ...filter, limit: Math.min(Math.max(filter.limit ?? 50, 1), 200) });
  }

  public async stats(guildId: string): Promise<TicketStats> {
    requireSnowflake("guildId", guildId);
    return this.repository.stats(guildId);
  }

  public async claim(guildId: string, id: string, actor: TicketActor): Promise<Ticket> {
    const { ticket, settings } = await this.staffContext(guildId, id, actor);
    if (!settings.claimEnabled) throw new TicketError("DISABLED", "Claiming is turned off for this server.");
    requireActive(ticket);
    if (ticket.claimedById === actor.userId) throw new TicketError("INVALID_STATE", "You already claimed this ticket.");
    if (ticket.claimedById && !actor.elevated)
      throw new TicketError("CONFLICT", `This ticket is already claimed by <@${ticket.claimedById}>.`);
    const updated = await this.repository.updateTicket(id, {
      claimedById: actor.userId,
      status: ticket.status === "PENDING" ? "PENDING" : "CLAIMED",
      lastActivityAt: this.now(),
      ...(ticket.firstResponseAt ? {} : { firstResponseAt: this.now() }),
    });
    await this.event(id, "claimed", actor, { previous: ticket.claimedById ?? null });
    if (updated.channelId) {
      const channelId = updated.channelId;
      if (settings.claimRestrictsReplies && settings.mode === "CHANNEL")
        await this.restrictStaff(updated, settings, actor, channelId, "READ_ONLY");
      await this.notice(updated, actor, `<@${actor.userId}> claimed this ticket and will be assisting you.`);
    }
    await this.addStaffThreadMember(updated, actor.userId, actor);
    await this.log(settings, updated, `Ticket #${updated.number} claimed`, `<@${actor.userId}> claimed the ticket.`, "#FEE75C");
    return updated;
  }

  public async unclaim(guildId: string, id: string, actor: TicketActor): Promise<Ticket> {
    const { ticket, settings } = await this.staffContext(guildId, id, actor);
    requireActive(ticket);
    if (!ticket.claimedById) throw new TicketError("INVALID_STATE", "This ticket is not claimed.");
    if (ticket.claimedById !== actor.userId && !actor.elevated) throw new TicketError("FORBIDDEN", "Only the claiming staff member can unclaim this ticket.");
    const updated = await this.repository.updateTicket(id, {
      claimedById: null,
      status: ticket.status === "PENDING" ? "PENDING" : "OPEN",
    });
    await this.event(id, "unclaimed", actor, { previous: ticket.claimedById });
    if (updated.channelId) {
      if (settings.claimRestrictsReplies && settings.mode === "CHANNEL")
        await this.restrictStaff(updated, settings, actor, updated.channelId, "FULL");
      await this.notice(updated, actor, "This ticket is no longer claimed. Any support team member can help.");
    }
    return updated;
  }

  public async transfer(guildId: string, id: string, actor: TicketActor, targetUserId: string): Promise<Ticket> {
    requireSnowflake("userId", targetUserId);
    const { ticket } = await this.staffContext(guildId, id, actor);
    requireActive(ticket);
    const updated = await this.repository.updateTicket(id, { claimedById: targetUserId, status: ticket.status === "PENDING" ? "PENDING" : "CLAIMED" });
    await this.event(id, "transferred", actor, { from: ticket.claimedById ?? null, to: targetUserId });
    await this.notice(updated, actor, `This ticket was transferred to <@${targetUserId}>.`);
    await this.addStaffThreadMember(updated, targetUserId, actor);
    return updated;
  }

  public async addParticipant(guildId: string, id: string, actor: TicketActor, userId: string): Promise<Ticket> {
    requireSnowflake("userId", userId);
    const { ticket, settings } = await this.staffContext(guildId, id, actor);
    requireActive(ticket);
    if (userId === ticket.openerId || ticket.participantIds.includes(userId)) throw new TicketError("INVALID_STATE", "That member already has access to this ticket.");
    if (ticket.participantIds.length >= 20) throw new TicketError("LIMIT_REACHED", "A ticket can have at most 20 added members.");
    if (ticket.channelId) await this.requireGateway().setAccess({ guildId, channelId: ticket.channelId, mode: settings.mode, targetType: "USER", targetId: userId, access: "FULL" });
    const updated = await this.repository.updateTicket(id, { participantIds: [...ticket.participantIds, userId] });
    await this.event(id, "member-added", actor, { userId });
    await this.notice(updated, actor, `<@${userId}> was added to this ticket.`);
    return updated;
  }

  public async removeParticipant(guildId: string, id: string, actor: TicketActor, userId: string): Promise<Ticket> {
    requireSnowflake("userId", userId);
    const { ticket, settings } = await this.staffContext(guildId, id, actor);
    requireActive(ticket);
    if (userId === ticket.openerId) throw new TicketError("INVALID_STATE", "The ticket opener cannot be removed. Close the ticket instead.");
    if (!ticket.participantIds.includes(userId)) throw new TicketError("INVALID_STATE", "That member was not added to this ticket.");
    if (ticket.channelId) await this.requireGateway().setAccess({ guildId, channelId: ticket.channelId, mode: settings.mode, targetType: "USER", targetId: userId, access: "NONE" });
    const updated = await this.repository.updateTicket(id, { participantIds: ticket.participantIds.filter((item) => item !== userId) });
    await this.event(id, "member-removed", actor, { userId });
    await this.notice(updated, actor, `<@${userId}> was removed from this ticket.`);
    return updated;
  }

  public async rename(guildId: string, id: string, actor: TicketActor, name: string): Promise<Ticket> {
    const { ticket } = await this.staffContext(guildId, id, actor);
    const safe = channelName(name, placeholderValues(ticket, undefined, actor));
    if (!ticket.channelId) throw new TicketError("INVALID_STATE", "This ticket has no Discord channel.");
    await this.requireGateway().renameSpace(ticket.channelId, safe);
    await this.event(id, "renamed", actor, { name: safe });
    return ticket;
  }

  public async setPriority(guildId: string, id: string, actor: TicketActor, priority: TicketPriority): Promise<Ticket> {
    if (!TICKET_PRIORITIES.includes(priority)) invalid("Priority is not supported.");
    const { ticket, settings } = await this.staffContext(guildId, id, actor);
    if (ticket.priority === priority) return ticket;
    const updated = await this.repository.updateTicket(id, { priority });
    await this.event(id, "priority-changed", actor, { from: ticket.priority, to: priority });
    await this.notice(updated, actor, `Priority set to **${priority.toLowerCase()}**.`);
    if (priority === "URGENT") await this.log(settings, updated, `Ticket #${updated.number} marked urgent`, `<@${actor.userId}> escalated the ticket.`, "#ED4245");
    return updated;
  }

  public async setPending(guildId: string, id: string, actor: TicketActor, pending: boolean): Promise<Ticket> {
    const { ticket } = await this.staffContext(guildId, id, actor);
    requireActive(ticket);
    const status: TicketStatus = pending ? "PENDING" : ticket.claimedById ? "CLAIMED" : "OPEN";
    if (status === ticket.status) return ticket;
    const updated = await this.repository.updateTicket(id, { status, lastActivityAt: this.now() });
    await this.event(id, pending ? "awaiting-response" : "resumed", actor, {});
    await this.notice(updated, actor, pending ? `Waiting for a reply from <@${ticket.openerId}>.` : "This ticket is active again.");
    return updated;
  }

  public async setTags(guildId: string, id: string, actor: TicketActor, tags: readonly string[]): Promise<Ticket> {
    await this.staffContext(guildId, id, actor);
    const normalized = unique(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean));
    if (normalized.length > 10) invalid("A ticket can have at most 10 tags.");
    for (const tag of normalized) requireLength("tag", tag, 1, 32);
    const updated = await this.repository.updateTicket(id, { tags: normalized });
    await this.event(id, "tags-changed", actor, { tags: normalized.join(", ") });
    return updated;
  }

  public async addNote(guildId: string, id: string, actor: TicketActor, content: string): Promise<TicketMessage> {
    requireLength("note", content.trim(), 1, 4000);
    const { ticket } = await this.staffContext(guildId, id, actor);
    // Staff chat is one conversation: a note written outside Discord is posted into the staff thread too.
    const gateway = this.gateway;
    const threadId = ticket.staffThreadId;
    if (gateway && threadId && ticket.status !== "CLOSED") {
      const author = actor.source === "WEB" ? `${actor.displayName} (from portal)` : actor.displayName;
      await this.attempt(id, actor, "staff-thread-note", () =>
        gateway.postNotice({ channelId: threadId, content: `**${author}:**\n${content.trim()}`.slice(0, 2000), silent: true }).then(() => undefined),
      );
    }
    const message = await this.repository.addMessage({
      ticketId: id,
      authorId: actor.userId,
      authorName: actor.displayName,
      content: content.trim(),
      attachments: [],
      source: actor.source,
      internal: true,
    });
    await this.event(id, "note-added", actor, {});
    return message;
  }

  /** Sends a staff reply from the portal into the Discord ticket. */
  public async reply(guildId: string, id: string, actor: TicketActor, content: string): Promise<TicketMessage> {
    requireLength("reply", content.trim(), 1, 1900);
    const { ticket } = await this.staffContext(guildId, id, actor);
    requireActive(ticket);
    if (!ticket.channelId) throw new TicketError("INVALID_STATE", "This ticket has no Discord channel.");
    const { messageId } = await this.requireGateway().postNotice({
      channelId: ticket.channelId,
      title: `${actor.displayName} (support team)`,
      content: content.trim(),
    });
    const message = await this.repository.addMessage({
      ticketId: id,
      discordMessageId: messageId,
      authorId: actor.userId,
      authorName: actor.displayName,
      content: content.trim(),
      attachments: [],
      source: actor.source,
      internal: false,
    });
    await this.repository.updateTicket(id, {
      lastActivityAt: this.now(),
      autoCloseWarnedAt: null,
      ...(ticket.firstResponseAt ? {} : { firstResponseAt: this.now() }),
    });
    return message;
  }

  /**
   * Stores a Discord message sent inside a ticket channel for transcripts.
   * Messages in the ticket's staff thread are stored as staff chat (internal).
   */
  public async recordMessage(input: RecordedDiscordMessage): Promise<TicketMessage | undefined> {
    const ticket = await this.repository.findTicketByChannel(input.channelId);
    if (!ticket) {
      const staffTicket = await this.repository.findTicketByStaffThread(input.channelId);
      if (!staffTicket || staffTicket.status === "CLOSED") return undefined;
      return this.repository.addMessage({
        ticketId: staffTicket.id,
        discordMessageId: input.discordMessageId,
        authorId: input.authorId,
        authorName: input.authorName,
        content: input.content.slice(0, 4000),
        attachments: input.attachments.slice(0, 10),
        source: "DISCORD",
        internal: true,
      });
    }
    if (ticket.status === "CLOSED") return undefined;
    const message = await this.repository.addMessage({
      ticketId: ticket.id,
      discordMessageId: input.discordMessageId,
      authorId: input.authorId,
      authorName: input.authorName,
      content: input.content.slice(0, 4000),
      attachments: input.attachments.slice(0, 10),
      source: "DISCORD",
      internal: false,
    });
    const patch: { -readonly [K in keyof TicketPatch]: TicketPatch[K] } = { lastActivityAt: this.now(), autoCloseWarnedAt: null };
    const firstStaffMessage = ticket.staffThreadId !== undefined && !this.staffThreadMembers.has(`${ticket.staffThreadId}:${input.authorId}`);
    if (input.authorId !== ticket.openerId && (!ticket.firstResponseAt || firstStaffMessage)) {
      const settings = await this.settings(ticket.guildId);
      const category = await this.categoryFor(ticket);
      const actor: TicketActor = { userId: input.authorId, displayName: input.authorName, roleIds: input.authorRoleIds, elevated: false, source: "DISCORD" };
      if (this.isStaff(settings, category, actor)) {
        if (!ticket.firstResponseAt) patch.firstResponseAt = this.now();
        // Staff who talk in the ticket join its staff chat on their first message.
        if (firstStaffMessage) await this.addStaffThreadMember(ticket, input.authorId, actor);
      }
    }
    if (ticket.status === "PENDING" && input.authorId === ticket.openerId) patch.status = ticket.claimedById ? "CLAIMED" : "OPEN";
    await this.repository.updateTicket(ticket.id, patch);
    return message;
  }

  /** True when the actor may close this ticket. */
  public async canClose(ticket: Ticket, actor: TicketActor): Promise<boolean> {
    const settings = await this.settings(ticket.guildId);
    if (this.isStaff(settings, await this.categoryFor(ticket), actor)) return true;
    return settings.allowUserClose && ticket.openerId === actor.userId;
  }

  public async close(guildId: string, id: string, actor: TicketActor, reason?: string): Promise<Ticket> {
    const ticket = await this.ticket(guildId, id);
    const settings = await this.settings(guildId);
    if (ticket.status === "CLOSED") throw new TicketError("INVALID_STATE", "This ticket is already closed.");
    if (actor.source !== "SYSTEM" && !(await this.canClose(ticket, actor)))
      throw new TicketError("FORBIDDEN", "You are not allowed to close this ticket.");
    const trimmed = reason?.trim() || undefined;
    if (trimmed !== undefined) requireLength("reason", trimmed, 1, 500);
    if (settings.requireCloseReason && !trimmed && actor.source !== "SYSTEM") invalid("A reason is required to close tickets on this server.");

    const closed = await this.repository.updateTicket(id, {
      status: "CLOSED",
      closedAt: this.now(),
      closedById: actor.userId,
      closeReason: trimmed ?? null,
      autoCloseWarnedAt: null,
    });
    await this.event(id, "closed", actor, { reason: trimmed ?? null });
    const gateway = this.gateway;
    if (!gateway) return closed;

    if (closed.channelId) {
      const channelId = closed.channelId;
      await this.attempt(id, actor, "close-notice", () =>
        gateway.postNotice({
          channelId,
          title: "Ticket closed",
          content: `Closed by <@${actor.userId}>${trimmed ? `\n**Reason:** ${trimmed}` : ""}`,
          color: "#ED4245",
          closedControlsTicketId: settings.closeAction === "ARCHIVE" ? id : undefined,
        }).then(() => undefined),
      );
      if (settings.mode === "CHANNEL")
        for (const userId of [closed.openerId, ...closed.participantIds])
          await this.attempt(id, actor, "revoke-access", () =>
            gateway.setAccess({ guildId, channelId, mode: settings.mode, targetType: "USER", targetId: userId, access: "READ_ONLY" }),
          );
    }

    let finalTicket = closed;
    if (settings.transcriptsEnabled && settings.transcriptChannelId) {
      const transcriptChannelId = settings.transcriptChannelId;
      await this.attempt(id, actor, "post-transcript", async () => {
        // Staff copy: includes the staff chat.
        const files = await this.transcriptFiles(closed, settings, true);
        const { messageId } = await gateway.postTranscript({
          channelId: transcriptChannelId,
          ticket: closed,
          summary: closeSummary(closed),
          files,
        });
        finalTicket = await this.repository.updateTicket(id, { transcriptMessageId: messageId });
      });
    }
    if (settings.transcriptDmUser || settings.feedbackEnabled) {
      let sent = false;
      await this.attempt(id, actor, "direct-message", async () => {
        const message = await this.memberDirectMessage(closed, settings, trimmed, { transcript: settings.transcriptDmUser, feedback: settings.feedbackEnabled });
        sent = await gateway.directMessage(message);
      });
      if (!sent && settings.transcriptDmUser) await this.transcriptDmFailed(closed, actor, true);
    }
    if (closed.channelId) {
      const channelId = closed.channelId;
      await this.attempt(id, actor, "close-space", () =>
        gateway.closeSpace({
          guildId,
          channelId,
          mode: settings.mode,
          action: settings.closeAction,
          ...(settings.closedCategoryChannelId ? { closedParentChannelId: settings.closedCategoryChannelId } : {}),
          deleteDelaySeconds: settings.deleteDelaySeconds,
        }),
      );
      if (settings.closeAction === "DELETE") finalTicket = await this.repository.updateTicket(id, { channelId: null });
    }
    finalTicket = await this.closeStaffThread(finalTicket, closed.staffThreadId, settings, actor, settings.closeAction === "DELETE" ? settings.deleteDelaySeconds : undefined);
    await this.log(settings, closed, `Ticket #${closed.number} closed`, `Closed by <@${actor.userId}>${trimmed ? `\nReason: ${trimmed}` : ""}`, "#ED4245");
    return finalTicket;
  }

  public async reopen(guildId: string, id: string, actor: TicketActor): Promise<Ticket> {
    const { ticket, settings } = await this.staffContext(guildId, id, actor);
    if (ticket.status !== "CLOSED") throw new TicketError("INVALID_STATE", "Only closed tickets can be reopened.");
    if (!ticket.channelId) throw new TicketError("INVALID_STATE", "The ticket channel was deleted, so this ticket cannot be reopened.");
    const channelId = ticket.channelId;
    const gateway = this.requireGateway();
    const category = await this.categoryFor(ticket);
    const openParent = category?.parentChannelId ?? (settings.mode === "THREAD" ? settings.threadParentChannelId : settings.openCategoryChannelId);
    await gateway.reopenSpace({ guildId, channelId, mode: settings.mode, ...(openParent ? { openParentChannelId: openParent } : {}) });
    if (settings.mode === "CHANNEL")
      for (const userId of [ticket.openerId, ...ticket.participantIds])
        await gateway.setAccess({ guildId, channelId, mode: settings.mode, targetType: "USER", targetId: userId, access: "FULL" });
    const updated = await this.repository.updateTicket(id, {
      status: ticket.claimedById ? "CLAIMED" : "OPEN",
      closedAt: null,
      closedById: null,
      closeReason: null,
      lastActivityAt: this.now(),
    });
    const staffThreadId = ticket.staffThreadId;
    const setArchived = gateway.setThreadArchived?.bind(gateway);
    if (staffThreadId && setArchived) await this.attempt(id, actor, "staff-thread-reopen", () => setArchived(staffThreadId, false));
    await this.event(id, "reopened", actor, {});
    await this.notice(updated, actor, `Ticket reopened by <@${actor.userId}>.`);
    await this.log(settings, updated, `Ticket #${updated.number} reopened`, `<@${actor.userId}> reopened the ticket.`, "#57F287");
    return updated;
  }

  /** Deletes the Discord channel of a closed ticket. The record and transcript stay. */
  public async deleteChannel(guildId: string, id: string, actor: TicketActor): Promise<Ticket> {
    const { ticket, settings } = await this.staffContext(guildId, id, actor);
    if (ticket.status !== "CLOSED") throw new TicketError("INVALID_STATE", "Close the ticket before deleting its channel.");
    if (!ticket.channelId) throw new TicketError("INVALID_STATE", "The ticket channel was already deleted.");
    await this.requireGateway().deleteSpace(ticket.channelId, 5);
    const updated = await this.closeStaffThread(await this.repository.updateTicket(id, { channelId: null }), ticket.staffThreadId, settings, actor, 5);
    await this.event(id, "channel-deleted", actor, {});
    return updated;
  }

  /** Marks a ticket closed when its Discord channel disappears, and forgets a deleted staff thread. */
  public async handleChannelDeleted(channelId: string): Promise<void> {
    const ticket = await this.repository.findTicketByChannel(channelId);
    if (!ticket) {
      const staffTicket = await this.repository.findTicketByStaffThread(channelId);
      if (!staffTicket) return;
      await this.repository.updateTicket(staffTicket.id, { staffThreadId: null });
      await this.event(staffTicket.id, "staff-thread-removed", systemActor(), {});
      return;
    }
    const settings = await this.settings(ticket.guildId);
    // Channel mode: the staff thread lived inside the deleted channel. Thread mode: it stays, archived.
    const insideChannel = settings.mode === "CHANNEL";
    await this.repository.updateTicket(ticket.id, {
      channelId: null,
      ...(insideChannel && ticket.staffThreadId ? { staffThreadId: null } : {}),
      ...(ticket.status === "CLOSED" ? {} : { status: "CLOSED", closedAt: this.now(), closeReason: "Ticket channel was deleted." }),
    });
    await this.event(ticket.id, "channel-removed", systemActor(), {});
    const staffThreadId = ticket.staffThreadId;
    const setArchived = this.gateway?.setThreadArchived?.bind(this.gateway);
    if (!insideChannel && staffThreadId && setArchived && ticket.status !== "CLOSED")
      await this.attempt(ticket.id, systemActor(), "staff-thread-archive", () => setArchived(staffThreadId, true));
  }

  public async rate(id: string, userId: string, rating: number, feedback?: string): Promise<Ticket> {
    const ticket = await this.repository.getTicket(id);
    if (!ticket) throw new TicketError("NOT_FOUND", "Ticket was not found.");
    if (ticket.openerId !== userId) throw new TicketError("FORBIDDEN", "Only the ticket opener can rate this ticket.");
    if (ticket.status !== "CLOSED") throw new TicketError("INVALID_STATE", "Tickets can be rated after they close.");
    const settings = await this.settings(ticket.guildId);
    if (!settings.feedbackEnabled) throw new TicketError("DISABLED", "Ticket feedback is turned off.");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) invalid("Rating must be between 1 and 5.");
    const text = feedback?.trim() || undefined;
    if (text !== undefined) requireLength("feedback", text, 1, 1000);
    const updated = await this.repository.updateTicket(id, { rating, ...(text === undefined ? {} : { feedback: text }) });
    await this.event(id, "rated", { userId, source: "DISCORD" }, { rating });
    await this.log(settings, updated, `Ticket #${updated.number} rated ${rating}/5`, text ? `"${text}"` : `<@${userId}> left a rating.`, "#5865F2");
    return updated;
  }

  /** Renders a plain-text transcript. The staff chat is included only in staff copies. */
  public async transcript(guildId: string, id: string, includeInternal: boolean): Promise<TicketTranscriptFile> {
    const ticket = await this.ticket(guildId, id);
    const [text] = await this.transcriptFiles(ticket, await this.settings(guildId), includeInternal);
    return text;
  }

  /** The .txt and .html transcripts. Member copies never include the staff chat. */
  public async transcriptFiles(ticket: Ticket, settings: TicketSettings, includeStaffChat: boolean): Promise<readonly [TicketTranscriptFile, TicketTranscriptFile]> {
    const messages = await this.repository.listMessages(ticket.id);
    const serverName = this.gateway ? await this.gateway.guildName(ticket.guildId).catch(() => undefined) : undefined;
    const input = {
      ticket,
      messages,
      includeStaffChat,
      serverName,
      deletionDate: deletionDate(ticket, settings),
      byteLimit: this.options.transcriptByteLimit ?? TRANSCRIPT_BYTE_LIMIT,
    };
    return [renderTextTranscript(input), renderHtmlTranscript(input)];
  }

  /**
   * Portal retry: DMs the member their transcript (summary, .txt and .html,
   * no staff chat) for a closed ticket.
   */
  public async sendTranscriptToMember(guildId: string, id: string, actor: TicketActor): Promise<{ readonly sent: true }> {
    const { ticket, settings } = await this.staffContext(guildId, id, actor);
    if (ticket.status !== "CLOSED") throw new TicketError("INVALID_STATE", "Transcripts are sent once the ticket is closed.");
    const gateway = this.requireGateway();
    const message = await this.memberDirectMessage(ticket, settings, ticket.closeReason, { transcript: true, feedback: false });
    if (!(await gateway.directMessage(message).catch(() => false))) {
      await this.transcriptDmFailed(ticket, actor, false);
      throw new TicketError("INVALID_STATE", "The member's DMs are closed, so the transcript could not be sent.");
    }
    await this.event(id, "transcript-dm-sent", actor, {});
    return { sent: true };
  }

  /**
   * Deletes CLOSED tickets older than each server's retention (with their
   * messages and events), 200 at a time. Open tickets are never deleted.
   */
  public async sweepRetention(): Promise<RetentionSweepResult> {
    let deleted = 0;
    const policies = await this.repository.listRetentionPolicies();
    for (const policy of policies) {
      if (policy.retentionMonths <= 0) continue;
      const cutoff = addMonths(this.now(), -policy.retentionMonths);
      for (;;) {
        const count = await this.repository.deleteClosedTickets(policy.guildId, cutoff, RETENTION_BATCH_SIZE);
        deleted += count;
        if (count < RETENTION_BATCH_SIZE) break;
      }
    }
    return { deleted, guilds: policies.length };
  }

  /** Transcript for a member: staff get internal notes, the opener gets the public copy. */
  public async transcriptFor(guildId: string, id: string, actor: TicketActor): Promise<TicketTranscriptFile> {
    const ticket = await this.ticket(guildId, id);
    const staff = this.isStaff(await this.settings(guildId), await this.categoryFor(ticket), actor);
    if (!staff && ticket.openerId !== actor.userId)
      throw new TicketError("FORBIDDEN", "Only the support team or the ticket opener can download the transcript.");
    return this.transcript(guildId, id, staff);
  }

  /** Warns about and closes inactive tickets for every guild with auto-close enabled. */
  public async sweepAutoClose(): Promise<AutoCloseSweepResult> {
    let warned = 0;
    let closed = 0;
    const now = this.now();
    for (const guildId of await this.repository.listAutoCloseGuilds()) {
      const settings = await this.settings(guildId);
      if (!settings.enabled || settings.autoCloseHours <= 0) continue;
      const threshold = settings.autoCloseHours - settings.autoCloseWarningHours;
      const candidates = await this.repository.listTickets({
        guildId,
        statuses: settings.autoCloseExcludeClaimed ? ["OPEN", "PENDING"] : ACTIVE_STATUSES,
        lastActivityBefore: new Date(now.getTime() - threshold * HOUR_MS),
        limit: 200,
      });
      for (const ticket of candidates) {
        const idleHours = (now.getTime() - ticket.lastActivityAt.getTime()) / HOUR_MS;
        if (idleHours >= settings.autoCloseHours && (settings.autoCloseWarningHours === 0 || ticket.autoCloseWarnedAt)) {
          await this.close(guildId, ticket.id, systemActor(), `Closed automatically after ${settings.autoCloseHours} hours without activity.`);
          closed += 1;
        } else if (settings.autoCloseWarningHours > 0 && !ticket.autoCloseWarnedAt) {
          await this.repository.updateTicket(ticket.id, { autoCloseWarnedAt: now });
          await this.notice(ticket, systemActor(), `<@${ticket.openerId}> this ticket will close automatically in ${settings.autoCloseWarningHours} hour${settings.autoCloseWarningHours === 1 ? "" : "s"} if there is no reply.`);
          warned += 1;
        }
      }
    }
    return { warned, closed };
  }

  private async staffContext(guildId: string, id: string, actor: TicketActor): Promise<{ ticket: Ticket; settings: TicketSettings }> {
    const ticket = await this.ticket(guildId, id);
    const settings = await this.settings(guildId);
    if (!this.isStaff(settings, await this.categoryFor(ticket), actor))
      throw new TicketError("FORBIDDEN", "Only the support team can do that.");
    return { ticket, settings };
  }

  private async restrictStaff(ticket: Ticket, settings: TicketSettings, claimer: TicketActor, channelId: string, access: "FULL" | "READ_ONLY"): Promise<void> {
    const gateway = this.requireGateway();
    const category = await this.categoryFor(ticket);
    for (const roleId of unique([...settings.supportRoleIds, ...(category?.supportRoleIds ?? [])]))
      await this.attempt(ticket.id, claimer, "claim-restrict", () =>
        gateway.setAccess({ guildId: ticket.guildId, channelId, mode: settings.mode, targetType: "ROLE", targetId: roleId, access }),
      );
    if (access === "READ_ONLY")
      await this.attempt(ticket.id, claimer, "claim-restrict", () =>
        gateway.setAccess({ guildId: ticket.guildId, channelId, mode: settings.mode, targetType: "USER", targetId: claimer.userId, access: "FULL" }),
      );
  }

  private async categoryFor(ticket: Ticket): Promise<TicketCategory | undefined> {
    if (!ticket.categoryId) return undefined;
    return (await this.repository.listCategories(ticket.guildId)).find((category) => category.id === ticket.categoryId);
  }

  private async requireCategory(guildId: string, id: string): Promise<TicketCategory> {
    const category = (await this.categories(guildId)).find((item) => item.id === id);
    if (!category) throw new TicketError("NOT_FOUND", "Ticket category was not found.");
    return category;
  }

  private async requirePanel(guildId: string, id: string): Promise<TicketPanel> {
    const panel = (await this.panels(guildId)).find((item) => item.id === id);
    if (!panel) throw new TicketError("NOT_FOUND", "Ticket panel was not found.");
    return panel;
  }

  /**
   * Creates the private staff thread, posts its first message (pinging the
   * support roles), and adds the reason's alerted members. The opener is never
   * added. A refusal from Discord is recorded and the ticket stays open.
   */
  private async createStaffThread(
    ticket: Ticket,
    actor: TicketActor,
    input: { parentChannelId: string; name: string; supportRoleIds: readonly string[]; alertUserIds: readonly string[]; reason: string },
  ): Promise<Ticket> {
    const create = this.gateway?.createStaffThread?.bind(this.gateway);
    if (!create) return ticket;
    const inTicket = input.parentChannelId === ticket.channelId;
    const content = [
      `Staff-only chat for Ticket #${ticket.number} – ${input.reason}. <@${ticket.openerId}> cannot see this thread.`,
      ...(inTicket || !ticket.channelId ? [] : [`Ticket: <#${ticket.channelId}>`]),
      ...(input.supportRoleIds.length ? [input.supportRoleIds.map((roleId) => `<@&${roleId}>`).join(" ")] : []),
    ].join("\n");
    let threadId: string;
    try {
      ({ threadId } = await create({
        guildId: ticket.guildId,
        parentChannelId: input.parentChannelId,
        name: [...input.name].slice(0, 100).join(""),
        content,
        mentionRoleIds: input.supportRoleIds,
        reason: `Staff chat for ${ticketLabel(ticket)}`,
      }));
    } catch (error) {
      await this.event(ticket.id, "staff-thread-failed", actor, { reason: staffThreadFailureReason(error) });
      return ticket;
    }
    const updated = await this.repository.updateTicket(ticket.id, { staffThreadId: threadId });
    await this.event(ticket.id, "staff-thread-created", actor, { threadId });
    for (const userId of unique(input.alertUserIds)) await this.addStaffThreadMember(updated, userId, actor);
    return updated;
  }

  /** Adds a staff member to the ticket's staff thread. Never the opener. */
  private async addStaffThreadMember(ticket: Ticket, userId: string, actor: TicketActor): Promise<void> {
    const threadId = ticket.staffThreadId;
    const add = this.gateway?.addThreadMember?.bind(this.gateway);
    if (!threadId || !add || userId === ticket.openerId || userId === "0") return;
    await this.attempt(ticket.id, actor, "staff-thread-member", async () => {
      await add(threadId, userId);
      this.rememberStaffMember(threadId, userId);
    });
  }

  private rememberStaffMember(threadId: string, userId: string): void {
    if (this.staffThreadMembers.size > 10_000) this.staffThreadMembers.clear();
    this.staffThreadMembers.add(`${threadId}:${userId}`);
  }

  /**
   * Closing: archives and locks the staff thread. Deleting (`deleteDelaySeconds`
   * set): in channel mode the thread goes with the channel; in thread mode it
   * is deleted too.
   */
  private async closeStaffThread(ticket: Ticket, threadId: string | undefined, settings: TicketSettings, actor: TicketActor, deleteDelaySeconds?: number): Promise<Ticket> {
    const gateway = this.gateway;
    if (!threadId || !gateway) return ticket;
    if (deleteDelaySeconds !== undefined) {
      if (settings.mode === "THREAD") await this.attempt(ticket.id, actor, "staff-thread-delete", () => gateway.deleteSpace(threadId, deleteDelaySeconds));
      return this.repository.updateTicket(ticket.id, { staffThreadId: null });
    }
    const setArchived = gateway.setThreadArchived?.bind(gateway);
    if (setArchived) await this.attempt(ticket.id, actor, "staff-thread-archive", () => setArchived(threadId, true));
    return ticket;
  }

  /** Records a transcript DM the member did not receive and, while the ticket is still in Discord, tells them there. */
  private async transcriptDmFailed(ticket: Ticket, actor: TicketActor, tellMember: boolean): Promise<void> {
    await this.event(ticket.id, "transcript-dm-failed", actor, { reason: "The member's DMs are closed." });
    if (tellMember)
      await this.notice(ticket, actor, `<@${ticket.openerId}>, your DMs are closed, so the transcript could not be sent. Staff can send it to you from the portal.`);
  }

  /**
   * The DM for the member: the `tickets.closed-dm` message, plus (with the
   * transcript) a summary embed and the .txt and .html files without staff chat.
   */
  private async memberDirectMessage(ticket: Ticket, settings: TicketSettings, closeReason: string | undefined, include: { transcript: boolean; feedback: boolean }): Promise<TicketDirectMessage> {
    const message = await this.closedDirectMessage(ticket, closeReason, include.feedback);
    if (!include.transcript) return { userId: ticket.openerId, message, ...(include.feedback ? { feedbackTicketId: ticket.id } : {}) };
    const files = await this.transcriptFiles(ticket, settings, false);
    const messages = (await this.repository.listMessages(ticket.id)).filter((item) => !item.internal).length;
    const server = this.gateway ? await this.gateway.guildName(ticket.guildId).catch(() => "the server") : "the server";
    const closedAt = ticket.closedAt ?? this.now();
    const summary = {
      title: `Ticket #${ticket.number} transcript`,
      color: colorValue(settings.embedColor),
      fields: [
        { name: "Ticket", value: `#${ticket.number}${ticket.categoryNumber ? ` · Reason #${ticket.categoryNumber}` : ""}`, inline: true },
        { name: "Server", value: server.slice(0, 1024), inline: true },
        { name: "Reason", value: (ticket.categoryName ?? "General support").slice(0, 1024), inline: true },
        { name: "Opened", value: discordTime(ticket.createdAt), inline: true },
        { name: "Closed", value: discordTime(closedAt), inline: true },
        { name: "Closed by", value: ticket.closedById && ticket.closedById !== "0" ? `<@${ticket.closedById}>` : BRAND.name, inline: true },
        { name: "Close reason", value: (closeReason ?? "No reason given").slice(0, 1024) },
        { name: "Messages", value: String(messages), inline: true },
      ],
      footer: { text: "The .txt file previews here. Open the .html file in any browser and keep it." },
    };
    return {
      userId: ticket.openerId,
      message: { ...message, embeds: [...(message.embeds ?? []), summary].slice(0, 10) },
      files,
      ...(include.feedback ? { feedbackTicketId: ticket.id } : {}),
    };
  }

  /** The `tickets.closed-dm` message for the member who opened the ticket. */
  private closedDirectMessage(ticket: Ticket, closeReason: string | undefined, feedback: boolean): Promise<OutgoingMessage> {
    const ratingPrompt = feedback ? "How did we do? Rate your support experience below." : "";
    return this.templates.apply(
      ticket.guildId,
      "tickets.closed-dm",
      {
        user: `<@${ticket.openerId}>`,
        username: ticket.openerName,
        number: ticket.number,
        reason: ticket.categoryName ?? "support",
        reasonNumber: ticket.categoryNumber ?? ticket.number,
        closeReason: closeReason ?? "",
        ratingPrompt,
      },
      { content: `Your ticket #${ticket.number} was closed${closeReason ? `: ${closeReason}` : "."}${ratingPrompt ? `\n${ratingPrompt}` : ""}` },
    );
  }

  private requireGateway(): TicketDiscordGateway {
    if (!this.gateway) throw new TicketError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
    return this.gateway;
  }

  private async notice(ticket: Ticket, actor: TicketActor, content: string): Promise<void> {
    const gateway = this.gateway;
    const channelId = ticket.channelId;
    if (!gateway || !channelId) return;
    await this.attempt(ticket.id, actor, "notice", () => gateway.postNotice({ channelId, content }).then(() => undefined));
  }

  private async log(settings: TicketSettings, ticket: Ticket, title: string, content: string, color: string): Promise<void> {
    const gateway = this.gateway;
    const channelId = settings.logChannelId;
    if (!gateway || !channelId) return;
    await this.attempt(ticket.id, systemActor(), "log", () => gateway.postNotice({ channelId, title, content, color }).then(() => undefined));
  }

  private async attempt(ticketId: string, actor: TicketActor, step: string, operation: () => Promise<void>): Promise<void> {
    try {
      await operation();
    } catch (error) {
      await this.event(ticketId, "discord-sync-failed", actor, { step, reason: errorText(error) }).catch(() => undefined);
    }
  }

  private async event(ticketId: string, action: string, actor: Pick<TicketActor, "userId" | "source">, details: Readonly<Record<string, string | number | boolean | null>>): Promise<void> {
    await this.repository.addEvent({ ticketId, action, actorId: actor.userId, source: actor.source, details });
  }
}

export function systemActor(): TicketActor {
  return { userId: "0", displayName: BRAND.name, roleIds: [], elevated: true, source: "SYSTEM" };
}

/** Categories a panel offers: its chosen list in order, or every enabled category. */
export function panelCategories(panel: TicketPanel, categories: readonly TicketCategory[]): readonly TicketCategory[] {
  const enabled = categories.filter((category) => category.enabled);
  if (panel.categoryIds.length === 0) return [...enabled].sort((left, right) => left.position - right.position);
  return panel.categoryIds.flatMap((id) => enabled.filter((category) => category.id === id));
}

function collectAnswers(category: TicketCategory | undefined, answers: Readonly<Record<string, string>>): readonly TicketAnswer[] {
  if (!category) return [];
  return category.questions.flatMap((question) => {
    const answer = answers[question.id]?.trim() ?? "";
    if (!answer) {
      if (question.required) invalid(`"${question.label}" is required.`);
      return [];
    }
    requireLength(question.label, answer, question.minLength ?? 1, question.maxLength ?? 4000);
    return [{ question: question.label, answer }];
  });
}

/** Channel name for a ticket opened under a reason that has no template of its own: "donations-5". */
export const DEFAULT_REASON_NAME_TEMPLATE = "{reason}-{reasonNumber}";

function placeholderValues(ticket: Ticket, category: TicketCategory | undefined, actor: TicketActor): Readonly<Record<string, string>> {
  return {
    user: `<@${actor.userId}>`,
    username: actor.displayName,
    number: String(ticket.number),
    category: category?.name ?? ticket.categoryName ?? "support",
    reason: category?.name ?? ticket.categoryName ?? "support",
    reasonNumber: String(ticket.categoryNumber ?? ticket.number),
    subject: ticket.subject ?? "",
  };
}

export { ticketLabel };

function openingBody(message: string, ticket: Ticket): string {
  const parts = [message];
  if (ticket.subject) parts.push(`**Subject:** ${ticket.subject}`);
  for (const answer of ticket.answers) parts.push(`**${answer.question}**\n${answer.answer}`);
  return parts.join("\n\n").slice(0, 4000);
}

function closeSummary(ticket: Ticket): string {
  return [
    `**${ticketLabel(ticket)}**`,
    `Opened by <@${ticket.openerId}>`,
    ticket.claimedById ? `Handled by <@${ticket.claimedById}>` : "Unclaimed",
    `Closed by ${ticket.closedById && ticket.closedById !== "0" ? `<@${ticket.closedById}>` : BRAND.name}`,
    ...(ticket.closeReason ? [`Reason: ${ticket.closeReason}`] : []),
  ].join("\n");
}

/** True when tickets of this reason get a staff thread. */
function staffThreadWanted(settings: TicketSettings, category: TicketCategory | undefined): boolean {
  const mode = category?.staffThread ?? "INHERIT";
  return mode === "INHERIT" ? settings.staffThreadEnabled : mode === "ON";
}

/** Why Discord refused to create the staff thread, in plain words. */
function staffThreadFailureReason(error: unknown): string {
  const code = typeof error === "object" && error !== null ? Reflect.get(error, "code") : undefined;
  const message = error instanceof Error ? error.message : "";
  if (code === 50013 || code === 50001 || /missing (permissions|access)/i.test(message)) return STAFF_THREAD_PERMISSION_REASON;
  return `Discord refused: ${errorText(error)}`;
}

/** When a closed ticket is deleted under the server's retention, or undefined when kept forever. */
function deletionDate(ticket: Ticket, settings: TicketSettings): Date | undefined {
  if (settings.retentionMonths <= 0) return undefined;
  return addMonths(ticket.closedAt ?? ticket.updatedAt, settings.retentionMonths);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

/** Discord timestamp markup, shown in each reader's own time zone. */
function discordTime(date: Date): string {
  return `<t:${Math.floor(date.getTime() / 1000)}:f>`;
}

function requireActive(ticket: Ticket): void {
  if (ticket.status === "CLOSED") throw new TicketError("INVALID_STATE", "This ticket is closed.");
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function normalizeColor(value: string): string {
  return (value.startsWith("#") ? value : `#${value}`).toUpperCase();
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message.slice(0, 200) : "unknown error";
}
