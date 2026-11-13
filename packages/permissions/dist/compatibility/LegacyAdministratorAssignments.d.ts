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
 *
 * Legacy roles only make sense in one server. Without a guild ID (the bot
 * runs in many servers), the roles are ignored and no assignments are made.
 */
export declare function createLegacyAdministratorCompatibility(guildId: string, roleIds: readonly string[], modeEnabled?: boolean): LegacyAdministratorCompatibility;
//# sourceMappingURL=LegacyAdministratorAssignments.d.ts.map