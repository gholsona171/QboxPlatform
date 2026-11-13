import { type ScheduledMessageService } from "@qbox/scheduled-messages";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/schedule` - day-to-day control of scheduled messages. Create and edit them in the portal. */
export declare class ScheduleCommand implements DiscordCommand {
    private readonly scheduled?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(scheduled?: ScheduledMessageService | undefined, authorizer?: PermissionAuthorizer | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: ScheduleCommand;
//# sourceMappingURL=Schedule.command.d.ts.map