import { CommunityCommand } from "./communityCommandHelpers.js";
import { base, configureWelcomeGoodbye } from "./Welcome.command.js";
export class GoodbyeCommand extends CommunityCommand {
    data = base("goodbye", "Manage goodbye messages.");
    constructor(community) { super("discord.welcome.manage", community); }
    async execute(context) {
        await configureWelcomeGoodbye("GOODBYE", this.service(), this.guildId(context), context);
    }
}
export const command = new GoodbyeCommand();
//# sourceMappingURL=Goodbye.command.js.map