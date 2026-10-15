import type { DiscordCommunityService } from "@qbox/discord-community";
import { CommunityCommand } from "./communityCommandHelpers.js";
import type { CommandExecutionContext } from "./DiscordCommand.js";
export declare class WelcomeCommand extends CommunityCommand {
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(community?: DiscordCommunityService);
    execute(context: CommandExecutionContext): Promise<void>;
}
export declare const command: WelcomeCommand;
export declare function base(name: string, description: string): import("discord.js").SlashCommandSubcommandsOnlyBuilder;
export declare function configureWelcomeGoodbye(kind: "WELCOME" | "GOODBYE", service: DiscordCommunityService, guildId: string, context: CommandExecutionContext): Promise<void>;
//# sourceMappingURL=Welcome.command.d.ts.map