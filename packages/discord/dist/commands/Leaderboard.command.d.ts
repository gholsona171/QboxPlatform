import { SlashCommandBuilder } from "discord.js";
import { type LevelService } from "@qbox/levels";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/leaderboard` - members with the most XP, 10 per page. */
export declare class LeaderboardCommand implements DiscordCommand {
    private readonly levels?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: SlashCommandBuilder;
    constructor(levels?: LevelService | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
}
export declare const command: LeaderboardCommand;
//# sourceMappingURL=Leaderboard.command.d.ts.map