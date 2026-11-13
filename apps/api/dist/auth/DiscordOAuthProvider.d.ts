import { type DiscordGuildMembershipVerification, type DiscordGuildMembershipVerificationRequest, type DiscordGuildMembershipVerifier, type DiscordOAuthAuthorizationInspection, type DiscordOAuthCodeExchangeRequest, type DiscordOAuthProvider, type DiscordOAuthRefreshRequest, type DiscordOAuthRevocationRequest, type DiscordOAuthRevocationResult, type DiscordOAuthTokenResult, type OpaqueAuthenticationSecret, type VerifiedDiscordIdentity } from "@qbox/authentication";
import type { DiscordOAuthConfiguration } from "./DiscordOAuthConfiguration.js";
import type { DiscordUserGuild, DiscordUserGuildSource } from "./GuildDirectory.js";
/** Minimal fetch boundary used by the Discord OAuth adapter. */
export type DiscordOAuthFetch = (input: string | URL, init: RequestInit) => Promise<Response>;
/**
 * Native-fetch Discord OAuth adapter.
 *
 * The adapter performs no work on import or construction, never follows
 * provider redirects for API calls, never logs credentials, and translates
 * provider failures into bounded safe categories.
 */
export declare class NativeDiscordOAuthProvider implements DiscordOAuthProvider, DiscordGuildMembershipVerifier, DiscordUserGuildSource {
    #private;
    private readonly configuration;
    private readonly fetchImplementation;
    /** Constructs a provider over fixed official Discord endpoints. */
    constructor(configuration: DiscordOAuthConfiguration, fetchImplementation?: DiscordOAuthFetch);
    /** Builds a state-bearing authorization URL without logging or network work. */
    createAuthorizationUrl(input: {
        readonly state: OpaqueAuthenticationSecret;
        readonly redirectUri?: URL;
        readonly scopes?: readonly string[];
        readonly pkceChallenge?: string;
    }): URL;
    /** Exchanges one authorization code using form encoding and confidential auth. */
    exchangeCode(request: DiscordOAuthCodeExchangeRequest): Promise<DiscordOAuthTokenResult>;
    /** Refreshes one grant without automatic retry after possible token rotation. */
    refreshToken(request: DiscordOAuthRefreshRequest): Promise<DiscordOAuthTokenResult>;
    /** Performs best-effort provider revocation; local revocation remains final. */
    revokeCredential(request: DiscordOAuthRevocationRequest): Promise<DiscordOAuthRevocationResult>;
    /** Retrieves and validates current Discord OAuth authorization information. */
    inspectAuthorization(accessToken: OpaqueAuthenticationSecret, signal: AbortSignal): Promise<DiscordOAuthAuthorizationInspection>;
    /** Fetches the immutable Discord subject and display-only profile snapshot. */
    fetchIdentity(accessToken: OpaqueAuthenticationSecret, signal: AbortSignal): Promise<VerifiedDiscordIdentity>;
    /** Lists the servers the signed-in user belongs to (`guilds` scope). */
    fetchGuilds(accessToken: OpaqueAuthenticationSecret, signal: AbortSignal): Promise<readonly DiscordUserGuild[]>;
    /** Verifies current-user membership in the requested Discord guild. */
    verify(request: DiscordGuildMembershipVerificationRequest): Promise<DiscordGuildMembershipVerification>;
}
/** Computes an RFC 7636 S256 challenge for an already-generated verifier. */
export declare function createS256PkceChallenge(verifier: OpaqueAuthenticationSecret): string;
//# sourceMappingURL=DiscordOAuthProvider.d.ts.map