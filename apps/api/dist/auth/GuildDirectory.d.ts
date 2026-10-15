import { type AuthenticationOperationContext, type AuthenticationUnitOfWork, type ExternalIdentity, type OpaqueAuthenticationSecret } from "@qbox/authentication";
import { type PermissionAuthorizer } from "@qbox/permissions";
import type { DiscordRestClient } from "@qbox/shared/discord-rest";
import type { ApiLogger } from "../logging/ApiLogger.js";
/** One server as Discord reports it to the signed-in user (`guilds` scope). */
export interface DiscordUserGuild {
    readonly id: string;
    readonly name: string;
    readonly icon: string | null;
    readonly owner: boolean;
    /** Permission bits as a decimal string. */
    readonly permissions: string;
}
/** Reads the signed-in user's server list with their OAuth access token. */
export interface DiscordUserGuildSource {
    fetchGuilds(accessToken: OpaqueAuthenticationSecret, signal: AbortSignal): Promise<readonly DiscordUserGuild[]>;
}
/** One server the bot is in. */
export interface BotGuild {
    readonly id: string;
    readonly name: string;
    readonly icon: string | null;
}
/** Lists the servers the bot is in. */
export interface BotGuildSource {
    listGuilds(): Promise<readonly BotGuild[]>;
}
/** A server the member and the bot share, as the portal shows it. */
export interface GuildSummary {
    readonly id: string;
    readonly name: string;
    readonly icon: string | null;
    readonly owner: boolean;
    /** Discord owner / Administrator / Manage Server, or any Qbox permission there. */
    readonly canManage: boolean;
}
/** The member's server list, or the reason it could not be read. */
export interface GuildListing {
    readonly guilds: readonly GuildSummary[];
    /** The stored OAuth grant predates the `guilds` scope; the member must sign in again. */
    readonly reauthRequired: boolean;
}
/** Answers which servers a signed-in member and the bot share. */
export interface GuildDirectory {
    /** Lists shared servers; `refresh` re-reads Discord instead of the cache. */
    list(identity: ExternalIdentity, context: AuthenticationOperationContext, signal: AbortSignal, options?: {
        readonly refresh?: boolean;
    }): Promise<GuildListing>;
    /** Drops the cached list for one identity (after login or membership changes). */
    forget(identityId: ExternalIdentity["id"]): void;
}
/** Whether the member holds any Qbox permission in one server. */
export type QboxAccessCheck = (identity: ExternalIdentity, guildId: string) => Promise<boolean>;
export interface DiscordGuildDirectoryDependencies {
    readonly credentials: {
        loadUsableAccessCredential(externalIdentityId: ExternalIdentity["id"], context: AuthenticationOperationContext, signal: AbortSignal): Promise<{
            readonly accessToken: OpaqueAuthenticationSecret;
        }>;
    };
    readonly unitOfWork: AuthenticationUnitOfWork;
    readonly provider: DiscordUserGuildSource;
    /** Absent when the bot token is not configured; then only the default server is offered. */
    readonly bot?: BotGuildSource | undefined;
    readonly qboxAccess?: QboxAccessCheck | undefined;
    readonly defaultGuildId?: string | undefined;
    readonly ttlMs?: number;
    readonly now?: () => number;
    readonly logger?: ApiLogger;
}
/**
 * Intersects the member's Discord server list with the bot's, cached per
 * identity for a minute. A stored grant without the `guilds` scope (users who
 * signed in before multi-server support) yields `reauthRequired` instead of
 * an error so the portal can ask them to sign in again.
 */
export declare class DiscordGuildDirectory implements GuildDirectory {
    private readonly dependencies;
    private readonly cache;
    private readonly ttlMs;
    private readonly now;
    constructor(dependencies: DiscordGuildDirectoryDependencies);
    list(identity: ExternalIdentity, context: AuthenticationOperationContext, signal: AbortSignal, options?: {
        readonly refresh?: boolean;
    }): Promise<GuildListing>;
    forget(identityId: ExternalIdentity["id"]): void;
    private load;
    /** The member's servers, or `undefined` when the stored grant cannot list them. */
    private memberGuilds;
    private shared;
}
/** Bot-side server list read through the bot's REST client, cached for a minute. */
export declare class DiscordRestBotGuildSource implements BotGuildSource {
    private readonly rest;
    private cached;
    private inFlight;
    private readonly ttlMs;
    private readonly now;
    constructor(rest: DiscordRestClient, options?: {
        readonly ttlMs?: number;
        readonly now?: () => number;
    });
    listGuilds(): Promise<readonly BotGuild[]>;
    private fetchAll;
}
/** Builds the Qbox side of `canManage`: any active permission in that server, roles from the stored membership. */
export declare function createQboxAccessCheck(dependencies: {
    readonly authorizer: PermissionAuthorizer;
    readonly unitOfWork: AuthenticationUnitOfWork;
}): QboxAccessCheck;
//# sourceMappingURL=GuildDirectory.d.ts.map