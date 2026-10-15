import { BRAND } from "@qbox/shared/brand";
export class RoleMenuError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "RoleMenuError";
    }
}
const snowflake = /^\d{17,20}$/;
const maxOptions = 25;
export class RoleMenuService {
    repository;
    gateway;
    constructor(repository, gateway) {
        this.repository = repository;
        this.gateway = gateway;
    }
    createDraft(input) {
        validateDraft(input);
        return this.repository.create(input);
    }
    updateDraft(id, input) {
        if (input.channelId !== undefined && !snowflake.test(input.channelId))
            throw invalid("channelId must be a Discord snowflake.");
        if (input.title !== undefined)
            validateText("title", input.title, 1, 100);
        if (input.description !== undefined)
            validateText("description", input.description, 0, 1000);
        return this.repository.update(id, input);
    }
    addOption(roleMenuId, input) {
        validateOption(input);
        return this.repository.addOption(roleMenuId, input);
    }
    updateOption(roleMenuId, optionId, input) {
        if (input.roleId !== undefined && !snowflake.test(input.roleId))
            throw invalid("roleId must be a Discord snowflake.");
        if (input.label !== undefined)
            validateText("label", input.label, 1, 80);
        if (input.description !== undefined)
            validateText("description", input.description, 0, 100);
        return this.repository.updateOption(roleMenuId, optionId, input);
    }
    removeOption(roleMenuId, optionId, input) {
        return this.repository.removeOption(roleMenuId, optionId, input);
    }
    reorderOptions(roleMenuId, optionIds, input) {
        if (new Set(optionIds).size !== optionIds.length)
            throw invalid("Option order contains duplicates.");
        return this.repository.reorderOptions(roleMenuId, optionIds, input);
    }
    async publish(roleMenuId, messageId, input) {
        if (!snowflake.test(messageId))
            throw invalid("messageId must be a Discord snowflake.");
        const menu = await this.requireMenu(roleMenuId);
        if (menu.options.length === 0)
            throw invalid("A role menu requires at least one option before publishing.");
        if (menu.options.length > maxOptions)
            throw invalid("A role menu cannot contain more than 25 options.");
        return this.repository.setPublished(roleMenuId, messageId, input);
    }
    disable(roleMenuId, input) {
        return this.repository.setStatus(roleMenuId, "DISABLED", input);
    }
    delete(roleMenuId) {
        return this.repository.delete(roleMenuId);
    }
    getById(roleMenuId) {
        return this.repository.findById(roleMenuId);
    }
    listByGuild(guildId) {
        if (!snowflake.test(guildId))
            throw invalid("guildId must be a Discord snowflake.");
        return this.repository.listByGuild(guildId);
    }
    async resolveMemberInteraction(input) {
        if (!this.gateway)
            throw new RoleMenuError("ROLE_NOT_ASSIGNABLE", "Discord role gateway is not configured.");
        const menu = await this.repository.findByPublishedMessage(input.guildId, input.channelId, input.messageId);
        if (!menu)
            throw new RoleMenuError("NOT_FOUND", "Role menu was not found for this message.");
        if (menu.status !== "PUBLISHED")
            throw new RoleMenuError("DISABLED", "Role menu is not published.");
        const option = this.resolveOption(menu, input);
        const validation = await this.gateway.validateAssignableRole({
            guildId: input.guildId,
            memberId: input.memberId,
            roleId: option.roleId,
        });
        if (!validation.assignable)
            throw new RoleMenuError("ROLE_NOT_ASSIGNABLE", validation.reason ?? "Role cannot be assigned.");
        if (input.surface === "REACTION" && input.direction === "remove") {
            if (menu.assignmentMode === "ADD_ONLY")
                return { changed: false, message: "Reaction removal does not remove this role." };
            const hasRole = await this.gateway.hasRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId });
            if (!hasRole)
                return { changed: false, message: "No role change was required." };
            return this.gateway.removeRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId, reason: `${BRAND.name} role menu ${menu.id} reaction removed.` });
        }
        if (menu.assignmentMode === "EXCLUSIVE") {
            for (const other of menu.options) {
                if (other.roleId !== option.roleId && await this.gateway.hasRole({ guildId: input.guildId, memberId: input.memberId, roleId: other.roleId }))
                    await this.gateway.removeRole({ guildId: input.guildId, memberId: input.memberId, roleId: other.roleId, reason: `${BRAND.name} role menu ${menu.id} exclusive selection.` });
            }
            return this.gateway.addRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId, reason: `${BRAND.name} role menu ${menu.id} selected.` });
        }
        const hasRole = await this.gateway.hasRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId });
        if (menu.assignmentMode === "ADD_ONLY" || (menu.assignmentMode === "TOGGLE" && !hasRole))
            return this.gateway.addRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId, reason: `${BRAND.name} role menu ${menu.id} selected.` });
        if (menu.assignmentMode === "REMOVE_ONLY" || (menu.assignmentMode === "TOGGLE" && hasRole))
            return this.gateway.removeRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId, reason: `${BRAND.name} role menu ${menu.id} removed.` });
        return { changed: false, message: "No role change was required." };
    }
    async requireMenu(id) {
        const menu = await this.repository.findById(id);
        if (!menu)
            throw new RoleMenuError("NOT_FOUND", "Role menu was not found.");
        return menu;
    }
    resolveOption(menu, input) {
        const option = input.optionId
            ? menu.options.find((candidate) => candidate.id === input.optionId)
            : menu.options.find((candidate) => candidate.emoji === input.emoji);
        if (!option)
            throw new RoleMenuError("OPTION_NOT_FOUND", "Role menu option was not found.");
        return option;
    }
}
function validateDraft(input) {
    if (!snowflake.test(input.guildId))
        throw invalid("guildId must be a Discord snowflake.");
    if (!snowflake.test(input.channelId))
        throw invalid("channelId must be a Discord snowflake.");
    if (!snowflake.test(input.createdByDiscordUserId))
        throw invalid("createdByDiscordUserId must be a Discord snowflake.");
    validateText("title", input.title, 1, 100);
    if (input.description !== undefined)
        validateText("description", input.description, 0, 1000);
}
function validateOption(input) {
    if (!snowflake.test(input.roleId))
        throw invalid("roleId must be a Discord snowflake.");
    validateText("label", input.label, 1, 80);
    if (input.description !== undefined)
        validateText("description", input.description, 0, 100);
}
function validateText(name, value, min, max) {
    if (value.length < min || value.length > max)
        throw invalid(`${name} length must be between ${min} and ${max}.`);
}
function invalid(message) {
    return new RoleMenuError("INVALID_INPUT", message);
}
//# sourceMappingURL=index.js.map