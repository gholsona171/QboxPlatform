import { randomUUID } from "node:crypto";
import { PersistentPermissionService, } from "@qbox/permissions";
const DISCORD_SNOWFLAKE = /^\d{17,20}$/;
/**
 * Operator-only persistent permission bootstrap and compatibility migration.
 *
 * The service accepts only verified IDs supplied by the local CLI. It owns no
 * database lifecycle and uses injected repository ports. Dry-run methods never
 * mutate state; apply methods are additive and idempotent.
 */
export class PermissionBootstrapService {
    guilds;
    principals;
    assignments;
    permissionService;
    constructor(guilds, principals, assignments, permissionService) {
        this.guilds = guilds;
        this.principals = principals;
        this.assignments = assignments;
        this.permissionService = permissionService;
    }
    async planOwner(guildId, userId) {
        validateSnowflake("guild ID", guildId);
        validateSnowflake("Discord user ID", userId);
        const guild = await this.guilds.findByDiscordId(guildId);
        const principal = await this.principals.findDiscordUser(guildId, userId);
        const identity = {
            type: "discord-user",
            externalId: userId,
            guildId,
        };
        const existing = principal
            ? findActiveAssignment(await this.assignments.findByPrincipal(identity, true), "platform.owner", "platform")
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
    async applyOwner(guildId, userId) {
        const plan = await this.planOwner(guildId, userId);
        if (plan.guildWillBeCreated)
            await this.guilds.create(guildId);
        const principal = {
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
    async planLegacyAdministrators(guildId, roleIds) {
        validateSnowflake("guild ID", guildId);
        const uniqueRoles = [...new Set(roleIds)];
        uniqueRoles.forEach((roleId) => validateSnowflake("Discord role ID", roleId));
        const guild = await this.guilds.findByDiscordId(guildId);
        const roles = [];
        for (const roleId of uniqueRoles) {
            const principal = await this.principals.findDiscordRole(guildId, roleId);
            const identity = {
                type: "discord-role",
                externalId: roleId,
                guildId,
            };
            const existing = principal
                ? findActiveAssignment(await this.assignments.findByPrincipal(identity, true), "platform.admin", "discord-guild")
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
    async applyLegacyAdministrators(guildId, roleIds) {
        const plan = await this.planLegacyAdministrators(guildId, roleIds);
        if (plan.guildWillBeCreated)
            await this.guilds.create(guildId);
        let createdAssignments = 0;
        for (const role of plan.roles) {
            const principal = {
                type: "discord-role",
                externalId: role.roleId,
                guildId,
            };
            await this.principals.getOrCreateDiscordPrincipal(principal);
            if (!role.grantWillBeCreated)
                continue;
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
function findActiveAssignment(assignments, permission, scope) {
    const now = new Date();
    return assignments.find((assignment) => assignment.enabled &&
        (!assignment.expiresAt || assignment.expiresAt > now) &&
        assignment.effect === "allow" &&
        assignment.selector.type === "permission" &&
        assignment.selector.permission === permission &&
        assignment.scope.type === scope);
}
/** Rejects malformed or non-Discord identifiers before persistence access. */
export function validateDiscordSnowflake(valueName, value) {
    validateSnowflake(valueName, value);
}
function validateSnowflake(valueName, value) {
    if (!DISCORD_SNOWFLAKE.test(value))
        throw new Error(`${valueName} must be a 17-20 digit Discord snowflake.`);
}
//# sourceMappingURL=PermissionBootstrapService.js.map