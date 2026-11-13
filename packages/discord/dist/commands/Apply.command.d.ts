import { SlashCommandBuilder } from "discord.js";
import { type ApplicationService } from "@qbox/applications";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** `/apply` - shows the forms a member can apply to. Any member can run it. */
export declare class ApplyCommand implements DiscordCommand {
    private readonly applications?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: SlashCommandBuilder;
    constructor(applications?: ApplicationService | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
}
export declare const command: ApplyCommand;
//# sourceMappingURL=Apply.command.d.ts.map