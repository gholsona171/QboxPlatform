import type { FastifyInstance } from "fastify";
import { BrowserSessionService, DiscordGuildMembershipService, DiscordLoginService, OAuthCredentialService, OAuthTransactionService, type AuthenticationUnitOfWork, type DiscordGuildMembershipVerifier, type DiscordOAuthProvider } from "@qbox/authentication";
import type { GuildRepository } from "@qbox/permissions";
import type { PermissionAuthorizer } from "@qbox/permissions";
import { type RoleMenuService } from "@qbox/role-menus";
import { type DiscordCommunityService } from "@qbox/discord-community";
import { type RoleManagementService } from "@qbox/discord-roles";
import type { ApiLogger } from "../logging/ApiLogger.js";
import { type ApiAuthenticationConfiguration } from "./ApiAuthenticationConfiguration.js";
import { AuthenticationCaches } from "./AuthenticationCaches.js";
import type { ApiFeature } from "../features/ApiFeature.js";
import type { DiscordGuildAuthority } from "./DiscordGuildAuthority.js";
import type { DiscordUserGuildSource, GuildDirectory, GuildSummary } from "./GuildDirectory.js";
/** Dependencies for browser-visible authentication and dashboard routes. */
export interface BrowserAuthenticationRouteDependencies {
    readonly configuration: ApiAuthenticationConfiguration;
    readonly provider: DiscordOAuthProvider & DiscordGuildMembershipVerifier & DiscordUserGuildSource;
    readonly oauthTransactions: OAuthTransactionService;
    readonly login: DiscordLoginService;
    readonly credentials: OAuthCredentialService;
    readonly sessions: BrowserSessionService;
    readonly memberships: DiscordGuildMembershipService;
    readonly guilds: Pick<GuildRepository, "findByDiscordId" | "create">;
    /** Servers the member and the bot share; drives the server picker and the current-server cookie. */
    readonly directory: GuildDirectory;
    readonly authorizer: PermissionAuthorizer;
    readonly roleMenus: RoleMenuService;
    readonly community: DiscordCommunityService;
    readonly roles: RoleManagementService;
    /** Pluggable features that register their own routes. */
    readonly features?: readonly ApiFeature[];
    /** Discord owner / Administrator / Manage Server bypass; absent when the bot token is not configured. */
    readonly guildAuthority?: DiscordGuildAuthority;
    /** Serve the built-in dashboard at `/`. Off when the portal owns `/`. */
    readonly serveDashboard?: boolean;
    readonly unitOfWork: AuthenticationUnitOfWork;
    readonly logger: ApiLogger;
    /** Short in-process caches for session, account, membership, and guild-row reads; created when absent. */
    readonly caches?: AuthenticationCaches;
}
/** Registers the QboxPlatform browser dashboard and proof-of-concept auth routes. */
export declare function registerBrowserAuthenticationRoutes(server: FastifyInstance, input: BrowserAuthenticationRouteDependencies): Promise<void>;
/**
 * The server a member starts in when they have not picked one: the default
 * when they manage it, else one they own, else one they manage (by name),
 * else the default when they are in it, else their only shared server.
 */
export declare function chooseStartingGuild(guilds: readonly GuildSummary[], defaultGuildId: string | undefined): string | undefined;
//# sourceMappingURL=BrowserAuthenticationRoutes.d.ts.map