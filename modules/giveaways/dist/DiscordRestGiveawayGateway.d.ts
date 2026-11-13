import { type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { GiveawayGateway, GiveawayMessage } from "./types.js";
/** Giveaway messages and winner DMs through the Discord REST API (v10). */
export declare class DiscordRestGiveawayGateway implements GiveawayGateway {
    private readonly rest;
    private readonly guildNames;
    constructor(rest: DiscordRestClient);
    guildName(guildId: string): Promise<string>;
    postMessage(channelId: string, message: GiveawayMessage, replyToMessageId?: string): Promise<{
        readonly messageId: string;
    }>;
    editMessage(channelId: string, messageId: string, message: GiveawayMessage): Promise<void>;
    directMessage(userId: string, message: GiveawayMessage): Promise<boolean>;
}
//# sourceMappingURL=DiscordRestGiveawayGateway.d.ts.map