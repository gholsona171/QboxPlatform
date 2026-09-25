import { randomUUID } from "node:crypto";

import { defaultTicketSettings } from "./TicketService.js";
import type {
  Ticket,
  TicketCategory,
  TicketCategoryInput,
  TicketCreateData,
  TicketEvent,
  TicketEventInput,
  TicketListFilter,
  TicketMessage,
  TicketMessageInput,
  TicketPanel,
  TicketPanelInput,
  TicketPatch,
  TicketRepository,
  TicketSettings,
  TicketSettingsInput,
  TicketStats,
} from "./types.js";
import { TicketError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryTicketRepository implements TicketRepository {
  public readonly settingsByGuild = new Map<string, TicketSettings>();
  public readonly categories = new Map<string, TicketCategory>();
  public readonly panels = new Map<string, TicketPanel>();
  public readonly tickets = new Map<string, Ticket>();
  public readonly messages: TicketMessage[] = [];
  public readonly events: TicketEvent[] = [];

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async getSettings(guildId: string): Promise<TicketSettings | undefined> {
    return this.settingsByGuild.get(guildId);
  }

  public async saveSettings(input: TicketSettingsInput): Promise<TicketSettings> {
    const current = this.settingsByGuild.get(input.guildId) ?? defaultTicketSettings(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new TicketError("CONFLICT", "Ticket settings changed since they were loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, source: _source, ...rest } = input;
    const saved: TicketSettings = { ...rest, nextNumber: current.nextNumber, revision: current.revision + 1 };
    this.settingsByGuild.set(input.guildId, saved);
    return saved;
  }

  public async allocateNumber(guildId: string): Promise<number> {
    const current = this.settingsByGuild.get(guildId) ?? defaultTicketSettings(guildId);
    this.settingsByGuild.set(guildId, { ...current, nextNumber: current.nextNumber + 1 });
    return current.nextNumber;
  }

  public async listCategories(guildId: string): Promise<readonly TicketCategory[]> {
    return [...this.categories.values()].filter((item) => item.guildId === guildId).sort((left, right) => left.position - right.position);
  }

  public async saveCategory(input: TicketCategoryInput): Promise<TicketCategory> {
    const existing = input.id ? this.categories.get(input.id) : undefined;
    const saved: TicketCategory = { ...input, id: input.id ?? randomUUID(), position: input.position ?? existing?.position ?? 0 };
    this.categories.set(saved.id, saved);
    return saved;
  }

  public async deleteCategory(_guildId: string, id: string): Promise<void> {
    this.categories.delete(id);
  }

  public async listPanels(guildId: string): Promise<readonly TicketPanel[]> {
    return [...this.panels.values()].filter((item) => item.guildId === guildId);
  }

  public async savePanel(input: TicketPanelInput): Promise<TicketPanel> {
    const existing = input.id ? this.panels.get(input.id) : undefined;
    const saved: TicketPanel = {
      ...input,
      id: input.id ?? randomUUID(),
      ...(existing?.messageId ? { messageId: existing.messageId } : {}),
      ...(existing?.publishedAt ? { publishedAt: existing.publishedAt } : {}),
    };
    this.panels.set(saved.id, saved);
    return saved;
  }

  public async markPanelPublished(_guildId: string, id: string, messageId: string): Promise<TicketPanel> {
    const panel = this.panels.get(id);
    if (!panel) throw new TicketError("NOT_FOUND", "Ticket panel was not found.");
    const saved = { ...panel, messageId, publishedAt: this.now() };
    this.panels.set(id, saved);
    return saved;
  }

  public async deletePanel(_guildId: string, id: string): Promise<void> {
    this.panels.delete(id);
  }

  public async createTicket(input: TicketCreateData): Promise<Ticket> {
    const now = this.now();
    const category = input.categoryId ? this.categories.get(input.categoryId) : undefined;
    const ticket: Ticket = {
      ...input,
      id: randomUUID(),
      ...(category ? { categoryName: category.name } : {}),
      status: "OPEN",
      participantIds: [],
      tags: [],
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  public async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  public async findTicketByChannel(channelId: string): Promise<Ticket | undefined> {
    return [...this.tickets.values()].find((ticket) => ticket.channelId === channelId);
  }

  public async findTicketByNumber(guildId: string, number: number): Promise<Ticket | undefined> {
    return [...this.tickets.values()].find((ticket) => ticket.guildId === guildId && ticket.number === number);
  }

  public async listTickets(filter: TicketListFilter): Promise<readonly Ticket[]> {
    const search = filter.search?.toLowerCase();
    return [...this.tickets.values()]
      .filter((ticket) => ticket.guildId === filter.guildId)
      .filter((ticket) => !filter.statuses || filter.statuses.includes(ticket.status))
      .filter((ticket) => !filter.openerId || ticket.openerId === filter.openerId)
      .filter((ticket) => !filter.claimedById || ticket.claimedById === filter.claimedById)
      .filter((ticket) => !filter.categoryId || ticket.categoryId === filter.categoryId)
      .filter((ticket) => !filter.priority || ticket.priority === filter.priority)
      .filter((ticket) => !filter.lastActivityBefore || ticket.lastActivityAt < filter.lastActivityBefore)
      .filter((ticket) => !search || `${ticket.number} ${ticket.subject ?? ""} ${ticket.openerName}`.toLowerCase().includes(search))
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, filter.limit ?? 50);
  }

  public async countActiveTickets(guildId: string, openerId: string, categoryId?: string): Promise<number> {
    return [...this.tickets.values()].filter(
      (ticket) => ticket.guildId === guildId && ticket.openerId === openerId && ticket.status !== "CLOSED" && (!categoryId || ticket.categoryId === categoryId),
    ).length;
  }

  public async updateTicket(id: string, patch: TicketPatch): Promise<Ticket> {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new TicketError("NOT_FOUND", "Ticket was not found.");
    const next: Record<string, unknown> = { ...ticket, updatedAt: this.now() };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as Ticket;
    this.tickets.set(id, updated);
    return updated;
  }

  public async addMessage(input: TicketMessageInput): Promise<TicketMessage> {
    const message: TicketMessage = { ...input, id: randomUUID(), createdAt: input.createdAt ?? this.now() };
    this.messages.push(message);
    return message;
  }

  public async listMessages(ticketId: string): Promise<readonly TicketMessage[]> {
    return this.messages.filter((message) => message.ticketId === ticketId);
  }

  public async addEvent(input: TicketEventInput): Promise<TicketEvent> {
    const event: TicketEvent = { ...input, id: randomUUID(), createdAt: this.now() };
    this.events.push(event);
    return event;
  }

  public async listEvents(ticketId: string): Promise<readonly TicketEvent[]> {
    return this.events.filter((event) => event.ticketId === ticketId);
  }

  public async listAutoCloseGuilds(): Promise<readonly string[]> {
    return [...this.settingsByGuild.values()].filter((settings) => settings.enabled && settings.autoCloseHours > 0).map((settings) => settings.guildId);
  }

  public async stats(guildId: string): Promise<TicketStats> {
    const tickets = [...this.tickets.values()].filter((ticket) => ticket.guildId === guildId);
    const rated = tickets.filter((ticket) => ticket.rating !== undefined);
    const count = (status: Ticket["status"]) => tickets.filter((ticket) => ticket.status === status).length;
    return {
      open: count("OPEN"),
      claimed: count("CLAIMED"),
      pending: count("PENDING"),
      closed: count("CLOSED"),
      total: tickets.length,
      ratingCount: rated.length,
      ...(rated.length ? { averageRating: rated.reduce((sum, ticket) => sum + (ticket.rating ?? 0), 0) / rated.length } : {}),
      byCategory: [],
      topStaff: [],
    };
  }
}
