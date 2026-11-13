import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ModerationError, caseLabel, formatDuration, parseDuration } from "@qbox/moderation";
import { interactionDisplayName, memberHasPermission } from "../features/featureAuthorization.js";
const DELETE_CHOICES = [
    { name: "Don't delete", value: 0 },
    { name: "Last hour", value: 1 },
    { name: "Last 24 hours", value: 24 },
    { name: "Last 7 days", value: 168 },
];
/** Permission each subcommand needs. */
const SUBCOMMAND_PERMISSIONS = {
    warn: "moderation.warn",
    note: "moderation.warn",
    timeout: "moderation.timeout",
    untimeout: "moderation.timeout",
    kick: "moderation.kick",
    ban: "moderation.ban",
    unban: "moderation.ban",
    softban: "moderation.ban",
    history: "moderation.view",
    case: "moderation.view",
    reason: "moderation.manage",
    pardon: "moderation.manage",
    purge: "moderation.messages",
    lock: "moderation.messages",
    unlock: "moderation.messages",
    slowmode: "moderation.messages",
};
const ACTION_TYPES = {
    warn: "WARN",
    note: "NOTE",
    timeout: "TIMEOUT",
    untimeout: "UNTIMEOUT",
    kick: "KICK",
    ban: "BAN",
    unban: "UNBAN",
    softban: "SOFTBAN",
};
/** `/mod` - moderation actions, case history, and channel tools. */
export class ModCommand {
    moderation;
    authorizer;
    type = "chat-input";
    policy = {
        contexts: "guild",
        response: { acknowledgement: "deferred", visibility: "ephemeral" },
        concurrency: "user",
    };
    data = new SlashCommandBuilder()
        .setName("mod")
        .setDescription("Moderate members and channels.")
        .addSubcommand((sub) => sub.setName("warn").setDescription("Warn a member.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
        .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000)))
        .addSubcommand((sub) => sub.setName("timeout").setDescription("Time out a member (they can't talk or react).")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
        .addStringOption((option) => option.setName("duration").setDescription("For example 10m, 2h, 3d (max 28d)."))
        .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000)))
        .addSubcommand((sub) => sub.setName("untimeout").setDescription("Remove a timeout.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
        .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000)))
        .addSubcommand((sub) => sub.setName("kick").setDescription("Kick a member.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
        .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000)))
        .addSubcommand((sub) => sub.setName("ban").setDescription("Ban a user. Add a duration for a temporary ban.")
        .addUserOption((option) => option.setName("user").setDescription("User (can be someone not in the server).").setRequired(true))
        .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000))
        .addStringOption((option) => option.setName("duration").setDescription("For example 7d. Leave empty for permanent."))
        .addIntegerOption((option) => option.setName("delete-messages").setDescription("Delete their recent messages.").addChoices(...DELETE_CHOICES)))
        .addSubcommand((sub) => sub.setName("unban").setDescription("Unban a user.")
        .addUserOption((option) => option.setName("user").setDescription("User (paste their ID).").setRequired(true))
        .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000)))
        .addSubcommand((sub) => sub.setName("softban").setDescription("Kick a member and delete their recent messages.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
        .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000)))
        .addSubcommand((sub) => sub.setName("note").setDescription("Add a private staff note to a member's record.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
        .addStringOption((option) => option.setName("text").setDescription("Note.").setRequired(true).setMaxLength(1000)))
        .addSubcommand((sub) => sub.setName("history").setDescription("Show a member's moderation history.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true)))
        .addSubcommand((sub) => sub.setName("case").setDescription("Show one case.")
        .addIntegerOption((option) => option.setName("number").setDescription("Case number.").setRequired(true).setMinValue(1)))
        .addSubcommand((sub) => sub.setName("reason").setDescription("Change a case's reason.")
        .addIntegerOption((option) => option.setName("number").setDescription("Case number.").setRequired(true).setMinValue(1))
        .addStringOption((option) => option.setName("reason").setDescription("New reason.").setRequired(true).setMaxLength(1000)))
        .addSubcommand((sub) => sub.setName("pardon").setDescription("Pardon a case (lifts active bans and timeouts).")
        .addIntegerOption((option) => option.setName("number").setDescription("Case number.").setRequired(true).setMinValue(1))
        .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(1000)))
        .addSubcommand((sub) => sub.setName("purge").setDescription("Delete recent messages in this channel.")
        .addIntegerOption((option) => option.setName("count").setDescription("How many (1-100).").setRequired(true).setMinValue(1).setMaxValue(100))
        .addUserOption((option) => option.setName("member").setDescription("Only messages from this member.")))
        .addSubcommand((sub) => sub.setName("lock").setDescription("Stop everyone from sending messages in a channel.")
        .addChannelOption((option) => option.setName("channel").setDescription("Channel (default: this one).").addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
        .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(500)))
        .addSubcommand((sub) => sub.setName("unlock").setDescription("Let everyone send messages in a channel again.")
        .addChannelOption((option) => option.setName("channel").setDescription("Channel (default: this one).").addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)))
        .addSubcommand((sub) => sub.setName("slowmode").setDescription("Set slowmode for a channel.")
        .addIntegerOption((option) => option.setName("seconds").setDescription("Seconds between messages (0 turns it off).").setRequired(true).setMinValue(0).setMaxValue(21600))
        .addChannelOption((option) => option.setName("channel").setDescription("Channel (default: this one).").addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)));
    constructor(moderation, authorizer) {
        this.moderation = moderation;
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
            if (!(error instanceof ModerationError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
    async run(context) {
        const moderation = this.moderation;
        const interaction = context.interaction;
        const guildId = interaction.guildId;
        if (!moderation || !this.authorizer || !guildId)
            throw new ModerationError("DEPENDENCY_UNAVAILABLE", "Moderation is not available right now.");
        const route = context.route.requiredSubcommand();
        const permission = SUBCOMMAND_PERMISSIONS[route];
        if (!permission || !(await memberHasPermission(this.authorizer, interaction, permission))) {
            await context.editReply({ content: `You need the \`${permission ?? "moderation"}\` permission to do that.` });
            return;
        }
        const moderator = { userId: interaction.user.id, displayName: interactionDisplayName(interaction), source: "DISCORD" };
        const options = context.options;
        const type = ACTION_TYPES[route];
        if (type) {
            const user = options.optionalUser("member") ?? options.requiredUser("user");
            const target = { userId: user.id, displayName: "globalName" in user && user.globalName ? user.globalName : user.username };
            const durationText = options.optionalString("duration");
            const durationMinutes = durationText === undefined ? undefined : parseDuration(durationText);
            if (durationText !== undefined && durationMinutes === undefined)
                throw new ModerationError("INVALID_INPUT", "Use a duration like 10m, 2h, 3d, or 1w.");
            const deleteHours = options.optionalInteger("delete-messages");
            const created = await moderation.act({
                guildId,
                type,
                target,
                moderator,
                reason: options.optionalString(route === "note" ? "text" : "reason"),
                ...(durationMinutes === undefined ? {} : { durationMinutes }),
                ...(deleteHours === undefined ? {} : { deleteMessageHours: deleteHours }),
            });
            await context.editReply({ content: confirmation(created) });
            return;
        }
        switch (route) {
            case "history": {
                const member = options.requiredUser("member");
                const history = await moderation.history(guildId, member.id);
                const lines = history.cases.slice(0, 15).map((item) => `\`#${item.number}\` ${caseLabel(item.type)}${item.revokedAt ? " ~~pardoned~~" : ""} <t:${Math.floor(item.createdAt.getTime() / 1000)}:d> - ${item.reason ?? "no reason"}`);
                const embed = new EmbedBuilder()
                    .setTitle(`History for ${member.username}`)
                    .setColor(0x5865f2)
                    .setDescription(lines.join("\n") || "No cases.")
                    .addFields({ name: "Active warnings", value: String(history.activeWarnings), inline: true }, { name: "Banned", value: history.activeBan ? `Yes (case #${history.activeBan.number})` : "No", inline: true }, { name: "Timed out", value: history.activeTimeout?.expiresAt ? `Until <t:${Math.floor(history.activeTimeout.expiresAt.getTime() / 1000)}:R>` : "No", inline: true });
                await context.editReply({ embeds: [embed] });
                return;
            }
            case "case": {
                const item = await moderation.getCase(guildId, options.requiredInteger("number"));
                await context.editReply({ embeds: [caseEmbed(item)] });
                return;
            }
            case "reason": {
                const item = await moderation.updateReason(guildId, options.requiredInteger("number"), moderator, options.requiredString("reason"));
                await context.editReply({ content: `Case #${item.number} reason updated.` });
                return;
            }
            case "pardon": {
                const item = await moderation.revoke(guildId, options.requiredInteger("number"), moderator, options.optionalString("reason"));
                await context.editReply({ content: `Case #${item.number} pardoned.` });
                return;
            }
            case "purge": {
                const deleted = await moderation.purge(guildId, interaction.channelId, options.requiredInteger("count"), moderator, options.optionalUser("member")?.id);
                await context.editReply({ content: `Deleted ${deleted} message${deleted === 1 ? "" : "s"}. Messages older than 14 days can't be bulk-deleted.` });
                return;
            }
            case "lock":
            case "unlock": {
                const channelId = options.optionalChannel("channel")?.id ?? interaction.channelId;
                await moderation.lock(guildId, channelId, route === "lock", moderator, options.optionalString("reason"));
                await context.editReply({ content: `<#${channelId}> ${route === "lock" ? "locked" : "unlocked"}.` });
                return;
            }
            default: {
                const channelId = options.optionalChannel("channel")?.id ?? interaction.channelId;
                const seconds = options.requiredInteger("seconds");
                await moderation.slowmode(guildId, channelId, seconds, moderator);
                await context.editReply({ content: seconds ? `Slowmode in <#${channelId}> set to ${seconds}s.` : `Slowmode in <#${channelId}> turned off.` });
            }
        }
    }
}
function confirmation(item) {
    const length = item.durationMinutes ? ` for ${formatDuration(item.durationMinutes)}` : "";
    const dm = item.dmDelivered === false ? " (their DMs are closed, so they were not notified)" : "";
    return `${caseLabel(item.type)} recorded for <@${item.targetId}>${length}. Case #${item.number}${dm}.`;
}
function caseEmbed(item) {
    return new EmbedBuilder()
        .setTitle(`Case #${item.number} - ${caseLabel(item.type)}`)
        .setColor(item.revokedAt ? 0x57f287 : 0x5865f2)
        .addFields({ name: "Member", value: `<@${item.targetId}> (${item.targetName})`, inline: true }, { name: "Moderator", value: item.moderatorId === "0" ? item.moderatorName : `<@${item.moderatorId}>`, inline: true }, { name: "When", value: `<t:${Math.floor(item.createdAt.getTime() / 1000)}:f>`, inline: true }, { name: "Reason", value: item.reason ?? "No reason given" }, ...(item.durationMinutes ? [{ name: "Length", value: formatDuration(item.durationMinutes), inline: true }] : []), ...(item.expiresAt ? [{ name: "Ends", value: `<t:${Math.floor(item.expiresAt.getTime() / 1000)}:R>`, inline: true }] : []), ...(item.revokedAt ? [{ name: "Pardoned", value: `<t:${Math.floor(item.revokedAt.getTime() / 1000)}:f>${item.revokeReason ? ` - ${item.revokeReason}` : ""}` }] : []), ...(item.evidence.length ? [{ name: "Evidence", value: item.evidence.join("\n").slice(0, 1024) }] : []));
}
export const command = new ModCommand();
//# sourceMappingURL=Mod.command.js.map