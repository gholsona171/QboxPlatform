import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { GamesError, gameLabel, playerLines, statusMessage, type GamesService } from "@qbox/game-servers";
import type { OutgoingEmbed } from "@qbox/shared/messages";

import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";

/** `/server` - game server status, players, and the list of servers. Anyone can use it. */
export class ServerCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public readonly policy: CommandExecutionPolicy = {
    contexts: "guild",
    response: { acknowledgement: "deferred", visibility: "public" },
    cooldown: { scope: "user", durationMs: 5_000 },
    concurrency: "user",
  };
  public readonly data = new SlashCommandBuilder()
    .setName("server")
    .setDescription("Game server status.")
    .addSubcommand((sub) => sub.setName("status").setDescription("Is the server online, and how many players are on?")
      .addStringOption((option) => option.setName("name").setDescription("Which server (default: the first one).").setMaxLength(50)))
    .addSubcommand((sub) => sub.setName("players").setDescription("Who is playing right now.")
      .addStringOption((option) => option.setName("name").setDescription("Which server (default: the first one).").setMaxLength(50)))
    .addSubcommand((sub) => sub.setName("list").setDescription("Every game server and its last known status."));

  public constructor(private readonly games?: GamesService) {}

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await this.run(context);
    } catch (error) {
      if (!(error instanceof GamesError)) throw error;
      await context.editReply({ content: error.message });
    }
  }

  private async run(context: CommandExecutionContext): Promise<void> {
    const guildId = context.interaction.guildId;
    if (!this.games || !guildId) throw new GamesError("DEPENDENCY_UNAVAILABLE", "Game server status is not available right now.");
    const route = context.route.requiredSubcommand();
    if (route === "list") {
      const servers = await this.games.servers(guildId);
      if (servers.length === 0) throw new GamesError("INVALID_STATE", "No game servers are set up yet. Add one in the portal.");
      const lines = servers.map(({ server, state }) => {
        const dot = !server.enabled ? "⚪" : state.lastOnline === true ? "🟢" : state.lastOnline === false ? "🔴" : "⚫";
        const count = state.lastOnline ? ` · ${state.lastPlayerCount}/${state.lastMaxPlayers} players` : state.lastOnline === false ? " · offline" : "";
        return `${dot} **${server.name}** (${gameLabel(server)})${count}${server.enabled ? "" : " · monitoring off"}`;
      });
      await context.editReply({ embeds: [new EmbedBuilder().setTitle("Game servers").setDescription(lines.join("\n").slice(0, 4000)).setColor(0x5865f2)] });
      return;
    }
    const { server, state } = await this.games.findServer(guildId, context.options.optionalString("name"));
    const status = await this.games.status(guildId, server.id);
    if (route === "players") {
      await context.editReply({
        embeds: [new EmbedBuilder()
          .setTitle(`${status.name || server.name} — ${status.online ? `${status.playerCount}/${status.maxPlayers} players` : "offline"}`)
          .setDescription(status.online ? playerLines(status) : status.error ?? "The server is not answering.")
          .setColor(status.online ? 0x57f287 : 0xed4245)],
      });
      return;
    }
    const message = statusMessage(server, status, status.online && state.lastOnline ? state.onlineSince : undefined);
    const button = server.connectUrl && /^https?:\/\//i.test(server.connectUrl)
      ? [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Connect").setURL(server.connectUrl))]
      : [];
    await context.editReply({ embeds: (message.embeds ?? []).map(toEmbedBuilder), components: button });
  }
}

function toEmbedBuilder(embed: OutgoingEmbed): EmbedBuilder {
  const builder = new EmbedBuilder();
  if (embed.title) builder.setTitle(embed.title);
  if (embed.description) builder.setDescription(embed.description);
  if (embed.color !== undefined) builder.setColor(embed.color);
  if (embed.fields?.length) builder.addFields(embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })));
  if (embed.footer) builder.setFooter({ text: embed.footer.text });
  return builder;
}

export const command = new ServerCommand();
