import { SlashCommandBuilder } from "discord.js";
import { CommunityCommand } from "./communityCommandHelpers.js";
export class SuggestCommand extends CommunityCommand {
    data = new SlashCommandBuilder()
        .setName("suggest").setDescription("Manage suggestions.")
        .addSubcommand((sub) => sub.setName("submit").setDescription("Submit suggestion.").addStringOption((option) => option.setName("content").setDescription("Suggestion.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("approve").setDescription("Approve suggestion.").addStringOption((option) => option.setName("id").setDescription("Suggestion ID.").setRequired(true)).addStringOption((option) => option.setName("note").setDescription("Staff note.")))
        .addSubcommand((sub) => sub.setName("deny").setDescription("Deny suggestion.").addStringOption((option) => option.setName("id").setDescription("Suggestion ID.").setRequired(true)).addStringOption((option) => option.setName("note").setDescription("Staff note.")))
        .addSubcommand((sub) => sub.setName("consider").setDescription("Mark under review.").addStringOption((option) => option.setName("id").setDescription("Suggestion ID.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("inspect").setDescription("Inspect suggestions."));
    constructor(community) { super("discord.suggestions.manage", community); }
    bypassAuthorization(context) {
        return context.route.requiredSubcommand() === "submit";
    }
    async execute(context) {
        const service = this.service();
        const guildId = this.guildId(context);
        const route = context.route.requiredSubcommand();
        if (route === "submit") {
            const suggestion = await service.createSuggestion({ guildId, submitterId: context.interaction.user.id, content: context.options.requiredString("content") });
            await context.editReply({ content: `Suggestion submitted: ${suggestion.id}.` });
            return;
        }
        if (["approve", "deny", "consider"].includes(route)) {
            const status = route === "approve" ? "APPROVED" : route === "deny" ? "DENIED" : "UNDER_REVIEW";
            const note = context.options.optionalString("note");
            const suggestion = await service.updateSuggestion({ guildId, id: context.options.requiredString("id"), status, reviewerId: context.interaction.user.id, ...(note ? { staffNote: note } : {}) });
            await context.editReply({ content: `Suggestion ${suggestion.id} is now ${suggestion.status}.` });
            return;
        }
        const settings = await service.settings(guildId);
        await context.editReply({ content: settings.suggestions.slice(0, 10).map((item) => `${item.id}: ${item.status} ${item.content.slice(0, 80)}`).join("\n") || "No suggestions yet." });
    }
}
export const command = new SuggestCommand();
//# sourceMappingURL=Suggest.command.js.map