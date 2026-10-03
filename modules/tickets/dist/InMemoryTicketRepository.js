import { randomUUID } from "node:crypto";
import { defaultTicketSettings } from "./TicketService.js";
import { TicketError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryTicketRepository {
    now;
    settingsByGuild = new Map();
    categories = new Map();
    categoryCounters = new Map();
    panels = new Map();
    tickets = new Map();
    messages = [];
    events = [];
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async getSettings(guildId) {
        return this.settingsByGuild.get(guildId);
    }
    async saveSettings(input) {
        const current = this.settingsByGuild.get(input.guildId) ?? defaultTicketSettings(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new TicketError("CONFLICT", "Ticket settings changed since they were loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, source: _source, ...rest } = input;
        const saved = {
            ...rest,
            staffThreadEnabled: input.staffThreadEnabled ?? current.staffThreadEnabled,
            retentionMonths: input.retentionMonths ?? current.retentionMonths,
            nextNumber: current.nextNumber,
            revision: current.revision + 1,
        };
        this.settingsByGuild.set(input.guildId, saved);
        return saved;
    }
    async allocateNumber(guildId) {
        const current = this.settingsByGuild.get(guildId) ?? defaultTicketSettings(guildId);
        this.settingsByGuild.set(guildId, { ...current, nextNumber: current.nextNumber + 1 });
        return current.nextNumber;
    }
    async allocateCategoryNumber(_guildId, categoryId) {
        const next = this.categoryCounters.get(categoryId) ?? 1;
        this.categoryCounters.set(categoryId, next + 1);
        return next;
    }
    async listCategories(guildId) {
        return [...this.categories.values()].filter((item) => item.guildId === guildId).sort((left, right) => left.position - right.position);
    }
    async saveCategory(input) {
        const existing = input.id ? this.categories.get(input.id) : undefined;
        const saved = {
            ...input,
            id: input.id ?? randomUUID(),
            position: input.position ?? existing?.position ?? 0,
            staffThread: input.staffThread ?? existing?.staffThread ?? "INHERIT",
        };
        this.categories.set(saved.id, saved);
        return saved;
    }
    async deleteCategory(_guildId, id) {
        this.categories.delete(id);
    }
    async listPanels(guildId) {
        return [...this.panels.values()].filter((item) => item.guildId === guildId);
    }
    async savePanel(input) {
        const existing = input.id ? this.panels.get(input.id) : undefined;
        const saved = {
            ...input,
            id: input.id ?? randomUUID(),
            ...(existing?.messageId ? { messageId: existing.messageId } : {}),
            ...(existing?.publishedAt ? { publishedAt: existing.publishedAt } : {}),
        };
        this.panels.set(saved.id, saved);
        return saved;
    }
    async markPanelPublished(_guildId, id, messageId) {
        const panel = this.panels.get(id);
        if (!panel)
            throw new TicketError("NOT_FOUND", "Ticket panel was not found.");
        const saved = { ...panel, messageId, publishedAt: this.now() };
        this.panels.set(id, saved);
        return saved;
    }
    async clearPanelMessage(_guildId, id) {
        const panel = this.panels.get(id);
        if (!panel)
            throw new TicketError("NOT_FOUND", "Ticket panel was not found.");
        const { messageId: _message, publishedAt: _published, ...rest } = panel;
        this.panels.set(id, rest);
        return rest;
    }
    async deletePanel(_guildId, id) {
        this.panels.delete(id);
    }
    async createTicket(input) {
        const now = this.now();
        const category = input.categoryId ? this.categories.get(input.categoryId) : undefined;
        const ticket = {
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
    async getTicket(id) {
        return this.tickets.get(id);
    }
    async findTicketByChannel(channelId) {
        return [...this.tickets.values()].find((ticket) => ticket.channelId === channelId);
    }
    async findTicketByStaffThread(threadId) {
        return [...this.tickets.values()].find((ticket) => ticket.staffThreadId === threadId);
    }
    async findTicketByNumber(guildId, number) {
        return [...this.tickets.values()].find((ticket) => ticket.guildId === guildId && ticket.number === number);
    }
    async listTickets(filter) {
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
    async countActiveTickets(guildId, openerId, categoryId) {
        return [...this.tickets.values()].filter((ticket) => ticket.guildId === guildId && ticket.openerId === openerId && ticket.status !== "CLOSED" && (!categoryId || ticket.categoryId === categoryId)).length;
    }
    async updateTicket(id, patch) {
        const ticket = this.tickets.get(id);
        if (!ticket)
            throw new TicketError("NOT_FOUND", "Ticket was not found.");
        const next = { ...ticket, updatedAt: this.now() };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        this.tickets.set(id, updated);
        return updated;
    }
    async addMessage(input) {
        const message = { ...input, id: randomUUID(), createdAt: input.createdAt ?? this.now() };
        this.messages.push(message);
        return message;
    }
    async listMessages(ticketId) {
        return this.messages.filter((message) => message.ticketId === ticketId);
    }
    async addEvent(input) {
        const event = { ...input, id: randomUUID(), createdAt: this.now() };
        this.events.push(event);
        return event;
    }
    async listEvents(ticketId) {
        return this.events.filter((event) => event.ticketId === ticketId);
    }
    async listAutoCloseGuilds() {
        return [...this.settingsByGuild.values()].filter((settings) => settings.enabled && settings.autoCloseHours > 0).map((settings) => settings.guildId);
    }
    async listRetentionPolicies() {
        return [...this.settingsByGuild.values()]
            .filter((settings) => settings.retentionMonths > 0)
            .map((settings) => ({ guildId: settings.guildId, retentionMonths: settings.retentionMonths }));
    }
    async deleteClosedTickets(guildId, closedBefore, limit) {
        const doomed = [...this.tickets.values()]
            .filter((ticket) => ticket.guildId === guildId && ticket.status === "CLOSED" && ticket.closedAt !== undefined && ticket.closedAt < closedBefore)
            .slice(0, limit);
        const ids = new Set(doomed.map((ticket) => ticket.id));
        for (const id of ids)
            this.tickets.delete(id);
        const keep = (items) => {
            const remaining = items.filter((item) => !ids.has(item.ticketId));
            items.splice(0, items.length, ...remaining);
        };
        keep(this.messages);
        keep(this.events);
        return ids.size;
    }
    async stats(guildId) {
        const tickets = [...this.tickets.values()].filter((ticket) => ticket.guildId === guildId);
        const rated = tickets.filter((ticket) => ticket.rating !== undefined);
        const count = (status) => tickets.filter((ticket) => ticket.status === status).length;
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
//# sourceMappingURL=InMemoryTicketRepository.js.map