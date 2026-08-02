import type { DiscordCommunityService } from "@qbox/discord-community";
import { CommunityCommand } from "./communityCommandHelpers.js";
import type { CommandExecutionContext } from "./DiscordCommand.js";
import { base, configureWelcomeGoodbye } from "./Welcome.command.js";

export class GoodbyeCommand extends CommunityCommand {
  public readonly data = base("goodbye", "Manage goodbye messages.");
  public constructor(community?: DiscordCommunityService) { super("discord.welcome.manage", community); }
  public async execute(context: CommandExecutionContext): Promise<void> {
    await configureWelcomeGoodbye("GOODBYE", this.service(), this.guildId(context), context);
  }
}

export const command = new GoodbyeCommand();
