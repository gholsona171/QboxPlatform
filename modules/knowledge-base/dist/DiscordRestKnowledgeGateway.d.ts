import { type DiscordRestClient } from "@qbox/shared/discord-rest";
import type { KnowledgeEmbed, KnowledgeGateway } from "./types.js";
/** Knowledge base messages through the Discord REST API (v10). */
export declare class DiscordRestKnowledgeGateway implements KnowledgeGateway {
    private readonly rest;
    constructor(rest: DiscordRestClient);
    postEmbed(channelId: string, embed: KnowledgeEmbed): Promise<{
        readonly messageId: string;
    }>;
    replyEmbed(channelId: string, messageId: string, content: string, embed: KnowledgeEmbed): Promise<void>;
}
//# sourceMappingURL=DiscordRestKnowledgeGateway.d.ts.map