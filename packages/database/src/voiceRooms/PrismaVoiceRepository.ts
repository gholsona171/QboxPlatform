import {
  VoiceError,
  type VoiceHub,
  type VoiceHubInput,
  type VoiceRepository,
  type VoiceRoom,
  type VoiceRoomCreateData,
  type VoiceRoomPatch,
  type VoiceSettings,
  type VoiceSettingsInput,
} from "@qbox/voice-rooms";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<PrismaClient, "voiceSettings" | "voiceHub" | "voiceRoom">;
type SettingsRow = Prisma.VoiceSettingsGetPayload<object>;
type HubRow = Prisma.VoiceHubGetPayload<object>;
type RoomRow = Prisma.VoiceRoomGetPayload<object>;

/** PostgreSQL voice room settings, hubs, and active rooms. `guildId` is the Discord guild ID. */
export class PrismaVoiceRepository implements VoiceRepository {
  public constructor(private readonly client: Client) {}

  public async getSettings(guildId: string): Promise<VoiceSettings | undefined> {
    const row = await this.client.voiceSettings.findUnique({ where: { guildId } });
    return row ? mapSettings(row) : undefined;
  }

  public async saveSettings(input: VoiceSettingsInput): Promise<VoiceSettings> {
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
    if (result.count === 0) throw new VoiceError("CONFLICT", "Voice room settings changed since they were loaded.", { currentRevision: existing.revision });
    return mapSettings(await this.client.voiceSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
  }

  public async listHubs(guildId: string): Promise<readonly VoiceHub[]> {
    return (await this.client.voiceHub.findMany({ where: { guildId }, orderBy: { createdAt: "asc" } })).map(mapHub);
  }

  public async getHub(guildId: string, id: string): Promise<VoiceHub | undefined> {
    if (!isUuid(id)) return undefined;
    const row = await this.client.voiceHub.findFirst({ where: { guildId, id } });
    return row ? mapHub(row) : undefined;
  }

  public async findHubByChannel(guildId: string, channelId: string): Promise<VoiceHub | undefined> {
    const row = await this.client.voiceHub.findUnique({ where: { guildId_channelId: { guildId, channelId } } });
    return row ? mapHub(row) : undefined;
  }

  public async createHub(guildId: string, input: VoiceHubInput): Promise<VoiceHub> {
    return mapHub(await this.client.voiceHub.create({ data: { guildId, ...hubData(input) } }));
  }

  public async updateHub(guildId: string, id: string, input: VoiceHubInput): Promise<VoiceHub> {
    const result = await this.client.voiceHub.updateMany({ where: { guildId, id }, data: hubData(input) });
    if (result.count === 0) throw new VoiceError("NOT_FOUND", "That hub no longer exists.");
    return mapHub(await this.client.voiceHub.findUniqueOrThrow({ where: { id } }));
  }

  public async deleteHub(guildId: string, id: string): Promise<void> {
    await this.client.voiceHub.deleteMany({ where: { guildId, id } });
  }

  public async listRooms(guildId?: string): Promise<readonly VoiceRoom[]> {
    return (await this.client.voiceRoom.findMany({ where: guildId ? { guildId } : {}, orderBy: { createdAt: "asc" }, take: 1000 })).map(mapRoom);
  }

  public async getRoom(guildId: string, id: string): Promise<VoiceRoom | undefined> {
    if (!isUuid(id)) return undefined;
    const row = await this.client.voiceRoom.findFirst({ where: { guildId, id } });
    return row ? mapRoom(row) : undefined;
  }

  public async findRoomByChannel(channelId: string): Promise<VoiceRoom | undefined> {
    const row = await this.client.voiceRoom.findUnique({ where: { channelId } });
    return row ? mapRoom(row) : undefined;
  }

  public async findRoomByOwner(guildId: string, ownerId: string): Promise<VoiceRoom | undefined> {
    const row = await this.client.voiceRoom.findFirst({ where: { guildId, ownerId }, orderBy: { createdAt: "desc" } });
    return row ? mapRoom(row) : undefined;
  }

  public countRooms(guildId: string, hubId: string): Promise<number> {
    return this.client.voiceRoom.count({ where: { guildId, hubId } });
  }

  public async createRoom(input: VoiceRoomCreateData): Promise<VoiceRoom> {
    return mapRoom(await this.client.voiceRoom.create({ data: { ...input } }));
  }

  public async updateRoom(id: string, patch: VoiceRoomPatch): Promise<VoiceRoom> {
    const data: Prisma.VoiceRoomUpdateInput = {};
    if (patch.ownerId !== undefined) data.ownerId = patch.ownerId;
    if (patch.name !== undefined) data.name = patch.name;
    if (patch.locked !== undefined) data.locked = patch.locked;
    if (patch.hidden !== undefined) data.hidden = patch.hidden;
    if (patch.panelMessageId !== undefined) data.panelMessageId = patch.panelMessageId;
    try {
      return mapRoom(await this.client.voiceRoom.update({ where: { id }, data }));
    } catch {
      throw new VoiceError("NOT_FOUND", "That room no longer exists.");
    }
  }

  public async deleteRoom(id: string): Promise<void> {
    await this.client.voiceRoom.deleteMany({ where: { id } });
  }
}

function hubData(input: VoiceHubInput) {
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function mapSettings(row: SettingsRow): VoiceSettings {
  return { guildId: row.guildId, enabled: row.enabled, controlPanel: row.controlPanel, allowClaim: row.allowClaim, revision: row.revision };
}

function mapHub(row: HubRow): VoiceHub {
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

function mapRoom(row: RoomRow): VoiceRoom {
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
