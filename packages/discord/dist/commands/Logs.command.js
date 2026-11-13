import { SlashCommandBuilder } from "discord.js";
import { CommunityCommand, enabledText } from "./communityCommandHelpers.js";
import { BRAND } from "@qbox/shared/brand";
const LOG_EVENT_CHOICES = [
    { name: "Member joined", value: "memberJoin" },
    { name: "Member left", value: "memberLeave" },
    { name: "Message deleted", value: "messageDelete" },
    { name: "Message edited", value: "messageEdit" },
    { name: "Member roles changed", value: "roleChange" },
    { name: "Nickname changed", value: "nicknameChange" },
    { name: "Voice joins and leaves", value: "voice" },
    { name: "Bans and unbans", value: "ban" },
];
export class LogsCommand extends CommunityCommand {
    data = new SlashCommandBuilder()
        .setName("logs").setDescription("Manage server logs.")
        .addSubcommand((sub) => sub.setName("configure").setDescription("Set destination for log events.").addChannelOption((option) => option.setName("channel").setDescription("Destination channel.").setRequired(true)).addStringOption((option) => option.setName("group").setDescription("Which events go to this channel.").setRequired(true).addChoices({ name: "All events", value: "all" }, ...LOG_EVENT_CHOICES)))
        .addSubcommand((sub) => sub.setName("event-enable").setDescription("Enable an event.").addStringOption((option) => option.setName("event").setDescription("Event.").setRequired(true).addChoices(...LOG_EVENT_CHOICES)))
        .addSubcommand((sub) => sub.setName("event-disable").setDescription("Disable an event.").addStringOption((option) => option.setName("event").setDescription("Event.").setRequired(true).addChoices(...LOG_EVENT_CHOICES)))
        .addSubcommand((sub) => sub.setName("ignore-add").setDescription("Add ignored ID.").addStringOption((option) => option.setName("id").setDescription("Discord ID.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("ignore-remove").setDescription("Remove ignored ID.").addStringOption((option) => option.setName("id").setDescription("Discord ID.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("inspect").setDescription("Inspect logging."))
        .addSubcommand((sub) => sub.setName("test").setDescription("Send a safe test event."));
    constructor(community) { super("discord.logs.manage", community); }
    async execute(context) {
        const service = this.service();
        const guildId = this.guildId(context);
        const settings = await service.settings(guildId);
        const current = settings.logs ?? { guildId, enabled: false, events: [], destinations: {}, ignoredChannels: [], ignoredRoles: [], ignoredUsers: [], includeBots: false, contentMode: "REDACTED", colors: {} };
        const route = context.route.requiredSubcommand();
        if (route === "configure") {
            const channel = context.options.requiredChannel("channel");
            const group = context.options.requiredString("group");
            await service.saveLogs({ ...current, enabled: true, destinations: { ...current.destinations, [group]: channel.id } });
            await context.editReply({ content: `Logs for ${group} configured to <#${channel.id}>.` });
            return;
        }
        if (route === "event-enable" || route === "event-disable") {
            const event = context.options.requiredString("event");
            const events = route === "event-enable" ? [...new Set([...current.events, event])] : current.events.filter((item) => item !== event);
            await service.saveLogs({ ...current, enabled: true, events });
            await context.editReply({ content: `${event} ${route === "event-enable" ? "enabled" : "disabled"}.` });
            return;
        }
        if (route === "ignore-add" || route === "ignore-remove") {
            const id = context.options.requiredString("id");
            const ignoredUsers = route === "ignore-add" ? [...new Set([...current.ignoredUsers, id])] : current.ignoredUsers.filter((item) => item !== id);
            await service.saveLogs({ ...current, ignoredUsers });
            await context.editReply({ content: "Log ignore list updated." });
            return;
        }
        if (route === "test") {
            const destination = current.destinations.all ?? Object.values(current.destinations)[0];
            if (!destination) {
                await context.editReply({ content: "Set a log channel first with /logs configure." });
                return;
            }
            await service.sendAnnouncement({ guildId, channelId: destination, content: `${BRAND.name} log test from <@${context.interaction.user.id}>. Logging is working.` });
            await context.editReply({ content: `Test message sent to <#${destination}>.` });
            return;
        }
        await context.editReply({ content: `Logs are ${enabledText(current.enabled)}. Events: ${current.events.join(", ") || "none"}.` });
    }
}
export const command = new LogsCommand();
//# sourceMappingURL=Logs.command.js.map