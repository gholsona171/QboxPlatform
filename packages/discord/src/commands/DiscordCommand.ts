import type {
  ChatInputCommandInteraction,
  InteractionEditReplyOptions,
} from "discord.js";
import type { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

import type { Permission } from "@qbox/permissions";

import type {
  CommandOptionReader,
  CommandRoute
} from "./CommandInput.js";

export type CommandContextPolicy = "guild" | "dm" | "both";
export type PermissionEvaluationMode = "all" | "any";
export type ResponseAcknowledgement = "immediate" | "deferred";
export type ResponseVisibility = "ephemeral" | "public";
export type CooldownScope = "user" | "guild";
export type ConcurrencyScope =
  | "single"
  | "user"
  | "guild"
  | "unlimited";

export interface CommandPermissionPolicy {
  readonly required: readonly Permission[];
  readonly mode: PermissionEvaluationMode;
  readonly administratorOverride: boolean;
}

export interface CommandResponsePolicy {
  readonly acknowledgement: ResponseAcknowledgement;
  readonly visibility: ResponseVisibility;
}

export interface CommandCooldownPolicy {
  readonly scope: CooldownScope;
  readonly durationMs: number;
}

export interface CommandExecutionPolicy {
  readonly contexts: CommandContextPolicy;
  readonly permissions?: CommandPermissionPolicy;
  readonly response: CommandResponsePolicy;
  readonly cooldown?: CommandCooldownPolicy;
  readonly concurrency: ConcurrencyScope;
}

export type CommandReplyOptions = InteractionEditReplyOptions;

export interface CommandExecutionContext {
  readonly interaction: ChatInputCommandInteraction;
  readonly signal: AbortSignal;
  readonly options: CommandOptionReader;
  readonly route: CommandRoute;
  reply(options: CommandReplyOptions): Promise<void>;
  editReply(options: InteractionEditReplyOptions): Promise<void>;
}

export interface DiscordCommand {
  readonly type: "chat-input";
  readonly data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  readonly aliases?: readonly string[];
  readonly policy: CommandExecutionPolicy;
  bypassAuthorization?(context: CommandExecutionContext): boolean;
  execute(context: CommandExecutionContext): Promise<void>;
}
