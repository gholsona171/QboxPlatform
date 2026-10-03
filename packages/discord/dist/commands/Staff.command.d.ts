import { type StaffService } from "@qbox/staff";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/staff` - roster, promotions, strikes, leave, and shifts. */
export declare class StaffCommand implements DiscordCommand {
    private readonly staff?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(staff?: StaffService | undefined, authorizer?: PermissionAuthorizer | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
    private rankByName;
    private profileEmbed;
}
export declare const command: StaffCommand;
//# sourceMappingURL=Staff.command.d.ts.map