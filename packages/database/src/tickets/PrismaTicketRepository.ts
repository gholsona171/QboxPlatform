import {
  TicketError,
  type Ticket,
  type TicketAnswer,
  type TicketCategory,
  type TicketCategoryInput,
  type TicketCreateData,
  type TicketEvent,
  type TicketEventInput,
  type TicketListFilter,
  type TicketMessage,
  type TicketMessageInput,
  type TicketPanel,
  type TicketPanelInput,
  type TicketPatch,
  type TicketQuestion,
  type TicketRepository,
  type TicketRetentionPolicy,
  type TicketSettings,
  type TicketStaffThreadMode,
  type TicketSettingsInput,
  type TicketStats,
} from "@qbox/tickets";
import { Prisma, type PrismaClient } from "@qbox/prisma";

import { GuildRowIds } from "../policies/GuildRowIds.js";

type Client = Pick<
  PrismaClient,
  "guild" | "ticketSettings" | "ticketCategory" | "ticketPanel" | "ticket" | "ticketMessage" | "ticketEvent" | "$transaction"
>;

type SettingsRow = Prisma.TicketSettingsGetPayload<object>;
type CategoryRow = Prisma.TicketCategoryGetPayload<object>;
type PanelRow = Prisma.TicketPanelGetPayload<object>;
type TicketRow = Prisma.TicketGetPayload<{ include: typeof ticketInclude }>;
type MessageRow = Prisma.TicketMessageGetPayload<object>;
type EventRow = Prisma.TicketEventGetPayload<object>;

const ticketInclude = {
  guild: { select: { discordGuildId: true } },
  category: { select: { name: true } },
} as const;

/** PostgreSQL ticket persistence. Guild IDs in and out are Discord snowflakes. */
export class PrismaTicketRepository implements TicketRepository {
  private readonly guildRows: GuildRowIds;

  public constructor(private readonly client: Client) {
    this.guildRows = new GuildRowIds(client);
  }

  public async getSettings(guildId: string): Promise<TicketSettings | undefined> {
    const row = await this.client.ticketSettings.findFirst({ where: { guild: { discordGuildId: guildId } } });
    return row ? mapSettings(guildId, row) : undefined;
  }

  public async saveSettings(input: TicketSettingsInput): Promise<TicketSettings> {
    const guild = await this.ensureGuild(input.guildId);
    const data = settingsData(input);
    const existing = await this.client.ticketSettings.findUnique({ where: { guildId: guild.id }, select: { revision: true } });
    if (!existing) {
      if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
        throw new TicketError("CONFLICT", "Ticket settings changed since they were loaded.", { currentRevision: 0 });
      return mapSettings(input.guildId, await this.client.ticketSettings.create({ data: { guildId: guild.id, ...data } }));
    }
    const result = await this.client.ticketSettings.updateMany({
      where: { guildId: guild.id, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
      data: { ...data, revision: { increment: 1 } },
    });
    if (result.count === 0)
      throw new TicketError("CONFLICT", "Ticket settings changed since they were loaded.", { currentRevision: existing.revision });
    return mapSettings(input.guildId, await this.client.ticketSettings.findUniqueOrThrow({ where: { guildId: guild.id } }));
  }

  public async allocateNumber(guildId: string): Promise<number> {
    const guild = await this.ensureGuild(guildId);
    const row = await this.client.ticketSettings.upsert({
      where: { guildId: guild.id },
      create: { guildId: guild.id, nextNumber: 2, supportRoleIds: [], blockedUserIds: [], blockedRoleIds: [] },
      update: { nextNumber: { increment: 1 } },
      select: { nextNumber: true },
    });
    return row.nextNumber - 1;
  }

  public async allocateCategoryNumber(guildId: string, categoryId: string): Promise<number> {
    const guild = await this.ensureGuild(guildId);
    const result = await this.client.ticketCategory.updateManyAndReturn({
      where: { id: categoryId, guildId: guild.id },
      data: { nextNumber: { increment: 1 } },
      select: { nextNumber: true },
    });
    const row = result[0];
    if (!row) throw new TicketError("NOT_FOUND", "Ticket reason was not found.");
    return row.nextNumber - 1;
  }

  public async listCategories(guildId: string): Promise<readonly TicketCategory[]> {
    const rows = await this.client.ticketCategory.findMany({
      where: { guild: { discordGuildId: guildId } },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((row) => mapCategory(guildId, row));
  }

  public async saveCategory(input: TicketCategoryInput): Promise<TicketCategory> {
    const guild = await this.ensureGuild(input.guildId);
    const data = {
      name: input.name,
      description: input.description ?? null,
      emoji: input.emoji ?? null,
      buttonStyle: input.buttonStyle,
      enabled: input.enabled,
      supportRoleIds: [...input.supportRoleIds],
      alertUserIds: [...input.alertUserIds],
      parentChannelId: input.parentChannelId ?? null,
      nameTemplate: input.nameTemplate ?? null,
      openMessage: input.openMessage ?? null,
      defaultPriority: input.defaultPriority,
      questions: input.questions.map((question) => ({ ...question })) as Prisma.InputJsonValue,
      requiredRoleIds: [...input.requiredRoleIds],
      maxOpenPerUser: input.maxOpenPerUser ?? null,
      ...(input.staffThread === undefined ? {} : { staffThread: input.staffThread }),
      ...(input.position === undefined ? {} : { position: input.position }),
    };
    const row = input.id
      ? await this.client.ticketCategory.update({ where: { id: input.id, guildId: guild.id }, data })
      : await this.client.ticketCategory.create({ data: { guildId: guild.id, ...data } });
    return mapCategory(input.guildId, row);
  }

  public async deleteCategory(guildId: string, id: string): Promise<void> {
    await this.client.ticketCategory.deleteMany({ where: { id, guild: { discordGuildId: guildId } } });
  }

  public async listPanels(guildId: string): Promise<readonly TicketPanel[]> {
    const rows = await this.client.ticketPanel.findMany({ where: { guild: { discordGuildId: guildId } }, orderBy: { createdAt: "asc" } });
    return rows.map((row) => mapPanel(guildId, row));
  }

  public async savePanel(input: TicketPanelInput): Promise<TicketPanel> {
    const guild = await this.ensureGuild(input.guildId);
    const data = {
      name: input.name,
      channelId: input.channelId,
      title: input.title,
      description: input.description,
      color: input.color,
      style: input.style,
      placeholder: input.placeholder,
      imageUrl: input.imageUrl ?? null,
      footer: input.footer ?? null,
      categoryIds: [...input.categoryIds],
      buttonRows: input.rows && input.rows.length > 0 ? input.rows.map((row) => [...row]) : Prisma.DbNull,
    };
    const row = input.id
      ? await this.client.ticketPanel.update({ where: { id: input.id, guildId: guild.id }, data })
      : await this.client.ticketPanel.create({ data: { guildId: guild.id, ...data } });
    return mapPanel(input.guildId, row);
  }

  public async markPanelPublished(guildId: string, id: string, messageId: string): Promise<TicketPanel> {
    const guild = await this.ensureGuild(guildId);
    const row = await this.client.ticketPanel.update({ where: { id, guildId: guild.id }, data: { messageId, publishedAt: new Date() } });
    return mapPanel(guildId, row);
  }

  public async clearPanelMessage(guildId: string, id: string): Promise<TicketPanel> {
    const guild = await this.ensureGuild(guildId);
    const row = await this.client.ticketPanel.update({ where: { id, guildId: guild.id }, data: { messageId: null, publishedAt: null } });
    return mapPanel(guildId, row);
  }

  public async deletePanel(guildId: string, id: string): Promise<void> {
    await this.client.ticketPanel.deleteMany({ where: { id, guild: { discordGuildId: guildId } } });
  }

  public async createTicket(input: TicketCreateData): Promise<Ticket> {
    const guild = await this.ensureGuild(input.guildId);
    const row = await this.client.ticket.create({
      data: {
        guildId: guild.id,
        number: input.number,
        categoryId: input.categoryId ?? null,
        categoryNumber: input.categoryNumber ?? null,
        openerId: input.openerId,
        openerName: input.openerName,
        subject: input.subject ?? null,
        answers: input.answers.map((answer) => ({ ...answer })) as Prisma.InputJsonValue,
        priority: input.priority,
        participantIds: [],
        tags: [],
      },
      include: ticketInclude,
    });
    return mapTicket(row);
  }

  public async getTicket(id: string): Promise<Ticket | undefined> {
    if (!isUuid(id)) return undefined;
    const row = await this.client.ticket.findUnique({ where: { id }, include: ticketInclude });
    return row ? mapTicket(row) : undefined;
  }

  public async findTicketByChannel(channelId: string): Promise<Ticket | undefined> {
    const row = await this.client.ticket.findUnique({ where: { channelId }, include: ticketInclude });
    return row ? mapTicket(row) : undefined;
  }

  public async findTicketByStaffThread(threadId: string): Promise<Ticket | undefined> {
    const row = await this.client.ticket.findUnique({ where: { staffThreadId: threadId }, include: ticketInclude });
    return row ? mapTicket(row) : undefined;
  }

  public async findTicketByNumber(guildId: string, number: number): Promise<Ticket | undefined> {
    const row = await this.client.ticket.findFirst({ where: { number, guild: { discordGuildId: guildId } }, include: ticketInclude });
    return row ? mapTicket(row) : undefined;
  }

  public async listTickets(filter: TicketListFilter): Promise<readonly Ticket[]> {
    const search = filter.search?.trim();
    const searchNumber = search && /^#?\d+$/.test(search) ? Number(search.replace("#", "")) : undefined;
    const rows = await this.client.ticket.findMany({
      where: {
        guild: { discordGuildId: filter.guildId },
        ...(filter.statuses ? { status: { in: [...filter.statuses] } } : {}),
        ...(filter.openerId ? { openerId: filter.openerId } : {}),
        ...(filter.claimedById ? { claimedById: filter.claimedById } : {}),
        ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
        ...(filter.priority ? { priority: filter.priority } : {}),
        ...(filter.lastActivityBefore ? { lastActivityAt: { lt: filter.lastActivityBefore } } : {}),
        ...(search
          ? {
              OR: [
                ...(searchNumber === undefined ? [] : [{ number: searchNumber }]),
                { subject: { contains: search, mode: "insensitive" as const } },
                { openerName: { contains: search, mode: "insensitive" as const } },
                { openerId: search },
                { tags: { has: search.toLowerCase() } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: filter.limit ?? 50,
      include: ticketInclude,
    });
    return rows.map(mapTicket);
  }

  public countActiveTickets(guildId: string, openerId: string, categoryId?: string): Promise<number> {
    return this.client.ticket.count({
      where: {
        guild: { discordGuildId: guildId },
        openerId,
        status: { not: "CLOSED" },
        ...(categoryId ? { categoryId } : {}),
      },
    });
  }

  public async updateTicket(id: string, patch: TicketPatch): Promise<Ticket> {
    const data: Prisma.TicketUpdateInput = {};
    if (patch.channelId !== undefined) data.channelId = patch.channelId;
    if (patch.staffThreadId !== undefined) data.staffThreadId = patch.staffThreadId;
    if (patch.status !== undefined) data.status = patch.status;
    if (patch.priority !== undefined) data.priority = patch.priority;
    if (patch.claimedById !== undefined) data.claimedById = patch.claimedById;
    if (patch.participantIds !== undefined) data.participantIds = [...patch.participantIds];
    if (patch.tags !== undefined) data.tags = [...patch.tags];
    if (patch.subject !== undefined) data.subject = patch.subject;
    if (patch.closedById !== undefined) data.closedById = patch.closedById;
    if (patch.closeReason !== undefined) data.closeReason = patch.closeReason;
    if (patch.rating !== undefined) data.rating = patch.rating;
    if (patch.feedback !== undefined) data.feedback = patch.feedback;
    if (patch.transcriptMessageId !== undefined) data.transcriptMessageId = patch.transcriptMessageId;
    if (patch.autoCloseWarnedAt !== undefined) data.autoCloseWarnedAt = patch.autoCloseWarnedAt;
    if (patch.firstResponseAt !== undefined) data.firstResponseAt = patch.firstResponseAt;
    if (patch.lastActivityAt !== undefined) data.lastActivityAt = patch.lastActivityAt;
    if (patch.closedAt !== undefined) data.closedAt = patch.closedAt;
    const row = await this.client.ticket.update({ where: { id }, data, include: ticketInclude });
    return mapTicket(row);
  }

  public async addMessage(input: TicketMessageInput): Promise<TicketMessage> {
    const data = {
      ticketId: input.ticketId,
      discordMessageId: input.discordMessageId ?? null,
      authorId: input.authorId,
      authorName: input.authorName,
      content: input.content,
      attachments: [...input.attachments],
      source: input.source,
      internal: input.internal,
      ...(input.createdAt ? { createdAt: input.createdAt } : {}),
    };
    const row = input.discordMessageId
      ? await this.client.ticketMessage.upsert({ where: { discordMessageId: input.discordMessageId }, create: data, update: {} })
      : await this.client.ticketMessage.create({ data });
    return mapMessage(row);
  }

  public async listMessages(ticketId: string): Promise<readonly TicketMessage[]> {
    const rows = await this.client.ticketMessage.findMany({ where: { ticketId }, orderBy: { createdAt: "asc" }, take: 5000 });
    return rows.map(mapMessage);
  }

  public async addEvent(input: TicketEventInput): Promise<TicketEvent> {
    const row = await this.client.ticketEvent.create({
      data: { ticketId: input.ticketId, action: input.action, actorId: input.actorId, source: input.source, details: { ...input.details } },
    });
    return mapEvent(row);
  }

  public async listEvents(ticketId: string): Promise<readonly TicketEvent[]> {
    const rows = await this.client.ticketEvent.findMany({ where: { ticketId }, orderBy: { createdAt: "asc" }, take: 1000 });
    return rows.map(mapEvent);
  }

  public async listAutoCloseGuilds(): Promise<readonly string[]> {
    const rows = await this.client.ticketSettings.findMany({
      where: { enabled: true, autoCloseHours: { gt: 0 } },
      select: { guild: { select: { discordGuildId: true } } },
    });
    return rows.map((row) => row.guild.discordGuildId);
  }

  public async listRetentionPolicies(): Promise<readonly TicketRetentionPolicy[]> {
    const rows = await this.client.ticketSettings.findMany({
      where: { retentionMonths: { gt: 0 } },
      select: { retentionMonths: true, guild: { select: { discordGuildId: true } } },
    });
    return rows.map((row) => ({ guildId: row.guild.discordGuildId, retentionMonths: row.retentionMonths }));
  }

  public async deleteClosedTickets(guildId: string, closedBefore: Date, limit: number): Promise<number> {
    const doomed = await this.client.ticket.findMany({
      where: { guild: { discordGuildId: guildId }, status: "CLOSED", closedAt: { lt: closedBefore } },
      select: { id: true },
      orderBy: { closedAt: "asc" },
      take: limit,
    });
    if (doomed.length === 0) return 0;
    const ids = doomed.map((row) => row.id);
    const [, , deleted] = await this.client.$transaction([
      this.client.ticketMessage.deleteMany({ where: { ticketId: { in: ids } } }),
      this.client.ticketEvent.deleteMany({ where: { ticketId: { in: ids } } }),
      // Re-checked so a ticket reopened in the meantime is kept.
      this.client.ticket.deleteMany({ where: { id: { in: ids }, status: "CLOSED" } }),
    ]);
    return deleted.count;
  }

  public async stats(guildId: string): Promise<TicketStats> {
    const where = { guild: { discordGuildId: guildId } };
    const [byStatus, ratings, byCategory, categories, staff, responded, resolved] = await Promise.all([
      this.client.ticket.groupBy({ by: ["status"], where, _count: { _all: true } }),
      this.client.ticket.aggregate({ where: { ...where, rating: { not: null } }, _avg: { rating: true }, _count: { rating: true } }),
      this.client.ticket.groupBy({ by: ["categoryId", "status"], where, _count: { _all: true } }),
      this.client.ticketCategory.findMany({ where, select: { id: true, name: true } }),
      this.client.ticket.groupBy({ by: ["claimedById"], where: { ...where, status: "CLOSED", claimedById: { not: null } }, _count: { _all: true } }),
      this.client.ticket.findMany({ where: { ...where, firstResponseAt: { not: null } }, select: { createdAt: true, firstResponseAt: true }, orderBy: { createdAt: "desc" }, take: 500 }),
      this.client.ticket.findMany({ where: { ...where, closedAt: { not: null } }, select: { createdAt: true, closedAt: true }, orderBy: { createdAt: "desc" }, take: 500 }),
    ]);
    const count = (status: string) => byStatus.find((row) => row.status === status)?._count._all ?? 0;
    const names = new Map(categories.map((category) => [category.id, category.name]));
    const categoryTotals = new Map<string, { categoryId?: string; name: string; open: number; total: number }>();
    for (const row of byCategory) {
      const key = row.categoryId ?? "none";
      const entry = categoryTotals.get(key) ?? { ...(row.categoryId ? { categoryId: row.categoryId } : {}), name: row.categoryId ? names.get(row.categoryId) ?? "Deleted category" : "General", open: 0, total: 0 };
      entry.total += row._count._all;
      if (row.status !== "CLOSED") entry.open += row._count._all;
      categoryTotals.set(key, entry);
    }
    const firstResponse = averageMinutes(responded.map((row) => [row.createdAt, row.firstResponseAt]));
    const resolution = averageMinutes(resolved.map((row) => [row.createdAt, row.closedAt]));
    return {
      open: count("OPEN"),
      claimed: count("CLAIMED"),
      pending: count("PENDING"),
      closed: count("CLOSED"),
      total: byStatus.reduce((sum, row) => sum + row._count._all, 0),
      ratingCount: ratings._count.rating,
      ...(ratings._avg.rating === null ? {} : { averageRating: Math.round(ratings._avg.rating * 100) / 100 }),
      ...(firstResponse === undefined ? {} : { averageFirstResponseMinutes: firstResponse }),
      ...(resolution === undefined ? {} : { averageResolutionMinutes: resolution }),
      byCategory: [...categoryTotals.values()].sort((left, right) => right.total - left.total),
      topStaff: staff
        .flatMap((row) => (row.claimedById ? [{ userId: row.claimedById, closed: row._count._all }] : []))
        .sort((left, right) => right.closed - left.closed)
        .slice(0, 10),
    };
  }

  private ensureGuild(discordGuildId: string) {
    return this.guildRows.ensure(discordGuildId);
  }
}

function settingsData(input: TicketSettingsInput) {
  return {
    enabled: input.enabled,
    mode: input.mode,
    openCategoryChannelId: input.openCategoryChannelId ?? null,
    closedCategoryChannelId: input.closedCategoryChannelId ?? null,
    threadParentChannelId: input.threadParentChannelId ?? null,
    transcriptChannelId: input.transcriptChannelId ?? null,
    logChannelId: input.logChannelId ?? null,
    supportRoleIds: [...input.supportRoleIds],
    pingSupportOnOpen: input.pingSupportOnOpen,
    maxOpenPerUser: input.maxOpenPerUser,
    nameTemplate: input.nameTemplate,
    openMessage: input.openMessage,
    embedColor: input.embedColor,
    allowUserClose: input.allowUserClose,
    requireCloseReason: input.requireCloseReason,
    closeConfirmation: input.closeConfirmation,
    closeAction: input.closeAction,
    deleteDelaySeconds: input.deleteDelaySeconds,
    claimEnabled: input.claimEnabled,
    claimRestrictsReplies: input.claimRestrictsReplies,
    transcriptsEnabled: input.transcriptsEnabled,
    transcriptDmUser: input.transcriptDmUser,
    feedbackEnabled: input.feedbackEnabled,
    autoCloseHours: input.autoCloseHours,
    autoCloseWarningHours: input.autoCloseWarningHours,
    autoCloseExcludeClaimed: input.autoCloseExcludeClaimed,
    blockedUserIds: [...input.blockedUserIds],
    blockedRoleIds: [...input.blockedRoleIds],
    ...(input.staffThreadEnabled === undefined ? {} : { staffThreadEnabled: input.staffThreadEnabled }),
    ...(input.retentionMonths === undefined ? {} : { retentionMonths: input.retentionMonths }),
    lastOperationSource: input.source,
  };
}

function mapSettings(guildId: string, row: SettingsRow): TicketSettings {
  return {
    guildId,
    enabled: row.enabled,
    mode: row.mode,
    ...optional("openCategoryChannelId", row.openCategoryChannelId),
    ...optional("closedCategoryChannelId", row.closedCategoryChannelId),
    ...optional("threadParentChannelId", row.threadParentChannelId),
    ...optional("transcriptChannelId", row.transcriptChannelId),
    ...optional("logChannelId", row.logChannelId),
    supportRoleIds: row.supportRoleIds,
    pingSupportOnOpen: row.pingSupportOnOpen,
    maxOpenPerUser: row.maxOpenPerUser,
    nameTemplate: row.nameTemplate,
    openMessage: row.openMessage,
    embedColor: row.embedColor,
    allowUserClose: row.allowUserClose,
    requireCloseReason: row.requireCloseReason,
    closeConfirmation: row.closeConfirmation,
    closeAction: row.closeAction,
    deleteDelaySeconds: row.deleteDelaySeconds,
    claimEnabled: row.claimEnabled,
    claimRestrictsReplies: row.claimRestrictsReplies,
    transcriptsEnabled: row.transcriptsEnabled,
    transcriptDmUser: row.transcriptDmUser,
    feedbackEnabled: row.feedbackEnabled,
    autoCloseHours: row.autoCloseHours,
    autoCloseWarningHours: row.autoCloseWarningHours,
    autoCloseExcludeClaimed: row.autoCloseExcludeClaimed,
    blockedUserIds: row.blockedUserIds,
    blockedRoleIds: row.blockedRoleIds,
    staffThreadEnabled: row.staffThreadEnabled,
    retentionMonths: row.retentionMonths,
    nextNumber: row.nextNumber,
    revision: row.revision,
  };
}

function mapCategory(guildId: string, row: CategoryRow): TicketCategory {
  return {
    id: row.id,
    guildId,
    name: row.name,
    ...optional("description", row.description),
    ...optional("emoji", row.emoji),
    buttonStyle: row.buttonStyle === "SECONDARY" || row.buttonStyle === "SUCCESS" || row.buttonStyle === "DANGER" ? row.buttonStyle : "PRIMARY",
    enabled: row.enabled,
    position: row.position,
    supportRoleIds: row.supportRoleIds,
    alertUserIds: row.alertUserIds,
    ...optional("parentChannelId", row.parentChannelId),
    ...optional("nameTemplate", row.nameTemplate),
    ...optional("openMessage", row.openMessage),
    defaultPriority: row.defaultPriority,
    questions: parseQuestions(row.questions),
    requiredRoleIds: row.requiredRoleIds,
    ...optional("maxOpenPerUser", row.maxOpenPerUser),
    staffThread: staffThreadMode(row.staffThread),
  };
}

function staffThreadMode(value: string): TicketStaffThreadMode {
  return value === "ON" || value === "OFF" ? value : "INHERIT";
}

function mapPanel(guildId: string, row: PanelRow): TicketPanel {
  return {
    id: row.id,
    guildId,
    name: row.name,
    channelId: row.channelId,
    ...optional("messageId", row.messageId),
    title: row.title,
    description: row.description,
    color: row.color,
    style: row.style,
    placeholder: row.placeholder,
    ...optional("imageUrl", row.imageUrl),
    ...optional("footer", row.footer),
    categoryIds: row.categoryIds,
    rows: buttonRows(row.buttonRows),
    ...optional("publishedAt", row.publishedAt),
  };
}

/** Stored button rows, or null (automatic) when missing or malformed. */
function buttonRows(value: Prisma.JsonValue | null): string[][] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const rows = value.map((row) => (Array.isArray(row) ? row.filter((id): id is string => typeof id === "string") : []));
  return rows.every((row) => row.length > 0) ? rows : null;
}

function mapTicket(row: TicketRow): Ticket {
  return {
    id: row.id,
    guildId: row.guild.discordGuildId,
    number: row.number,
    ...optional("categoryId", row.categoryId),
    ...optional("categoryName", row.category?.name ?? null),
    ...optional("categoryNumber", row.categoryNumber),
    openerId: row.openerId,
    openerName: row.openerName,
    ...optional("channelId", row.channelId),
    ...optional("staffThreadId", row.staffThreadId),
    ...optional("subject", row.subject),
    answers: parseAnswers(row.answers),
    status: row.status,
    priority: row.priority,
    ...optional("claimedById", row.claimedById),
    participantIds: row.participantIds,
    tags: row.tags,
    ...optional("closedById", row.closedById),
    ...optional("closeReason", row.closeReason),
    ...optional("rating", row.rating),
    ...optional("feedback", row.feedback),
    ...optional("transcriptMessageId", row.transcriptMessageId),
    ...optional("autoCloseWarnedAt", row.autoCloseWarnedAt),
    ...optional("firstResponseAt", row.firstResponseAt),
    lastActivityAt: row.lastActivityAt,
    ...optional("closedAt", row.closedAt),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapMessage(row: MessageRow): TicketMessage {
  return {
    id: row.id,
    ticketId: row.ticketId,
    ...optional("discordMessageId", row.discordMessageId),
    authorId: row.authorId,
    authorName: row.authorName,
    content: row.content,
    attachments: row.attachments,
    source: row.source,
    internal: row.internal,
    createdAt: row.createdAt,
  };
}

function mapEvent(row: EventRow): TicketEvent {
  const details: Record<string, string | number | boolean | null> = {};
  if (row.details && typeof row.details === "object" && !Array.isArray(row.details)) {
    for (const [key, value] of Object.entries(row.details)) {
      if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") details[key] = value;
    }
  }
  return {
    id: row.id,
    ticketId: row.ticketId,
    action: row.action,
    actorId: row.actorId,
    source: row.source === "WEB" || row.source === "SYSTEM" ? row.source : "DISCORD",
    details,
    createdAt: row.createdAt,
  };
}

function parseQuestions(value: Prisma.JsonValue): readonly TicketQuestion[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const { id, label, placeholder, style, required, minLength, maxLength } = item as Record<string, unknown>;
    if (typeof id !== "string" || typeof label !== "string") return [];
    return [{
      id,
      label,
      ...(typeof placeholder === "string" ? { placeholder } : {}),
      style: style === "PARAGRAPH" ? "PARAGRAPH" : "SHORT",
      required: required === true,
      ...(typeof minLength === "number" ? { minLength } : {}),
      ...(typeof maxLength === "number" ? { maxLength } : {}),
    } satisfies TicketQuestion];
  });
}

function parseAnswers(value: Prisma.JsonValue): readonly TicketAnswer[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const { question, answer } = item as Record<string, unknown>;
    return typeof question === "string" && typeof answer === "string" ? [{ question, answer }] : [];
  });
}

function averageMinutes(pairs: readonly (readonly [Date, Date | null])[]): number | undefined {
  const durations = pairs.flatMap(([start, end]) => (end ? [(end.getTime() - start.getTime()) / 60_000] : []));
  if (durations.length === 0) return undefined;
  return Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length);
}

function optional<K extends string, V>(key: K, value: V | null): { [P in K]?: V } {
  return (value === null ? {} : { [key]: value }) as { [P in K]?: V };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
