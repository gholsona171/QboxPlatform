import { MAX_HUBS } from "./types.js";
import { VoiceError, invalid, requireRange, requireRoomName, requireSnowflake, validateHub } from "./validation.js";
export function defaultVoiceSettings(guildId) {
    return { guildId, enabled: true, controlPanel: true, allowClaim: true, revision: 0 };
}
/** Fills `{user}`, `{count}`, and `{game}` in a room name template. */
export function renderRoomName(template, values) {
    const name = template
        .replaceAll("{user}", values.user)
        .replaceAll("{count}", String(values.count))
        .replaceAll("{game}", values.game?.trim() || "Voice")
        .trim();
    return (name || `Room ${values.count}`).slice(0, 100);
}
/**
 * Join-to-create voice rooms: hubs, room creation, owner controls, and
 * cleanup. Callers check `voice.manage` before hub and settings changes and
 * pass `elevated` actors for staff overrides.
 */
export class VoiceRoomService {
    repository;
    gateway;
    creating = new Set();
    constructor(repository, gateway) {
        this.repository = repository;
        this.gateway = gateway;
    }
    async settings(guildId) {
        requireSnowflake("guildId", guildId);
        return (await this.repository.getSettings(guildId)) ?? defaultVoiceSettings(guildId);
    }
    async saveSettings(input) {
        requireSnowflake("guildId", input.guildId);
        return this.repository.saveSettings(input);
    }
    async hubs(guildId) {
        requireSnowflake("guildId", guildId);
        return this.repository.listHubs(guildId);
    }
    async createHub(guildId, input) {
        requireSnowflake("guildId", guildId);
        validateHub(input);
        const hubs = await this.repository.listHubs(guildId);
        if (hubs.length >= MAX_HUBS)
            throw new VoiceError("LIMIT_REACHED", `You can have at most ${MAX_HUBS} hubs.`);
        await this.requireFreeChannel(guildId, input.channelId);
        return this.repository.createHub(guildId, clean(input));
    }
    async updateHub(guildId, id, input) {
        validateHub(input);
        await this.hub(guildId, id);
        await this.requireFreeChannel(guildId, input.channelId, id);
        return this.repository.updateHub(guildId, id, clean(input));
    }
    async deleteHub(guildId, id) {
        await this.hub(guildId, id);
        await this.repository.deleteHub(guildId, id);
    }
    async rooms(guildId) {
        requireSnowflake("guildId", guildId);
        return this.repository.listRooms(guildId);
    }
    async room(guildId, id) {
        const room = await this.repository.getRoom(guildId, id);
        if (!room)
            throw new VoiceError("NOT_FOUND", "That room no longer exists.");
        return room;
    }
    /** The room for a voice channel, for members using `/voice` inside it. */
    async roomForChannel(channelId) {
        const room = channelId ? await this.repository.findRoomByChannel(channelId) : undefined;
        if (!room)
            throw new VoiceError("NOT_FOUND", "Join your voice room first, then use this command.");
        return room;
    }
    isRoomChannel(channelId) {
        return this.repository.findRoomByChannel(channelId);
    }
    /**
     * A member joined a voice channel. When it is a hub, creates their room (or
     * moves them to the room they already own) and returns it.
     */
    async handleJoin(join) {
        const settings = await this.settings(join.guildId);
        if (!settings.enabled)
            return undefined;
        const hub = await this.repository.findHubByChannel(join.guildId, join.channelId);
        if (!hub?.enabled)
            return undefined;
        const gateway = this.requireGateway();
        if (hub.allowedRoleIds.length > 0 && !join.roleIds.some((roleId) => hub.allowedRoleIds.includes(roleId))) {
            await gateway.moveMember(join.guildId, join.userId, undefined).catch(() => undefined);
            return undefined;
        }
        const key = `${join.guildId}:${join.userId}`;
        if (this.creating.has(key))
            return undefined;
        this.creating.add(key);
        try {
            const existing = await this.repository.findRoomByOwner(join.guildId, join.userId);
            if (existing) {
                try {
                    await gateway.moveMember(join.guildId, join.userId, existing.channelId);
                    return existing;
                }
                catch {
                    await this.repository.deleteRoom(existing.id);
                }
            }
            return await this.create(hub, join, settings);
        }
        finally {
            this.creating.delete(key);
        }
    }
    /** Someone left a room channel and it is now empty. Returns how long to wait before deleting it. */
    async roomEmptied(channelId) {
        const room = await this.repository.findRoomByChannel(channelId);
        if (!room)
            return undefined;
        const hub = room.hubId ? await this.repository.getHub(room.guildId, room.hubId) : undefined;
        return { room, delaySeconds: hub?.deleteDelaySeconds ?? 0 };
    }
    /** Deletes a room's channel and record. */
    async deleteRoom(guildId, id, reason) {
        const room = await this.room(guildId, id);
        await this.requireGateway().deleteChannel(room.channelId, reason.slice(0, 512)).catch(() => undefined);
        await this.repository.deleteRoom(room.id);
    }
    /** The room's channel was deleted in Discord. */
    async channelDeleted(channelId) {
        const room = await this.repository.findRoomByChannel(channelId);
        if (room)
            await this.repository.deleteRoom(room.id);
    }
    /**
     * Removes rooms left over from before a restart. `occupancy` returns how
     * many people are in a channel, or undefined when the channel is gone.
     */
    async cleanup(occupancy) {
        let removed = 0;
        for (const room of await this.repository.listRooms()) {
            const people = occupancy(room);
            if (people !== undefined && people > 0)
                continue;
            if (people === 0 && this.gateway)
                await this.gateway.deleteChannel(room.channelId, "Empty voice room").catch(() => undefined);
            await this.repository.deleteRoom(room.id);
            removed += 1;
        }
        return removed;
    }
    async rename(room, actor, name) {
        this.requireOwner(room, actor);
        const trimmed = requireRoomName(name);
        await this.requireGateway().renameChannel(room.channelId, trimmed, audit(actor, "renamed the room"));
        return this.repository.updateRoom(room.id, { name: trimmed });
    }
    async limit(room, actor, limit) {
        this.requireOwner(room, actor);
        requireRange("User limit", limit, 0, 99);
        await this.requireGateway().setUserLimit(room.channelId, limit, audit(actor, "changed the user limit"));
    }
    async lock(room, actor, locked) {
        this.requireOwner(room, actor);
        await this.requireGateway().setLocked(room.guildId, room.channelId, locked, audit(actor, locked ? "locked the room" : "unlocked the room"));
        return this.repository.updateRoom(room.id, { locked });
    }
    async hide(room, actor, hidden) {
        this.requireOwner(room, actor);
        await this.requireGateway().setHidden(room.guildId, room.channelId, hidden, audit(actor, hidden ? "hid the room" : "unhid the room"));
        return this.repository.updateRoom(room.id, { hidden });
    }
    /** Lets a member see and join the room even when it is locked or hidden. */
    async permit(room, actor, userId) {
        this.requireOwner(room, actor);
        requireSnowflake("Member", userId);
        if (userId === room.ownerId)
            invalid("You already own this room.");
        await this.requireGateway().setMemberAccess(room.channelId, userId, "PERMIT", audit(actor, "permitted a member"));
    }
    /** Blocks a member from the room and disconnects them if they are in it. */
    async reject(room, actor, userId) {
        this.requireOwner(room, actor);
        requireSnowflake("Member", userId);
        if (userId === room.ownerId || userId === actor.userId)
            invalid("You can't reject yourself or the owner.");
        const gateway = this.requireGateway();
        await gateway.setMemberAccess(room.channelId, userId, "REJECT", audit(actor, "rejected a member"));
        if ((await gateway.memberVoiceChannel(room.guildId, userId)) === room.channelId)
            await gateway.moveMember(room.guildId, userId, undefined);
    }
    /** Disconnects a member from the room. They can rejoin unless rejected or the room is locked. */
    async kick(room, actor, userId) {
        this.requireOwner(room, actor);
        requireSnowflake("Member", userId);
        if (userId === room.ownerId || userId === actor.userId)
            invalid("You can't kick yourself or the owner.");
        const gateway = this.requireGateway();
        if ((await gateway.memberVoiceChannel(room.guildId, userId)) !== room.channelId)
            throw new VoiceError("INVALID_STATE", "That member is not in this room.");
        await gateway.moveMember(room.guildId, userId, undefined);
    }
    /** Makes another member in the room its owner. */
    async transfer(room, actor, userId) {
        this.requireOwner(room, actor);
        requireSnowflake("Member", userId);
        if (userId === room.ownerId)
            invalid("That member already owns this room.");
        if ((await this.requireGateway().memberVoiceChannel(room.guildId, userId)) !== room.channelId)
            throw new VoiceError("INVALID_STATE", "The new owner must be in the room.");
        return this.changeOwner(room, userId, audit(actor, "transferred ownership"));
    }
    /** Takes over a room whose owner left. */
    async claim(room, actor) {
        if (room.ownerId === actor.userId)
            throw new VoiceError("INVALID_STATE", "You already own this room.");
        const settings = await this.settings(room.guildId);
        if (!settings.allowClaim && !actor.elevated)
            throw new VoiceError("FORBIDDEN", "Claiming rooms is turned off on this server.");
        const gateway = this.requireGateway();
        if ((await gateway.memberVoiceChannel(room.guildId, actor.userId)) !== room.channelId)
            throw new VoiceError("INVALID_STATE", "Join the room first to claim it.");
        if ((await gateway.memberVoiceChannel(room.guildId, room.ownerId)) === room.channelId)
            throw new VoiceError("INVALID_STATE", "The owner is still in the room.");
        return this.changeOwner(room, actor.userId, audit(actor, "claimed the room"));
    }
    /** Posts a new control panel in the room. */
    async resendPanel(room, actor) {
        this.requireOwner(room, actor);
        const panel = await this.requireGateway().sendPanel(room.channelId, room);
        await this.repository.updateRoom(room.id, { panelMessageId: panel.messageId });
    }
    async create(hub, join, settings) {
        const gateway = this.requireGateway();
        const count = (await this.repository.countRooms(join.guildId, hub.id)) + 1;
        const name = renderRoomName(hub.nameTemplate, { user: join.displayName, count, game: join.activity });
        const parentId = hub.categoryId ?? (await gateway.channelParentId(hub.channelId).catch(() => undefined));
        const { channelId } = await gateway.createRoomChannel(join.guildId, { name, parentId, userLimit: hub.userLimit, bitrateKbps: hub.bitrateKbps, ownerId: join.userId, private: hub.privateByDefault }, `Voice room for ${join.displayName}`.slice(0, 512));
        const room = await this.repository.createRoom({
            guildId: join.guildId,
            hubId: hub.id,
            channelId,
            ownerId: join.userId,
            name,
            locked: hub.privateByDefault,
            hidden: hub.privateByDefault,
        });
        try {
            await gateway.moveMember(join.guildId, join.userId, channelId);
        }
        catch {
            await gateway.deleteChannel(channelId, "Owner left before the room was ready").catch(() => undefined);
            await this.repository.deleteRoom(room.id);
            return undefined;
        }
        if (!settings.controlPanel)
            return room;
        const panel = await gateway.sendPanel(channelId, room).catch(() => undefined);
        return panel ? this.repository.updateRoom(room.id, { panelMessageId: panel.messageId }) : room;
    }
    async changeOwner(room, userId, reason) {
        const gateway = this.requireGateway();
        await gateway.setOwner(room.channelId, userId, reason);
        await gateway.setMemberAccess(room.channelId, room.ownerId, "CLEAR", reason).catch(() => undefined);
        return this.repository.updateRoom(room.id, { ownerId: userId });
    }
    async hub(guildId, id) {
        requireSnowflake("guildId", guildId);
        const hub = await this.repository.getHub(guildId, id);
        if (!hub)
            throw new VoiceError("NOT_FOUND", "That hub no longer exists.");
        return hub;
    }
    async requireFreeChannel(guildId, channelId, hubId) {
        const existing = await this.repository.findHubByChannel(guildId, channelId);
        if (existing && existing.id !== hubId)
            invalid("That channel is already a hub.");
        if (await this.repository.findRoomByChannel(channelId))
            invalid("That channel is a voice room, not a hub channel.");
    }
    requireOwner(room, actor) {
        if (room.ownerId !== actor.userId && !actor.elevated)
            throw new VoiceError("FORBIDDEN", "Only the room owner can do that.");
    }
    requireGateway() {
        if (!this.gateway)
            throw new VoiceError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
        return this.gateway;
    }
}
function clean(input) {
    return { ...input, name: input.name.trim(), nameTemplate: input.nameTemplate.trim(), allowedRoleIds: [...input.allowedRoleIds] };
}
function audit(actor, action) {
    return `${actor.displayName} ${action}`.slice(0, 512);
}
//# sourceMappingURL=VoiceRoomService.js.map