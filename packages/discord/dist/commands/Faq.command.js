import { SlashCommandBuilder } from "discord.js";
import { KnowledgeError, articleEmbed } from "@qbox/knowledge-base";
import { toEmbedBuilder } from "../features/featureEmbeds.js";
/** `/faq` - show a knowledge base article. Anyone can use it. */
export class FaqCommand {
    knowledge;
    type = "chat-input";
    policy = {
        contexts: "guild",
        // Acknowledged in `execute` so members can choose a private reply.
        response: { acknowledgement: "immediate", visibility: "public" },
        concurrency: "user",
    };
    data = new SlashCommandBuilder()
        .setName("faq")
        .setDescription("Show an article from the knowledge base.")
        .addStringOption((option) => option.setName("query").setDescription("What are you looking for?").setRequired(true).setMaxLength(200).setAutocomplete(true))
        .addBooleanOption((option) => option.setName("private").setDescription("Only you see the answer."));
    constructor(knowledge) {
        this.knowledge = knowledge;
    }
    async execute(context) {
        const interaction = context.interaction;
        await interaction.deferReply({ ephemeral: context.options.optionalBoolean("private") ?? false });
        try {
            if (!this.knowledge || !interaction.guildId)
                throw new KnowledgeError("DEPENDENCY_UNAVAILABLE", "The knowledge base is not available right now.");
            const article = await this.knowledge.find(interaction.guildId, context.options.requiredString("query"), true);
            await context.editReply({ embeds: [toEmbedBuilder(articleEmbed(article, await this.knowledge.categoryOf(article)))] });
        }
        catch (error) {
            if (!(error instanceof KnowledgeError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
}
export const command = new FaqCommand();
//# sourceMappingURL=Faq.command.js.map