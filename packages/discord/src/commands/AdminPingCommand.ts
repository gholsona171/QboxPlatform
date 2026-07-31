import {
  SlashCommandBuilder
} from "discord.js";

import type {
  ChatInputCommandInteraction
} from "discord.js";

import type {
  Permission
} from "@qbox/permissions";

import type {
  DiscordCommand
} from "./DiscordCommand.js";

export class AdminPingCommand implements DiscordCommand {
  public readonly data = new SlashCommandBuilder()
    .setName("adminping")
    .setDescription(
      "Tests whether you have platform administrator permission."
    );

  public readonly requiredPermissions:
    readonly Permission[] = [
      "platform.admin"
    ];

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.reply({
      content: "Administrator permission confirmed.",
      ephemeral: true
    });
  }
}
