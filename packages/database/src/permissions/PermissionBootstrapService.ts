import { randomUUID } from "node:crypto";

import {
  PersistentPermissionService,
  type GuildRepository,
  type PermissionAssignment,
  type PermissionAssignmentAdministrationRepository,
  type PermissionPrincipal,
  type PermissionPrincipalRepository,
} from "@qbox/permissions";

const DISCORD_SNOWFLAKE = /^\d{17,20}$/;

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
export class PermissionBootstrapService {
  public constructor(
    private readonly guilds: GuildRepository,
    private readonly principals: PermissionPrincipalRepository,
    private readonly assignments: PermissionAssignmentAdministrationRepository,
    private readonly permissionService: PersistentPermissionService,
  ) {}

  public async planOwner(
    guildId: string,
    userId: string,
  ): Promise<OwnerBootstrapPlan> {
    validateSnowflake("guild ID", guildId);
    validateSnowflake("Discord user ID", userId);
    const guild = await this.guilds.findByDiscordId(guildId);
    const principal = await this.principals.findDiscordUser(guildId, userId);
    const identity: PermissionPrincipal = {
      type: "discord-user",
      externalId: userId,
      guildId,
    };
    const existing = principal
      ? findActiveAssignment(
          await this.assignments.findByPrincipal(identity, true),
          "platform.owner",
          "platform",
        )
      : undefined;
    return {
      guildId,
      userId,
      guildWillBeCreated: !guild,
      principalWillBeCreated: !principal,
      grantWillBeCreated: !existing,
      ...(existing ? { existingAssignmentId: existing.id } : {}),
    };
  }

  public async applyOwner(
    guildId: string,
    userId: string,
  ): Promise<PermissionBootstrapApplyResult<OwnerBootstrapPlan>> {
    const plan = await this.planOwner(guildId, userId);
    if (plan.guildWillBeCreated) await this.guilds.create(guildId);
    const principal: PermissionPrincipal = {
      type: "discord-user",
      externalId: userId,
      guildId,
    };
    await this.principals.getOrCreateDiscordPrincipal(principal);
    if (plan.grantWillBeCreated)
      await this.permissionService.mutate({
        type: "set-assignment",
        actor: { type: "system", service: "permission-owner-bootstrap" },
        target: principal,
        selector: { type: "permission", permission: "platform.owner" },
        scope: { type: "platform" },
        effect: "allow",
        correlationId: randomUUID(),
        reasonCode: "bootstrap",
        reason: "Explicit local operator owner bootstrap.",
      });
    return { plan, createdAssignments: plan.grantWillBeCreated ? 1 : 0 };
  }

  public async planLegacyAdministrators(
    guildId: string,
    roleIds: readonly string[],
  ): Promise<LegacyAdministratorMigrationPlan> {
    validateSnowflake("guild ID", guildId);
    const uniqueRoles = [...new Set(roleIds)];
    uniqueRoles.forEach((roleId) =>
      validateSnowflake("Discord role ID", roleId),
    );
    const guild = await this.guilds.findByDiscordId(guildId);
    const roles: LegacyAdministratorRolePlan[] = [];
    for (const roleId of uniqueRoles) {
      const principal = await this.principals.findDiscordRole(guildId, roleId);
      const identity: PermissionPrincipal = {
        type: "discord-role",
        externalId: roleId,
        guildId,
      };
      const existing = principal
        ? findActiveAssignment(
            await this.assignments.findByPrincipal(identity, true),
            "platform.admin",
            "discord-guild",
          )
        : undefined;
      roles.push({
        roleId,
        principalWillBeCreated: !principal,
        grantWillBeCreated: !existing,
        ...(existing ? { existingAssignmentId: existing.id } : {}),
      });
    }
    return { guildId, guildWillBeCreated: !guild, roles };
  }

  public async applyLegacyAdministrators(
    guildId: string,
    roleIds: readonly string[],
  ): Promise<PermissionBootstrapApplyResult<LegacyAdministratorMigrationPlan>> {
    const plan = await this.planLegacyAdministrators(guildId, roleIds);
    if (plan.guildWillBeCreated) await this.guilds.create(guildId);
    let createdAssignments = 0;
    for (const role of plan.roles) {
      const principal: PermissionPrincipal = {
        type: "discord-role",
        externalId: role.roleId,
        guildId,
      };
      await this.principals.getOrCreateDiscordPrincipal(principal);
      if (!role.grantWillBeCreated) continue;
      await this.permissionService.mutate({
        type: "set-assignment",
        actor: { type: "system", service: "legacy-administrator-migration" },
        target: principal,
        selector: { type: "permission", permission: "platform.admin" },
        scope: { type: "discord-guild", guildId },
        effect: "allow",
        correlationId: randomUUID(),
        reasonCode: "migration",
        reason: "Persisted ADMIN_ROLE_IDS compatibility assignment.",
      });
      createdAssignments += 1;
    }
    return { plan, createdAssignments };
  }
}

function findActiveAssignment(
  assignments: readonly PermissionAssignment[],
  permission: "platform.owner" | "platform.admin",
  scope: "platform" | "discord-guild",
): PermissionAssignment | undefined {
  const now = new Date();
  return assignments.find(
    (assignment) =>
      assignment.enabled &&
      (!assignment.expiresAt || assignment.expiresAt > now) &&
      assignment.effect === "allow" &&
      assignment.selector.type === "permission" &&
      assignment.selector.permission === permission &&
      assignment.scope.type === scope,
  );
}

/** Rejects malformed or non-Discord identifiers before persistence access. */
export function validateDiscordSnowflake(
  valueName: string,
  value: string,
): void {
  validateSnowflake(valueName, value);
}

function validateSnowflake(valueName: string, value: string): void {
  if (!DISCORD_SNOWFLAKE.test(value))
    throw new Error(`${valueName} must be a 17-20 digit Discord snowflake.`);
}
