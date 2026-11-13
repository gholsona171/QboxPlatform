import { type KnowledgeService } from "@qbox/knowledge-base";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/kb` - list articles, and post one publicly (staff). */
export declare class KbCommand implements DiscordCommand {
    private readonly knowledge?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(knowledge?: KnowledgeService | undefined, authorizer?: PermissionAuthorizer | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: KbCommand;
//# sourceMappingURL=Kb.command.d.ts.map