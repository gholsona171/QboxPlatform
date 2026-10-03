import { SlashCommandBuilder } from "discord.js";
export class PingCommand {
    type = "chat-input";
    data = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Checks whether the bot is responding.");
    policy = {
        contexts: "both",
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
            content: "Pong."
        });
    }
}
export const command = new PingCommand();
//# sourceMappingURL=Ping.command.js.map