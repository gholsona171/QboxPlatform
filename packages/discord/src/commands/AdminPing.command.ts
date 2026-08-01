import {
  SlashCommandBuilder
} from "discord.js";

import type {
  CommandExecutionContext,
  DiscordCommand
} from "./DiscordCommand.js";

export class AdminPingCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;

  public readonly data = new SlashCommandBuilder()
    .setName("adminping")
    .setDescription(
      "Tests whether you have platform administrator permission."
    );

  public readonly policy = {
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
  } as const;

  public async execute(
    context: CommandExecutionContext
  ): Promise<void> {
    await context.reply({
      content: "Administrator permission confirmed."
    });
  }
}

export const command = new AdminPingCommand();
