import { ChannelType, PermissionsBitField, } from "discord.js";
import { BRAND } from "@qbox/shared/brand";
export class DiscordRoleManagementGateway {
    client;
    constructor(client) {
        this.client = client;
    }
    async listRoles(guildId) {
        const guild = await this.guild(guildId);
        await guild.roles.fetch();
        const botPosition = await this.botHighestPosition(guild);
        return [...guild.roles.cache.values()]
            .sort((left, right) => right.position - left.position)
            .map((role) => mapRole(guild.id, role, botPosition));
    }
    async listChannels(guildId) {
        const guild = await this.guild(guildId);
        await guild.channels.fetch();
        const member = await guild.members.fetchMe();
        return [...guild.channels.cache.values()]
            .filter((channel) => channel !== null)
            .sort((left, right) => channelPosition(left) - channelPosition(right))
            .map((channel) => mapChannel(guild.id, channel, channel.permissionsFor(member)));
    }
    async getRole(guildId, roleId) {
        const guild = await this.guild(guildId);
        const role = await guild.roles.fetch(roleId);
        if (!role)
            return undefined;
        return mapRole(guild.id, role, await this.botHighestPosition(guild));
    }
    async createRole(input) {
        const guild = await this.guild(input.guildId);
        const role = await guild.roles.create({
            name: input.name,
            ...(input.color === undefined ? {} : { color: normalizeColor(input.color) }),
            hoist: input.hoist ?? false,
            mentionable: input.mentionable ?? false,
            reason: `${BRAND.name} role management by ${input.actor.type}:${input.actor.id}`,
        });
        if (input.position !== undefined)
            await role.setPosition(input.position, { reason: `${BRAND.name} role management by ${input.actor.type}:${input.actor.id}` });
        return mapRole(guild.id, role, await this.botHighestPosition(guild));
    }
    async editRole(input) {
        const guild = await this.guild(input.guildId);
        const role = await guild.roles.fetch(input.roleId);
        if (!role)
            throw new Error("Role was not found.");
        const edited = await role.edit({
            ...(input.name === undefined ? {} : { name: input.name }),
            ...(input.color === undefined ? {} : { color: normalizeColor(input.color) }),
            ...(input.hoist === undefined ? {} : { hoist: input.hoist }),
            ...(input.mentionable === undefined ? {} : { mentionable: input.mentionable }),
            reason: `${BRAND.name} role management by ${input.actor.type}:${input.actor.id}`,
        });
        if (input.position !== undefined)
            await edited.setPosition(input.position, { reason: `${BRAND.name} role management by ${input.actor.type}:${input.actor.id}` });
        return mapRole(guild.id, edited, await this.botHighestPosition(guild));
    }
    async deleteRole(input) {
        const guild = await this.guild(input.guildId);
        const role = await guild.roles.fetch(input.roleId);
        if (!role)
            throw new Error("Role was not found.");
        await role.delete(`${BRAND.name} role management by ${input.actor.type}:${input.actor.id}`);
    }
    async moveRole(input) {
        const guild = await this.guild(input.guildId);
        const role = await guild.roles.fetch(input.roleId);
        if (!role)
            throw new Error("Role was not found.");
        const moved = await role.setPosition(input.position, { reason: `${BRAND.name} role management by ${input.actor.type}:${input.actor.id}` });
        return mapRole(guild.id, moved, await this.botHighestPosition(guild));
    }
    async capabilities(guildId) {
        const guild = await this.guild(guildId);
        const member = await guild.members.fetchMe();
        const canManageRoles = member.permissions.has(PermissionsBitField.Flags.ManageRoles);
        return {
            guildId,
            connected: true,
            botHighestRolePosition: member.roles.highest.position,
            canManageRoles,
            ...(canManageRoles ? {} : { reason: "Bot lacks Manage Roles permission." }),
        };
    }
    async guild(guildId) {
        const guild = await this.client.guilds.fetch(guildId);
        if (!guild)
            throw new Error("Discord guild is unavailable.");
        return guild;
    }
    async botHighestPosition(guild) {
        const member = await guild.members.fetchMe();
        return member.roles.highest.position;
    }
}
function mapRole(guildId, role, botHighestPosition) {
    const everyone = role.id === guildId;
    const hierarchyBlocked = role.position >= botHighestPosition && !everyone;
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
        color: role.hexColor,
        position: role.position,
        hoisted: role.hoist,
        mentionable: role.mentionable,
        managed: role.managed,
        permissions: role.permissions.toArray(),
        memberCount: role.members.size,
        assignable: !everyone && !role.managed && !hierarchyBlocked,
        editable: !everyone && !role.managed && !hierarchyBlocked,
        deletable: !everyone && !role.managed && !hierarchyBlocked,
        ...(unavailableReason === undefined ? {} : { unavailableReason }),
        dependencyCount: 0,
    };
}
function mapChannel(guildId, channel, permissions) {
    const canView = permissions?.has(PermissionsBitField.Flags.ViewChannel) ?? false;
    return {
        id: channel.id,
        guildId,
        name: channel.name,
        type: mapChannelType(channel.type),
        ...(channel.parentId === null ? {} : { parentId: channel.parentId }),
        position: channelPosition(channel),
        nsfw: "nsfw" in channel && channel.nsfw === true,
        canView,
        canSendMessages: canView && (permissions?.has(PermissionsBitField.Flags.SendMessages) ?? false),
        canEmbedLinks: canView && (permissions?.has(PermissionsBitField.Flags.EmbedLinks) ?? false),
        canManage: canView && (permissions?.has(PermissionsBitField.Flags.ManageChannels) ?? false),
    };
}
function channelPosition(channel) {
    return "position" in channel && typeof channel.position === "number" ? channel.position : 0;
}
function mapChannelType(type) {
    switch (type) {
        case ChannelType.GuildText:
            return "TEXT";
        case ChannelType.GuildAnnouncement:
            return "ANNOUNCEMENT";
        case ChannelType.GuildForum:
            return "FORUM";
        case ChannelType.GuildMedia:
            return "MEDIA";
        case ChannelType.GuildVoice:
            return "VOICE";
        case ChannelType.GuildCategory:
            return "CATEGORY";
        default:
            return "OTHER";
    }
}
function normalizeColor(color) {
    return Number.parseInt(color.startsWith("#") ? color.slice(1) : color, 16);
}
//# sourceMappingURL=DiscordRoleManagementGateway.js.map