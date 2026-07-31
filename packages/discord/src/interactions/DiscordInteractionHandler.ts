import type {
  ChatInputCommandInteraction,
  Interaction
} from "discord.js";

import { logger } from "@qbox/logger";

import type { CommandRegistry } from "../commands/CommandRegistry.js";

interface InteractionLogger {
  debug(context: object, message: string): void;
  info(context: object, message: string): void;
  warn(context: object, message: string): void;
  error(context: object, message: string): void;
}

export interface DiscordInteractionHandlerOptions {
  readonly executionTimeoutMs: number;
  readonly acknowledgementTimeoutMs?: number;
  readonly log?: InteractionLogger;
}

export class CommandExecutionTimeoutError extends Error {
  public constructor(timeoutMs: number) {
    super(`Command execution exceeded ${timeoutMs}ms.`);
    this.name = "CommandExecutionTimeoutError";
  }
}

export class InteractionAcknowledgementTimeoutError extends Error {
  public constructor(timeoutMs: number) {
    super(`Interaction was not acknowledged within ${timeoutMs}ms.`);
    this.name = "InteractionAcknowledgementTimeoutError";
  }
}

const defaultAcknowledgementTimeoutMs = 2_500;

function validateTimeout(name: string, value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

export class DiscordInteractionHandler {
  private readonly executionTimeoutMs: number;
  private readonly acknowledgementTimeoutMs: number;
  private readonly log: InteractionLogger;

  public constructor(
    private readonly commands: CommandRegistry,
    options: DiscordInteractionHandlerOptions
  ) {
    this.executionTimeoutMs = validateTimeout(
      "executionTimeoutMs",
      options.executionTimeoutMs
    );
    this.acknowledgementTimeoutMs = validateTimeout(
      "acknowledgementTimeoutMs",
      options.acknowledgementTimeoutMs ??
        defaultAcknowledgementTimeoutMs
    );
    this.log = options.log ?? logger;
  }

  public async handle(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) {
      this.log.debug(
        {
          interactionId: interaction.id,
          interactionType: interaction.type
        },
        "Ignoring unsupported Discord interaction type."
      );

      return;
    }

    await this.handleChatInputCommand(interaction);
  }

  private async handleChatInputCommand(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const startedAt = performance.now();
    const command = this.commands.get(interaction.commandName);
    const context = {
      commandName: interaction.commandName,
      interactionId: interaction.id,
      guildId: interaction.guildId,
      userId: interaction.user.id
    };

    this.log.info(
      {
        ...context,
        commandFound: Boolean(command)
      },
      "Discord command interaction received."
    );

    if (!command) {
      this.log.warn(
        {
          ...context,
          commandFound: false
        },
        "Discord command is unknown or stale."
      );

      await this.sendErrorResponse(
        interaction,
        "That command is no longer available.",
        context
      );
      return;
    }

    const controller = new AbortController();
    let executionTimer: ReturnType<typeof setTimeout> | undefined;
    let acknowledgementTimer: ReturnType<typeof setTimeout> | undefined;

    try {
      if (command.deferReply && !interaction.replied && !interaction.deferred) {
        await interaction.deferReply({ ephemeral: true });
      }

      this.log.info(
        {
          ...context,
          deferred: interaction.deferred,
          replied: interaction.replied
        },
        "Discord command execution started."
      );

      const execution = this.commands.execute(interaction, {
        signal: controller.signal
      });
      const executionTimeout = new Promise<never>((_resolve, reject) => {
        executionTimer = setTimeout(() => {
          reject(
            new CommandExecutionTimeoutError(
              this.executionTimeoutMs
            )
          );
        }, this.executionTimeoutMs);
      });
      const acknowledgementTimeout = new Promise<never>(
        (_resolve, reject) => {
          acknowledgementTimer = setTimeout(() => {
            if (!interaction.replied && !interaction.deferred) {
              reject(
                new InteractionAcknowledgementTimeoutError(
                  this.acknowledgementTimeoutMs
                )
              );
            }
          }, this.acknowledgementTimeoutMs);
        }
      );

      await Promise.race([
        execution,
        executionTimeout,
        acknowledgementTimeout
      ]);

      if (!interaction.replied && !interaction.deferred) {
        throw new Error(
          "Command completed without replying to or deferring the interaction."
        );
      }

      this.log.info(
        {
          ...context,
          executionDurationMs: performance.now() - startedAt,
          deferred: interaction.deferred,
          replied: interaction.replied
        },
        "Discord command execution completed."
      );
    } catch (error) {
      controller.abort();

      this.log.error(
        {
          ...context,
          err: error,
          stack: error instanceof Error ? error.stack : undefined,
          executionDurationMs: performance.now() - startedAt,
          deferred: interaction.deferred,
          replied: interaction.replied
        },
        "Discord command execution failed."
      );

      await this.sendErrorResponse(
        interaction,
        "Something went wrong while running that command.",
        context
      );
    } finally {
      if (executionTimer) {
        clearTimeout(executionTimer);
      }

      if (acknowledgementTimer) {
        clearTimeout(acknowledgementTimer);
      }
    }
  }

  private async sendErrorResponse(
    interaction: ChatInputCommandInteraction,
    content: string,
    context: object
  ): Promise<void> {
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content,
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content,
          ephemeral: true
        });
      }
    } catch (error) {
      this.log.error(
        {
          ...context,
          err: error,
          stack: error instanceof Error ? error.stack : undefined,
          deferred: interaction.deferred,
          replied: interaction.replied
        },
        "Discord interaction error response failed."
      );
    }
  }
}
