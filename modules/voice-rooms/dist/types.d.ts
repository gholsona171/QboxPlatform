/** Most hubs a server can have. */
export declare const MAX_HUBS = 20;
/** Custom ID prefixes for control panel buttons, menus, and forms. */
export declare const VOICE_CUSTOM_ID: {
    readonly prefix: "qbox:voice:";
    readonly button: "qbox:voice:button:";
    readonly pick: "qbox:voice:pick:";
    readonly form: "qbox:voice:form:";
};
/** A join-to-create channel: joining it creates a new room for the member. */
export interface VoiceHub {
    readonly id: string;
    readonly guildId: string;
    readonly name: string;
    readonly enabled: boolean;
    /** Voice channel members join to get a room. */
    readonly channelId: string;
    /** Category for new rooms. Defaults to the hub's category. */
    readonly categoryId?: string | undefined;
    /** Supports `{user}`, `{count}`, and `{game}`. */
    readonly nameTemplate: string;
    /** 0 = no limit. */
    readonly userLimit: number;
    /** Kilobits per second (8-384; above 96 needs server boosts). */
    readonly bitrateKbps: number;
    /** Rooms start hidden and locked; only the owner and permitted members can see and join. */
    readonly privateByDefault: boolean;
    /** Seconds an empty room waits before it is deleted. */
    readonly deleteDelaySeconds: number;
    /** When set, only members with one of these roles can use the hub. */
    readonly allowedRoleIds: readonly string[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export type VoiceHubInput = Omit<VoiceHub, "id" | "guildId" | "createdAt" | "updatedAt">;
export interface VoiceRoom {
    readonly id: string;
    readonly guildId: string;
    readonly hubId?: string | undefined;
    readonly channelId: string;
    readonly ownerId: string;
    readonly name: string;
    readonly locked: boolean;
    readonly hidden: boolean;
    readonly panelMessageId?: string | undefined;
    readonly createdAt: Date;
}
export interface VoiceRoomCreateData {
    readonly guildId: string;
    readonly hubId: string;
    readonly channelId: string;
    readonly ownerId: string;
    readonly name: string;
    readonly locked: boolean;
    readonly hidden: boolean;
}
export interface VoiceRoomPatch {
    readonly ownerId?: string;
    readonly name?: string;
    readonly locked?: boolean;
    readonly hidden?: boolean;
    readonly panelMessageId?: string | null;
}
export interface VoiceSettings {
    readonly guildId: string;
    readonly enabled: boolean;
    /** Post the control panel in each new room's text chat. */
    readonly controlPanel: boolean;
    /** Let someone in the room claim it after the owner leaves. */
    readonly allowClaim: boolean;
    readonly revision: number;
}
export interface VoiceSettingsInput extends Omit<VoiceSettings, "revision"> {
    readonly expectedRevision?: number | undefined;
}
export interface VoiceRepository {
    getSettings(guildId: string): Promise<VoiceSettings | undefined>;
    saveSettings(input: VoiceSettingsInput): Promise<VoiceSettings>;
    listHubs(guildId: string): Promise<readonly VoiceHub[]>;
    getHub(guildId: string, id: string): Promise<VoiceHub | undefined>;
    findHubByChannel(guildId: string, channelId: string): Promise<VoiceHub | undefined>;
    createHub(guildId: string, input: VoiceHubInput): Promise<VoiceHub>;
    updateHub(guildId: string, id: string, input: VoiceHubInput): Promise<VoiceHub>;
    deleteHub(guildId: string, id: string): Promise<void>;
    /** Rooms in one server, or in every server when `guildId` is omitted. */
    listRooms(guildId?: string): Promise<readonly VoiceRoom[]>;
    getRoom(guildId: string, id: string): Promise<VoiceRoom | undefined>;
    findRoomByChannel(channelId: string): Promise<VoiceRoom | undefined>;
    findRoomByOwner(guildId: string, ownerId: string): Promise<VoiceRoom | undefined>;
    countRooms(guildId: string, hubId: string): Promise<number>;
    createRoom(input: VoiceRoomCreateData): Promise<VoiceRoom>;
    updateRoom(id: string, patch: VoiceRoomPatch): Promise<VoiceRoom>;
    deleteRoom(id: string): Promise<void>;
}
export interface VoiceChannelSpec {
    readonly name: string;
    readonly parentId?: string | undefined;
    readonly userLimit: number;
    readonly bitrateKbps: number;
    readonly ownerId: string;
    /** Hidden and locked for everyone but the owner. */
    readonly private: boolean;
}
/** Access a member or @everyone has to a room. */
export type VoiceAccess = "PERMIT" | "REJECT" | "CLEAR";
/** Discord operations voice rooms need. */
export interface VoiceGateway {
    /** Parent category of a channel. */
    channelParentId(channelId: string): Promise<string | undefined>;
    createRoomChannel(guildId: string, spec: VoiceChannelSpec, reason: string): Promise<{
        readonly channelId: string;
    }>;
    deleteChannel(channelId: string, reason: string): Promise<void>;
    renameChannel(channelId: string, name: string, reason: string): Promise<void>;
    setUserLimit(channelId: string, limit: number, reason: string): Promise<void>;
    /** Denies or allows Connect for @everyone. */
    setLocked(guildId: string, channelId: string, locked: boolean, reason: string): Promise<void>;
    /** Denies or allows View Channel for @everyone. */
    setHidden(guildId: string, channelId: string, hidden: boolean, reason: string): Promise<void>;
    /** Sets a member's own overwrite: permit (view + connect), reject (deny both), or clear. */
    setMemberAccess(channelId: string, userId: string, access: VoiceAccess, reason: string): Promise<void>;
    /** Gives a member the owner overwrite (view, connect, speak, stream, priority speaker). */
    setOwner(channelId: string, userId: string, reason: string): Promise<void>;
    /** Moves a member into a voice channel, or disconnects them with `undefined`. */
    moveMember(guildId: string, userId: string, channelId: string | undefined): Promise<void>;
    /** Voice channel the member is in, if any. */
    memberVoiceChannel(guildId: string, userId: string): Promise<string | undefined>;
    /** Posts the control panel in the room's text chat. */
    sendPanel(channelId: string, room: VoiceRoom): Promise<{
        readonly messageId: string;
    }>;
}
/** Who is changing a room. `elevated` members hold `voice.manage`. */
export interface VoiceActor {
    readonly userId: string;
    readonly displayName: string;
    readonly elevated: boolean;
}
/** A member who joined a hub channel. */
export interface VoiceJoin {
    readonly guildId: string;
    readonly channelId: string;
    readonly userId: string;
    readonly displayName: string;
    readonly roleIds: readonly string[];
    /** Game or activity name, for `{game}`. */
    readonly activity?: string | undefined;
}
//# sourceMappingURL=types.d.ts.map