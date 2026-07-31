import {
  SlashCommandBuilder
} from "discord.js";

import type {
  ChatInputCommandInteraction
} from "discord.js";

import type {
  DiscordCommand
} from "./DiscordCommand.js";

export class PingCommand implements DiscordCommand {
  public readonly data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Checks whether the bot is responding.");

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.reply({
      content: "Pong.",
      ephemeral: true
    });
  }
}
