import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { OutgoingMessage } from "@qbox/shared/messages";
import type { MessagesGateway } from "./types.js";
/** Test messages and server names through the Discord REST API (v10). */
export declare class DiscordRestMessagesGateway implements MessagesGateway {
    private readonly rest;
    constructor(rest: DiscordRestClient);
    postMessage(channelId: string, message: OutgoingMessage): Promise<{
        readonly messageId: string;
    }>;
    guildName(guildId: string): Promise<string | undefined>;
}
//# sourceMappingURL=DiscordRestMessagesGateway.d.ts.map