import { DISCORD_PERMISSION, GuildNameCache, colorValue } from "@qbox/shared/discord-rest";
import { BRAND } from "@qbox/shared/brand";
const GUILD_CACHE_MS = 60_000;
const BULK_DELETE_MAX_AGE_MS = 14 * 86_400_000 - 60_000;
const LOCK_BITS = DISCORD_PERMISSION.sendMessages | DISCORD_PERMISSION.sendMessagesInThreads | DISCORD_PERMISSION.createPublicThreads | DISCORD_PERMISSION.createPrivateThreads | DISCORD_PERMISSION.addReactions;
/** Moderation actions through the Discord REST API (v10). */
export class DiscordRestModerationGateway {
    rest;
    now;
    botUserId;
    guilds = new Map();
    guildNames;
    constructor(rest, now = Date.now) {
        this.rest = rest;
        this.now = now;
        this.guildNames = new GuildNameCache(rest, now);
    }
    async checkHierarchy(guildId, moderatorId, targetId) {
        const guild = await this.guild(guildId);
        const target = await this.member(guildId, targetId);
        const targetRoleIds = target?.roles ?? [];
        if (!target)
            return { allowed: true, targetRoleIds, targetIsMember: false };
        if (targetId === guild.owner_id)
            return { allowed: false, reason: "The server owner cannot be moderated.", targetRoleIds, targetIsMember: true };
        const botId = await this.selfId();
        if (targetId === botId)
            return { allowed: false, reason: "I can't moderate myself.", targetRoleIds, targetIsMember: true };
        const bot = await this.member(guildId, botId);
        const targetTop = topPosition(guild, targetRoleIds);
        if (topPosition(guild, bot?.roles ?? []) <= targetTop)
            return { allowed: false, reason: `My highest role must be above theirs. Move the ${BRAND.name} role (the bot's role) higher in Server Settings > Roles.`, targetRoleIds, targetIsMember: true };
        if (moderatorId && moderatorId !== guild.owner_id) {
            const moderator = await this.member(guildId, moderatorId);
            if (topPosition(guild, moderator?.roles ?? []) <= targetTop)
                return { allowed: false, reason: "Your highest role must be above theirs.", targetRoleIds, targetIsMember: true };
        }
        return { allowed: true, targetRoleIds, targetIsMember: true };
    }
    async timeout(guildId, userId, until, reason) {
        await this.rest.patch(`/guilds/${guildId}/members/${userId}`, { body: { communication_disabled_until: until ? until.toISOString() : null }, reason });
    }
    async kick(guildId, userId, reason) {
        await this.rest.delete(`/guilds/${guildId}/members/${userId}`, { reason });
    }
    async ban(guildId, userId, deleteMessageSeconds, reason) {
        await this.rest.put(`/guilds/${guildId}/bans/${userId}`, { body: { delete_message_seconds: deleteMessageSeconds }, reason });
    }
    async unban(guildId, userId, reason) {
        await this.rest.delete(`/guilds/${guildId}/bans/${userId}`, { reason });
    }
    guildName(guildId) {
        return this.guildNames.name(guildId);
    }
    async directMessage(userId, message) {
        try {
            const channel = (await this.rest.post("/users/@me/channels", { body: { recipient_id: userId } }));
            await this.rest.post(`/channels/${channel.id}/messages`, { body: { ...message, allowed_mentions: { parse: [] } } });
            return true;
        }
        catch {
            return false;
        }
    }
    async postEmbed(channelId, embed) {
        return this.postMessage(channelId, { embeds: [toEmbed(embed)] });
    }
    async postMessage(channelId, message) {
        const posted = (await this.rest.post(`/channels/${channelId}/messages`, { body: { ...message, allowed_mentions: { parse: [] } } }));
        return { messageId: posted.id };
    }
    async purge(channelId, count, userId) {
        const messages = (await this.rest.get(`/channels/${channelId}/messages?limit=100`));
        const cutoff = this.now() - BULK_DELETE_MAX_AGE_MS;
        const ids = messages
            .filter((message) => !userId || message.author.id === userId)
            .filter((message) => Date.parse(message.timestamp) > cutoff)
            .slice(0, count)
            .map((message) => message.id);
        if (ids.length === 0)
            return 0;
        if (ids.length === 1)
            await this.rest.delete(`/channels/${channelId}/messages/${ids[0]}`);
        else
            await this.rest.post(`/channels/${channelId}/messages/bulk-delete`, { body: { messages: ids } });
        return ids.length;
    }
    async setLocked(guildId, channelId, locked, reason) {
        const channel = (await this.rest.get(`/channels/${channelId}`));
        const current = channel.permission_overwrites?.find((overwrite) => overwrite.id === guildId);
        const allow = BigInt(current?.allow ?? "0") & ~(locked ? LOCK_BITS : 0n);
        const deny = locked ? BigInt(current?.deny ?? "0") | LOCK_BITS : BigInt(current?.deny ?? "0") & ~LOCK_BITS;
        await this.rest.put(`/channels/${channelId}/permissions/${guildId}`, { body: { type: 0, allow: String(allow), deny: String(deny) }, reason });
    }
    async setSlowmode(channelId, seconds, reason) {
        await this.rest.patch(`/channels/${channelId}`, { body: { rate_limit_per_user: seconds }, reason });
    }
    async deleteMessage(channelId, messageId, reason) {
        await this.rest.delete(`/channels/${channelId}/messages/${messageId}`, { reason });
    }
    async guild(guildId) {
        const cached = this.guilds.get(guildId);
        if (cached && this.now() - cached.at < GUILD_CACHE_MS)
            return cached.guild;
        const guild = (await this.rest.get(`/guilds/${guildId}`));
        this.guilds.set(guildId, { guild, at: this.now() });
        return guild;
    }
    async member(guildId, userId) {
        try {
            return (await this.rest.get(`/guilds/${guildId}/members/${userId}`));
        }
        catch {
            return undefined;
        }
    }
    async selfId() {
        if (!this.botUserId)
            this.botUserId = (await this.rest.get("/users/@me")).id;
        return this.botUserId;
    }
}
function topPosition(guild, roleIds) {
    return guild.roles.filter((role) => roleIds.includes(role.id)).reduce((top, role) => Math.max(top, role.position), 0);
}
function toEmbed(embed) {
    return {
        title: embed.title,
        description: embed.description,
        color: colorValue(embed.color),
        ...(embed.fields?.length ? { fields: embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })) } : {}),
        ...(embed.footer ? { footer: { text: embed.footer } } : {}),
        timestamp: new Date().toISOString(),
    };
}
//# sourceMappingURL=DiscordRestModerationGateway.js.map