import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";
import type { DiscordCommunityService } from "@qbox/discord-community";
import { rulesCustomId } from "../community/DiscordCommunityEventHandler.js";
import { CommunityCommand, enabledText } from "./communityCommandHelpers.js";
import type { CommandExecutionContext } from "./DiscordCommand.js";

export class RulesCommand extends CommunityCommand {
  public readonly data = new SlashCommandBuilder()
    .setName("rules").setDescription("Manage rules acknowledgement.")
    .addSubcommand((sub) => sub.setName("configure").setDescription("Configure rules panel.").addChannelOption((option) => option.setName("channel").setDescription("Target channel.").setRequired(true)).addStringOption((option) => option.setName("message").setDescription("Rules text.").setRequired(true)).addRoleOption((option) => option.setName("accepted-role").setDescription("Accepted role.").setRequired(true)).addStringOption((option) => option.setName("button").setDescription("Button label.")).addRoleOption((option) => option.setName("remove-role").setDescription("Optional role to remove.")))
    .addSubcommand((sub) => sub.setName("publish").setDescription("Publish or republish rules panel."))
    .addSubcommand((sub) => sub.setName("inspect").setDescription("Inspect rules config."))
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable rules."));
  public constructor(community?: DiscordCommunityService) { super("discord.rules.manage", community); }
  public async execute(context: CommandExecutionContext): Promise<void> {
    const service = this.service();
    const guildId = this.guildId(context);
    const route = context.route.requiredSubcommand();
    const settings = await service.settings(guildId);
    if (route === "configure") {
      const channel = context.options.requiredChannel("channel");
      const accepted = context.options.requiredRole("accepted-role");
      const pending = context.options.optionalRole("remove-role");
      const saved = await service.saveRules({ guildId, enabled: settings.rules?.enabled ?? false, channelId: channel.id, messageText: context.options.requiredString("message"), buttonLabel: context.options.optionalString("button") ?? "Accept Rules", acceptedRoleId: accepted.id, ...(pending ? { pendingRoleId: pending.id } : {}), ...(settings.rules?.messageId ? { messageId: settings.rules.messageId } : {}) });
      await context.editReply({ content: `Rules configured for <#${saved.channelId}> and currently ${enabledText(saved.enabled)}.` });
      return;
    }
    if (route === "disable") {
      if (!settings.rules) { await context.editReply({ content: "Rules are not configured." }); return; }
      await service.saveRules({ ...settings.rules, enabled: false });
      await context.editReply({ content: "Rules disabled." });
      return;
    }
    if (route === "publish") {
      if (!settings.rules) { await context.editReply({ content: "Rules are not configured." }); return; }
      const channel = await context.interaction.guild?.channels.fetch(settings.rules.channelId);
      if (!channel?.isTextBased()) { await context.editReply({ content: "Configured channel cannot receive messages." }); return; }
      const button = new ButtonBuilder().setCustomId(rulesCustomId(guildId)).setStyle(ButtonStyle.Success).setLabel(settings.rules.buttonLabel);
      const message = await channel.send({ content: settings.rules.messageText, components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)] });
      await service.saveRules({ ...settings.rules, enabled: true, messageId: message.id });
      await context.editReply({ content: `Rules panel published: ${message.url}` });
      return;
    }
    await context.editReply({ content: settings.rules ? `Rules are ${enabledText(settings.rules.enabled)} in <#${settings.rules.channelId}>.` : "Rules are not configured." });
  }
}
export const command = new RulesCommand();
