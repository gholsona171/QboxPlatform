import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from "discord.js";

import type {
  Permission
} from "@qbox/permissions";

export interface DiscordCommand {
  readonly type: "chat-input";

  readonly data: SlashCommandBuilder;

  readonly aliases?: readonly string[];

  readonly requiredPermissions?: readonly Permission[];

  execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void>;
}
