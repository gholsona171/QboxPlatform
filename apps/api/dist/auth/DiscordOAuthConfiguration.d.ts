import { discordGuildId } from "@qbox/authentication";
/** Explicit Discord PKCE capability decision for OAuth authorization URLs. */
export type DiscordOAuthPkceCapability = "DISABLED_UNVERIFIED" | "S256_VERIFIED";
/** Safe Discord OAuth prompt policy. */
export type DiscordOAuthPromptPolicy = "none" | "consent";
/** Immutable constructor input for Discord OAuth provider configuration. */
export interface DiscordOAuthConfigurationInput {
    readonly environment: "development" | "test" | "production";
    readonly clientId: string;
    readonly clientSecret: string;
    readonly redirectUri: string;
    /** Server used when a browser has not picked one; optional in multi-server deployments. */
    readonly defaultGuildId?: string | undefined;
    readonly requestTimeoutMs?: number;
    readonly maximumResponseBytes?: number;
    readonly pkceCapability?: DiscordOAuthPkceCapability;
    readonly apiVersion?: number;
    readonly prompt?: DiscordOAuthPromptPolicy;
    readonly tokenRefreshSkewMs?: number;
}
/** Redacted provider diagnostics safe for startup logs and tests. */
export interface DiscordOAuthConfigurationDiagnostics {
    readonly clientId: string;
    readonly redirectOrigin: string;
    readonly redirectPath: string;
    readonly scopes: readonly string[];
    readonly requestTimeoutMs: number;
    readonly maximumResponseBytes: number;
    readonly apiVersion: number;
    readonly defaultGuildId: string | undefined;
    readonly pkceCapability: DiscordOAuthPkceCapability;
    readonly prompt: DiscordOAuthPromptPolicy;
    readonly tokenRefreshSkewMs: number;
}
/**
 * Immutable Discord OAuth configuration.
 *
 * The object validates the exact approved scope policy, stores the client secret
 * only for provider construction, and emits redacted diagnostics that never
 * include the secret or a state-bearing authorization URL.
 */
export declare class DiscordOAuthConfiguration {
    #private;
    /** Discord OAuth application/client ID. */
    readonly clientId: string;
    /** Exact configured redirect URI. */
    readonly redirectUri: URL;
    /** Default Discord guild for browsers that have not picked a server, when configured. */
    readonly defaultGuildId: ReturnType<typeof discordGuildId> | undefined;
    /** Bounded provider request timeout. */
    readonly requestTimeoutMs: number;
    /** Maximum accepted provider response size. */
    readonly maximumResponseBytes: number;
    /** Explicit transaction PKCE capability. */
    readonly pkceCapability: DiscordOAuthPkceCapability;
    /** Fixed Discord API version. */
    readonly apiVersion: 10;
    /** Fixed provider authorization prompt behavior. */
    readonly prompt: DiscordOAuthPromptPolicy;
    /** Refresh skew used by credential lifecycle composition. */
    readonly tokenRefreshSkewMs: number;
    /** Exact approved Discord OAuth scopes. */
    readonly scopes: readonly string[];
    private constructor();
    /** Validates and constructs immutable Discord OAuth configuration. */
    static from(input: DiscordOAuthConfigurationInput): DiscordOAuthConfiguration;
    /** Returns the confidential client secret only to the provider adapter. */
    secretForProvider(): string;
    /** Returns safe diagnostics with no client secret or state-bearing URL. */
    diagnostics(): DiscordOAuthConfigurationDiagnostics;
}
//# sourceMappingURL=DiscordOAuthConfiguration.d.ts.map