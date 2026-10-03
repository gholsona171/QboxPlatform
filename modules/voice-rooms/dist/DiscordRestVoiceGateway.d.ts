import { type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { VoiceAccess, VoiceChannelSpec, VoiceGateway, VoiceRoom } from "./types.js";
/** Voice room channels and member moves through the Discord REST API (v10). */
export declare class DiscordRestVoiceGateway implements VoiceGateway {
    private readonly rest;
    private botUserId;
    constructor(rest: DiscordRestClient);
    channelParentId(channelId: string): Promise<string | undefined>;
    createRoomChannel(guildId: string, spec: VoiceChannelSpec, reason: string): Promise<{
        readonly channelId: string;
    }>;
    deleteChannel(channelId: string, reason: string): Promise<void>;
    renameChannel(channelId: string, name: string, reason: string): Promise<void>;
    setUserLimit(channelId: string, limit: number, reason: string): Promise<void>;
    setLocked(guildId: string, channelId: string, locked: boolean, reason: string): Promise<void>;
    setHidden(guildId: string, channelId: string, hidden: boolean, reason: string): Promise<void>;
    setMemberAccess(channelId: string, userId: string, access: VoiceAccess, reason: string): Promise<void>;
    setOwner(channelId: string, userId: string, reason: string): Promise<void>;
    moveMember(guildId: string, userId: string, channelId: string | undefined): Promise<void>;
    memberVoiceChannel(guildId: string, userId: string): Promise<string | undefined>;
    sendPanel(channelId: string, room: VoiceRoom): Promise<{
        readonly messageId: string;
    }>;
    private toggleEveryone;
    private channel;
    private selfId;
}
//# sourceMappingURL=DiscordRestVoiceGateway.d.ts.map