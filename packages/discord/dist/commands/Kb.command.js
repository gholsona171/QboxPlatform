import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { KnowledgeError } from "@qbox/knowledge-base";
import { memberHasPermission } from "../features/featureAuthorization.js";
/** `/kb` - list articles, and post one publicly (staff). */
export class KbCommand {
    knowledge;
    authorizer;
    type = "chat-input";
    policy = {
        contexts: "guild",
        response: { acknowledgement: "deferred", visibility: "ephemeral" },
        concurrency: "user",
    };
    data = new SlashCommandBuilder()
        .setName("kb")
        .setDescription("Knowledge base articles.")
        .addSubcommand((sub) => sub.setName("list").setDescription("List the published articles."))
        .addSubcommand((sub) => sub.setName("post").setDescription("Post an article publicly in a channel.")
        .addStringOption((option) => option.setName("article").setDescription("Article to post.").setRequired(true).setMaxLength(200).setAutocomplete(true))
        .addChannelOption((option) => option.setName("channel").setDescription("Channel (default: this one).").addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)));
    constructor(knowledge, authorizer) {
        this.knowledge = knowledge;
        this.authorizer = authorizer;
    }
    bypassAuthorization() {
        return true;
    }
    async execute(context) {
        try {
            await this.run(context);
        }
        catch (error) {
            if (!(error instanceof KnowledgeError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
    async run(context) {
        const knowledge = this.knowledge;
        const interaction = context.interaction;
        const guildId = interaction.guildId;
        if (!knowledge || !this.authorizer || !guildId)
            throw new KnowledgeError("DEPENDENCY_UNAVAILABLE", "The knowledge base is not available right now.");
        if (context.route.requiredSubcommand() === "list") {
            const [categories, articles] = await Promise.all([knowledge.categories(guildId), knowledge.list(guildId)]);
            if (articles.length === 0) {
                await context.editReply({ content: "There are no published articles yet." });
                return;
            }
            const groups = [...categories.map((category) => ({ id: category.id, label: `${category.emoji ? `${category.emoji} ` : ""}${category.name}` })), { id: undefined, label: "Other" }];
            const sections = groups.flatMap((group) => {
                const items = articles.filter((article) => article.categoryId === group.id);
                return items.length ? [`**${group.label}**\n${items.map((article) => `• ${article.pinned ? "📌 " : ""}${article.title} — \`${article.slug}\``).join("\n")}`] : [];
            });
            const embed = new EmbedBuilder().setTitle("Knowledge base").setColor(0x5865f2).setDescription(sections.join("\n\n").slice(0, 4000)).setFooter({ text: "Use /faq to open an article." });
            await context.editReply({ embeds: [embed] });
            return;
        }
        if (!(await memberHasPermission(this.authorizer, interaction, "knowledge.manage"))) {
            await context.editReply({ content: "You need the `knowledge.manage` permission to do that." });
            return;
        }
        const channelId = context.options.optionalChannel("channel")?.id ?? interaction.channelId;
        const article = await knowledge.find(guildId, context.options.requiredString("article"));
        await knowledge.post(guildId, article.id, channelId);
        await context.editReply({ content: `Posted "${article.title}" in <#${channelId}>.` });
    }
}
export const command = new KbCommand();
//# sourceMappingURL=Kb.command.js.map