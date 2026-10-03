import { logger } from "@qbox/logger";
import { CommandInputError, CommandOptionReader, CommandRoute } from "../commands/CommandInput.js";
export class CommandExecutionTimeoutError extends Error {
    constructor(timeoutMs) {
        super(`Command execution exceeded ${timeoutMs}ms.`);
        this.name = "CommandExecutionTimeoutError";
    }
}
export class InteractionAcknowledgementTimeoutError extends Error {
    constructor(timeoutMs) {
        super(`Interaction was not acknowledged within ${timeoutMs}ms.`);
        this.name = "InteractionAcknowledgementTimeoutError";
    }
}
const defaultAcknowledgementTimeoutMs = 2_500;
function validateTimeout(name, value) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`${name} must be a positive integer.`);
    }
    return value;
}
export class DiscordInteractionHandler {
    commands;
    executionTimeoutMs;
    acknowledgementTimeoutMs;
    log;
    roleMenuInteractions;
    community;
    featureInteractions;
    activeExecutions = new Set();
    activeControllers = new Set();
    acceptingExecutions = true;
    constructor(commands, options) {
        this.commands = commands;
        this.executionTimeoutMs = validateTimeout("executionTimeoutMs", options.executionTimeoutMs);
        this.acknowledgementTimeoutMs = validateTimeout("acknowledgementTimeoutMs", options.acknowledgementTimeoutMs ?? defaultAcknowledgementTimeoutMs);
        this.log = options.log ?? logger;
        this.roleMenuInteractions = options.roleMenuInteractions;
        this.community = options.community;
        this.featureInteractions = options.featureInteractions ?? [];
    }
    async handle(interaction) {
        const customId = componentCustomId(interaction);
        const feature = customId === undefined ? undefined : this.featureInteractions.find((handler) => handler.prefixes.some((prefix) => customId.startsWith(prefix)));
        if (feature) {
            await feature.handle(interaction);
            return;
        }
        if (typeof interaction.isButton === "function" && interaction.isButton() && interaction.customId.startsWith("qbox:rules:")) {
            if (!this.community || !interaction.guildId || !interaction.member || !("user" in interaction.member))
                return;
            await interaction.deferReply({ ephemeral: true });
            const result = await this.community.acceptRules(interaction.guildId, interaction.user.id);
            await interaction.editReply({ content: result.every((item) => !item.changed) ? "Rules were already accepted." : "Rules accepted." });
            return;
        }
        const isRoleMenuComponent = (typeof interaction.isButton === "function" && interaction.isButton()) ||
            (typeof interaction.isStringSelectMenu === "function" && interaction.isStringSelectMenu());
        if (isRoleMenuComponent) {
            if (this.roleMenuInteractions) {
                await this.roleMenuInteractions.handleComponent(interaction);
                return;
            }
        }
        if (!interaction.isChatInputCommand()) {
            this.log.debug({
                interactionId: interaction.id,
                interactionType: interaction.type
            }, "Ignoring unsupported Discord interaction type.");
            return;
        }
        if (!this.acceptingExecutions) {
            this.log.warn({
                interactionId: interaction.id,
                commandName: interaction.commandName
            }, "Discord command rejected during shutdown.");
            await this.sendErrorResponse(interaction, "The bot is shutting down. Please try again shortly.", { interactionId: interaction.id, commandName: interaction.commandName });
            return;
        }
        const execution = this.handleChatInputCommand(interaction);
        this.activeExecutions.add(execution);
        try {
            await execution;
        }
        finally {
            this.activeExecutions.delete(execution);
        }
    }
    async shutdown(timeoutMs) {
        this.acceptingExecutions = false;
        const timeout = validateTimeout("shutdownTimeoutMs", timeoutMs);
        if (this.activeExecutions.size === 0) {
            return;
        }
        this.log.info({ activeExecutionCount: this.activeExecutions.size, shutdownTimeoutMs: timeout }, "Waiting for active Discord commands to finish.");
        let timer;
        const completed = Promise.allSettled([...this.activeExecutions]);
        const expired = new Promise((resolve) => {
            timer = setTimeout(() => resolve("expired"), timeout);
        });
        const result = await Promise.race([
            completed.then(() => "completed"),
            expired
        ]);
        if (timer) {
            clearTimeout(timer);
        }
        if (result === "expired") {
            for (const controller of this.activeControllers) {
                controller.abort();
            }
            this.log.warn({ activeExecutionCount: this.activeExecutions.size, shutdownTimeoutMs: timeout }, "Discord command shutdown deadline exceeded; active commands were aborted.");
        }
    }
    async handleChatInputCommand(interaction) {
        const startedAt = performance.now();
        const command = this.commands.get(interaction.commandName);
        const logContext = {
            commandName: interaction.commandName,
            interactionId: interaction.id,
            guildId: interaction.guildId,
            userId: interaction.user.id
        };
        this.log.info({ ...logContext, commandFound: Boolean(command) }, "Discord command interaction received.");
        if (!command) {
            this.log.warn({ ...logContext, commandFound: false }, "Discord command is unknown or stale.");
            await this.sendErrorResponse(interaction, "That command is no longer available.", logContext);
            return;
        }
        const controller = new AbortController();
        this.activeControllers.add(controller);
        let executionTimer;
        let acknowledgementTimer;
        try {
            if (command.policy.response.acknowledgement === "deferred" &&
                !interaction.replied &&
                !interaction.deferred) {
                await interaction.deferReply({
                    ephemeral: command.policy.response.visibility === "ephemeral"
                });
            }
            const context = this.createExecutionContext(command, interaction, controller.signal);
            this.log.info({
                ...logContext,
                deferred: interaction.deferred,
                replied: interaction.replied
            }, "Discord command execution started.");
            const execution = this.commands.execute(context);
            const executionTimeout = new Promise((_resolve, reject) => {
                executionTimer = setTimeout(() => {
                    reject(new CommandExecutionTimeoutError(this.executionTimeoutMs));
                }, this.executionTimeoutMs);
            });
            const acknowledgementTimeout = new Promise((_resolve, reject) => {
                acknowledgementTimer = setTimeout(() => {
                    if (!interaction.replied && !interaction.deferred) {
                        reject(new InteractionAcknowledgementTimeoutError(this.acknowledgementTimeoutMs));
                    }
                }, this.acknowledgementTimeoutMs);
            });
            await Promise.race([execution, executionTimeout, acknowledgementTimeout]);
            if (!interaction.replied && !interaction.deferred) {
                throw new Error("Command completed without replying to or deferring the interaction.");
            }
            this.log.info({
                ...logContext,
                executionDurationMs: performance.now() - startedAt,
                deferred: interaction.deferred,
                replied: interaction.replied
            }, "Discord command execution completed.");
        }
        catch (error) {
            controller.abort();
            if (error instanceof CommandInputError) {
                this.log.warn({
                    ...logContext,
                    inputError: error.message,
                    executionDurationMs: performance.now() - startedAt,
                    deferred: interaction.deferred,
                    replied: interaction.replied
                }, "Discord command input was rejected.");
            }
            else {
                this.log.error({
                    ...logContext,
                    err: error,
                    stack: error instanceof Error ? error.stack : undefined,
                    executionDurationMs: performance.now() - startedAt,
                    deferred: interaction.deferred,
                    replied: interaction.replied
                }, "Discord command execution failed.");
            }
            await this.sendErrorResponse(interaction, error instanceof CommandInputError
                ? error.userMessage
                : "Something went wrong while running that command.", logContext);
        }
        finally {
            this.activeControllers.delete(controller);
            if (executionTimer)
                clearTimeout(executionTimer);
            if (acknowledgementTimer)
                clearTimeout(acknowledgementTimer);
        }
    }
    createExecutionContext(command, interaction, signal) {
        const ephemeral = command.policy.response.visibility === "ephemeral";
        return {
            interaction,
            signal,
            options: new CommandOptionReader(interaction.options),
            route: new CommandRoute(interaction.options),
            reply: async (options) => {
                if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply(options);
                }
                else if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        ...options,
                        ephemeral
                    });
                }
                else {
                    await interaction.reply({
                        ...options,
                        ephemeral
                    });
                }
            },
            editReply: async (options) => {
                await interaction.editReply(options);
            }
        };
    }
    async sendErrorResponse(interaction, content, context) {
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content, ephemeral: true });
            }
            else {
                await interaction.reply({ content, ephemeral: true });
            }
        }
        catch (error) {
            this.log.error({
                ...context,
                err: error,
                stack: error instanceof Error ? error.stack : undefined,
                deferred: interaction.deferred,
                replied: interaction.replied
            }, "Discord interaction error response failed.");
        }
    }
}
function componentCustomId(interaction) {
    const component = (typeof interaction.isButton === "function" && interaction.isButton()) ||
        (typeof interaction.isStringSelectMenu === "function" && interaction.isStringSelectMenu()) ||
        (typeof interaction.isAnySelectMenu === "function" && interaction.isAnySelectMenu()) ||
        (typeof interaction.isModalSubmit === "function" && interaction.isModalSubmit());
    return component && "customId" in interaction && typeof interaction.customId === "string" ? interaction.customId : undefined;
}
//# sourceMappingURL=DiscordInteractionHandler.js.map