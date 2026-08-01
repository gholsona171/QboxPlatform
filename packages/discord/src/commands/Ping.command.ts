import {
  SlashCommandBuilder
} from "discord.js";

import type {
  CommandExecutionContext,
  DiscordCommand
} from "./DiscordCommand.js";

export class PingCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;

  public readonly data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Checks whether the bot is responding.");

  public readonly policy = {
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
  } as const;

  public async execute(
    context: CommandExecutionContext
  ): Promise<void> {
    await context.reply({
      content: "Pong."
    });
  }
}

export const command = new PingCommand();
