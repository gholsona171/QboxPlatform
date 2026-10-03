import { SlashCommandBuilder } from "discord.js";
import { KnowledgeError, articleEmbed } from "@qbox/knowledge-base";
import { toEmbedBuilder } from "../features/featureEmbeds.js";
/** `/ask` - answer a question from the knowledge base, with AI when configured. */
export class AskCommand {
    knowledge;
    type = "chat-input";
    policy = {
        contexts: "guild",
        // Acknowledged in `execute` so members can choose a private reply.
        response: { acknowledgement: "immediate", visibility: "public" },
        cooldown: { scope: "user", durationMs: 10_000 },
        concurrency: "user",
    };
    data = new SlashCommandBuilder()
        .setName("ask")
        .setDescription("Ask a question. The answer comes from the knowledge base.")
        .addStringOption((option) => option.setName("question").setDescription("Your question.").setRequired(true).setMinLength(3).setMaxLength(500))
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
            const question = context.options.requiredString("question");
            const answer = await this.knowledge.ask(interaction.guildId, question);
            const best = answer.sources[0];
            if (!best) {
                await context.editReply({ content: "I couldn't find an article about that. Try other words, or ask a staff member." });
                return;
            }
            if (answer.ai && answer.text) {
                await context.editReply({
                    embeds: [toEmbedBuilder({
                            title: question.slice(0, 256),
                            description: answer.text.slice(0, 4000),
                            color: "#5865F2",
                            fields: [{ name: "From these articles", value: answer.sources.map((article) => `• ${article.title}`).join("\n").slice(0, 1024) }],
                            footer: "AI answer based on the knowledge base. Use /faq to read the full article.",
                        })],
                });
                return;
            }
            await context.editReply({ content: "This article should help:", embeds: [toEmbedBuilder(articleEmbed(best, await this.knowledge.categoryOf(best)))] });
        }
        catch (error) {
            if (!(error instanceof KnowledgeError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
}
export const command = new AskCommand();
//# sourceMappingURL=Ask.command.js.map