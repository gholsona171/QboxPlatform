import type { InteractionGuildSource } from "@qbox/messages";
/**
 * Remembers which server an interaction came from, by interaction id and by
 * token, so REST calls that only carry those (`/interactions/:id/:token/callback`,
 * `/webhooks/:appId/:token/...`) can be themed. Entries expire after 15 minutes,
 * the lifetime of an interaction token.
 */
export declare class InteractionGuildMap implements InteractionGuildSource {
    private readonly now;
    private readonly ttlMs;
    private readonly ids;
    private readonly tokens;
    constructor(now?: () => number, ttlMs?: number);
    remember(interactionId: string, token: string, guildId: string | null | undefined): void;
    byId(interactionId: string): string | undefined;
    byToken(token: string): string | undefined;
    get size(): number;
    private store;
    private read;
    private sweep;
}
//# sourceMappingURL=InteractionGuildMap.d.ts.map