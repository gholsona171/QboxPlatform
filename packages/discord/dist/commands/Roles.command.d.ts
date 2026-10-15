import { type RoleManagementService } from "@qbox/discord-roles";
import type { CommandExecutionContext, DiscordCommand } from "./DiscordCommand.js";
export declare class RolesCommand implements DiscordCommand {
    private readonly roles?;
    readonly type: "chat-input";
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    readonly policy: {
        readonly contexts: "guild";
        readonly permissions: {
            readonly required: readonly ["discord.roles.manage"];
            readonly mode: "all";
            readonly administratorOverride: true;
        };
        readonly response: {
            readonly acknowledgement: "deferred";
            readonly visibility: "ephemeral";
        };
        readonly concurrency: "user";
    };
    constructor(roles?: RoleManagementService | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
    private list;
    private inspect;
    private create;
    private edit;
    private delete;
    private move;
    private hierarchy;
    private dependencies;
    private replaceDependency;
    private service;
    private guildId;
}
export declare const command: RolesCommand;
//# sourceMappingURL=Roles.command.d.ts.map