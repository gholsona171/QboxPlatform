import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from "discord.js";

import type {
  Permission
} from "@qbox/permissions";

export interface DiscordCommand {
  readonly data: SlashCommandBuilder;

  readonly requiredPermissions?: readonly Permission[];

  execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void>;
}
