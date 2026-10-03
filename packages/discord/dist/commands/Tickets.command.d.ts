import { type TicketService } from "@qbox/tickets";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/tickets` - ticket system administration (requires `tickets.manage`). */
export declare class TicketsCommand implements DiscordCommand {
    private readonly tickets?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(tickets?: TicketService | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
    private categoryByName;
}
export declare const command: TicketsCommand;
//# sourceMappingURL=Tickets.command.d.ts.map