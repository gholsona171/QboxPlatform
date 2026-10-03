import type { Ticket, TicketMessage, TicketTranscriptFile } from "./types.js";
/** Discord lets bots send 10 MB per file without boosts; transcripts stay under 8 MB. */
export declare const TRANSCRIPT_BYTE_LIMIT: number;
export interface TranscriptInput {
    readonly ticket: Ticket;
    readonly messages: readonly TicketMessage[];
    /** Staff copies include the staff chat; member copies never do. */
    readonly includeStaffChat: boolean;
    readonly serverName?: string | undefined;
    /** When the ticket will be deleted from the portal (for the truncation line). Absent means never. */
    readonly deletionDate?: Date | undefined;
    /** Size limit in bytes for each file. */
    readonly byteLimit?: number | undefined;
}
/** "Ticket #12 - Donations #5" (reason and its own count when the ticket has one). */
export declare function ticketLabel(ticket: Ticket): string;
/** The last line of a transcript cut to fit Discord's file size limit. */
export declare function truncationLine(deletionDate: Date | undefined): string;
/** Plain-text transcript. Discord previews .txt files inline on desktop and mobile. */
export declare function renderTextTranscript(input: TranscriptInput): TicketTranscriptFile;
/**
 * One self-contained HTML page: inline CSS, no scripts, no external requests,
 * every value HTML-escaped. Opens in any browser and can be kept forever.
 */
export declare function renderHtmlTranscript(input: TranscriptInput): TicketTranscriptFile;
export declare function escapeHtml(value: string): string;
//# sourceMappingURL=transcripts.d.ts.map