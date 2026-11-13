import type { VoiceActor, VoiceGateway, VoiceHub, VoiceHubInput, VoiceJoin, VoiceRepository, VoiceRoom, VoiceSettings, VoiceSettingsInput } from "./types.js";
export declare function defaultVoiceSettings(guildId: string): VoiceSettings;
/** Fills `{user}`, `{count}`, and `{game}` in a room name template. */
export declare function renderRoomName(template: string, values: {
    readonly user: string;
    readonly count: number;
    readonly game?: string | undefined;
}): string;
/** A room that became empty and when to delete it. */
export interface EmptyRoom {
    readonly room: VoiceRoom;
    readonly delaySeconds: number;
}
/**
 * Join-to-create voice rooms: hubs, room creation, owner controls, and
 * cleanup. Callers check `voice.manage` before hub and settings changes and
 * pass `elevated` actors for staff overrides.
 */
export declare class VoiceRoomService {
    private readonly repository;
    private readonly gateway?;
    private readonly creating;
    constructor(repository: VoiceRepository, gateway?: VoiceGateway | undefined);
    settings(guildId: string): Promise<VoiceSettings>;
    saveSettings(input: VoiceSettingsInput): Promise<VoiceSettings>;
    hubs(guildId: string): Promise<readonly VoiceHub[]>;
    createHub(guildId: string, input: VoiceHubInput): Promise<VoiceHub>;
    updateHub(guildId: string, id: string, input: VoiceHubInput): Promise<VoiceHub>;
    deleteHub(guildId: string, id: string): Promise<void>;
    rooms(guildId: string): Promise<readonly VoiceRoom[]>;
    room(guildId: string, id: string): Promise<VoiceRoom>;
    /** The room for a voice channel, for members using `/voice` inside it. */
    roomForChannel(channelId: string | undefined): Promise<VoiceRoom>;
    isRoomChannel(channelId: string): Promise<VoiceRoom | undefined>;
    /**
     * A member joined a voice channel. When it is a hub, creates their room (or
     * moves them to the room they already own) and returns it.
     */
    handleJoin(join: VoiceJoin): Promise<VoiceRoom | undefined>;
    /** Someone left a room channel and it is now empty. Returns how long to wait before deleting it. */
    roomEmptied(channelId: string): Promise<EmptyRoom | undefined>;
    /** Deletes a room's channel and record. */
    deleteRoom(guildId: string, id: string, reason: string): Promise<void>;
    /** The room's channel was deleted in Discord. */
    channelDeleted(channelId: string): Promise<void>;
    /**
     * Removes rooms left over from before a restart. `occupancy` returns how
     * many people are in a channel, or undefined when the channel is gone.
     */
    cleanup(occupancy: (room: VoiceRoom) => number | undefined): Promise<number>;
    rename(room: VoiceRoom, actor: VoiceActor, name: string): Promise<VoiceRoom>;
    limit(room: VoiceRoom, actor: VoiceActor, limit: number): Promise<void>;
    lock(room: VoiceRoom, actor: VoiceActor, locked: boolean): Promise<VoiceRoom>;
    hide(room: VoiceRoom, actor: VoiceActor, hidden: boolean): Promise<VoiceRoom>;
    /** Lets a member see and join the room even when it is locked or hidden. */
    permit(room: VoiceRoom, actor: VoiceActor, userId: string): Promise<void>;
    /** Blocks a member from the room and disconnects them if they are in it. */
    reject(room: VoiceRoom, actor: VoiceActor, userId: string): Promise<void>;
    /** Disconnects a member from the room. They can rejoin unless rejected or the room is locked. */
    kick(room: VoiceRoom, actor: VoiceActor, userId: string): Promise<void>;
    /** Makes another member in the room its owner. */
    transfer(room: VoiceRoom, actor: VoiceActor, userId: string): Promise<VoiceRoom>;
    /** Takes over a room whose owner left. */
    claim(room: VoiceRoom, actor: VoiceActor): Promise<VoiceRoom>;
    /** Posts a new control panel in the room. */
    resendPanel(room: VoiceRoom, actor: VoiceActor): Promise<void>;
    private create;
    private changeOwner;
    private hub;
    private requireFreeChannel;
    private requireOwner;
    private requireGateway;
}
//# sourceMappingURL=VoiceRoomService.d.ts.map