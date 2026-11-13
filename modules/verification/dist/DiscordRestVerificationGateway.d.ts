import { type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";
import type { GuildMemberInfo, VerificationEmbed, VerificationGateway, VerificationPanel } from "./types.js";
/** Verification actions through the Discord REST API (v10). */
export declare class DiscordRestVerificationGateway implements VerificationGateway {
    private readonly rest;
    private readonly now;
    private readonly names;
    constructor(rest: DiscordRestClient, now?: () => number);
    member(guildId: string, userId: string): Promise<GuildMemberInfo | undefined>;
    guildName(guildId: string): Promise<string>;
    addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    kick(guildId: string, userId: string, reason: string): Promise<void>;
    directMessage(userId: string, content: string): Promise<boolean>;
    sendMessage(channelId: string, message: OutgoingMessage, mentionUserId: string): Promise<void>;
    postEmbed(channelId: string, embed: VerificationEmbed): Promise<void>;
    publishPanel(channelId: string, panel: VerificationPanel, existingMessageId?: string): Promise<{
        readonly messageId: string;
    }>;
}
//# sourceMappingURL=DiscordRestVerificationGateway.d.ts.map