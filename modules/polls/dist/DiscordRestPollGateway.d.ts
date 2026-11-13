import { type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { PollGateway, PollMessage } from "./types.js";
/** Poll messages through the Discord REST API (v10). */
export declare class DiscordRestPollGateway implements PollGateway {
    private readonly rest;
    constructor(rest: DiscordRestClient);
    postMessage(channelId: string, message: PollMessage, replyToMessageId?: string): Promise<{
        readonly messageId: string;
    }>;
    editMessage(channelId: string, messageId: string, message: PollMessage): Promise<void>;
    deleteMessage(channelId: string, messageId: string): Promise<void>;
}
//# sourceMappingURL=DiscordRestPollGateway.d.ts.map