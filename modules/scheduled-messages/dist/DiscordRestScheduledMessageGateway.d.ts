import { type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage, ScheduledMessageGateway } from "./types.js";
/** Posts scheduled messages through the Discord REST API (v10). */
export declare class DiscordRestScheduledMessageGateway implements ScheduledMessageGateway {
    private readonly rest;
    constructor(rest: DiscordRestClient);
    post(channelId: string, message: OutgoingMessage): Promise<{
        readonly messageId: string;
    }>;
    deleteMessage(channelId: string, messageId: string): Promise<void>;
    pin(channelId: string, messageId: string): Promise<void>;
}
//# sourceMappingURL=DiscordRestScheduledMessageGateway.d.ts.map