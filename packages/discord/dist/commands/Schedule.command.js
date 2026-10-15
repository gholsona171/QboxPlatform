import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ScheduledMessageError, describeSchedule } from "@qbox/scheduled-messages";
import { memberHasPermission } from "../features/featureAuthorization.js";
/** `/schedule` - day-to-day control of scheduled messages. Create and edit them in the portal. */
export class ScheduleCommand {
    scheduled;
    authorizer;
    type = "chat-input";
    policy = {
        contexts: "guild",
        response: { acknowledgement: "deferred", visibility: "ephemeral" },
        concurrency: "user",
    };
    data = new SlashCommandBuilder()
        .setName("schedule")
        .setDescription("Manage scheduled messages.")
        .addSubcommand((sub) => sub.setName("list").setDescription("Show scheduled messages and when they post next."))
        .addSubcommand((sub) => sub.setName("send").setDescription("Post a scheduled message right now.")
        .addStringOption((option) => option.setName("name").setDescription("Message name.").setRequired(true).setMaxLength(100)))
        .addSubcommand((sub) => sub.setName("pause").setDescription("Stop a scheduled message from posting.")
        .addStringOption((option) => option.setName("name").setDescription("Message name.").setRequired(true).setMaxLength(100)))
        .addSubcommand((sub) => sub.setName("resume").setDescription("Let a paused message post again.")
        .addStringOption((option) => option.setName("name").setDescription("Message name.").setRequired(true).setMaxLength(100)))
        .addSubcommand((sub) => sub.setName("delete").setDescription("Delete a scheduled message.")
        .addStringOption((option) => option.setName("name").setDescription("Message name.").setRequired(true).setMaxLength(100)));
    constructor(scheduled, authorizer) {
        this.scheduled = scheduled;
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
            if (!(error instanceof ScheduledMessageError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
    async run(context) {
        const scheduled = this.scheduled;
        const interaction = context.interaction;
        const guildId = interaction.guildId;
        if (!scheduled || !this.authorizer || !guildId)
            throw new ScheduledMessageError("DEPENDENCY_UNAVAILABLE", "Scheduled messages are not available right now.");
        if (!(await memberHasPermission(this.authorizer, interaction, "scheduled.manage"))) {
            await context.editReply({ content: "You need the `scheduled.manage` permission to do that." });
            return;
        }
        const route = context.route.requiredSubcommand();
        if (route === "list") {
            const messages = await scheduled.list(guildId);
            const lines = messages.slice(0, 25).map((item) => {
                const state = !item.enabled ? "paused" : item.nextRunAt ? `next <t:${Math.floor(item.nextRunAt.getTime() / 1000)}:R>` : "finished";
                return `**${item.name}** in <#${item.channelId}> - ${describeSchedule(item.schedule)} - ${state}`;
            });
            const embed = new EmbedBuilder().setTitle("Scheduled messages").setColor(0x5865f2).setDescription(lines.join("\n").slice(0, 4000) || "No scheduled messages yet. Create one in the portal.");
            if (messages.length > 25)
                embed.setFooter({ text: `And ${messages.length - 25} more in the portal.` });
            await context.editReply({ embeds: [embed] });
            return;
        }
        const message = await scheduled.byName(guildId, context.options.requiredString("name"));
        switch (route) {
            case "send": {
                const run = await scheduled.sendNow(guildId, message.id);
                await context.editReply({ content: run.success ? `Posted **${message.name}** in <#${message.channelId}>.` : `Could not post **${message.name}**: ${run.error ?? "Discord rejected it."}` });
                return;
            }
            case "pause":
                await scheduled.setEnabled(guildId, message.id, false);
                await context.editReply({ content: `Paused **${message.name}**.` });
                return;
            case "resume": {
                const resumed = await scheduled.setEnabled(guildId, message.id, true);
                await context.editReply({ content: `Resumed **${message.name}**.${resumed.nextRunAt ? ` Next post <t:${Math.floor(resumed.nextRunAt.getTime() / 1000)}:R>.` : ""}` });
                return;
            }
            default:
                await scheduled.delete(guildId, message.id);
                await context.editReply({ content: `Deleted **${message.name}**.` });
        }
    }
}
export const command = new ScheduleCommand();
//# sourceMappingURL=Schedule.command.js.map