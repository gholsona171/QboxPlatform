import { SlashCommandBuilder } from "discord.js";
import type { CommandExecutionContext, DiscordCommand } from "./DiscordCommand.js";
export declare class AdminPingCommand implements DiscordCommand {
    readonly type: "chat-input";
    readonly data: SlashCommandBuilder;
    readonly policy: {
        readonly contexts: "guild";
        readonly permissions: {
            readonly required: readonly ["platform.admin"];
            readonly mode: "all";
            readonly administratorOverride: false;
        };
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
export declare const command: AdminPingCommand;
//# sourceMappingURL=AdminPing.command.d.ts.map