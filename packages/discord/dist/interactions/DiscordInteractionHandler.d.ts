import type { Interaction } from "discord.js";
import type { DiscordCommunityService } from "@qbox/discord-community";
import type { CommandRegistry } from "../commands/CommandRegistry.js";
import type { DiscordRoleMenuInteractionHandler } from "../roleMenus/DiscordRoleMenuInteractionHandler.js";
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
    readonly roleMenuInteractions?: DiscordRoleMenuInteractionHandler;
    readonly community?: DiscordCommunityService;
    /** Feature handlers for components and modals, matched by custom ID prefix. */
    readonly featureInteractions?: readonly FeatureInteractionHandler[];
}
export declare class CommandExecutionTimeoutError extends Error {
    constructor(timeoutMs: number);
}
export declare class InteractionAcknowledgementTimeoutError extends Error {
    constructor(timeoutMs: number);
}
export declare class DiscordInteractionHandler {
    private readonly commands;
    private readonly executionTimeoutMs;
    private readonly acknowledgementTimeoutMs;
    private readonly log;
    private readonly roleMenuInteractions;
    private readonly community;
    private readonly featureInteractions;
    private readonly activeExecutions;
    private readonly activeControllers;
    private acceptingExecutions;
    constructor(commands: CommandRegistry, options: DiscordInteractionHandlerOptions);
    handle(interaction: Interaction): Promise<void>;
    shutdown(timeoutMs: number): Promise<void>;
    private handleChatInputCommand;
    private createExecutionContext;
    private sendErrorResponse;
}
export interface FeatureInteractionHandler {
    readonly prefixes: readonly string[];
    handle(interaction: Interaction): Promise<void>;
}
export {};
//# sourceMappingURL=DiscordInteractionHandler.d.ts.map