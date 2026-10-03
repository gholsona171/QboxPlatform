import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";
import { FivemError, playerLines, statusEmbed } from "@qbox/fivem";
import { toEmbedBuilder } from "../features/featureEmbeds.js";
/** `/fivem` - FiveM server status, players, and connect link. Anyone can use it. */
export class FivemCommand {
    fivem;
    type = "chat-input";
    policy = {
        contexts: "guild",
        response: { acknowledgement: "deferred", visibility: "public" },
        cooldown: { scope: "user", durationMs: 5_000 },
        concurrency: "user",
    };
    data = new SlashCommandBuilder()
        .setName("fivem")
        .setDescription("FiveM server status.")
        .addSubcommand((sub) => sub.setName("status").setDescription("Is the server online, and how many players are on?"))
        .addSubcommand((sub) => sub.setName("players").setDescription("Who is playing right now."))
        .addSubcommand((sub) => sub.setName("connect").setDescription("How to join the server."));
    constructor(fivem) {
        this.fivem = fivem;
    }
    async execute(context) {
        try {
            await this.run(context);
        }
        catch (error) {
            if (!(error instanceof FivemError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
    async run(context) {
        const guildId = context.interaction.guildId;
        if (!this.fivem || !guildId)
            throw new FivemError("DEPENDENCY_UNAVAILABLE", "FiveM status is not available right now.");
        const config = await this.fivem.config(guildId);
        const { settings } = config;
        const button = settings.connectUrl
            ? [new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Connect").setURL(settings.connectUrl))]
            : [];
        const route = context.route.requiredSubcommand();
        if (route === "connect") {
            if (!settings.connectUrl && !settings.serverAddress)
                throw new FivemError("INVALID_STATE", "The server's connect details are not set yet.");
            const lines = [
                ...(settings.connectUrl ? [`Click **Connect**, or open ${settings.connectUrl}`] : []),
                ...(settings.serverAddress ? [`In FiveM press **F8** and type \`connect ${settings.serverAddress}\``] : []),
            ];
            await context.editReply({ content: lines.join("\n"), components: button });
            return;
        }
        const status = await this.fivem.status(guildId);
        if (route === "players") {
            await context.editReply({
                embeds: [toEmbedBuilder({
                        title: `${status.hostname || "FiveM server"} — ${status.online ? `${status.playerCount}/${status.maxPlayers} players` : "offline"}`,
                        description: status.online ? playerLines(status) : status.error ?? "The server is not answering.",
                        color: status.online ? "#57F287" : "#ED4245",
                    })],
            });
            return;
        }
        const onlineSince = config.state.lastOnline ? config.state.onlineSince : undefined;
        await context.editReply({ embeds: [toEmbedBuilder(statusEmbed(settings, status, status.online ? onlineSince : undefined))], components: button });
    }
}
export const command = new FivemCommand();
//# sourceMappingURL=Fivem.command.js.map