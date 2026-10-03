import type { TicketAccessInput, TicketCategory, TicketCloseSpaceInput, TicketDirectMessage, TicketDiscordGateway, TicketNotice, TicketOpeningMessage, TicketPanelPublishInput, TicketReopenSpaceInput, TicketSpaceInput, TicketPanel, TicketStaffThreadInput, TicketTranscriptPost } from "./types.js";
import { emojiObject, type DiscordRestClient } from "@qbox/shared/discord-rest";
export type { DiscordRestClient, DiscordRestFile, DiscordRestRequest } from "@qbox/shared/discord-rest";
/** Custom ID prefixes routed by the Discord interaction handler. */
export declare const TICKET_CUSTOM_ID: {
    readonly open: "qbox:ticket:open:";
    readonly select: "qbox:ticket:select";
    readonly form: "qbox:ticket:form:";
    readonly close: "qbox:ticket:close:";
    readonly closeConfirm: "qbox:ticket:close-confirm:";
    readonly closeReason: "qbox:ticket:close-reason:";
    readonly claim: "qbox:ticket:claim:";
    readonly reopen: "qbox:ticket:reopen:";
    readonly transcript: "qbox:ticket:transcript:";
    readonly delete: "qbox:ticket:delete:";
    readonly rate: "qbox:ticket:rate:";
    /** "🔒 Staff chat" button on the opening message. */
    readonly staffChat: "qbox:tickets:staffchat:";
};
/** Discord adapter for tickets built on the Discord REST API (v10). */
export declare class DiscordRestTicketGateway implements TicketDiscordGateway {
    private readonly rest;
    private readonly schedule;
    private botUserId;
    private readonly guildNames;
    constructor(rest: DiscordRestClient, schedule?: (callback: () => void, delayMs: number) => void);
    guildName(guildId: string): Promise<string>;
    createTicketSpace(input: TicketSpaceInput): Promise<{
        readonly channelId: string;
    }>;
    postOpening(input: TicketOpeningMessage): Promise<void>;
    postNotice(input: TicketNotice): Promise<{
        readonly messageId: string;
    }>;
    setAccess(input: TicketAccessInput): Promise<void>;
    closeSpace(input: TicketCloseSpaceInput): Promise<void>;
    reopenSpace(input: TicketReopenSpaceInput): Promise<void>;
    deleteSpace(channelId: string, delaySeconds: number): Promise<void>;
    renameSpace(channelId: string, name: string): Promise<void>;
    publishPanel(input: TicketPanelPublishInput): Promise<{
        readonly messageId: string;
    }>;
    deletePanelMessage(channelId: string, messageId: string): Promise<void>;
    postTranscript(input: TicketTranscriptPost): Promise<{
        readonly messageId: string;
    }>;
    directMessage(input: TicketDirectMessage): Promise<boolean>;
    createStaffThread(input: TicketStaffThreadInput): Promise<{
        readonly threadId: string;
    }>;
    addThreadMember(threadId: string, userId: string): Promise<void>;
    setThreadArchived(threadId: string, archived: boolean): Promise<void>;
    private selfId;
}
/**
 * Button rows for a BUTTONS panel: the owner's arrangement when set (unknown or
 * disabled reasons dropped, empty rows removed), otherwise five per row.
 * Offered reasons missing from the arrangement fill the remaining space.
 * Discord allows at most 5 rows of 5 buttons.
 */
export declare function panelButtonRows(panel: Pick<TicketPanel, "rows">, categories: readonly TicketCategory[]): TicketCategory[][];
/** Parses a unicode or custom emoji into a Discord emoji object. */
export declare const emoji: typeof emojiObject;
//# sourceMappingURL=DiscordRestTicketGateway.d.ts.map