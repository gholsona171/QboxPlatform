import { type Client } from "discord.js";
import { DiscordCommunityService, type SuggestionStatus } from "@qbox/discord-community";
export declare class DiscordCommunityEventHandler {
    private readonly service;
    private counterTimer;
    private client;
    private readonly counterRefreshedAt;
    constructor(service: DiscordCommunityService);
    attach(client: Client): void;
    detach(): void;
    private onMemberAdd;
    private onMemberRemove;
    private onMessage;
    private onReaction;
    private onMessageDelete;
    private onMessageEdit;
    private onMemberUpdate;
    private onVoice;
    private onBan;
    /** Refreshes each counter once its own interval has passed. */
    private refreshDueCounters;
    private refreshCounters;
    private safe;
}
export declare function rulesCustomId(guildId: string): string;
export declare function suggestionStatus(value: string): SuggestionStatus;
//# sourceMappingURL=DiscordCommunityEventHandler.d.ts.map