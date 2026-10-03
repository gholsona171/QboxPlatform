import { type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";
import type { HierarchyCheck, ModerationEmbed, ModerationGateway } from "./types.js";
/** Moderation actions through the Discord REST API (v10). */
export declare class DiscordRestModerationGateway implements ModerationGateway {
    private readonly rest;
    private readonly now;
    private botUserId;
    private readonly guilds;
    private readonly guildNames;
    constructor(rest: DiscordRestClient, now?: () => number);
    checkHierarchy(guildId: string, moderatorId: string | undefined, targetId: string): Promise<HierarchyCheck>;
    timeout(guildId: string, userId: string, until: Date | undefined, reason: string): Promise<void>;
    kick(guildId: string, userId: string, reason: string): Promise<void>;
    ban(guildId: string, userId: string, deleteMessageSeconds: number, reason: string): Promise<void>;
    unban(guildId: string, userId: string, reason: string): Promise<void>;
    guildName(guildId: string): Promise<string>;
    directMessage(userId: string, message: OutgoingMessage): Promise<boolean>;
    postEmbed(channelId: string, embed: ModerationEmbed): Promise<{
        readonly messageId: string;
    }>;
    postMessage(channelId: string, message: OutgoingMessage): Promise<{
        readonly messageId: string;
    }>;
    purge(channelId: string, count: number, userId?: string): Promise<number>;
    setLocked(guildId: string, channelId: string, locked: boolean, reason: string): Promise<void>;
    setSlowmode(channelId: string, seconds: number, reason: string): Promise<void>;
    deleteMessage(channelId: string, messageId: string, reason: string): Promise<void>;
    private guild;
    private member;
    private selfId;
}
//# sourceMappingURL=DiscordRestModerationGateway.d.ts.map