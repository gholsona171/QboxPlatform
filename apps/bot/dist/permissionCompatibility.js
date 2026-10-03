import { createLegacyAdministratorCompatibility, } from "@qbox/permissions";
/**
 * Composes legacy `ADMIN_ROLE_IDS` compatibility for the bot process.
 * Without `DISCORD_GUILD_ID` the roles are ignored (compatibility is off),
 * so the bot starts and serves every server it is invited to.
 */
export function composePermissionCompatibility(settings) {
    const compatibility = createLegacyAdministratorCompatibility(settings.guildId, settings.roleIds, settings.enabled);
    return {
        compatibility,
        persistence: {
            enabled: compatibility.enabled,
            ...(compatibility.guildId ? { guildId: compatibility.guildId } : {}),
            roleIds: compatibility.guildId ? settings.roleIds : [],
        },
    };
}
//# sourceMappingURL=permissionCompatibility.js.map