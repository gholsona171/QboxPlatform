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

  public registerCommand(command: DiscordCommand): void {
    this.commands.register(command);
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

    this.client.once(
      Events.ClientReady,
      async (readyClient) => {
        const commandData = this.commands
          .list()
          .map((command) => command.data.toJSON());

        await readyClient.application.commands.set(
          commandData
        );

        logger.info(
          {
            user: readyClient.user.tag,
            commandCount: commandData.length
          },
          "Discord commands registered."
        );
      }
    );

    await this.client.login(env.DISCORD_TOKEN);
  }

  public async stop(): Promise<void> {
    this.client.destroy();
  }
}
