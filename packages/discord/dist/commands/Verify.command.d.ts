import { type VerificationService } from "@qbox/verification";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/verify` - post the panel, and verify, unverify, or check members. */
export declare class VerifyCommand implements DiscordCommand {
    private readonly verification?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(verification?: VerificationService | undefined, authorizer?: PermissionAuthorizer | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
export declare const command: VerifyCommand;
//# sourceMappingURL=Verify.command.d.ts.map