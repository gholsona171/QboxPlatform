import { SlashCommandBuilder } from "discord.js";
import { CommunityCommand, enabledText } from "./communityCommandHelpers.js";
export class AutoroleCommand extends CommunityCommand {
    data = new SlashCommandBuilder()
        .setName("autorole").setDescription("Manage autoroles.")
        .addSubcommand((sub) => sub.setName("add").setDescription("Add an autorole.").addRoleOption((option) => option.setName("role").setDescription("Role.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("remove").setDescription("Remove an autorole.").addRoleOption((option) => option.setName("role").setDescription("Role.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("list").setDescription("List autoroles."))
        .addSubcommand((sub) => sub.setName("enable").setDescription("Enable autoroles.").addIntegerOption((option) => option.setName("delay").setDescription("Delay seconds.")).addBooleanOption((option) => option.setName("bots").setDescription("Include bots.")))
        .addSubcommand((sub) => sub.setName("disable").setDescription("Disable autoroles."))
        .addSubcommand((sub) => sub.setName("test").setDescription("Validate autorole configuration."));
    constructor(community) { super("discord.autoroles.manage", community); }
    async execute(context) {
        const service = this.service();
        const guildId = this.guildId(context);
        const route = context.route.requiredSubcommand();
        const settings = await service.settings(guildId);
        if (route === "add") {
            const role = context.options.requiredRole("role");
            await service.addAutorole({ guildId, roleId: role.id });
            await context.editReply({ content: `Added autorole <@&${role.id}>.` });
            return;
        }
        if (route === "remove") {
            const role = context.options.requiredRole("role");
            await service.removeAutorole(guildId, role.id);
            await context.editReply({ content: `Removed autorole <@&${role.id}>.` });
            return;
        }
        if (route === "enable" || route === "disable") {
            const saved = await service.saveAutoroles({ ...settings.autoroles, enabled: route === "enable", delaySeconds: context.options.optionalInteger("delay") ?? settings.autoroles.delaySeconds, includeBots: context.options.optionalBoolean("bots") ?? settings.autoroles.includeBots });
            await context.editReply({ content: `Autoroles ${enabledText(saved.enabled)} with ${saved.roles.length} role(s).` });
            return;
        }
        await context.editReply({ content: `Autoroles are ${enabledText(settings.autoroles.enabled)}: ${settings.autoroles.roles.map((role) => `<@&${role.roleId}>`).join(", ") || "none"}.` });
    }
}
export const command = new AutoroleCommand();
//# sourceMappingURL=Autorole.command.js.map