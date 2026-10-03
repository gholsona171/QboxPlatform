import type { Ticket, TicketCategory, TicketCategoryInput, TicketCreateData, TicketEvent, TicketEventInput, TicketListFilter, TicketMessage, TicketMessageInput, TicketPanel, TicketPanelInput, TicketPatch, TicketRepository, TicketRetentionPolicy, TicketSettings, TicketSettingsInput, TicketStats } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryTicketRepository implements TicketRepository {
    private readonly now;
    readonly settingsByGuild: Map<string, TicketSettings>;
    readonly categories: Map<string, TicketCategory>;
    readonly categoryCounters: Map<string, number>;
    readonly panels: Map<string, TicketPanel>;
    readonly tickets: Map<string, Ticket>;
    readonly messages: TicketMessage[];
    readonly events: TicketEvent[];
    constructor(now?: () => Date);
    getSettings(guildId: string): Promise<TicketSettings | undefined>;
    saveSettings(input: TicketSettingsInput): Promise<TicketSettings>;
    allocateNumber(guildId: string): Promise<number>;
    allocateCategoryNumber(_guildId: string, categoryId: string): Promise<number>;
    listCategories(guildId: string): Promise<readonly TicketCategory[]>;
    saveCategory(input: TicketCategoryInput): Promise<TicketCategory>;
    deleteCategory(_guildId: string, id: string): Promise<void>;
    listPanels(guildId: string): Promise<readonly TicketPanel[]>;
    savePanel(input: TicketPanelInput): Promise<TicketPanel>;
    markPanelPublished(_guildId: string, id: string, messageId: string): Promise<TicketPanel>;
    clearPanelMessage(_guildId: string, id: string): Promise<TicketPanel>;
    deletePanel(_guildId: string, id: string): Promise<void>;
    createTicket(input: TicketCreateData): Promise<Ticket>;
    getTicket(id: string): Promise<Ticket | undefined>;
    findTicketByChannel(channelId: string): Promise<Ticket | undefined>;
    findTicketByStaffThread(threadId: string): Promise<Ticket | undefined>;
    findTicketByNumber(guildId: string, number: number): Promise<Ticket | undefined>;
    listTickets(filter: TicketListFilter): Promise<readonly Ticket[]>;
    countActiveTickets(guildId: string, openerId: string, categoryId?: string): Promise<number>;
    updateTicket(id: string, patch: TicketPatch): Promise<Ticket>;
    addMessage(input: TicketMessageInput): Promise<TicketMessage>;
    listMessages(ticketId: string): Promise<readonly TicketMessage[]>;
    addEvent(input: TicketEventInput): Promise<TicketEvent>;
    listEvents(ticketId: string): Promise<readonly TicketEvent[]>;
    listAutoCloseGuilds(): Promise<readonly string[]>;
    listRetentionPolicies(): Promise<readonly TicketRetentionPolicy[]>;
    deleteClosedTickets(guildId: string, closedBefore: Date, limit: number): Promise<number>;
    stats(guildId: string): Promise<TicketStats>;
}
//# sourceMappingURL=InMemoryTicketRepository.d.ts.map