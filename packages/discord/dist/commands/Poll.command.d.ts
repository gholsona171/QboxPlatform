import { type PollService } from "@qbox/polls";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/poll` - create, close, and view polls. */
export declare class PollCommand implements DiscordCommand {
    private readonly polls?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(polls?: PollService | undefined, authorizer?: PermissionAuthorizer | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: PollCommand;
//# sourceMappingURL=Poll.command.d.ts.map