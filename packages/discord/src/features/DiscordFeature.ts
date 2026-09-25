import type { Client, Interaction } from "discord.js";
import type { PermissionAuthorizer } from "@qbox/permissions";

import type { DiscordCommand } from "../commands/DiscordCommand.js";

/** Shared runtime handed to every Discord feature when the bot is composed. */
export interface DiscordFeatureContext {
  readonly client: Client;
  readonly authorizer: PermissionAuthorizer;
}

/**
 * A pluggable bot feature. Each feature owns its commands, component and
 * modal handlers, and gateway event listeners.
 *
 * Every command a feature returns must also exist as a `*.command.ts` file in
 * `src/commands/` (exporting a service-less `command`) so command deployment can
 * see it; at runtime the feature's instance replaces the file-loaded one.
 */
export interface DiscordFeature {
  readonly name: string;
  /** Live command instances, matched to file-loaded commands by name. */
  commands(): readonly DiscordCommand[];
  /** Custom ID prefixes this feature owns, for example `qbox:ticket:`. */
  readonly interactionPrefixes?: readonly string[];
  handleInteraction?(interaction: Interaction): Promise<void>;
  /** Registers gateway listeners and timers. Called once before login. */
  attach?(client: Client): void;
  /** Removes listeners and timers. */
  detach?(): void;
}

export type DiscordFeatureFactory = (context: DiscordFeatureContext) => DiscordFeature;

/** Returns the custom ID of a component or modal interaction, if any. */
export function interactionCustomId(interaction: Interaction): string | undefined {
  if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) return interaction.customId;
  return undefined;
}
