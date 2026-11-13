import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { LookProvider } from "./types.js";
/** Resolves the guild a REST route posts into; undefined leaves the body untouched. */
export type RouteGuildResolver = (route: string) => Promise<string | undefined>;
/** Interaction id and token to guild lookups, filled by the bot on InteractionCreate. */
export interface InteractionGuildSource {
    byId(interactionId: string): string | undefined;
    byToken(token: string): string | undefined;
}
interface ThemedRestOptions {
    readonly now?: (() => number) | undefined;
}
/**
 * Guild resolution for message routes: `/channels/:id/messages` through a
 * cached `GET /channels/:id` (DM channels have no guild and are remembered
 * as such), interaction callbacks and webhook follow-ups through the
 * interaction map the bot fills.
 */
export declare function guildResolver(rest: Pick<DiscordRestClient, "get">, interactions?: InteractionGuildSource): RouteGuildResolver;
/**
 * Applies a server's look to the embeds in a message body. Handles
 * `{ embeds }` and `{ data: { embeds } }` (interaction callbacks). Any
 * failure returns the body untouched so sending is never blocked.
 */
export declare class EmbedThemer {
    private readonly rest;
    private readonly resolve;
    private readonly looks;
    private readonly guildNames;
    private readonly now;
    constructor(rest: Pick<DiscordRestClient, "get">, resolve: RouteGuildResolver, looks: LookProvider, options?: ThemedRestOptions);
    theme(route: string, method: string, body: unknown): Promise<unknown>;
    private guildName;
}
/**
 * Decorates a `DiscordRestClient` so every message body with embeds gets the
 * guild's look before it is sent. GET, PUT, and DELETE pass straight through.
 */
export declare function themedRest(rest: DiscordRestClient, resolve: RouteGuildResolver, looks: LookProvider, options?: ThemedRestOptions): DiscordRestClient;
/** The part of discord.js `REST` that every helper (`get`, `post`, ...) and discord.js itself funnel through. */
export interface RequestingRest extends Pick<DiscordRestClient, "get"> {
    request(options: {
        readonly fullRoute: `/${string}`;
        readonly method: string;
        readonly body?: unknown;
    }): Promise<unknown>;
}
/**
 * Wraps a discord.js `REST` instance's `request` method in place, so both
 * feature gateways and discord.js's own interaction replies get themed.
 * Returns a function that restores the original.
 */
export declare function installThemedRequests(rest: RequestingRest, resolve: RouteGuildResolver, looks: LookProvider, options?: ThemedRestOptions): () => void;
export {};
//# sourceMappingURL=themedRest.d.ts.map