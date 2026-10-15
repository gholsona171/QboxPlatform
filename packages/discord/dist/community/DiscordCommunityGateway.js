import { EmbedBuilder, } from "discord.js";
import { BRAND } from "@qbox/shared/brand";
export class DiscordCommunityGatewayAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    async sendMessage(input) {
        const channel = await this.resolveTextChannel(input.guildId, input.channelId);
        const message = await channel.send({
            ...(input.content ? { content: input.content } : {}),
            ...(input.embed ? { embeds: [embed(input.embed)] } : {}),
            allowedMentions: { parse: [], roles: roleMentions(input.content), users: userMentions(input.content) },
        });
        return this.sent(message, input.deleteAfterSeconds);
    }
    async postMessage(input) {
        const channel = await this.resolveTextChannel(input.guildId, input.channelId);
        const message = await channel.send({
            ...(input.message.content ? { content: input.message.content } : {}),
            ...(input.message.embeds?.length ? { embeds: input.message.embeds.map(apiEmbed) } : {}),
            allowedMentions: { parse: [], roles: roleMentions(input.message.content), users: userMentions(input.message.content) },
        });
        return this.sent(message, input.deleteAfterSeconds);
    }
    sent(message, deleteAfterSeconds) {
        if (deleteAfterSeconds) {
            setTimeout(() => void message.delete().catch(() => undefined), deleteAfterSeconds * 1000).unref?.();
        }
        return {
            channelId: message.channelId,
            messageId: message.id,
            url: message.url,
        };
    }
    async assignRole(input) {
        const member = await this.resolveMember(input);
        if (member.roles.cache.has(input.roleId))
            return { changed: false, message: "Member already has that role." };
        await member.roles.add(input.roleId, input.reason);
        return { changed: true, message: "Role assigned." };
    }
    async removeRole(input) {
        const member = await this.resolveMember(input);
        if (!member.roles.cache.has(input.roleId))
            return { changed: false, message: "Member does not have that role." };
        await member.roles.remove(input.roleId, input.reason);
        return { changed: true, message: "Role removed." };
    }
    async validateRole(input) {
        const guild = await this.resolveGuild(input.guildId);
        const role = await guild.roles.fetch(input.roleId);
        if (!role)
            return { assignable: false, reason: "Role was not found." };
        if (role.managed)
            return { assignable: false, reason: "Managed roles cannot be assigned." };
        if (role.id === guild.id)
            return { assignable: false, reason: "@everyone cannot be assigned." };
        const me = guild.members.me ?? await guild.members.fetchMe();
        if (role.position >= me.roles.highest.position)
            return { assignable: false, reason: "Bot role is not high enough." };
        return { assignable: true };
    }
    async countMembers(input) {
        const guild = await this.resolveGuild(input.guildId);
        await guild.members.fetch();
        if (input.type === "TOTAL_MEMBERS")
            return guild.memberCount;
        if (input.type === "BOTS")
            return guild.members.cache.filter((member) => member.user.bot).size;
        if (input.type === "HUMANS")
            return guild.members.cache.filter((member) => !member.user.bot).size;
        if (input.type === "ROLE" && input.roleId) {
            const roleId = input.roleId;
            return guild.members.cache.filter((member) => member.roles.cache.has(roleId)).size;
        }
        return guild.presences.cache.size;
    }
    async renameChannel(input) {
        const guild = await this.resolveGuild(input.guildId);
        const channel = await guild.channels.fetch(input.channelId);
        if (!channel || !("setName" in channel))
            throw new Error("Counter channel cannot be renamed.");
        await channel.setName(input.name, `${BRAND.name} member counter refresh.`);
    }
    async resolveGuild(guildId) {
        const guild = await this.client.guilds.fetch(guildId);
        if (!guild)
            throw new Error("Guild is unavailable.");
        return guild;
    }
    async resolveMember(input) {
        const guild = await this.resolveGuild(input.guildId);
        return guild.members.fetch(input.memberId);
    }
    async resolveTextChannel(guildId, channelId) {
        const guild = await this.resolveGuild(guildId);
        const channel = await guild.channels.fetch(channelId);
        if (!channel || !channel.isTextBased() || !("send" in channel))
            throw new Error("Configured channel cannot receive messages.");
        return channel;
    }
}
function embed(input) {
    const builder = new EmbedBuilder();
    if (input.title)
        builder.setTitle(input.title);
    if (input.description)
        builder.setDescription(input.description);
    if (input.color !== undefined)
        builder.setColor(input.color);
    if (input.thumbnailUrl && !input.thumbnailUrl.startsWith("avatar:"))
        builder.setThumbnail(input.thumbnailUrl);
    if (input.imageUrl)
        builder.setImage(input.imageUrl);
    if (input.footer)
        builder.setFooter({ text: input.footer });
    if (input.timestamp)
        builder.setTimestamp();
    if (input.fields)
        builder.addFields(input.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline })));
    return builder;
}
/** Embed JSON as discord.js types it: the same shape without undefined keys or readonly arrays. */
function apiEmbed(embed) {
    return JSON.parse(JSON.stringify(embed));
}
/**
 * Members mentioned in the text (`{user}` renders as `<@id>`). Listing them
 * makes Discord send their names with the message, so everyone sees the
 * name instead of "@unknown-user"; it also pings them, as welcome bots do.
 */
export function userMentions(content) {
    if (!content)
        return [];
    const ids = [...content.matchAll(/<@!?(\d{17,20})>/g)].map((match) => match[1]).filter((id) => id !== undefined);
    return [...new Set(ids)].slice(0, 100);
}
function roleMentions(content) {
    if (!content)
        return [];
    return [...content.matchAll(/<@&(\d{17,20})>/g)].map((match) => match[1]).filter((id) => id !== undefined);
}
//# sourceMappingURL=DiscordCommunityGateway.js.map