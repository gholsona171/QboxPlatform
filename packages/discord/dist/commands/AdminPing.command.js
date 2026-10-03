import { SlashCommandBuilder } from "discord.js";
export class AdminPingCommand {
    type = "chat-input";
    data = new SlashCommandBuilder()
        .setName("adminping")
        .setDescription("Tests whether you have platform administrator permission.");
    policy = {
        contexts: "guild",
        permissions: {
            required: ["platform.admin"],
            mode: "all",
            administratorOverride: false
        },
        response: {
            acknowledgement: "immediate",
            visibility: "ephemeral"
        },
        cooldown: {
            scope: "user",
            durationMs: 1_000
        },
        concurrency: "user"
    };
    async execute(context) {
        await context.reply({
            content: "Administrator permission confirmed."
        });
    }
}
export const command = new AdminPingCommand();
//# sourceMappingURL=AdminPing.command.js.map