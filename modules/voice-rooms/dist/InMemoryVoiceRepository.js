import { randomUUID } from "node:crypto";
import { defaultVoiceSettings } from "./VoiceRoomService.js";
import { VoiceError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryVoiceRepository {
    now;
    settingsByGuild = new Map();
    hubList = [];
    roomList = [];
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async getSettings(guildId) {
        return this.settingsByGuild.get(guildId);
    }
    async saveSettings(input) {
        const current = this.settingsByGuild.get(input.guildId) ?? defaultVoiceSettings(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new VoiceError("CONFLICT", "Voice room settings changed since they were loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const saved = { ...rest, revision: current.revision + 1 };
        this.settingsByGuild.set(input.guildId, saved);
        return saved;
    }
    async listHubs(guildId) {
        return this.hubList.filter((hub) => hub.guildId === guildId);
    }
    async getHub(guildId, id) {
        return this.hubList.find((hub) => hub.guildId === guildId && hub.id === id);
    }
    async findHubByChannel(guildId, channelId) {
        return this.hubList.find((hub) => hub.guildId === guildId && hub.channelId === channelId);
    }
    async createHub(guildId, input) {
        const hub = { ...input, id: randomUUID(), guildId, createdAt: this.now(), updatedAt: this.now() };
        this.hubList.push(hub);
        return hub;
    }
    async updateHub(guildId, id, input) {
        const index = this.hubList.findIndex((hub) => hub.guildId === guildId && hub.id === id);
        const current = this.hubList[index];
        if (!current)
            throw new VoiceError("NOT_FOUND", "That hub no longer exists.");
        const { categoryId, ...rest } = input;
        const updated = { id, guildId, createdAt: current.createdAt, ...rest, ...(categoryId ? { categoryId } : {}), updatedAt: this.now() };
        this.hubList[index] = updated;
        return updated;
    }
    async deleteHub(guildId, id) {
        const index = this.hubList.findIndex((hub) => hub.guildId === guildId && hub.id === id);
        if (index >= 0)
            this.hubList.splice(index, 1);
        for (const [roomIndex, room] of this.roomList.entries())
            if (room.hubId === id) {
                const { hubId: _hub, ...rest } = room;
                this.roomList[roomIndex] = rest;
            }
    }
    async listRooms(guildId) {
        return this.roomList.filter((room) => !guildId || room.guildId === guildId);
    }
    async getRoom(guildId, id) {
        return this.roomList.find((room) => room.guildId === guildId && room.id === id);
    }
    async findRoomByChannel(channelId) {
        return this.roomList.find((room) => room.channelId === channelId);
    }
    async findRoomByOwner(guildId, ownerId) {
        return this.roomList.find((room) => room.guildId === guildId && room.ownerId === ownerId);
    }
    async countRooms(guildId, hubId) {
        return this.roomList.filter((room) => room.guildId === guildId && room.hubId === hubId).length;
    }
    async createRoom(input) {
        const room = { ...input, id: randomUUID(), createdAt: this.now() };
        this.roomList.push(room);
        return room;
    }
    async updateRoom(id, patch) {
        const index = this.roomList.findIndex((room) => room.id === id);
        const current = this.roomList[index];
        if (!current)
            throw new VoiceError("NOT_FOUND", "That room no longer exists.");
        const next = { ...current };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        this.roomList[index] = updated;
        return updated;
    }
    async deleteRoom(id) {
        const index = this.roomList.findIndex((room) => room.id === id);
        if (index >= 0)
            this.roomList.splice(index, 1);
    }
}
//# sourceMappingURL=InMemoryVoiceRepository.js.map