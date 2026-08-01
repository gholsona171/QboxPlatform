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
import {
  DiscordInteractionHandler
} from "./interactions/DiscordInteractionHandler.js";

export interface CommandDeploymentResult {
  readonly commandCount: number;
  readonly commandNames: readonly string[];
}

function readExecutionTimeout(): number {
  const timeout = Number(env.DISCORD_COMMAND_TIMEOUT_MS);

  if (!Number.isInteger(timeout) || timeout <= 0) {
    throw new Error(
      "DISCORD_COMMAND_TIMEOUT_MS must be a positive integer."
    );
  }

  return timeout;
}

function readShutdownTimeout(): number {
  const timeout = Number(env.DISCORD_COMMAND_SHUTDOWN_TIMEOUT_MS);

  if (!Number.isInteger(timeout) || timeout <= 0) {
    throw new Error(
      "DISCORD_COMMAND_SHUTDOWN_TIMEOUT_MS must be a positive integer."
    );
  }

  return timeout;
}

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
  private readonly interactions: DiscordInteractionHandler;

  public constructor(
    permissionService: PermissionService
  ) {
    this.commands = new CommandRegistry(
      permissionService
    );
    this.interactions = new DiscordInteractionHandler(
      this.commands,
      {
        executionTimeoutMs: readExecutionTimeout()
      }
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

    if (!env.DISCORD_APPLICATION_ID) {
      throw new Error("DISCORD_APPLICATION_ID is missing.");
    }

    this.client.on(Events.InteractionCreate, (interaction) => {
      void this.interactions.handle(interaction).catch((error: unknown) => {
        logger.error(
          {
            err: error,
            stack: error instanceof Error ? error.stack : undefined,
            interactionId: interaction.id,
            interactionType: interaction.type
          },
          "Unhandled Discord interaction listener failure."
        );
      });
    });

    logger.info(
      {
        listener: Events.InteractionCreate
      },
      "Discord interaction listener attached."
    );

    await this.client.login(env.DISCORD_TOKEN);

    const applicationId = this.client.application?.id;
    const user = this.client.user;

    if (!applicationId || !user) {
      throw new Error(
        "Discord client became ready without application identity."
      );
    }

    if (applicationId !== env.DISCORD_APPLICATION_ID) {
      this.client.destroy();
      throw new Error(
        `Discord application mismatch: expected '${env.DISCORD_APPLICATION_ID}', connected '${applicationId}'.`
      );
    }

    logger.info(
      {
        applicationId,
        botUsername: user.tag,
        botUserId: user.id,
        connectedGuildCount: this.client.guilds.cache.size
      },
      "Discord client connected."
    );
  }

  public applicationId(): string {
    const applicationId = this.client.application?.id;

    if (!applicationId) {
      throw new Error("Discord application identity is unavailable.");
    }

    return applicationId;
  }

  public async deployCommands(
    guildId?: string
  ): Promise<CommandDeploymentResult> {
    if (!this.client.application) {
      throw new Error(
        "Discord application identity is unavailable for command deployment."
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

    return {
      commandCount: commandData.length,
      commandNames: commandData.map((command) => command.name)
    };
  }

  public async stop(): Promise<void> {
    await this.interactions.shutdown(readShutdownTimeout());
    this.client.destroy();
  }
}
