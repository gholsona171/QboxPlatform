import { DISCORD_PERMISSION } from "@qbox/shared/discord-rest";
import { VOICE_CUSTOM_ID } from "./types.js";
const PRIORITY_SPEAKER = 1n << 8n;
const STREAM = 1n << 9n;
const VIEW = DISCORD_PERMISSION.viewChannel;
const CONNECT = DISCORD_PERMISSION.connect;
const OWNER_BITS = VIEW | CONNECT | DISCORD_PERMISSION.speak | STREAM | PRIORITY_SPEAKER;
const BOT_BITS = VIEW | CONNECT | DISCORD_PERMISSION.manageChannels | DISCORD_PERMISSION.moveMembers;
const ROLE = 0;
const MEMBER = 1;
const VOICE_CHANNEL = 2;
const DEFAULT_BITRATE = 64_000;
/** Control panel buttons: [action, label, style]. Style 2 is grey, 4 is red, 3 is green. */
const PANEL = [
    [["rename", "Rename", 2], ["limit", "Limit", 2], ["lock", "Lock", 2], ["unlock", "Unlock", 2], ["hide", "Hide", 2]],
    [["unhide", "Unhide", 2], ["permit", "Permit", 3], ["reject", "Reject", 4], ["kick", "Kick", 4], ["transfer", "Transfer", 2]],
    [["claim", "Claim", 1]],
];
/** Voice room channels and member moves through the Discord REST API (v10). */
export class DiscordRestVoiceGateway {
    rest;
    botUserId;
    constructor(rest) {
        this.rest = rest;
    }
    async channelParentId(channelId) {
        return (await this.channel(channelId)).parent_id ?? undefined;
    }
    async createRoomChannel(guildId, spec, reason) {
        const inherited = spec.parentId ? ((await this.channel(spec.parentId).catch(() => undefined))?.permission_overwrites ?? []) : [];
        const overwrites = new Map(inherited.map((item) => [item.id, { ...item }]));
        if (spec.private) {
            const current = overwrites.get(guildId);
            overwrites.set(guildId, { id: guildId, type: ROLE, allow: String(BigInt(current?.allow ?? "0") & ~(VIEW | CONNECT)), deny: String(BigInt(current?.deny ?? "0") | VIEW | CONNECT) });
        }
        overwrites.set(spec.ownerId, { id: spec.ownerId, type: MEMBER, allow: String(OWNER_BITS), deny: "0" });
        const botId = await this.selfId();
        overwrites.set(botId, { id: botId, type: MEMBER, allow: String(BOT_BITS), deny: "0" });
        const body = {
            name: spec.name,
            type: VOICE_CHANNEL,
            ...(spec.parentId ? { parent_id: spec.parentId } : {}),
            user_limit: spec.userLimit,
            permission_overwrites: [...overwrites.values()],
        };
        try {
            const created = (await this.rest.post(`/guilds/${guildId}/channels`, { body: { ...body, bitrate: spec.bitrateKbps * 1000 }, reason }));
            return { channelId: created.id };
        }
        catch {
            // Bitrates above 96 kbps need server boosts; retry with a safe bitrate.
            const created = (await this.rest.post(`/guilds/${guildId}/channels`, { body: { ...body, bitrate: DEFAULT_BITRATE }, reason }));
            return { channelId: created.id };
        }
    }
    async deleteChannel(channelId, reason) {
        await this.rest.delete(`/channels/${channelId}`, { reason });
    }
    async renameChannel(channelId, name, reason) {
        await this.rest.patch(`/channels/${channelId}`, { body: { name }, reason });
    }
    async setUserLimit(channelId, limit, reason) {
        await this.rest.patch(`/channels/${channelId}`, { body: { user_limit: limit }, reason });
    }
    async setLocked(guildId, channelId, locked, reason) {
        await this.toggleEveryone(guildId, channelId, CONNECT, locked, reason);
    }
    async setHidden(guildId, channelId, hidden, reason) {
        await this.toggleEveryone(guildId, channelId, VIEW, hidden, reason);
    }
    async setMemberAccess(channelId, userId, access, reason) {
        if (access === "CLEAR") {
            await this.rest.delete(`/channels/${channelId}/permissions/${userId}`, { reason });
            return;
        }
        const bits = String(VIEW | CONNECT);
        await this.rest.put(`/channels/${channelId}/permissions/${userId}`, {
            body: { type: MEMBER, allow: access === "PERMIT" ? bits : "0", deny: access === "REJECT" ? bits : "0" },
            reason,
        });
    }
    async setOwner(channelId, userId, reason) {
        await this.rest.put(`/channels/${channelId}/permissions/${userId}`, { body: { type: MEMBER, allow: String(OWNER_BITS), deny: "0" }, reason });
    }
    async moveMember(guildId, userId, channelId) {
        await this.rest.patch(`/guilds/${guildId}/members/${userId}`, { body: { channel_id: channelId ?? null } });
    }
    async memberVoiceChannel(guildId, userId) {
        try {
            const state = (await this.rest.get(`/guilds/${guildId}/voice-states/${userId}`));
            return state.channel_id ?? undefined;
        }
        catch {
            return undefined;
        }
    }
    async sendPanel(channelId, room) {
        const message = (await this.rest.post(`/channels/${channelId}/messages`, {
            body: {
                embeds: [{
                        title: "Voice room controls",
                        description: `<@${room.ownerId}> owns this room. The owner can use these buttons or \`/voice\`. If the owner leaves, anyone in the room can claim it.`,
                        color: 0x5865f2,
                    }],
                components: PANEL.map((buttons) => ({
                    type: 1,
                    components: buttons.map(([action, label, style]) => ({ type: 2, style, label, custom_id: `${VOICE_CUSTOM_ID.button}${action}:${room.id}` })),
                })),
                allowed_mentions: { parse: [] },
            },
        }));
        return { messageId: message.id };
    }
    async toggleEveryone(guildId, channelId, bit, deny, reason) {
        const current = (await this.channel(channelId)).permission_overwrites?.find((overwrite) => overwrite.id === guildId);
        const allow = BigInt(current?.allow ?? "0") & ~bit;
        const denied = deny ? BigInt(current?.deny ?? "0") | bit : BigInt(current?.deny ?? "0") & ~bit;
        await this.rest.put(`/channels/${channelId}/permissions/${guildId}`, { body: { type: ROLE, allow: String(allow), deny: String(denied) }, reason });
    }
    async channel(channelId) {
        return (await this.rest.get(`/channels/${channelId}`));
    }
    async selfId() {
        if (!this.botUserId)
            this.botUserId = (await this.rest.get("/users/@me")).id;
        return this.botUserId;
    }
}
//# sourceMappingURL=DiscordRestVoiceGateway.js.map