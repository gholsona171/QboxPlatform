/** Discord's PINNED flag for forum posts. */
const PINNED = 2;
/** `name:id` becomes a custom emoji; anything else is a unicode emoji. */
function emojiFields(emoji) {
    const custom = /^[a-zA-Z0-9_]{2,32}:(\d{17,20})$/.exec(emoji);
    return custom ? { emoji_id: custom[1], emoji_name: null } : { emoji_id: null, emoji_name: emoji };
}
/** Server builder operations through the Discord REST API (v10). */
export class DiscordRestBuilderGateway {
    rest;
    botUserId;
    constructor(rest) {
        this.rest = rest;
    }
    async listRoles(guildId) {
        const roles = (await this.rest.get(`/guilds/${guildId}/roles`));
        return roles.map((role) => ({ id: role.id, name: role.name, position: role.position, managed: role.managed === true, permissions: role.permissions }));
    }
    async listChannels(guildId) {
        const channels = (await this.rest.get(`/guilds/${guildId}/channels`));
        return channels.map((channel) => ({ id: channel.id, name: channel.name, type: channel.type, ...(channel.parent_id ? { parentId: channel.parent_id } : {}) }));
    }
    async botStatus(guildId) {
        const userId = await this.selfId();
        const [guild, roles, member] = await Promise.all([
            this.rest.get(`/guilds/${guildId}`),
            this.rest.get(`/guilds/${guildId}/roles`),
            this.rest.get(`/guilds/${guildId}/members/${userId}`),
        ]);
        const mine = roles.filter((role) => role.id === guildId || member.roles.includes(role.id));
        return {
            userId,
            permissions: mine.reduce((bits, role) => bits | BigInt(role.permissions), 0n),
            topRolePosition: mine.reduce((top, role) => Math.max(top, role.position), 0),
            highestRolePosition: roles.reduce((top, role) => Math.max(top, role.position), 0),
            community: guild.features?.includes("COMMUNITY") ?? false,
            ...(guild.owner_id ? { ownerId: guild.owner_id } : {}),
        };
    }
    async createRole(guildId, input, reason) {
        const role = (await this.rest.post(`/guilds/${guildId}/roles`, {
            body: { name: input.name, color: input.color, hoist: input.hoist, mentionable: input.mentionable, permissions: input.permissions },
            reason,
        }));
        return role.id;
    }
    async setRolePositions(guildId, positions, reason) {
        await this.rest.patch(`/guilds/${guildId}/roles`, { body: positions.map((item) => ({ id: item.id, position: item.position })), reason });
    }
    async createChannel(guildId, input, reason) {
        const channel = (await this.rest.post(`/guilds/${guildId}/channels`, {
            body: {
                name: input.name,
                type: input.type,
                permission_overwrites: input.overwrites.map((overwrite) => ({ id: overwrite.id, type: overwrite.type, allow: overwrite.allow, deny: overwrite.deny })),
                ...(input.parentId ? { parent_id: input.parentId } : {}),
                ...(input.topic ? { topic: input.topic } : {}),
                ...(input.slowmodeSeconds ? { rate_limit_per_user: input.slowmodeSeconds } : {}),
                ...(input.nsfw ? { nsfw: true } : {}),
                ...(input.userLimit ? { user_limit: input.userLimit } : {}),
                ...(input.tags?.length ? { available_tags: input.tags.map((tag) => ({ name: tag.name, moderated: false, ...(tag.emoji ? emojiFields(tag.emoji) : {}) })) } : {}),
                ...(input.defaultReactionEmoji ? { default_reaction_emoji: emojiFields(input.defaultReactionEmoji) } : {}),
            },
            reason,
        }));
        return channel.id;
    }
    async createForumPost(channelId, input, reason) {
        const thread = (await this.rest.post(`/channels/${channelId}/threads`, {
            body: { name: input.title, message: { content: input.content }, applied_tags: [] },
            reason,
        }));
        return { threadId: thread.id };
    }
    async pinForumPost(threadId, reason) {
        await this.rest.patch(`/channels/${threadId}`, { body: { flags: PINNED }, reason });
    }
    /** Deleting something that is already gone counts as done. */
    async deleteChannel(channelId, reason) {
        await this.rest.delete(`/channels/${channelId}`, { reason }).catch(ignoreMissing);
    }
    async deleteRole(guildId, roleId, reason) {
        await this.rest.delete(`/guilds/${guildId}/roles/${roleId}`, { reason }).catch(ignoreMissing);
    }
    async readLayout(guildId) {
        const [guild, roles, channels] = await Promise.all([
            this.rest.get(`/guilds/${guildId}`),
            this.rest.get(`/guilds/${guildId}/roles`),
            this.rest.get(`/guilds/${guildId}/channels`),
        ]);
        return {
            name: guild.name ?? "",
            community: guild.features?.includes("COMMUNITY") ?? false,
            ...(guild.rules_channel_id ? { rulesChannelId: guild.rules_channel_id } : {}),
            ...(guild.public_updates_channel_id ? { publicUpdatesChannelId: guild.public_updates_channel_id } : {}),
            roles: roles.map(toLayoutRole),
            channels: channels.map(toLayoutChannel),
        };
    }
    async listEmojis(guildId) {
        const emojis = (await this.rest.get(`/guilds/${guildId}/emojis`));
        return emojis.flatMap((emoji) => (emoji.id ? [{ id: emoji.id, name: emoji.name ?? emoji.id }] : []));
    }
    async listStickers(guildId) {
        const stickers = (await this.rest.get(`/guilds/${guildId}/stickers`));
        return stickers.map((sticker) => ({ id: sticker.id, name: sticker.name }));
    }
    async deleteEmoji(guildId, emojiId, reason) {
        await this.rest.delete(`/guilds/${guildId}/emojis/${emojiId}`, { reason }).catch(ignoreMissing);
    }
    async deleteSticker(guildId, stickerId, reason) {
        await this.rest.delete(`/guilds/${guildId}/stickers/${stickerId}`, { reason }).catch(ignoreMissing);
    }
    async selfId() {
        if (!this.botUserId)
            this.botUserId = (await this.rest.get("/users/@me")).id;
        return this.botUserId;
    }
}
function toLayoutRole(role) {
    return {
        id: role.id,
        name: role.name,
        color: role.color ?? 0,
        hoist: role.hoist === true,
        mentionable: role.mentionable === true,
        permissions: role.permissions,
        position: role.position,
        managed: role.managed === true,
    };
}
function toLayoutChannel(channel) {
    return {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        nsfw: channel.nsfw === true,
        slowmodeSeconds: channel.rate_limit_per_user ?? 0,
        userLimit: channel.user_limit ?? 0,
        position: channel.position ?? 0,
        ...(channel.topic ? { topic: channel.topic } : {}),
        ...(typeof channel.bitrate === "number" ? { bitrate: channel.bitrate } : {}),
        ...(channel.parent_id ? { parentId: channel.parent_id } : {}),
        overwrites: (channel.permission_overwrites ?? []).map((overwrite) => ({
            id: overwrite.id,
            type: overwrite.type === 1 ? 1 : 0,
            allow: overwrite.allow,
            deny: overwrite.deny,
        })),
    };
}
function ignoreMissing(error) {
    if (error && typeof error === "object" && "status" in error && error.status === 404)
        return;
    throw error;
}
//# sourceMappingURL=DiscordRestBuilderGateway.js.map