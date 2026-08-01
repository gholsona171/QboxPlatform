import type { PermissionAssignment } from "../models/Permission.js";

/** Diagnostics for non-persistent legacy administrator compatibility. */
export interface LegacyAdministratorCompatibility {
  readonly enabled: boolean;
  readonly guildId?: string;
  readonly roleCount: number;
  readonly assignments: readonly PermissionAssignment[];
}

/**
 * Creates guild-bound, non-persistent administrator assignments from legacy roles.
 * The function owns no state or resources and is safe for concurrent composition.
 * Explicit persisted denies retain precedence when these assignments are evaluated.
 */
export function createLegacyAdministratorCompatibility(
  guildId: string,
  roleIds: readonly string[],
): LegacyAdministratorCompatibility {
  const uniqueRoleIds = [
    ...new Set(roleIds.map((roleId) => roleId.trim()).filter(Boolean)),
  ];
  if (uniqueRoleIds.length > 0 && guildId.trim().length === 0) {
    throw new Error(
      "DISCORD_GUILD_ID is required when ADMIN_ROLE_IDS compatibility is configured.",
    );
  }
  return {
    enabled: uniqueRoleIds.length > 0,
    ...(uniqueRoleIds.length > 0 ? { guildId } : {}),
    roleCount: uniqueRoleIds.length,
    assignments: uniqueRoleIds.map((roleId) => ({
      id: `legacy-bootstrap:${guildId}:${roleId}`,
      principal: { type: "discord-role", externalId: roleId, guildId },
      selector: { type: "permission", permission: "platform.admin" },
      scope: { type: "discord-guild", guildId },
      effect: "allow",
      enabled: true,
    })),
  };
}
