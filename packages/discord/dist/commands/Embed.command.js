import { SlashCommandBuilder } from "discord.js";
import { CommunityCommand, parseColor } from "./communityCommandHelpers.js";
export class EmbedCommand extends CommunityCommand {
    data = new SlashCommandBuilder()
        .setName("embed").setDescription("Manage embed templates.")
        .addSubcommand((sub) => sub.setName("create").setDescription("Create template.").addStringOption((option) => option.setName("name").setDescription("Template name.").setRequired(true)).addStringOption((option) => option.setName("title").setDescription("Title.")).addStringOption((option) => option.setName("description").setDescription("Description.")).addStringOption((option) => option.setName("color").setDescription("Hex color.")))
        .addSubcommand((sub) => sub.setName("edit").setDescription("Edit template.").addStringOption((option) => option.setName("name").setDescription("Template name.").setRequired(true)).addStringOption((option) => option.setName("description").setDescription("Description.")))
        .addSubcommand((sub) => sub.setName("list").setDescription("List templates."))
        .addSubcommand((sub) => sub.setName("preview").setDescription("Preview template.").addStringOption((option) => option.setName("name").setDescription("Template name.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("send").setDescription("Send template.").addStringOption((option) => option.setName("name").setDescription("Template name.").setRequired(true)).addChannelOption((option) => option.setName("channel").setDescription("Target channel.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("delete").setDescription("Delete template.").addStringOption((option) => option.setName("id").setDescription("Template ID.").setRequired(true)));
    constructor(community) { super("discord.embeds.manage", community); }
    async execute(context) {
        const service = this.service();
        const guildId = this.guildId(context);
        const route = context.route.requiredSubcommand();
        if (route === "create" || route === "edit") {
            const template = await service.saveEmbedTemplate({ guildId, name: context.options.requiredString("name"), title: context.options.optionalString("title"), description: context.options.optionalString("description") ?? "Embed template.", color: parseColor(context.options.optionalString("color")), timestamp: false, fields: [], allowedRoleMentions: [] });
            await context.editReply({ content: `Embed template saved: ${template.name} (${template.id}).` });
            return;
        }
        const settings = await service.settings(guildId);
        if (route === "delete") {
            await service.deleteEmbedTemplate(guildId, context.options.requiredString("id"));
            await context.editReply({ content: "Embed template deleted." });
            return;
        }
        if (route === "preview") {
            const template = settings.embedTemplates.find((item) => item.name === context.options.requiredString("name"));
            await context.editReply({ content: template ? `Preview: ${template.title ?? template.name}\n${template.description ?? ""}` : "Template not found." });
            return;
        }
        if (route === "send") {
            const sent = await service.sendEmbedTemplate(guildId, context.options.requiredString("name"), context.options.requiredChannel("channel").id);
            await context.editReply({ content: sent.url ? `Embed sent: ${sent.url}` : `Embed sent in <#${sent.channelId}>.` });
            return;
        }
        await context.editReply({ content: settings.embedTemplates.map((template) => `${template.id}: ${template.name}`).join("\n") || "No embed templates configured." });
    }
}
export const command = new EmbedCommand();
//# sourceMappingURL=Embed.command.js.map