import { PermissionFlagsBits, type ChatInputCommandInteraction, type MessageComponentInteraction } from "discord.js";
import type { Permission, PermissionAuthorizer } from "@qbox/permissions";

import { discordPermissionIdentity } from "../permissions/DiscordPermissionIdentity.js";

/**
 * True when the member holds `permission` through Qbox permissions, or is a
 * Discord administrator. Used by feature commands whose subcommands need
 * different permissions, and by component handlers (buttons, menus).
 */
export async function memberHasPermission(
  authorizer: PermissionAuthorizer,
  interaction: ChatInputCommandInteraction | MessageComponentInteraction,
  permission: Permission,
): Promise<boolean> {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
  const identity = discordPermissionIdentity(interaction);
  if (identity.type !== "guild") return false;
  try {
    const decision = await authorizer.authorize({
      principals: identity.principals,
      scope: identity.scope,
      required: [permission],
      mode: "all",
      administratorOverride: true,
    });
    return decision.allowed;
  } catch {
    return false;
  }
}

/** Display name of the member who ran an interaction. */
export function interactionDisplayName(interaction: ChatInputCommandInteraction): string {
  const member = interaction.member;
  if (member && "displayName" in member && typeof member.displayName === "string") return member.displayName;
  return interaction.user.globalName ?? interaction.user.username;
}
