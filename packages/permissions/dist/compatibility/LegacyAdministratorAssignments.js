/**
 * Creates guild-bound, non-persistent administrator assignments from legacy roles.
 * The function owns no state or resources and is safe for concurrent composition.
 * Explicit persisted denies retain precedence when these assignments are evaluated.
 *
 * Legacy roles only make sense in one server. Without a guild ID (the bot
 * runs in many servers), the roles are ignored and no assignments are made.
 */
export function createLegacyAdministratorCompatibility(guildId, roleIds, modeEnabled = true) {
    const boundGuildId = guildId.trim();
    const uniqueRoleIds = boundGuildId
        ? [...new Set(roleIds.map((roleId) => roleId.trim()).filter(Boolean))]
        : [];
    return {
        enabled: modeEnabled,
        ...(uniqueRoleIds.length > 0 ? { guildId } : {}),
        roleCount: uniqueRoleIds.length,
        assignments: (modeEnabled ? uniqueRoleIds : []).map((roleId) => ({
            id: `legacy-bootstrap:${guildId}:${roleId}`,
            principal: { type: "discord-role", externalId: roleId, guildId },
            selector: { type: "permission", permission: "platform.admin" },
            scope: { type: "discord-guild", guildId },
            effect: "allow",
            enabled: true,
        })),
    };
}
//# sourceMappingURL=LegacyAdministratorAssignments.js.map