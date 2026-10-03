import { type ModerationService } from "@qbox/moderation";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/mod` - moderation actions, case history, and channel tools. */
export declare class ModCommand implements DiscordCommand {
    private readonly moderation?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(moderation?: ModerationService | undefined, authorizer?: PermissionAuthorizer | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: ModCommand;
//# sourceMappingURL=Mod.command.d.ts.map