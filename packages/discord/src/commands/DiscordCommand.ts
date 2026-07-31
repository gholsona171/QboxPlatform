import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from "discord.js";

import type {
  Permission
} from "@qbox/permissions";

export interface CommandExecutionContext {
  readonly signal: AbortSignal;
}

export interface DiscordCommand {
  readonly type: "chat-input";

  readonly data: SlashCommandBuilder;

  readonly aliases?: readonly string[];

  readonly requiredPermissions?: readonly Permission[];

  readonly deferReply?: boolean;

  execute(
    interaction: ChatInputCommandInteraction,
    context: CommandExecutionContext
  ): Promise<void>;
}
