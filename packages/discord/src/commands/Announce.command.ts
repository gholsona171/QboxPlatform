import { SlashCommandBuilder } from "discord.js";
import type { DiscordCommunityService } from "@qbox/discord-community";
import { CommunityCommand } from "./communityCommandHelpers.js";
import type { CommandExecutionContext } from "./DiscordCommand.js";

export class AnnounceCommand extends CommunityCommand {
  public readonly data = new SlashCommandBuilder()
    .setName("announce").setDescription("Send announcements.")
    .addSubcommand((sub) => sub.setName("send").setDescription("Send an announcement.").addChannelOption((option) => option.setName("channel").setDescription("Target channel.").setRequired(true)).addStringOption((option) => option.setName("content").setDescription("Announcement content.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("template").setDescription("List announcement templates."))
    .addSubcommand((sub) => sub.setName("preview").setDescription("Preview announcement.").addStringOption((option) => option.setName("content").setDescription("Announcement content.").setRequired(true)));
  public constructor(community?: DiscordCommunityService) { super("discord.embeds.manage", community); }
  public async execute(context: CommandExecutionContext): Promise<void> {
    if (context.route.requiredSubcommand() === "preview") await context.editReply({ content: `Preview:\n${context.options.requiredString("content")}` });
    else if (context.route.requiredSubcommand() === "send") {
      const sent = await this.service().sendAnnouncement({ guildId: this.guildId(context), channelId: context.options.requiredChannel("channel").id, content: context.options.requiredString("content") });
      await context.editReply({ content: sent.url ? `Announcement sent: ${sent.url}` : `Announcement sent in <#${sent.channelId}>.` });
    }
    else await context.editReply({ content: (await this.service().settings(this.guildId(context))).embedTemplates.map((template) => template.name).join(", ") || "No templates." });
  }
}
export const command = new AnnounceCommand();
