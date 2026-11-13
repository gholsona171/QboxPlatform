import { SlashCommandBuilder } from "discord.js";
import { LevelError } from "@qbox/levels";
import { memberHasPermission } from "../features/featureAuthorization.js";
/** `/levels` - staff tools to give, take, set, and reset XP. Needs `levels.manage`. */
export class LevelsCommand {
    levels;
    authorizer;
    type = "chat-input";
    policy = {
        contexts: "guild",
        response: { acknowledgement: "deferred", visibility: "ephemeral" },
        concurrency: "user",
    };
    data = new SlashCommandBuilder()
        .setName("levels")
        .setDescription("Change members' XP and levels (staff).")
        .addSubcommand((sub) => sub.setName("give").setDescription("Give XP to a member.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
        .addIntegerOption((option) => option.setName("xp").setDescription("XP to add.").setRequired(true).setMinValue(1).setMaxValue(10_000_000)))
        .addSubcommand((sub) => sub.setName("take").setDescription("Take XP from a member.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
        .addIntegerOption((option) => option.setName("xp").setDescription("XP to remove.").setRequired(true).setMinValue(1).setMaxValue(10_000_000)))
        .addSubcommand((sub) => sub.setName("set").setDescription("Set a member's level.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
        .addIntegerOption((option) => option.setName("level").setDescription("New level.").setRequired(true).setMinValue(0).setMaxValue(1000)))
        .addSubcommand((sub) => sub.setName("reset").setDescription("Clear a member's XP.")
        .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true)));
    constructor(levels, authorizer) {
        this.levels = levels;
        this.authorizer = authorizer;
    }
    async execute(context) {
        try {
            await this.run(context);
        }
        catch (error) {
            if (!(error instanceof LevelError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
    async run(context) {
        const interaction = context.interaction;
        const guildId = interaction.guildId;
        if (!this.levels || !this.authorizer || !guildId)
            throw new LevelError("DEPENDENCY_UNAVAILABLE", "Levels are not available right now.");
        if (!(await memberHasPermission(this.authorizer, interaction, "levels.manage"))) {
            await context.editReply({ content: "You need the `levels.manage` permission to do that." });
            return;
        }
        const route = context.route.requiredSubcommand();
        const user = context.options.requiredUser("member");
        if (user.bot)
            throw new LevelError("INVALID_INPUT", "Bots don't earn XP.");
        const name = user.globalName ?? user.username;
        switch (route) {
            case "give":
                await context.editReply({ content: summary(await this.levels.give(guildId, user.id, context.options.requiredInteger("xp"), name)) });
                return;
            case "take":
                await context.editReply({ content: summary(await this.levels.take(guildId, user.id, context.options.requiredInteger("xp"))) });
                return;
            case "set":
                await context.editReply({ content: summary(await this.levels.setLevel(guildId, user.id, context.options.requiredInteger("level"), name)) });
                return;
            default:
                await this.levels.reset(guildId, user.id);
                await context.editReply({ content: `<@${user.id}>'s XP was reset.` });
        }
    }
}
function summary(change) {
    const { member } = change;
    const moved = member.level === change.previousLevel ? "" : ` (was level ${change.previousLevel})`;
    return `<@${member.userId}> now has ${member.xp.toLocaleString("en-US")} XP and is level ${member.level}${moved}.`;
}
export const command = new LevelsCommand();
//# sourceMappingURL=Levels.command.js.map