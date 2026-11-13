import { type GamesService } from "@qbox/game-servers";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/server` - game server status, players, and the list of servers. Anyone can use it. */
export declare class ServerCommand implements DiscordCommand {
    private readonly games?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(games?: GamesService | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: ServerCommand;
//# sourceMappingURL=Server.command.d.ts.map