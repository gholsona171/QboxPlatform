import { type VoiceHub, type VoiceHubInput, type VoiceRepository, type VoiceRoom, type VoiceRoomCreateData, type VoiceRoomPatch, type VoiceSettings, type VoiceSettingsInput } from "@qbox/voice-rooms";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "voiceSettings" | "voiceHub" | "voiceRoom">;
/** PostgreSQL voice room settings, hubs, and active rooms. `guildId` is the Discord guild ID. */
export declare class PrismaVoiceRepository implements VoiceRepository {
    private readonly client;
    constructor(client: Client);
    getSettings(guildId: string): Promise<VoiceSettings | undefined>;
    saveSettings(input: VoiceSettingsInput): Promise<VoiceSettings>;
    listHubs(guildId: string): Promise<readonly VoiceHub[]>;
    getHub(guildId: string, id: string): Promise<VoiceHub | undefined>;
    findHubByChannel(guildId: string, channelId: string): Promise<VoiceHub | undefined>;
    createHub(guildId: string, input: VoiceHubInput): Promise<VoiceHub>;
    updateHub(guildId: string, id: string, input: VoiceHubInput): Promise<VoiceHub>;
    deleteHub(guildId: string, id: string): Promise<void>;
    listRooms(guildId?: string): Promise<readonly VoiceRoom[]>;
    getRoom(guildId: string, id: string): Promise<VoiceRoom | undefined>;
    findRoomByChannel(channelId: string): Promise<VoiceRoom | undefined>;
    findRoomByOwner(guildId: string, ownerId: string): Promise<VoiceRoom | undefined>;
    countRooms(guildId: string, hubId: string): Promise<number>;
    createRoom(input: VoiceRoomCreateData): Promise<VoiceRoom>;
    updateRoom(id: string, patch: VoiceRoomPatch): Promise<VoiceRoom>;
    deleteRoom(id: string): Promise<void>;
}
export {};
//# sourceMappingURL=PrismaVoiceRepository.d.ts.map