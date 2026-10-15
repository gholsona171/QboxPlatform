import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { LevelError } from "@qbox/levels";
/** `/leaderboard` - members with the most XP, 10 per page. */
export class LeaderboardCommand {
    levels;
    type = "chat-input";
    policy = {
        contexts: "guild",
        response: { acknowledgement: "deferred", visibility: "public" },
        concurrency: "user",
    };
    data = leaderboardData();
    constructor(levels) {
        this.levels = levels;
    }
    async execute(context) {
        try {
            const guildId = context.interaction.guildId;
            if (!this.levels || !guildId)
                throw new LevelError("DEPENDENCY_UNAVAILABLE", "Levels are not available right now.");
            const page = context.options.optionalInteger("page") ?? 1;
            const board = await this.levels.leaderboard(guildId, page);
            const pages = Math.max(1, Math.ceil(board.total / board.pageSize));
            const start = (page - 1) * board.pageSize;
            const lines = board.members.map((member, index) => `**${start + index + 1}.** <@${member.userId}> - level ${member.level} (${member.xp.toLocaleString("en-US")} XP)`);
            await context.editReply({
                embeds: [new EmbedBuilder()
                        .setTitle("Leaderboard")
                        .setColor(0x5865f2)
                        .setDescription(lines.join("\n") || (board.total === 0 ? "Nobody has earned XP yet." : `There are only ${pages} page${pages === 1 ? "" : "s"}.`))
                        .setFooter({ text: `Page ${page} of ${pages} · ${board.total} members` })],
                allowedMentions: { parse: [] },
            });
        }
        catch (error) {
            if (!(error instanceof LevelError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
}
function leaderboardData() {
    const builder = new SlashCommandBuilder().setName("leaderboard").setDescription("Show the members with the most XP.");
    builder.addIntegerOption((option) => option.setName("page").setDescription("Page number.").setMinValue(1).setMaxValue(10000));
    return builder;
}
export const command = new LeaderboardCommand();
//# sourceMappingURL=Leaderboard.command.js.map