import { PersistentPermissionService, type GuildRepository, type PermissionAssignmentAdministrationRepository, type PermissionPrincipalRepository } from "@qbox/permissions";
/** Immutable preview for one owner bootstrap operation. */
export interface OwnerBootstrapPlan {
    readonly guildId: string;
    readonly userId: string;
    readonly guildWillBeCreated: boolean;
    readonly principalWillBeCreated: boolean;
    readonly grantWillBeCreated: boolean;
    readonly existingAssignmentId?: string;
}
/** Per-role preview used by the legacy administrator migration workflow. */
export interface LegacyAdministratorRolePlan {
    readonly roleId: string;
    readonly principalWillBeCreated: boolean;
    readonly grantWillBeCreated: boolean;
    readonly existingAssignmentId?: string;
}
/** Immutable preview for environment administrator migration. */
export interface LegacyAdministratorMigrationPlan {
    readonly guildId: string;
    readonly guildWillBeCreated: boolean;
    readonly roles: readonly LegacyAdministratorRolePlan[];
}
/** Result of applying an idempotent operational permission workflow. */
export interface PermissionBootstrapApplyResult<TPlan> {
    readonly plan: TPlan;
    readonly createdAssignments: number;
}
/**
 * Operator-only persistent permission bootstrap and compatibility migration.
 *
 * The service accepts only verified IDs supplied by the local CLI. It owns no
 * database lifecycle and uses injected repository ports. Dry-run methods never
 * mutate state; apply methods are additive and idempotent.
 */
export declare class PermissionBootstrapService {
    private readonly guilds;
    private readonly principals;
    private readonly assignments;
    private readonly permissionService;
    constructor(guilds: GuildRepository, principals: PermissionPrincipalRepository, assignments: PermissionAssignmentAdministrationRepository, permissionService: PersistentPermissionService);
    planOwner(guildId: string, userId: string): Promise<OwnerBootstrapPlan>;
    applyOwner(guildId: string, userId: string): Promise<PermissionBootstrapApplyResult<OwnerBootstrapPlan>>;
    planLegacyAdministrators(guildId: string, roleIds: readonly string[]): Promise<LegacyAdministratorMigrationPlan>;
    applyLegacyAdministrators(guildId: string, roleIds: readonly string[]): Promise<PermissionBootstrapApplyResult<LegacyAdministratorMigrationPlan>>;
}
/** Rejects malformed or non-Discord identifiers before persistence access. */
export declare function validateDiscordSnowflake(valueName: string, value: string): void;
//# sourceMappingURL=PermissionBootstrapService.d.ts.map