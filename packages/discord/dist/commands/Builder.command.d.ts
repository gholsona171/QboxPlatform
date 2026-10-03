import { type BuilderService } from "@qbox/server-builder";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/builder` - server builder status. Building happens in the portal. */
export declare class BuilderCommand implements DiscordCommand {
    private readonly builder?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(builder?: BuilderService | undefined, authorizer?: PermissionAuthorizer | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: BuilderCommand;
//# sourceMappingURL=Builder.command.d.ts.map