import { type GiveawayService } from "@qbox/giveaways";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/giveaway` - start and run giveaways (requires `giveaways.manage`). */
export declare class GiveawayCommand implements DiscordCommand {
    private readonly giveaways?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(giveaways?: GiveawayService | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: GiveawayCommand;
//# sourceMappingURL=Giveaway.command.d.ts.map