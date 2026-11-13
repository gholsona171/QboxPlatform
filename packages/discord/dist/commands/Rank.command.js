import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { LevelError } from "@qbox/levels";
/** `/rank` - a member's level, XP, and leaderboard position. */
export class RankCommand {
    levels;
    type = "chat-input";
    policy = {
        contexts: "guild",
        response: { acknowledgement: "deferred", visibility: "public" },
        concurrency: "user",
    };
    data = rankData();
    constructor(levels) {
        this.levels = levels;
    }
    async execute(context) {
        try {
            const guildId = context.interaction.guildId;
            if (!this.levels || !guildId)
                throw new LevelError("DEPENDENCY_UNAVAILABLE", "Levels are not available right now.");
            const user = context.options.optionalUser("member") ?? context.interaction.user;
            if (user.bot)
                throw new LevelError("INVALID_INPUT", "Bots don't earn XP.");
            const profile = await this.levels.profile(guildId, user.id);
            await context.editReply({ embeds: [rankEmbed(profile, user.globalName ?? user.username, user.displayAvatarURL({ size: 128 }))] });
        }
        catch (error) {
            if (!(error instanceof LevelError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
}
function rankData() {
    const builder = new SlashCommandBuilder().setName("rank").setDescription("Show your level and XP, or another member's.");
    builder.addUserOption((option) => option.setName("member").setDescription("Member (default: you)."));
    return builder;
}
/** Text progress bar, e.g. `▰▰▰▱▱▱▱▱▱▱`. */
function progressBar(value, total, width = 12) {
    const filled = total > 0 ? Math.min(width, Math.max(0, Math.round((value / total) * width))) : width;
    return `${"▰".repeat(filled)}${"▱".repeat(width - filled)}`;
}
function rankEmbed(profile, name, avatarUrl) {
    const { member } = profile;
    const next = profile.nextLevelXp;
    const into = member.xp - profile.currentLevelXp;
    const needed = next === undefined ? 0 : next - profile.currentLevelXp;
    return new EmbedBuilder()
        .setTitle(name)
        .setThumbnail(avatarUrl)
        .setColor(0x5865f2)
        .setDescription(next === undefined ? "Max level reached." : `${progressBar(into, needed)}\n${into.toLocaleString("en-US")} / ${needed.toLocaleString("en-US")} XP to level ${member.level + 1}`)
        .addFields({ name: "Level", value: String(member.level), inline: true }, { name: "Rank", value: profile.rank ? `#${profile.rank}` : "Unranked", inline: true }, { name: "Total XP", value: member.xp.toLocaleString("en-US"), inline: true }, { name: "Messages", value: member.messages.toLocaleString("en-US"), inline: true }, { name: "Voice", value: `${member.voiceMinutes.toLocaleString("en-US")} min`, inline: true });
}
export const command = new RankCommand();
//# sourceMappingURL=Rank.command.js.map