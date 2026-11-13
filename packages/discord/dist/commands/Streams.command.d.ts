import { type StreamsService } from "@qbox/streams";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/streams` - follow creators and announce when they go live. `list` is open to everyone; the rest needs `streams.manage`. */
export declare class StreamsCommand implements DiscordCommand {
    private readonly streams?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(streams?: StreamsService | undefined, authorizer?: PermissionAuthorizer | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
    private find;
}
export declare const command: StreamsCommand;
//# sourceMappingURL=Streams.command.d.ts.map