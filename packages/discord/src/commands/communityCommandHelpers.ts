import type { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import type { DiscordCommunityService } from "@qbox/discord-community";
import type { Permission } from "@qbox/permissions";

import type { CommandExecutionContext, DiscordCommand } from "./DiscordCommand.js";

export abstract class CommunityCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public abstract readonly data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  public readonly policy;

  protected constructor(
    permission: Permission,
    protected readonly community?: DiscordCommunityService,
  ) {
    this.policy = {
      contexts: "guild" as const,
      permissions: {
        required: [permission],
        mode: "all" as const,
        administratorOverride: true,
      },
      response: {
        acknowledgement: "deferred" as const,
        visibility: "ephemeral" as const,
      },
      concurrency: "guild" as const,
    };
  }

  public abstract execute(context: CommandExecutionContext): Promise<void>;

  protected service(): DiscordCommunityService {
    if (!this.community) throw new Error("Discord community service is not available.");
    return this.community;
  }

  protected guildId(context: CommandExecutionContext): string {
    const guildId = context.interaction.guildId;
    if (!guildId) throw new Error("This command requires a Discord server.");
    return guildId;
  }
}

export function enabledText(enabled: boolean): string {
  return enabled ? "enabled" : "disabled";
}

export function parseColor(value: string | undefined): string | undefined {
  return value?.startsWith("#") ? value : value ? `#${value}` : undefined;
}
