import type { Ticket, TicketActor, TicketCategory, TicketCategoryInput, TicketDetail, TicketDiscordGateway, TicketListFilter, TicketMessage, TicketPanel, TicketPanelInput, TicketPriority, TicketRepository, TicketSettings, TicketSettingsInput, TicketStats, TicketTranscriptFile } from "./types.js";
import { ticketLabel } from "./transcripts.js";
import { type MessageTemplates } from "@qbox/shared/messages";
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
/** Old closed tickets are deleted this many at a time. */
export declare const RETENTION_BATCH_SIZE = 200;
export declare function defaultTicketSettings(guildId: string): TicketSettings;
/**
 * Ticket lifecycle rules shared by the Discord bot, the API, and the portal.
 *
 * Persistence and Discord are injected. Discord side effects after a state
 * change are best-effort: failures are recorded as ticket events so a deleted
 * channel or missing permission never leaves a ticket stuck open.
 */
export declare class TicketService {
    private readonly repository;
    private readonly gateway?;
    private readonly now;
    private readonly templates;
    private readonly options;
    /** `threadId:userId` pairs already added to a staff thread by this process (adding again is harmless). */
    private readonly staffThreadMembers;
    constructor(repository: TicketRepository, gateway?: TicketDiscordGateway | undefined, now?: () => Date, templates?: MessageTemplates, options?: TicketServiceOptions);
    settings(guildId: string): Promise<TicketSettings>;
    saveSettings(input: TicketSettingsInput): Promise<TicketSettings>;
    categories(guildId: string): Promise<readonly TicketCategory[]>;
    saveCategory(input: TicketCategoryInput): Promise<TicketCategory>;
    deleteCategory(guildId: string, id: string): Promise<void>;
    panels(guildId: string): Promise<readonly TicketPanel[]>;
    savePanel(input: TicketPanelInput): Promise<TicketPanel>;
    publishPanel(guildId: string, id: string): Promise<TicketPanel>;
    deletePanel(guildId: string, id: string): Promise<void>;
    /** True when the actor may handle tickets in this category. */
    isStaff(settings: TicketSettings, category: TicketCategory | undefined, actor: TicketActor): boolean;
    openTicket(input: OpenTicketInput): Promise<Ticket>;
    ticketForChannel(channelId: string): Promise<Ticket | undefined>;
    /** The ticket whose staff thread this is. */
    ticketForStaffThread(threadId: string): Promise<Ticket | undefined>;
    /**
     * "🔒 Staff chat" button: adds a staff member (same rule as claiming) to the
     * ticket's staff thread and returns where it is.
     */
    openStaffChat(guildId: string, id: string, actor: TicketActor): Promise<StaffChatLink>;
    ticket(guildId: string, id: string): Promise<Ticket>;
    detail(guildId: string, id: string): Promise<TicketDetail>;
    list(filter: TicketListFilter): Promise<readonly Ticket[]>;
    stats(guildId: string): Promise<TicketStats>;
    claim(guildId: string, id: string, actor: TicketActor): Promise<Ticket>;
    unclaim(guildId: string, id: string, actor: TicketActor): Promise<Ticket>;
    transfer(guildId: string, id: string, actor: TicketActor, targetUserId: string): Promise<Ticket>;
    addParticipant(guildId: string, id: string, actor: TicketActor, userId: string): Promise<Ticket>;
    removeParticipant(guildId: string, id: string, actor: TicketActor, userId: string): Promise<Ticket>;
    rename(guildId: string, id: string, actor: TicketActor, name: string): Promise<Ticket>;
    setPriority(guildId: string, id: string, actor: TicketActor, priority: TicketPriority): Promise<Ticket>;
    setPending(guildId: string, id: string, actor: TicketActor, pending: boolean): Promise<Ticket>;
    setTags(guildId: string, id: string, actor: TicketActor, tags: readonly string[]): Promise<Ticket>;
    addNote(guildId: string, id: string, actor: TicketActor, content: string): Promise<TicketMessage>;
    /** Sends a staff reply from the portal into the Discord ticket. */
    reply(guildId: string, id: string, actor: TicketActor, content: string): Promise<TicketMessage>;
    /**
     * Stores a Discord message sent inside a ticket channel for transcripts.
     * Messages in the ticket's staff thread are stored as staff chat (internal).
     */
    recordMessage(input: RecordedDiscordMessage): Promise<TicketMessage | undefined>;
    /** True when the actor may close this ticket. */
    canClose(ticket: Ticket, actor: TicketActor): Promise<boolean>;
    close(guildId: string, id: string, actor: TicketActor, reason?: string): Promise<Ticket>;
    reopen(guildId: string, id: string, actor: TicketActor): Promise<Ticket>;
    /** Deletes the Discord channel of a closed ticket. The record and transcript stay. */
    deleteChannel(guildId: string, id: string, actor: TicketActor): Promise<Ticket>;
    /** Marks a ticket closed when its Discord channel disappears, and forgets a deleted staff thread. */
    handleChannelDeleted(channelId: string): Promise<void>;
    rate(id: string, userId: string, rating: number, feedback?: string): Promise<Ticket>;
    /** Renders a plain-text transcript. The staff chat is included only in staff copies. */
    transcript(guildId: string, id: string, includeInternal: boolean): Promise<TicketTranscriptFile>;
    /** The .txt and .html transcripts. Member copies never include the staff chat. */
    transcriptFiles(ticket: Ticket, settings: TicketSettings, includeStaffChat: boolean): Promise<readonly [TicketTranscriptFile, TicketTranscriptFile]>;
    /**
     * Portal retry: DMs the member their transcript (summary, .txt and .html,
     * no staff chat) for a closed ticket.
     */
    sendTranscriptToMember(guildId: string, id: string, actor: TicketActor): Promise<{
        readonly sent: true;
    }>;
    /**
     * Deletes CLOSED tickets older than each server's retention (with their
     * messages and events), 200 at a time. Open tickets are never deleted.
     */
    sweepRetention(): Promise<RetentionSweepResult>;
    /** Transcript for a member: staff get internal notes, the opener gets the public copy. */
    transcriptFor(guildId: string, id: string, actor: TicketActor): Promise<TicketTranscriptFile>;
    /** Warns about and closes inactive tickets for every guild with auto-close enabled. */
    sweepAutoClose(): Promise<AutoCloseSweepResult>;
    private staffContext;
    private restrictStaff;
    private categoryFor;
    private requireCategory;
    private requirePanel;
    /**
     * Creates the private staff thread, posts its first message (pinging the
     * support roles), and adds the reason's alerted members. The opener is never
     * added. A refusal from Discord is recorded and the ticket stays open.
     */
    private createStaffThread;
    /** Adds a staff member to the ticket's staff thread. Never the opener. */
    private addStaffThreadMember;
    private rememberStaffMember;
    /**
     * Closing: archives and locks the staff thread. Deleting (`deleteDelaySeconds`
     * set): in channel mode the thread goes with the channel; in thread mode it
     * is deleted too.
     */
    private closeStaffThread;
    /** Records a transcript DM the member did not receive and, while the ticket is still in Discord, tells them there. */
    private transcriptDmFailed;
    /**
     * The DM for the member: the `tickets.closed-dm` message, plus (with the
     * transcript) a summary embed and the .txt and .html files without staff chat.
     */
    private memberDirectMessage;
    /** The `tickets.closed-dm` message for the member who opened the ticket. */
    private closedDirectMessage;
    private requireGateway;
    private notice;
    private log;
    private attempt;
    private event;
}
export declare function systemActor(): TicketActor;
/** Categories a panel offers: its chosen list in order, or every enabled category. */
export declare function panelCategories(panel: TicketPanel, categories: readonly TicketCategory[]): readonly TicketCategory[];
/** Channel name for a ticket opened under a reason that has no template of its own: "donations-5". */
export declare const DEFAULT_REASON_NAME_TEMPLATE = "{reason}-{reasonNumber}";
export { ticketLabel };
//# sourceMappingURL=TicketService.d.ts.map