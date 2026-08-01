import { SlashCommandBuilder } from "discord.js";

import type {
  CommandExecutionPolicy,
  DiscordCommand
} from "../src/commands/DiscordCommand.js";

export const defaultPolicy: CommandExecutionPolicy = {
  contexts: "both",
  response: {
    acknowledgement: "immediate",
    visibility: "ephemeral"
  },
  concurrency: "unlimited"
};

export function createCommand(
  name: string,
  overrides: Partial<DiscordCommand> = {}
): DiscordCommand {
  return {
    type: "chat-input",
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(`Runs the ${name} command.`),
    policy: defaultPolicy,
    async execute(): Promise<void> {},
    ...overrides
  };
}
