import { type LevelService } from "@qbox/levels";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/levels` - staff tools to give, take, set, and reset XP. Needs `levels.manage`. */
export declare class LevelsCommand implements DiscordCommand {
    private readonly levels?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(levels?: LevelService | undefined, authorizer?: PermissionAuthorizer | undefined);
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: LevelsCommand;
//# sourceMappingURL=Levels.command.d.ts.map