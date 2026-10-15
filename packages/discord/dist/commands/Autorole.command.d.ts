import type { DiscordCommunityService } from "@qbox/discord-community";
import { CommunityCommand } from "./communityCommandHelpers.js";
import type { CommandExecutionContext } from "./DiscordCommand.js";
export declare class AutoroleCommand extends CommunityCommand {
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(community?: DiscordCommunityService);
    execute(context: CommandExecutionContext): Promise<void>;
}
export declare const command: AutoroleCommand;
//# sourceMappingURL=Autorole.command.d.ts.map