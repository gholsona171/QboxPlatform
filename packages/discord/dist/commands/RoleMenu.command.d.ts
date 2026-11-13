import type { RoleMenuService } from "@qbox/role-menus";
import type { CommandExecutionContext, DiscordCommand } from "./DiscordCommand.js";
export declare class RoleMenuCommand implements DiscordCommand {
    private readonly roleMenus?;
    readonly type: "chat-input";
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    readonly policy: {
        readonly contexts: "guild";
        readonly permissions: {
            readonly required: readonly ["discord.role-menus.manage"];
            readonly mode: "all";
            readonly administratorOverride: true;
        };
        readonly response: {
            readonly acknowledgement: "deferred";
            readonly visibility: "ephemeral";
        };
        readonly concurrency: "user";
    };
    constructor(roleMenus?: RoleMenuService | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
    private list;
    private create;
    private optionAdd;
    private optionEdit;
    private optionRemove;
    private publish;
    private disable;
    private delete;
    private inspect;
    private requireService;
}
export declare const command: RoleMenuCommand;
//# sourceMappingURL=RoleMenu.command.d.ts.map