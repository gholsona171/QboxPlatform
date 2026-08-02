import { SlashCommandBuilder } from "discord.js";
import type { DiscordCommunityService } from "@qbox/discord-community";
import { CommunityCommand, enabledText } from "./communityCommandHelpers.js";
import type { CommandExecutionContext } from "./DiscordCommand.js";

export class StarboardCommand extends CommunityCommand {
  public readonly data = new SlashCommandBuilder()
    .setName("starboard").setDescription("Manage starboard.")
    .addSubcommand((sub) => sub.setName("configure").setDescription("Configure starboard.").addChannelOption((option) => option.setName("channel").setDescription("Destination channel.").setRequired(true)).addStringOption((option) => option.setName("emoji").setDescription("Required emoji.")).addIntegerOption((option) => option.setName("threshold").setDescription("Threshold.")))
    .addSubcommand((sub) => sub.setName("enable").setDescription("Enable starboard."))
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable starboard."))
    .addSubcommand((sub) => sub.setName("inspect").setDescription("Inspect starboard."))
    .addSubcommand((sub) => sub.setName("remove-entry").setDescription("Mark entry deleted.").addStringOption((option) => option.setName("message").setDescription("Source message ID.").setRequired(true)));
  public constructor(community?: DiscordCommunityService) { super("discord.starboard.manage", community); }
  public async execute(context: CommandExecutionContext): Promise<void> {
    const service = this.service(); const guildId = this.guildId(context); const settings = await service.settings(guildId); const route = context.route.requiredSubcommand();
    if (route === "configure") {
      const channel = context.options.requiredChannel("channel");
      const config = await service.saveStarboard({ guildId, enabled: settings.starboard?.enabled ?? false, destinationChannelId: channel.id, emoji: context.options.optionalString("emoji") ?? "\u2b50", threshold: context.options.optionalInteger("threshold") ?? 3, allowSelfStar: false, includeBotMessages: false, nsfw: "BLOCK", mode: "DENYLIST", channels: [], ignoredRoles: [] });
      await context.editReply({ content: `Starboard configured for <#${config.destinationChannelId}>.` }); return;
    }
    if ((route === "enable" || route === "disable") && settings.starboard) { await service.saveStarboard({ ...settings.starboard, enabled: route === "enable" }); await context.editReply({ content: `Starboard ${route}d.` }); return; }
    if (route === "remove-entry") { await service.markStarboardEntryDeleted(guildId, context.options.requiredString("message")); await context.editReply({ content: "Starboard entry marked deleted." }); return; }
    await context.editReply({ content: settings.starboard ? `Starboard is ${enabledText(settings.starboard.enabled)} to <#${settings.starboard.destinationChannelId}> at ${settings.starboard.threshold} ${settings.starboard.emoji}.` : "Starboard is not configured." });
  }
}
export const command = new StarboardCommand();
