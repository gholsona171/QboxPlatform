import { BRAND } from "@qbox/shared/brand";
export class RoleManagementError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "RoleManagementError";
    }
}
const snowflake = /^\d{17,20}$/;
const hexColor = /^#?[0-9a-fA-F]{6}$/;
export class RoleManagementService {
    dependencies;
    gateway;
    constructor(dependencies, gateway) {
        this.dependencies = dependencies;
        this.gateway = gateway;
    }
    async listRoles(guildId) {
        requireSnowflake("guildId", guildId);
        const roles = await this.requireGateway().listRoles(guildId);
        const dependencies = await this.dependencies.listDependencies(guildId);
        return roles.map((role) => ({
            ...role,
            dependencyCount: dependencies.filter((dependency) => dependency.roleId === role.id).length,
        }));
    }
    async listChannels(guildId) {
        requireSnowflake("guildId", guildId);
        return this.requireGateway().listChannels(guildId);
    }
    async inspectRole(guildId, roleId) {
        requireSnowflake("guildId", guildId);
        requireSnowflake("roleId", roleId);
        const role = await this.requireGateway().getRole(guildId, roleId);
        if (!role)
            throw new RoleManagementError("NOT_FOUND", "Role was not found.");
        const dependencies = await this.dependencies.listDependencies(guildId, roleId);
        return { ...role, dependencyCount: dependencies.length };
    }
    capabilities(guildId) {
        requireSnowflake("guildId", guildId);
        return this.requireGateway().capabilities(guildId);
    }
    async createRole(input) {
        validateCreate(input);
        if (hasAdministrator(input.permissions) && !input.allowAdministrator)
            throw new RoleManagementError("FORBIDDEN", "Creating Administrator roles requires explicit Administrator-role permission.");
        const created = await this.requireGateway().createRole(input);
        await this.audit({ guildId: input.guildId, roleId: created.id, operation: "create", source: input.source, actor: input.actor, summary: `Created role ${created.name}.`, result: "SUCCESS" });
        return created;
    }
    async editRole(input) {
        validateEdit(input);
        const existing = await this.inspectRole(input.guildId, input.roleId);
        validateMutable(existing);
        if ((hasAdministrator(existing.permissions) || hasAdministrator(input.permissions)) && !input.allowAdministrator)
            throw new RoleManagementError("FORBIDDEN", "Editing Administrator roles requires explicit Administrator-role permission.");
        const edited = await this.requireGateway().editRole(input);
        await this.audit({ guildId: input.guildId, roleId: input.roleId, operation: "edit", source: input.source, actor: input.actor, summary: `Edited role ${edited.name}.`, result: "SUCCESS" });
        return edited;
    }
    async deleteRole(input) {
        requireSnowflake("guildId", input.guildId);
        requireSnowflake("roleId", input.roleId);
        const existing = await this.inspectRole(input.guildId, input.roleId);
        validateMutable(existing);
        if (input.confirmation !== existing.name && input.confirmation !== `delete ${existing.name}`)
            throw new RoleManagementError("INVALID_INPUT", "Role deletion requires a matching confirmation.");
        const dependencies = await this.dependencies.listDependencies(input.guildId, input.roleId);
        if (dependencies.length > 0)
            throw new RoleManagementError("DEPENDENCY_CONFLICT", `Role has ${BRAND.name} feature dependencies. Replace or remove dependencies before deleting it.`);
        await this.requireGateway().deleteRole(input);
        await this.audit({ guildId: input.guildId, roleId: input.roleId, operation: "delete", source: input.source, actor: input.actor, summary: `Deleted role ${existing.name}.`, result: "SUCCESS" });
    }
    async moveRole(input) {
        requireSnowflake("guildId", input.guildId);
        requireSnowflake("roleId", input.roleId);
        if (!Number.isInteger(input.position) || input.position < 0)
            throw new RoleManagementError("INVALID_INPUT", "Role position must be a non-negative integer.");
        const existing = await this.inspectRole(input.guildId, input.roleId);
        validateMutable(existing);
        const moved = await this.requireGateway().moveRole(input);
        await this.audit({ guildId: input.guildId, roleId: input.roleId, operation: "move", source: input.source, actor: input.actor, summary: `Moved role ${moved.name}.`, result: "SUCCESS" });
        return moved;
    }
    listDependencies(guildId, roleId) {
        requireSnowflake("guildId", guildId);
        if (roleId !== undefined)
            requireSnowflake("roleId", roleId);
        return this.dependencies.listDependencies(guildId, roleId);
    }
    async replaceDependency(input) {
        requireSnowflake("guildId", input.guildId);
        requireSnowflake("oldRoleId", input.oldRoleId);
        requireSnowflake("newRoleId", input.newRoleId);
        if (input.oldRoleId === input.newRoleId)
            throw new RoleManagementError("INVALID_INPUT", "Replacement role must differ from the existing role.");
        await this.inspectRole(input.guildId, input.newRoleId);
        const changed = await this.dependencies.replaceDependency(input.guildId, input.oldRoleId, input.newRoleId);
        await this.audit({ guildId: input.guildId, roleId: input.oldRoleId, operation: "replace-dependency", source: input.source, actor: input.actor, summary: `Replaced ${changed} role dependency record(s).`, result: "SUCCESS", metadata: { newRoleId: input.newRoleId, changed } });
        return changed;
    }
    requireGateway() {
        if (!this.gateway)
            throw new RoleManagementError("DISCORD_UNAVAILABLE", "Discord role management is unavailable.");
        return this.gateway;
    }
    audit(input) {
        return this.dependencies.recordAudit({ ...input, feature: "roles" });
    }
}
function validateCreate(input) {
    requireSnowflake("guildId", input.guildId);
    validateName(input.name);
    if (input.color !== undefined && !hexColor.test(input.color))
        throw new RoleManagementError("INVALID_INPUT", "Role color must be a hexadecimal color.");
}
function validateEdit(input) {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("roleId", input.roleId);
    if (input.name !== undefined)
        validateName(input.name);
    if (input.color !== undefined && !hexColor.test(input.color))
        throw new RoleManagementError("INVALID_INPUT", "Role color must be a hexadecimal color.");
}
function validateName(name) {
    if (name.trim().length < 1 || name.length > 100)
        throw new RoleManagementError("INVALID_INPUT", "Role name length must be between 1 and 100 characters.");
}
function validateMutable(role) {
    if (role.id === role.guildId)
        throw new RoleManagementError("FORBIDDEN", "@everyone cannot be edited or deleted.");
    if (role.managed)
        throw new RoleManagementError("FORBIDDEN", "Integration-managed roles cannot be edited or deleted.");
    if (!role.editable)
        throw new RoleManagementError("FORBIDDEN", role.unavailableReason ?? "Role cannot be edited by the bot.");
}
function requireSnowflake(name, value) {
    if (!snowflake.test(value))
        throw new RoleManagementError("INVALID_INPUT", `${name} must be a Discord snowflake.`);
}
function hasAdministrator(permissions) {
    return permissions?.some((permission) => permission.toLowerCase() === "administrator") ?? false;
}
//# sourceMappingURL=index.js.map