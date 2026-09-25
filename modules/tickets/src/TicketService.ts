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
} from "./types.js";
import { TICKET_PRIORITIES } from "./types.js";
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

const ACTIVE_STATUSES: readonly TicketStatus[] = ["OPEN", "CLAIMED", "PENDING"];
const HOUR_MS = 60 * 60 * 1000;

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
    transcriptDmUser: false,
    feedbackEnabled: true,
    autoCloseHours: 0,
    autoCloseWarningHours: 0,
    autoCloseExcludeClaimed: true,
    blockedUserIds: [],
    blockedRoleIds: [],
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
  public constructor(
    private readonly repository: TicketRepository,
    private readonly gateway?: TicketDiscordGateway,
    private readonly now: () => Date = () => new Date(),
  ) {}

  public async settings(guildId: string): Promise<TicketSettings> {
    requireSnowflake("guildId", guildId);
    return (await this.repository.getSettings(guildId)) ?? defaultTicketSettings(guildId);
  }

  public async saveSettings(input: TicketSettingsInput): Promise<TicketSettings> {
    validateSettings(input);
    return this.repository.saveSettings({
      ...input,
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
    return this.repository.savePanel({ ...input, name: input.name.trim(), color: normalizeColor(input.color), categoryIds: unique(input.categoryIds) });
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
    const created = await this.repository.createTicket({
      guildId: input.guildId,
      number,
      ...(category ? { categoryId: category.id } : {}),
      openerId: input.actor.userId,
      openerName: input.actor.displayName,
      ...(input.subject ? { subject: input.subject } : {}),
      answers,
      priority: input.priority ?? category?.defaultPriority ?? "NORMAL",
    });
    const values = placeholderValues(created, category, input.actor);
    const supportRoleIds = unique([...settings.supportRoleIds, ...(category?.supportRoleIds ?? [])]);
    let channelId: string;
    try {
      ({ channelId } = await gateway.createTicketSpace({
        guildId: input.guildId,
        mode: settings.mode,
        ...(parentChannelId ? { parentChannelId } : {}),
        name: channelName(category?.nameTemplate ?? settings.nameTemplate, values),
        openerId: input.actor.userId,
        supportRoleIds,
        memberIds: (category?.alertUserIds ?? []).filter((userId) => userId !== input.actor.userId),
        topic: `Ticket #${number} opened by ${input.actor.displayName}${category ? ` (${category.name})` : ""}`,
      }));
    } catch (error) {
      await this.repository.updateTicket(created.id, { status: "CLOSED", closedAt: this.now(), closeReason: "Discord channel could not be created." });
      await this.event(created.id, "open-failed", input.actor, { reason: errorText(error) });
      throw new TicketError("DEPENDENCY_UNAVAILABLE", "The ticket channel could not be created. Check the bot's permissions and try again.");
    }
    const ticket = await this.repository.updateTicket(created.id, { channelId, lastActivityAt: this.now() });
    await this.event(ticket.id, "opened", input.actor, {
      category: category?.name ?? null,
      priority: ticket.priority,
    });
    await this.attempt(ticket.id, input.actor, "post-opening", () =>
      gateway.postOpening({
        channelId,
        ticket,
        title: `Ticket #${ticket.number}${category ? ` - ${category.name}` : ""}`,
        body: openingBody(renderText(category?.openMessage ?? settings.openMessage, values), ticket),
        color: settings.embedColor,
        mentionUserIds: unique([input.actor.userId, ...(category?.alertUserIds ?? [])]),
        mentionRoleIds: settings.pingSupportOnOpen ? supportRoleIds : [],
        claimButton: settings.claimEnabled,
      }),
    );
    await this.log(settings, ticket, `Ticket #${ticket.number} opened`, `<@${ticket.openerId}> opened <#${channelId}>${category ? ` in **${category.name}**` : ""}.`, "#57F287");
    return ticket;
  }

  public async ticketForChannel(channelId: string): Promise<Ticket | undefined> {
    return this.repository.findTicketByChannel(channelId);
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
    const safe = channelName(name, { number: String(ticket.number) });
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
    await this.staffContext(guildId, id, actor);
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

  /** Stores a Discord message sent inside a ticket channel for transcripts. */
  public async recordMessage(input: RecordedDiscordMessage): Promise<TicketMessage | undefined> {
    const ticket = await this.repository.findTicketByChannel(input.channelId);
    if (!ticket || ticket.status === "CLOSED") return undefined;
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
    if (input.authorId !== ticket.openerId && !ticket.firstResponseAt) {
      const settings = await this.settings(ticket.guildId);
      const category = await this.categoryFor(ticket);
      const actor: TicketActor = { userId: input.authorId, displayName: input.authorName, roleIds: input.authorRoleIds, elevated: false, source: "DISCORD" };
      if (this.isStaff(settings, category, actor)) patch.firstResponseAt = this.now();
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
    const transcript = settings.transcriptsEnabled || settings.transcriptDmUser ? await this.transcript(guildId, id, true) : undefined;
    if (transcript && settings.transcriptsEnabled && settings.transcriptChannelId) {
      const transcriptChannelId = settings.transcriptChannelId;
      await this.attempt(id, actor, "post-transcript", async () => {
        const { messageId } = await gateway.postTranscript({
          channelId: transcriptChannelId,
          ticket: closed,
          summary: closeSummary(closed),
          file: transcript,
        });
        finalTicket = await this.repository.updateTicket(id, { transcriptMessageId: messageId });
      });
    }
    if (settings.transcriptDmUser || settings.feedbackEnabled) {
      const publicTranscript = settings.transcriptDmUser ? await this.transcript(guildId, id, false) : undefined;
      await this.attempt(id, actor, "direct-message", () =>
        gateway.directMessage({
          userId: closed.openerId,
          content: `Your ticket #${closed.number} was closed${trimmed ? `: ${trimmed}` : "."}${settings.feedbackEnabled ? "\nHow did we do? Rate your support experience below." : ""}`,
          ...(publicTranscript ? { file: publicTranscript } : {}),
          ...(settings.feedbackEnabled ? { feedbackTicketId: id } : {}),
        }).then(() => undefined),
      );
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
    await this.event(id, "reopened", actor, {});
    await this.notice(updated, actor, `Ticket reopened by <@${actor.userId}>.`);
    await this.log(settings, updated, `Ticket #${updated.number} reopened`, `<@${actor.userId}> reopened the ticket.`, "#57F287");
    return updated;
  }

  /** Deletes the Discord channel of a closed ticket. The record and transcript stay. */
  public async deleteChannel(guildId: string, id: string, actor: TicketActor): Promise<Ticket> {
    const { ticket } = await this.staffContext(guildId, id, actor);
    if (ticket.status !== "CLOSED") throw new TicketError("INVALID_STATE", "Close the ticket before deleting its channel.");
    if (!ticket.channelId) throw new TicketError("INVALID_STATE", "The ticket channel was already deleted.");
    await this.requireGateway().deleteSpace(ticket.channelId, 5);
    const updated = await this.repository.updateTicket(id, { channelId: null });
    await this.event(id, "channel-deleted", actor, {});
    return updated;
  }

  /** Marks a ticket closed when its Discord channel disappears. */
  public async handleChannelDeleted(channelId: string): Promise<void> {
    const ticket = await this.repository.findTicketByChannel(channelId);
    if (!ticket) return;
    await this.repository.updateTicket(ticket.id, {
      channelId: null,
      ...(ticket.status === "CLOSED" ? {} : { status: "CLOSED", closedAt: this.now(), closeReason: "Ticket channel was deleted." }),
    });
    await this.event(ticket.id, "channel-removed", systemActor(), {});
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

  /** Renders a plain-text transcript. Internal notes are included only for staff copies. */
  public async transcript(guildId: string, id: string, includeInternal: boolean): Promise<TicketTranscriptFile> {
    const ticket = await this.ticket(guildId, id);
    const messages = await this.repository.listMessages(id);
    const lines = [
      `Ticket #${ticket.number}${ticket.categoryName ? ` - ${ticket.categoryName}` : ""}`,
      `Opened by ${ticket.openerName} (${ticket.openerId}) at ${ticket.createdAt.toISOString()}`,
      `Status: ${ticket.status}  Priority: ${ticket.priority}${ticket.claimedById ? `  Claimed by: ${ticket.claimedById}` : ""}`,
      ...(ticket.subject ? [`Subject: ${ticket.subject}`] : []),
      ...ticket.answers.map((answer) => `${answer.question}: ${answer.answer}`),
      ...(ticket.closedAt ? [`Closed at ${ticket.closedAt.toISOString()} by ${ticket.closedById ?? "system"}${ticket.closeReason ? ` - ${ticket.closeReason}` : ""}`] : []),
      "-".repeat(60),
      ...messages
        .filter((message) => includeInternal || !message.internal)
        .flatMap((message) => [
          `[${message.createdAt.toISOString()}] ${message.internal ? "[internal note] " : ""}${message.authorName}: ${message.content}`,
          ...message.attachments.map((url) => `    attachment: ${url}`),
        ]),
    ];
    return { fileName: `ticket-${ticket.number}-transcript.txt`, content: `${lines.join("\n")}\n` };
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
  return { userId: "0", displayName: "Qbox", roleIds: [], elevated: true, source: "SYSTEM" };
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

function placeholderValues(ticket: Ticket, category: TicketCategory | undefined, actor: TicketActor): Readonly<Record<string, string>> {
  return {
    user: `<@${actor.userId}>`,
    username: actor.displayName,
    number: String(ticket.number),
    category: category?.name ?? "support",
    subject: ticket.subject ?? "",
  };
}

function openingBody(message: string, ticket: Ticket): string {
  const parts = [message];
  if (ticket.subject) parts.push(`**Subject:** ${ticket.subject}`);
  for (const answer of ticket.answers) parts.push(`**${answer.question}**\n${answer.answer}`);
  return parts.join("\n\n").slice(0, 4000);
}

function closeSummary(ticket: Ticket): string {
  return [
    `**Ticket #${ticket.number}**${ticket.categoryName ? ` - ${ticket.categoryName}` : ""}`,
    `Opened by <@${ticket.openerId}>`,
    ticket.claimedById ? `Handled by <@${ticket.claimedById}>` : "Unclaimed",
    `Closed by ${ticket.closedById && ticket.closedById !== "0" ? `<@${ticket.closedById}>` : "Qbox"}`,
    ...(ticket.closeReason ? [`Reason: ${ticket.closeReason}`] : []),
  ].join("\n");
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
