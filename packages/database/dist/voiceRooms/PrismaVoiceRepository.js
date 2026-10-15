import { VoiceError, } from "@qbox/voice-rooms";
/** PostgreSQL voice room settings, hubs, and active rooms. `guildId` is the Discord guild ID. */
export class PrismaVoiceRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async getSettings(guildId) {
        const row = await this.client.voiceSettings.findUnique({ where: { guildId } });
        return row ? mapSettings(row) : undefined;
    }
    async saveSettings(input) {
        const data = { enabled: input.enabled, controlPanel: input.controlPanel, allowClaim: input.allowClaim };
        const existing = await this.client.voiceSettings.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
        if (!existing) {
            if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
                throw new VoiceError("CONFLICT", "Voice room settings changed since they were loaded.", { currentRevision: 0 });
            return mapSettings(await this.client.voiceSettings.create({ data: { guildId: input.guildId, ...data } }));
        }
        const result = await this.client.voiceSettings.updateMany({
            where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
            data: { ...data, revision: { increment: 1 } },
        });
        if (result.count === 0)
            throw new VoiceError("CONFLICT", "Voice room settings changed since they were loaded.", { currentRevision: existing.revision });
        return mapSettings(await this.client.voiceSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
    }
    async listHubs(guildId) {
        return (await this.client.voiceHub.findMany({ where: { guildId }, orderBy: { createdAt: "asc" } })).map(mapHub);
    }
    async getHub(guildId, id) {
        if (!isUuid(id))
            return undefined;
        const row = await this.client.voiceHub.findFirst({ where: { guildId, id } });
        return row ? mapHub(row) : undefined;
    }
    async findHubByChannel(guildId, channelId) {
        const row = await this.client.voiceHub.findUnique({ where: { guildId_channelId: { guildId, channelId } } });
        return row ? mapHub(row) : undefined;
    }
    async createHub(guildId, input) {
        return mapHub(await this.client.voiceHub.create({ data: { guildId, ...hubData(input) } }));
    }
    async updateHub(guildId, id, input) {
        const result = await this.client.voiceHub.updateMany({ where: { guildId, id }, data: hubData(input) });
        if (result.count === 0)
            throw new VoiceError("NOT_FOUND", "That hub no longer exists.");
        return mapHub(await this.client.voiceHub.findUniqueOrThrow({ where: { id } }));
    }
    async deleteHub(guildId, id) {
        await this.client.voiceHub.deleteMany({ where: { guildId, id } });
    }
    async listRooms(guildId) {
        return (await this.client.voiceRoom.findMany({ where: guildId ? { guildId } : {}, orderBy: { createdAt: "asc" }, take: 1000 })).map(mapRoom);
    }
    async getRoom(guildId, id) {
        if (!isUuid(id))
            return undefined;
        const row = await this.client.voiceRoom.findFirst({ where: { guildId, id } });
        return row ? mapRoom(row) : undefined;
    }
    async findRoomByChannel(channelId) {
        const row = await this.client.voiceRoom.findUnique({ where: { channelId } });
        return row ? mapRoom(row) : undefined;
    }
    async findRoomByOwner(guildId, ownerId) {
        const row = await this.client.voiceRoom.findFirst({ where: { guildId, ownerId }, orderBy: { createdAt: "desc" } });
        return row ? mapRoom(row) : undefined;
    }
    countRooms(guildId, hubId) {
        return this.client.voiceRoom.count({ where: { guildId, hubId } });
    }
    async createRoom(input) {
        return mapRoom(await this.client.voiceRoom.create({ data: { ...input } }));
    }
    async updateRoom(id, patch) {
        const data = {};
        if (patch.ownerId !== undefined)
            data.ownerId = patch.ownerId;
        if (patch.name !== undefined)
            data.name = patch.name;
        if (patch.locked !== undefined)
            data.locked = patch.locked;
        if (patch.hidden !== undefined)
            data.hidden = patch.hidden;
        if (patch.panelMessageId !== undefined)
            data.panelMessageId = patch.panelMessageId;
        try {
            return mapRoom(await this.client.voiceRoom.update({ where: { id }, data }));
        }
        catch {
            throw new VoiceError("NOT_FOUND", "That room no longer exists.");
        }
    }
    async deleteRoom(id) {
        await this.client.voiceRoom.deleteMany({ where: { id } });
    }
}
function hubData(input) {
    return {
        name: input.name,
        enabled: input.enabled,
        channelId: input.channelId,
        categoryId: input.categoryId ?? null,
        nameTemplate: input.nameTemplate,
        userLimit: input.userLimit,
        bitrateKbps: input.bitrateKbps,
        privateByDefault: input.privateByDefault,
        deleteDelaySeconds: input.deleteDelaySeconds,
        allowedRoleIds: [...input.allowedRoleIds],
    };
}
function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
function mapSettings(row) {
    return { guildId: row.guildId, enabled: row.enabled, controlPanel: row.controlPanel, allowClaim: row.allowClaim, revision: row.revision };
}
function mapHub(row) {
    return {
        id: row.id,
        guildId: row.guildId,
        name: row.name,
        enabled: row.enabled,
        channelId: row.channelId,
        ...(row.categoryId ? { categoryId: row.categoryId } : {}),
        nameTemplate: row.nameTemplate,
        userLimit: row.userLimit,
        bitrateKbps: row.bitrateKbps,
        privateByDefault: row.privateByDefault,
        deleteDelaySeconds: row.deleteDelaySeconds,
        allowedRoleIds: row.allowedRoleIds,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
function mapRoom(row) {
    return {
        id: row.id,
        guildId: row.guildId,
        ...(row.hubId ? { hubId: row.hubId } : {}),
        channelId: row.channelId,
        ownerId: row.ownerId,
        name: row.name,
        locked: row.locked,
        hidden: row.hidden,
        ...(row.panelMessageId ? { panelMessageId: row.panelMessageId } : {}),
        createdAt: row.createdAt,
    };
}
//# sourceMappingURL=PrismaVoiceRepository.js.map