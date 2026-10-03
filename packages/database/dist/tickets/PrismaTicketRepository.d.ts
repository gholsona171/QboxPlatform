import { type Ticket, type TicketCategory, type TicketCategoryInput, type TicketCreateData, type TicketEvent, type TicketEventInput, type TicketListFilter, type TicketMessage, type TicketMessageInput, type TicketPanel, type TicketPanelInput, type TicketPatch, type TicketRepository, type TicketRetentionPolicy, type TicketSettings, type TicketSettingsInput, type TicketStats } from "@qbox/tickets";
import { type PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "guild" | "ticketSettings" | "ticketCategory" | "ticketPanel" | "ticket" | "ticketMessage" | "ticketEvent" | "$transaction">;
/** PostgreSQL ticket persistence. Guild IDs in and out are Discord snowflakes. */
export declare class PrismaTicketRepository implements TicketRepository {
    private readonly client;
    private readonly guildRows;
    constructor(client: Client);
    getSettings(guildId: string): Promise<TicketSettings | undefined>;
    saveSettings(input: TicketSettingsInput): Promise<TicketSettings>;
    allocateNumber(guildId: string): Promise<number>;
    allocateCategoryNumber(guildId: string, categoryId: string): Promise<number>;
    listCategories(guildId: string): Promise<readonly TicketCategory[]>;
    saveCategory(input: TicketCategoryInput): Promise<TicketCategory>;
    deleteCategory(guildId: string, id: string): Promise<void>;
    listPanels(guildId: string): Promise<readonly TicketPanel[]>;
    savePanel(input: TicketPanelInput): Promise<TicketPanel>;
    markPanelPublished(guildId: string, id: string, messageId: string): Promise<TicketPanel>;
    clearPanelMessage(guildId: string, id: string): Promise<TicketPanel>;
    deletePanel(guildId: string, id: string): Promise<void>;
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
    private ensureGuild;
}
export {};
//# sourceMappingURL=PrismaTicketRepository.d.ts.map