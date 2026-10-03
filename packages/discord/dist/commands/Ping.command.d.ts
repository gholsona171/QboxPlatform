import { SlashCommandBuilder } from "discord.js";
import type { CommandExecutionContext, DiscordCommand } from "./DiscordCommand.js";
export declare class PingCommand implements DiscordCommand {
    readonly type: "chat-input";
    readonly data: SlashCommandBuilder;
    readonly policy: {
        readonly contexts: "both";
        readonly response: {
            readonly acknowledgement: "immediate";
            readonly visibility: "ephemeral";
        };
        readonly cooldown: {
            readonly scope: "user";
            readonly durationMs: 1000;
        };
        readonly concurrency: "user";
    };
    execute(context: CommandExecutionContext): Promise<void>;
}
export declare const command: PingCommand;
//# sourceMappingURL=Ping.command.d.ts.map