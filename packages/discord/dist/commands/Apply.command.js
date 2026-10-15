import { SlashCommandBuilder } from "discord.js";
import { ApplicationError } from "@qbox/applications";
import { applicantFromInteraction } from "../applications/applicationActor.js";
import { formPicker } from "../applications/DiscordApplicationInteractionHandler.js";
/** `/apply` - shows the forms a member can apply to. Any member can run it. */
export class ApplyCommand {
    applications;
    type = "chat-input";
    policy = {
        contexts: "guild",
        response: { acknowledgement: "deferred", visibility: "ephemeral" },
        concurrency: "user",
    };
    data = new SlashCommandBuilder()
        .setName("apply")
        .setDescription("Apply for a staff position or whitelist.");
    constructor(applications) {
        this.applications = applications;
    }
    bypassAuthorization() {
        return true;
    }
    async execute(context) {
        try {
            const guildId = context.interaction.guildId;
            if (!this.applications || !guildId)
                throw new ApplicationError("DEPENDENCY_UNAVAILABLE", "Applications are not available right now.");
            const available = await this.applications.availability(guildId, applicantFromInteraction(context.interaction));
            await context.editReply(formPicker(available));
        }
        catch (error) {
            if (!(error instanceof ApplicationError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
}
export const command = new ApplyCommand();
//# sourceMappingURL=Apply.command.js.map