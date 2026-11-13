import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { GiveawayError, parseDuration } from "@qbox/giveaways";
import { interactionDisplayName } from "../features/featureAuthorization.js";
const STATUS_ICONS = { RUNNING: "🟢", PAUSED: "⏸️", ENDED: "🏁", CANCELLED: "❌" };
/** `/giveaway` - start and run giveaways (requires `giveaways.manage`). */
export class GiveawayCommand {
    giveaways;
    type = "chat-input";
    policy = {
        contexts: "guild",
        permissions: { required: ["giveaways.manage"], mode: "all", administratorOverride: true },
        response: { acknowledgement: "deferred", visibility: "ephemeral" },
        concurrency: "user",
    };
    data = new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Run giveaways.")
        .addSubcommand((sub) => sub.setName("start").setDescription("Start a giveaway. Members press Enter to join.")
        .addStringOption((option) => option.setName("prize").setDescription("What the winners get.").setRequired(true).setMaxLength(200))
        .addStringOption((option) => option.setName("duration").setDescription("How long it runs, e.g. 30m, 2h, 3d, 1w.").setRequired(true))
        .addIntegerOption((option) => option.setName("winners").setDescription("Number of winners (default 1).").setMinValue(1).setMaxValue(50))
        .addChannelOption((option) => option.setName("channel").setDescription("Where to post (default: this channel).").addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
        .addStringOption((option) => option.setName("description").setDescription("Extra details shown on the giveaway.").setMaxLength(1000))
        .addUserOption((option) => option.setName("host").setDescription("Who winners contact (default: you)."))
        .addRoleOption((option) => option.setName("required-role").setDescription("Only members with this role can enter."))
        .addRoleOption((option) => option.setName("blocked-role").setDescription("Members with this role cannot enter."))
        .addIntegerOption((option) => option.setName("min-account-days").setDescription("Minimum Discord account age in days.").setMinValue(0).setMaxValue(3650))
        .addIntegerOption((option) => option.setName("min-server-days").setDescription("Minimum days in this server.").setMinValue(0).setMaxValue(3650))
        .addRoleOption((option) => option.setName("bonus-role").setDescription("Members with this role get extra entries."))
        .addIntegerOption((option) => option.setName("bonus-entries").setDescription("Extra entries for the bonus role (default 1).").setMinValue(1).setMaxValue(100))
        .addRoleOption((option) => option.setName("ping-role").setDescription("Role to ping when the giveaway starts."))
        .addBooleanOption((option) => option.setName("dm-winners").setDescription("DM the winners (default: yes).")))
        .addSubcommand((sub) => sub.setName("end").setDescription("End a giveaway now and pick the winners.")
        .addIntegerOption((option) => option.setName("giveaway").setDescription("Giveaway number.").setRequired(true).setMinValue(1)))
        .addSubcommand((sub) => sub.setName("reroll").setDescription("Pick new winners for an ended giveaway.")
        .addIntegerOption((option) => option.setName("giveaway").setDescription("Giveaway number.").setRequired(true).setMinValue(1))
        .addIntegerOption((option) => option.setName("winners").setDescription("How many new winners (default: the original number).").setMinValue(1).setMaxValue(50)))
        .addSubcommand((sub) => sub.setName("cancel").setDescription("Cancel a giveaway without picking winners.")
        .addIntegerOption((option) => option.setName("giveaway").setDescription("Giveaway number.").setRequired(true).setMinValue(1)))
        .addSubcommand((sub) => sub.setName("list").setDescription("List recent giveaways."));
    constructor(giveaways) {
        this.giveaways = giveaways;
    }
    async execute(context) {
        try {
            await this.run(context);
        }
        catch (error) {
            if (!(error instanceof GiveawayError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
    async run(context) {
        const giveaways = this.giveaways;
        const interaction = context.interaction;
        const guildId = interaction.guildId;
        if (!giveaways || !guildId)
            throw new GiveawayError("DEPENDENCY_UNAVAILABLE", "Giveaways are not available right now.");
        const options = context.options;
        const actor = { userId: interaction.user.id, displayName: interactionDisplayName(interaction) };
        const ref = () => String(options.requiredInteger("giveaway"));
        switch (context.route.requiredSubcommand()) {
            case "start": {
                const durationMinutes = parseDuration(options.requiredString("duration"));
                if (durationMinutes === undefined)
                    throw new GiveawayError("INVALID_INPUT", "Use a duration like 30m, 2h, 3d, or 1w.");
                const required = options.optionalRole("required-role")?.id;
                const blocked = options.optionalRole("blocked-role")?.id;
                const bonus = options.optionalRole("bonus-role")?.id;
                const ping = options.optionalRole("ping-role")?.id;
                const giveaway = await giveaways.start({
                    guildId,
                    prize: options.requiredString("prize"),
                    description: options.optionalString("description"),
                    winnerCount: options.optionalInteger("winners"),
                    channelId: options.optionalChannel("channel")?.id ?? interaction.channelId,
                    hostId: options.optionalUser("host")?.id,
                    requiredRoleIds: required ? [required] : [],
                    blockedRoleIds: blocked ? [blocked] : [],
                    minAccountAgeDays: options.optionalInteger("min-account-days"),
                    minServerDays: options.optionalInteger("min-server-days"),
                    bonusEntries: bonus ? [{ roleId: bonus, entries: options.optionalInteger("bonus-entries") ?? 1 }] : [],
                    ...(ping ? { pingRoleId: ping } : {}),
                    dmWinners: options.optionalBoolean("dm-winners"),
                    durationMinutes,
                }, actor);
                await context.editReply({ content: `Giveaway #${giveaway.number} started in <#${giveaway.channelId}>. It ends <t:${Math.floor(giveaway.endsAt.getTime() / 1000)}:R>.` });
                return;
            }
            case "end": {
                const giveaway = await giveaways.end(guildId, ref(), actor);
                await context.editReply({ content: `Giveaway #${giveaway.number} ended. ${winnersText(giveaway)}` });
                return;
            }
            case "reroll": {
                const giveaway = await giveaways.reroll(guildId, ref(), options.optionalInteger("winners"));
                await context.editReply({ content: `Giveaway #${giveaway.number} rerolled. ${winnersText(giveaway)}` });
                return;
            }
            case "cancel": {
                const giveaway = await giveaways.cancel(guildId, ref(), actor);
                await context.editReply({ content: `Giveaway #${giveaway.number} cancelled. No winners were picked.` });
                return;
            }
            default: {
                const recent = await giveaways.list(guildId, undefined, 15);
                const lines = recent.map((giveaway) => `\`#${giveaway.number}\` ${STATUS_ICONS[giveaway.status]} **${giveaway.prize.slice(0, 80)}** · ${giveaway.entrantCount} entr${giveaway.entrantCount === 1 ? "y" : "ies"} · ${giveaway.status === "RUNNING" ? `ends <t:${Math.floor(giveaway.endsAt.getTime() / 1000)}:R>` : giveaway.status.toLowerCase()}`);
                await context.editReply({ embeds: [new EmbedBuilder().setTitle("Giveaways").setColor(0xf47fff).setDescription(lines.join("\n") || "No giveaways yet.")] });
            }
        }
    }
}
function winnersText(giveaway) {
    return giveaway.winnerIds.length ? `Winners: ${giveaway.winnerIds.map((id) => `<@${id}>`).join(", ")}.` : "Nobody could be picked.";
}
export const command = new GiveawayCommand();
//# sourceMappingURL=Giveaway.command.js.map