import { type FivemService } from "@qbox/fivem";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/fivem` - FiveM server status, players, and connect link. Anyone can use it. */
export declare class FivemCommand implements DiscordCommand {
    private readonly fivem?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(fivem?: FivemService | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: FivemCommand;
//# sourceMappingURL=Fivem.command.d.ts.map