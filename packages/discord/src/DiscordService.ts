import {
  Client,
  Events,
  GatewayIntentBits
} from "discord.js";

import { env } from "@qbox/shared";
import { logger } from "@qbox/logger";
import type {
  PermissionService
} from "@qbox/permissions";

import { CommandRegistry } from "./commands/CommandRegistry.js";
import type { DiscordCommand } from "./commands/DiscordCommand.js";

export class DiscordService {
  public readonly client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  public readonly commands: CommandRegistry;

  public constructor(
    permissionService: PermissionService
  ) {
    this.commands = new CommandRegistry(
      permissionService
    );
  }

  public registerCommands(
    commands: readonly DiscordCommand[]
  ): number {
    return this.commands.registerAll(commands);
  }

  public async start(): Promise<void> {
    if (!env.DISCORD_TOKEN) {
      throw new Error("DISCORD_TOKEN is missing.");
    }

    this.client.on(
      Events.InteractionCreate,
      async (interaction) => {
        if (!interaction.isChatInputCommand()) {
          return;
        }

        try {
          await this.commands.execute(interaction);
        } catch (error) {
          logger.error(
            {
              err: error,
              commandName: interaction.commandName
            },
            "Command execution failed."
          );

          const response = {
            content:
              "Something went wrong while running that command.",
            ephemeral: true
          } as const;

          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(response);
          } else {
            await interaction.reply(response);
          }
        }
      }
    );

    await this.client.login(env.DISCORD_TOKEN);
  }

  public async deployCommands(
    guildId?: string
  ): Promise<number> {
    if (!this.client.isReady() || !this.client.application) {
      throw new Error(
        "Discord client must be ready before deploying commands."
      );
    }

    const commandData = this.commands.deploymentData();

    if (guildId) {
      await this.client.application.commands.set(
        commandData,
        guildId
      );
    } else {
      await this.client.application.commands.set(commandData);
    }

    return commandData.length;
  }

  public async stop(): Promise<void> {
    this.client.destroy();
  }
}
