import { type LegacyAdministratorCompatibility } from "@qbox/permissions";
export interface PermissionCompatibilitySettings {
    /** Optional. Empty when the bot serves many servers. */
    readonly guildId: string;
    readonly roleIds: readonly string[];
    readonly enabled: boolean;
}
export interface PermissionCompatibilityComposition {
    readonly compatibility: LegacyAdministratorCompatibility;
    /** Startup diagnostics for `PermissionPersistenceModule`. */
    readonly persistence: {
        readonly enabled: boolean;
        readonly guildId?: string;
        readonly roleIds: readonly string[];
    };
}
/**
 * Composes legacy `ADMIN_ROLE_IDS` compatibility for the bot process.
 * Without `DISCORD_GUILD_ID` the roles are ignored (compatibility is off),
 * so the bot starts and serves every server it is invited to.
 */
export declare function composePermissionCompatibility(settings: PermissionCompatibilitySettings): PermissionCompatibilityComposition;
//# sourceMappingURL=permissionCompatibility.d.ts.map