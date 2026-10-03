import { SlashCommandBuilder } from "discord.js";
import { CommunityCommand, enabledText } from "./communityCommandHelpers.js";
export class CounterCommand extends CommunityCommand {
    data = new SlashCommandBuilder()
        .setName("counter").setDescription("Manage member counters.")
        .addSubcommand((sub) => sub.setName("create").setDescription("Create a counter.").addChannelOption((option) => option.setName("channel").setDescription("Channel to rename.").setRequired(true)).addStringOption((option) => option.setName("type").setDescription("Counter type.").setRequired(true).addChoices({ name: "Total", value: "TOTAL_MEMBERS" }, { name: "Humans", value: "HUMANS" }, { name: "Bots", value: "BOTS" }, { name: "Online", value: "ONLINE" }, { name: "Role", value: "ROLE" })).addStringOption((option) => option.setName("label").setDescription("Label template with {count}.").setRequired(true)).addRoleOption((option) => option.setName("role").setDescription("Role for role count.")))
        .addSubcommand((sub) => sub.setName("list").setDescription("List counters."))
        .addSubcommand((sub) => sub.setName("refresh").setDescription("Refresh counters."))
        .addSubcommand((sub) => sub.setName("disable").setDescription("Disable a counter.").addStringOption((option) => option.setName("id").setDescription("Counter ID.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("delete").setDescription("Delete a counter.").addStringOption((option) => option.setName("id").setDescription("Counter ID.").setRequired(true)));
    constructor(community) { super("discord.counters.manage", community); }
    async execute(context) {
        const service = this.service();
        const guildId = this.guildId(context);
        const route = context.route.requiredSubcommand();
        if (route === "create") {
            const channel = context.options.requiredChannel("channel");
            const role = context.options.optionalRole("role");
            const counter = await service.saveCounter({ guildId, enabled: true, channelId: channel.id, labelTemplate: context.options.requiredString("label"), type: counterType(context.options.requiredString("type")), ...(role ? { roleId: role.id } : {}), intervalSeconds: 300 });
            await context.editReply({ content: `Counter ${counter.id} created for <#${counter.channelId}>.` });
            return;
        }
        const settings = await service.settings(guildId);
        if (route === "refresh") {
            const results = await Promise.allSettled(settings.counters.map((counter) => service.refreshCounter(counter)));
            await context.editReply({ content: `Refreshed ${results.filter((result) => result.status === "fulfilled").length}/${results.length} counter(s).` });
            return;
        }
        if (route === "disable") {
            const id = context.options.requiredString("id");
            const counter = settings.counters.find((item) => item.id === id);
            if (!counter) {
                await context.editReply({ content: "Counter not found." });
                return;
            }
            await service.saveCounter({ ...counter, enabled: false });
            await context.editReply({ content: "Counter disabled." });
            return;
        }
        if (route === "delete") {
            await service.deleteCounter(guildId, context.options.requiredString("id"));
            await context.editReply({ content: "Counter deleted." });
            return;
        }
        await context.editReply({ content: settings.counters.map((counter) => `${counter.id}: <#${counter.channelId}> ${counter.type} ${enabledText(counter.enabled)}`).join("\n") || "No counters configured." });
    }
}
export const command = new CounterCommand();
function counterType(value) {
    const normalized = value.toUpperCase().replaceAll("-", "_");
    if (normalized === "TOTAL_MEMBERS" || normalized === "HUMANS" || normalized === "BOTS" || normalized === "ONLINE" || normalized === "ROLE")
        return normalized;
    throw new Error("Counter type must be total-members, humans, bots, online, or role.");
}
//# sourceMappingURL=Counter.command.js.map