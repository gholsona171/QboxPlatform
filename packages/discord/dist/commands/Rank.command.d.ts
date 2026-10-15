import { SlashCommandBuilder } from "discord.js";
import { type LevelService } from "@qbox/levels";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/rank` - a member's level, XP, and leaderboard position. */
export declare class RankCommand implements DiscordCommand {
    private readonly levels?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: SlashCommandBuilder;
    constructor(levels?: LevelService | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
}
export declare const command: RankCommand;
//# sourceMappingURL=Rank.command.d.ts.map