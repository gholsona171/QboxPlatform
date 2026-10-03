import type { VoiceHub, VoiceHubInput, VoiceRepository, VoiceRoom, VoiceRoomCreateData, VoiceRoomPatch, VoiceSettings, VoiceSettingsInput } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryVoiceRepository implements VoiceRepository {
    private readonly now;
    readonly settingsByGuild: Map<string, VoiceSettings>;
    readonly hubList: VoiceHub[];
    readonly roomList: VoiceRoom[];
    constructor(now?: () => Date);
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
//# sourceMappingURL=InMemoryVoiceRepository.d.ts.map