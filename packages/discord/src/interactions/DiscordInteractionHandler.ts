import type {
  ChatInputCommandInteraction,
  Interaction,
  InteractionEditReplyOptions,
  InteractionReplyOptions
} from "discord.js";

import { logger } from "@qbox/logger";

import type { CommandRegistry } from "../commands/CommandRegistry.js";
import type {
  CommandExecutionContext,
  CommandReplyOptions,
  DiscordCommand
} from "../commands/DiscordCommand.js";
import {
  CommandInputError,
  CommandOptionReader,
  CommandRoute
} from "../commands/CommandInput.js";

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
  private readonly activeExecutions = new Set<Promise<void>>();
  private readonly activeControllers = new Set<AbortController>();
  private acceptingExecutions = true;

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
      options.acknowledgementTimeoutMs ?? defaultAcknowledgementTimeoutMs
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

    if (!this.acceptingExecutions) {
      this.log.warn(
        {
          interactionId: interaction.id,
          commandName: interaction.commandName
        },
        "Discord command rejected during shutdown."
      );
      await this.sendErrorResponse(
        interaction,
        "The bot is shutting down. Please try again shortly.",
        { interactionId: interaction.id, commandName: interaction.commandName }
      );
      return;
    }

    const execution = this.handleChatInputCommand(interaction);
    this.activeExecutions.add(execution);

    try {
      await execution;
    } finally {
      this.activeExecutions.delete(execution);
    }
  }

  public async shutdown(timeoutMs: number): Promise<void> {
    this.acceptingExecutions = false;
    const timeout = validateTimeout("shutdownTimeoutMs", timeoutMs);

    if (this.activeExecutions.size === 0) {
      return;
    }

    this.log.info(
      { activeExecutionCount: this.activeExecutions.size, shutdownTimeoutMs: timeout },
      "Waiting for active Discord commands to finish."
    );

    let timer: ReturnType<typeof setTimeout> | undefined;
    const completed = Promise.allSettled([...this.activeExecutions]);
    const expired = new Promise<"expired">((resolve) => {
      timer = setTimeout(() => resolve("expired"), timeout);
    });
    const result = await Promise.race([
      completed.then(() => "completed" as const),
      expired
    ]);

    if (timer) {
      clearTimeout(timer);
    }

    if (result === "expired") {
      for (const controller of this.activeControllers) {
        controller.abort();
      }

      this.log.warn(
        { activeExecutionCount: this.activeExecutions.size, shutdownTimeoutMs: timeout },
        "Discord command shutdown deadline exceeded; active commands were aborted."
      );
    }
  }

  private async handleChatInputCommand(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const startedAt = performance.now();
    const command = this.commands.get(interaction.commandName);
    const logContext = {
      commandName: interaction.commandName,
      interactionId: interaction.id,
      guildId: interaction.guildId,
      userId: interaction.user.id
    };

    this.log.info(
      { ...logContext, commandFound: Boolean(command) },
      "Discord command interaction received."
    );

    if (!command) {
      this.log.warn(
        { ...logContext, commandFound: false },
        "Discord command is unknown or stale."
      );
      await this.sendErrorResponse(
        interaction,
        "That command is no longer available.",
        logContext
      );
      return;
    }

    const controller = new AbortController();
    this.activeControllers.add(controller);
    let executionTimer: ReturnType<typeof setTimeout> | undefined;
    let acknowledgementTimer: ReturnType<typeof setTimeout> | undefined;

    try {
      if (
        command.policy.response.acknowledgement === "deferred" &&
        !interaction.replied &&
        !interaction.deferred
      ) {
        await interaction.deferReply({
          ephemeral: command.policy.response.visibility === "ephemeral"
        });
      }

      const context = this.createExecutionContext(
        command,
        interaction,
        controller.signal
      );

      this.log.info(
        {
          ...logContext,
          deferred: interaction.deferred,
          replied: interaction.replied
        },
        "Discord command execution started."
      );

      const execution = this.commands.execute(context);
      const executionTimeout = new Promise<never>((_resolve, reject) => {
        executionTimer = setTimeout(() => {
          reject(new CommandExecutionTimeoutError(this.executionTimeoutMs));
        }, this.executionTimeoutMs);
      });
      const acknowledgementTimeout = new Promise<never>((_resolve, reject) => {
        acknowledgementTimer = setTimeout(() => {
          if (!interaction.replied && !interaction.deferred) {
            reject(
              new InteractionAcknowledgementTimeoutError(
                this.acknowledgementTimeoutMs
              )
            );
          }
        }, this.acknowledgementTimeoutMs);
      });

      await Promise.race([execution, executionTimeout, acknowledgementTimeout]);

      if (!interaction.replied && !interaction.deferred) {
        throw new Error(
          "Command completed without replying to or deferring the interaction."
        );
      }

      this.log.info(
        {
          ...logContext,
          executionDurationMs: performance.now() - startedAt,
          deferred: interaction.deferred,
          replied: interaction.replied
        },
        "Discord command execution completed."
      );
    } catch (error) {
      controller.abort();

      if (error instanceof CommandInputError) {
        this.log.warn(
          {
            ...logContext,
            inputError: error.message,
            executionDurationMs: performance.now() - startedAt,
            deferred: interaction.deferred,
            replied: interaction.replied
          },
          "Discord command input was rejected."
        );
      } else {
        this.log.error(
          {
            ...logContext,
            err: error,
            stack: error instanceof Error ? error.stack : undefined,
            executionDurationMs: performance.now() - startedAt,
            deferred: interaction.deferred,
            replied: interaction.replied
          },
          "Discord command execution failed."
        );
      }

      await this.sendErrorResponse(
        interaction,
        error instanceof CommandInputError
          ? error.userMessage
          : "Something went wrong while running that command.",
        logContext
      );
    } finally {
      this.activeControllers.delete(controller);

      if (executionTimer) clearTimeout(executionTimer);
      if (acknowledgementTimer) clearTimeout(acknowledgementTimer);
    }
  }

  private createExecutionContext(
    command: DiscordCommand,
    interaction: ChatInputCommandInteraction,
    signal: AbortSignal
  ): CommandExecutionContext {
    const ephemeral = command.policy.response.visibility === "ephemeral";

    return {
      interaction,
      signal,
      options: new CommandOptionReader(interaction.options),
      route: new CommandRoute(interaction.options),
      reply: async (options: CommandReplyOptions): Promise<void> => {
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply(options);
        } else if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            ...options,
            ephemeral
          } as InteractionReplyOptions);
        } else {
          await interaction.reply({
            ...options,
            ephemeral
          } as InteractionReplyOptions);
        }
      },
      editReply: async (options: InteractionEditReplyOptions): Promise<void> => {
        await interaction.editReply(options);
      }
    };
  }

  private async sendErrorResponse(
    interaction: ChatInputCommandInteraction,
    content: string,
    context: object
  ): Promise<void> {
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content, ephemeral: true });
      } else {
        await interaction.reply({ content, ephemeral: true });
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
