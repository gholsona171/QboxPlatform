import { SlashCommandBuilder } from "discord.js";
import { enabledText, parseColor, CommunityCommand } from "./communityCommandHelpers.js";
export class WelcomeCommand extends CommunityCommand {
    data = base("welcome", "Manage welcome messages.");
    constructor(community) { super("discord.welcome.manage", community); }
    async execute(context) {
        await configureWelcomeGoodbye("WELCOME", this.service(), this.guildId(context), context);
    }
}
export const command = new WelcomeCommand();
export function base(name, description) {
    return new SlashCommandBuilder()
        .setName(name)
        .setDescription(description)
        .addSubcommand((sub) => sub.setName("configure").setDescription("Configure the message.").addChannelOption((option) => option.setName("channel").setDescription("Target channel.").setRequired(true)).addStringOption((option) => option.setName("message").setDescription("Message text.").setRequired(true)).addBooleanOption((option) => option.setName("embed").setDescription("Use embed mode.")).addStringOption((option) => option.setName("title").setDescription("Embed title.")).addStringOption((option) => option.setName("description").setDescription("Embed description.")).addStringOption((option) => option.setName("color").setDescription("Embed color hex.")).addRoleOption((option) => option.setName("mention-role").setDescription("Optional role mention.")).addIntegerOption((option) => option.setName("delete-after").setDescription("Delete after seconds.")))
        .addSubcommand((sub) => sub.setName("preview").setDescription("Preview safely."))
        .addSubcommand((sub) => sub.setName("enable").setDescription("Enable messages."))
        .addSubcommand((sub) => sub.setName("disable").setDescription("Disable messages."))
        .addSubcommand((sub) => sub.setName("inspect").setDescription("Inspect configuration."));
}
export async function configureWelcomeGoodbye(kind, service, guildId, context) {
    const settings = await service.settings(guildId);
    const existing = kind === "WELCOME" ? settings.welcome : settings.goodbye;
    const route = context.route.requiredSubcommand();
    if (route === "inspect" || route === "preview") {
        await context.editReply({ content: existing ? `${kind} is ${enabledText(existing.enabled)} in <#${existing.channelId}>: ${existing.messageText}` : `${kind} is not configured.` });
        return;
    }
    if (route === "enable" || route === "disable") {
        if (!existing) {
            await context.editReply({ content: `${kind} is not configured.` });
            return;
        }
        await service.saveWelcomeGoodbye({ ...existing, enabled: route === "enable" });
        await context.editReply({ content: `${kind} ${route === "enable" ? "enabled" : "disabled"}.` });
        return;
    }
    const channel = context.options.requiredChannel("channel");
    const role = context.options.optionalRole("mention-role");
    const config = await service.saveWelcomeGoodbye({
        guildId,
        kind,
        enabled: existing?.enabled ?? false,
        channelId: channel.id,
        messageText: context.options.requiredString("message"),
        embedEnabled: context.options.optionalBoolean("embed") ?? false,
        ...(context.options.optionalString("title") ? { embedTitle: context.options.optionalString("title") } : {}),
        ...(context.options.optionalString("description") ? { embedDescription: context.options.optionalString("description") } : {}),
        ...(parseColor(context.options.optionalString("color")) ? { embedColor: parseColor(context.options.optionalString("color")) } : {}),
        thumbnailAvatar: true,
        directMessageEnabled: false,
        ...(role ? { roleMentionId: role.id } : {}),
        ...(context.options.optionalInteger("delete-after") ? { deleteAfterSeconds: context.options.optionalInteger("delete-after") } : {}),
    });
    await context.editReply({ content: `${kind} configured for <#${config.channelId}> and currently ${enabledText(config.enabled)}.` });
}
//# sourceMappingURL=Welcome.command.js.map