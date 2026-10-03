import { type ApplicationService } from "@qbox/applications";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { ApplicationElevation } from "../applications/applicationActor.js";
/**
 * `/applications` - staff review. Reviewers need `applications.review` or a
 * form's reviewer role; posting a panel needs `applications.manage`.
 */
export declare class ApplicationsCommand implements DiscordCommand {
    private readonly applications?;
    private readonly elevation?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(applications?: ApplicationService | undefined, elevation?: ApplicationElevation | undefined, authorizer?: PermissionAuthorizer | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: ApplicationsCommand;
//# sourceMappingURL=Applications.command.d.ts.map