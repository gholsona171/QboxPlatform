import { type Client } from "discord.js";
import type { TicketService } from "@qbox/tickets";
/** Old closed tickets are deleted once at start and then every 24 hours. */
export declare const RETENTION_INTERVAL_MS: number;
/**
 * Records ticket channel messages for transcripts and activity (staff thread
 * messages become staff chat), closes tickets whose channel is deleted, runs
 * the auto-close sweep every 10 minutes, and deletes closed tickets older than
 * each server's retention once at start and every 24 hours.
 *
 * Message text is only visible when the bot has the privileged Message Content
 * intent (`DISCORD_MESSAGE_CONTENT_INTENT=true`); without it, activity is still
 * tracked and text is recorded as unavailable.
 */
export declare class DiscordTicketEventHandler {
    private readonly tickets;
    private readonly ticketChannels;
    private sweepTimer;
    private retentionTimer;
    private client;
    private readonly onMessage;
    private readonly onChannelDelete;
    private readonly onThreadDelete;
    constructor(tickets: TicketService);
    attach(client: Client): void;
    detach(): void;
    private recordMessage;
    private channelDeleted;
    private sweep;
    private prune;
    /** Ticket channels and staff threads of tickets that are not closed. */
    private isTicketChannel;
    private safe;
}
//# sourceMappingURL=DiscordTicketEventHandler.d.ts.map