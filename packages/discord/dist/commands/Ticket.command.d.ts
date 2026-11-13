import { type TicketService } from "@qbox/tickets";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { TicketElevation } from "../tickets/ticketActor.js";
/**
 * `/ticket` - member and support-team actions. Access is decided per action by
 * the ticket service: support roles, `tickets.handle`, or Discord admins for
 * staff actions; the opener for their own ticket where settings allow.
 */
export declare class TicketCommand implements DiscordCommand {
    private readonly tickets?;
    private readonly elevation?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(tickets?: TicketService | undefined, elevation?: TicketElevation | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
    private currentTicket;
}
export declare const command: TicketCommand;
//# sourceMappingURL=Ticket.command.d.ts.map