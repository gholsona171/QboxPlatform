import { SlashCommandBuilder } from "discord.js";
import type { DiscordCommunityService } from "@qbox/discord-community";
import { CommunityCommand, enabledText } from "./communityCommandHelpers.js";
import type { CommandExecutionContext } from "./DiscordCommand.js";

export class CustomCommand extends CommunityCommand {
  public readonly data = new SlashCommandBuilder()
    .setName("custom").setDescription("Manage custom responses.")
    .addSubcommand((sub) => sub.setName("create").setDescription("Create response.").addStringOption((option) => option.setName("name").setDescription("Name.").setRequired(true)).addStringOption((option) => option.setName("response").setDescription("Response.").setRequired(true)).addStringOption((option) => option.setName("description").setDescription("Description.")))
    .addSubcommand((sub) => sub.setName("edit").setDescription("Edit response.").addStringOption((option) => option.setName("name").setDescription("Name.").setRequired(true)).addStringOption((option) => option.setName("response").setDescription("Response.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("delete").setDescription("Delete response.").addStringOption((option) => option.setName("name").setDescription("Name.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("list").setDescription("List responses."))
    .addSubcommand((sub) => sub.setName("run").setDescription("Run response.").addStringOption((option) => option.setName("name").setDescription("Name.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("enable").setDescription("Enable response.").addStringOption((option) => option.setName("name").setDescription("Name.").setRequired(true)))
    .addSubcommand((sub) => sub.setName("disable").setDescription("Disable response.").addStringOption((option) => option.setName("name").setDescription("Name.").setRequired(true)));
  public constructor(community?: DiscordCommunityService) { super("discord.custom-commands.manage", community); }
  public async execute(context: CommandExecutionContext): Promise<void> {
    const service = this.service(); const guildId = this.guildId(context); const route = context.route.requiredSubcommand(); const name = context.options.optionalString("name");
    if (route === "create" || route === "edit") {
      const saved = await service.saveCustomCommand({ guildId, name: context.options.requiredString("name"), description: context.options.optionalString("description") ?? "Custom response.", responseText: context.options.requiredString("response"), enabled: true, allowedChannels: [], deniedChannels: [], requiredRoles: [], cooldownSeconds: 0, triggerMode: "SLASH_ONLY", deleteTriggeringMessage: false });
      await context.editReply({ content: `Custom response saved: ${saved.name}.` }); return;
    }
    if (route === "delete" && name) { await service.deleteCustomCommand(guildId, name); await context.editReply({ content: "Custom response deleted." }); return; }
    const settings = await service.settings(guildId); const command = name ? settings.customCommands.find((item) => item.name === name) : undefined;
    if ((route === "enable" || route === "disable") && command) { await service.saveCustomCommand({ ...command, enabled: route === "enable" }); await context.editReply({ content: `${command.name} ${route}d.` }); return; }
    if (route === "run") { await context.editReply({ content: command?.responseText ?? "Custom response not found." }); return; }
    await context.editReply({ content: settings.customCommands.map((item) => `${item.name}: ${enabledText(item.enabled)}`).join("\n") || "No custom responses configured." });
  }
}
export const command = new CustomCommand();
