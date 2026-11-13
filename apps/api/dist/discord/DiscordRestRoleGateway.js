import { REST, Routes, PermissionsBitField } from "discord.js";
import { BRAND } from "@qbox/shared/brand";
export class DiscordRestRoleGateway {
    applicationId;
    rest;
    constructor(token, applicationId) {
        this.applicationId = applicationId;
        this.rest = new REST({ version: "10" }).setToken(token);
    }
    async listRoles(guildId) {
        const [roles, botPosition] = await Promise.all([this.roles(guildId), this.botHighestPosition(guildId)]);
        return roles.sort((left, right) => right.position - left.position).map((role) => mapRole(guildId, role, botPosition));
    }
    async listChannels(guildId) {
        const [channels, roles, botUserId] = await Promise.all([
            this.rest.get(Routes.guildChannels(guildId)),
            this.roles(guildId),
            this.botUserId(),
        ]);
        const member = await this.rest.get(Routes.guildMember(guildId, botUserId));
        return channels
            .sort((left, right) => (left.position ?? 0) - (right.position ?? 0))
            .map((channel) => mapChannel(guildId, channel, permissionsForChannel(guildId, channel, roles, member, botUserId)));
    }
    async getRole(guildId, roleId) {
        const roles = await this.listRoles(guildId);
        return roles.find((role) => role.id === roleId);
    }
    async createRole(input) {
        const created = await this.rest.post(Routes.guildRoles(input.guildId), {
            body: {
                name: input.name,
                ...(input.color === undefined ? {} : { color: normalizeColor(input.color) }),
                hoist: input.hoist ?? false,
                mentionable: input.mentionable ?? false,
            },
            reason: `${BRAND.name} role management by ${input.actor.type}:${input.actor.id}`,
        });
        if (input.position !== undefined) {
            await this.rest.patch(guildRolePositionsRoute(input.guildId), {
                body: [{ id: created.id, position: input.position }],
                reason: `${BRAND.name} role management by ${input.actor.type}:${input.actor.id}`,
            });
        }
        const current = await this.getRole(input.guildId, created.id);
        if (!current)
            throw new Error("Created role could not be read back from Discord.");
        return current;
    }
    async editRole(input) {
        await this.rest.patch(Routes.guildRole(input.guildId, input.roleId), {
            body: {
                ...(input.name === undefined ? {} : { name: input.name }),
                ...(input.color === undefined ? {} : { color: normalizeColor(input.color) }),
                ...(input.hoist === undefined ? {} : { hoist: input.hoist }),
                ...(input.mentionable === undefined ? {} : { mentionable: input.mentionable }),
            },
            reason: `${BRAND.name} role management by ${input.actor.type}:${input.actor.id}`,
        });
        if (input.position !== undefined) {
            await this.rest.patch(guildRolePositionsRoute(input.guildId), {
                body: [{ id: input.roleId, position: input.position }],
                reason: `${BRAND.name} role management by ${input.actor.type}:${input.actor.id}`,
            });
        }
        const current = await this.getRole(input.guildId, input.roleId);
        if (!current)
            throw new Error("Edited role could not be read back from Discord.");
        return current;
    }
    async deleteRole(input) {
        await this.rest.delete(Routes.guildRole(input.guildId, input.roleId), {
            reason: `${BRAND.name} role management by ${input.actor.type}:${input.actor.id}`,
        });
    }
    async moveRole(input) {
        await this.rest.patch(guildRolePositionsRoute(input.guildId), {
            body: [{ id: input.roleId, position: input.position }],
            reason: `${BRAND.name} role management by ${input.actor.type}:${input.actor.id}`,
        });
        const current = await this.getRole(input.guildId, input.roleId);
        if (!current)
            throw new Error("Moved role could not be read back from Discord.");
        return current;
    }
    async capabilities(guildId) {
        const botHighestRolePosition = await this.botHighestPosition(guildId);
        return { guildId, connected: true, botHighestRolePosition, canManageRoles: true };
    }
    async roles(guildId) {
        return await this.rest.get(Routes.guildRoles(guildId));
    }
    async botUserId() {
        return this.applicationId ?? (await this.rest.get(Routes.user())).id;
    }
    async botHighestPosition(guildId) {
        const userId = await this.botUserId();
        const [roles, member] = await Promise.all([
            this.roles(guildId),
            this.rest.get(Routes.guildMember(guildId, userId)),
        ]);
        return roles
            .filter((role) => member.roles.includes(role.id))
            .reduce((highest, role) => Math.max(highest, role.position), 0);
    }
}
function mapRole(guildId, role, botHighestPosition) {
    const everyone = role.id === guildId;
    const hierarchyBlocked = role.position >= botHighestPosition && !everyone;
    const permissions = new PermissionsBitField(BigInt(role.permissions)).toArray();
    const unavailableReason = everyone
        ? "@everyone cannot be managed as an ordinary role."
        : role.managed
            ? "Role is managed by an integration."
            : hierarchyBlocked
                ? "Role is at or above the bot's highest role."
                : undefined;
    return {
        id: role.id,
        guildId,
        name: role.name,
        color: `#${role.color.toString(16).padStart(6, "0")}`,
        position: role.position,
        hoisted: role.hoist,
        mentionable: role.mentionable,
        managed: role.managed,
        permissions,
        assignable: !everyone && !role.managed && !hierarchyBlocked,
        editable: !everyone && !role.managed && !hierarchyBlocked,
        deletable: !everyone && !role.managed && !hierarchyBlocked,
        ...(unavailableReason === undefined ? {} : { unavailableReason }),
        dependencyCount: 0,
    };
}
function mapChannel(guildId, channel, permissions) {
    const canView = permissions.has(PermissionsBitField.Flags.ViewChannel);
    return {
        id: channel.id,
        guildId,
        name: channel.name ?? channel.id,
        type: mapChannelType(channel.type),
        ...(channel.parent_id ? { parentId: channel.parent_id } : {}),
        position: channel.position ?? 0,
        nsfw: channel.nsfw === true,
        canView,
        canSendMessages: canView && permissions.has(PermissionsBitField.Flags.SendMessages),
        canEmbedLinks: canView && permissions.has(PermissionsBitField.Flags.EmbedLinks),
        canManage: canView && permissions.has(PermissionsBitField.Flags.ManageChannels),
    };
}
function permissionsForChannel(guildId, channel, roles, member, botUserId) {
    const byId = new Map(roles.map((role) => [role.id, role]));
    let bits = BigInt(byId.get(guildId)?.permissions ?? "0");
    for (const roleId of member.roles)
        bits |= BigInt(byId.get(roleId)?.permissions ?? "0");
    let permissions = new PermissionsBitField(bits);
    if (permissions.has(PermissionsBitField.Flags.Administrator))
        return permissions;
    const overwrites = channel.permission_overwrites ?? [];
    permissions = applyOverwrite(permissions, overwrites.find((overwrite) => overwrite.id === guildId));
    let roleAllow = 0n;
    let roleDeny = 0n;
    for (const overwrite of overwrites) {
        if (overwrite.type === 0 && member.roles.includes(overwrite.id)) {
            roleAllow |= BigInt(overwrite.allow);
            roleDeny |= BigInt(overwrite.deny);
        }
    }
    permissions = new PermissionsBitField((permissions.bitfield & ~roleDeny) | roleAllow);
    return applyOverwrite(permissions, overwrites.find((overwrite) => overwrite.type === 1 && overwrite.id === botUserId));
}
function applyOverwrite(permissions, overwrite) {
    if (!overwrite)
        return permissions;
    return new PermissionsBitField((permissions.bitfield & ~BigInt(overwrite.deny)) | BigInt(overwrite.allow));
}
function mapChannelType(type) {
    switch (type) {
        case 0:
            return "TEXT";
        case 5:
            return "ANNOUNCEMENT";
        case 15:
            return "FORUM";
        case 16:
            return "MEDIA";
        case 2:
            return "VOICE";
        case 4:
            return "CATEGORY";
        default:
            return "OTHER";
    }
}
function normalizeColor(color) {
    return Number.parseInt(color.startsWith("#") ? color.slice(1) : color, 16);
}
function guildRolePositionsRoute(guildId) {
    return `/guilds/${guildId}/roles`;
}
//# sourceMappingURL=DiscordRestRoleGateway.js.map