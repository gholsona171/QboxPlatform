import { type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { ApplicationEmbed, ApplicationForm, ApplicationGateway, ApplicationPanel, ReviewMessage } from "./types.js";
/** Application Discord operations through the Discord REST API (v10). */
export declare class DiscordRestApplicationGateway implements ApplicationGateway {
    private readonly rest;
    private readonly guildNames;
    constructor(rest: DiscordRestClient);
    postReview(channelId: string, message: ReviewMessage): Promise<{
        readonly messageId: string;
    }>;
    updateReview(channelId: string, messageId: string, message: ReviewMessage): Promise<void>;
    createDiscussion(channelId: string, name: string, memberIds: readonly string[], content: string): Promise<{
        readonly threadId: string;
    }>;
    postMessage(channelId: string, content: string): Promise<void>;
    addRoles(guildId: string, userId: string, roleIds: readonly string[], reason: string): Promise<void>;
    removeRoles(guildId: string, userId: string, roleIds: readonly string[], reason: string): Promise<void>;
    directMessage(userId: string, embed: ApplicationEmbed): Promise<boolean>;
    publishPanel(panel: ApplicationPanel, forms: readonly ApplicationForm[]): Promise<{
        readonly messageId: string;
    }>;
    deleteMessage(channelId: string, messageId: string): Promise<void>;
    guildName(guildId: string): Promise<string>;
}
//# sourceMappingURL=DiscordRestApplicationGateway.d.ts.map