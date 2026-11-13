import { z } from "zod";
import { discordGuildId } from "@qbox/authentication";
const APPROVED_SCOPES = Object.freeze(["guilds", "guilds.members.read", "identify"]);
const INPUT = z.object({
    environment: z.enum(["development", "test", "production"]),
    clientId: z.string().regex(/^[1-9][0-9]{16,19}$/),
    clientSecret: z.string().min(1).max(512).refine((value) => !/[\u0000-\u001f\u007f]/.test(value)),
    redirectUri: z.string().url(),
    defaultGuildId: z.string().regex(/^[1-9][0-9]{16,19}$/).optional(),
    requestTimeoutMs: z.number().int().min(500).max(15_000).default(5_000),
    maximumResponseBytes: z.number().int().min(1_024).max(128 * 1_024).default(32 * 1_024),
    pkceCapability: z.enum(["DISABLED_UNVERIFIED", "S256_VERIFIED"]).default("DISABLED_UNVERIFIED"),
    apiVersion: z.literal(10).default(10),
    prompt: z.enum(["none", "consent"]).default("consent"),
    tokenRefreshSkewMs: z.number().int().min(0).max(60 * 60_000).default(5 * 60_000),
}).strict();
/**
 * Immutable Discord OAuth configuration.
 *
 * The object validates the exact approved scope policy, stores the client secret
 * only for provider construction, and emits redacted diagnostics that never
 * include the secret or a state-bearing authorization URL.
 */
export class DiscordOAuthConfiguration {
    #clientSecret;
    /** Discord OAuth application/client ID. */
    clientId;
    /** Exact configured redirect URI. */
    redirectUri;
    /** Default Discord guild for browsers that have not picked a server, when configured. */
    defaultGuildId;
    /** Bounded provider request timeout. */
    requestTimeoutMs;
    /** Maximum accepted provider response size. */
    maximumResponseBytes;
    /** Explicit transaction PKCE capability. */
    pkceCapability;
    /** Fixed Discord API version. */
    apiVersion;
    /** Fixed provider authorization prompt behavior. */
    prompt;
    /** Refresh skew used by credential lifecycle composition. */
    tokenRefreshSkewMs;
    /** Exact approved Discord OAuth scopes. */
    scopes = APPROVED_SCOPES;
    constructor(parsed) {
        const redirectUri = new URL(parsed.redirectUri);
        validateRedirectUri(parsed.environment, redirectUri);
        this.clientId = parsed.clientId;
        this.#clientSecret = parsed.clientSecret;
        this.redirectUri = redirectUri;
        this.defaultGuildId = parsed.defaultGuildId === undefined ? undefined : discordGuildId(parsed.defaultGuildId);
        this.requestTimeoutMs = parsed.requestTimeoutMs;
        this.maximumResponseBytes = parsed.maximumResponseBytes;
        this.pkceCapability = parsed.pkceCapability;
        this.apiVersion = parsed.apiVersion;
        this.prompt = parsed.prompt;
        this.tokenRefreshSkewMs = parsed.tokenRefreshSkewMs;
        Object.freeze(this);
    }
    /** Validates and constructs immutable Discord OAuth configuration. */
    static from(input) {
        return new DiscordOAuthConfiguration(INPUT.parse(input));
    }
    /** Returns the confidential client secret only to the provider adapter. */
    secretForProvider() {
        return this.#clientSecret;
    }
    /** Returns safe diagnostics with no client secret or state-bearing URL. */
    diagnostics() {
        return Object.freeze({
            clientId: this.clientId,
            redirectOrigin: this.redirectUri.origin,
            redirectPath: this.redirectUri.pathname,
            scopes: this.scopes,
            requestTimeoutMs: this.requestTimeoutMs,
            maximumResponseBytes: this.maximumResponseBytes,
            apiVersion: this.apiVersion,
            defaultGuildId: this.defaultGuildId,
            pkceCapability: this.pkceCapability,
            prompt: this.prompt,
            tokenRefreshSkewMs: this.tokenRefreshSkewMs,
        });
    }
}
function validateRedirectUri(environment, redirectUri) {
    if (environment === "production") {
        if (redirectUri.protocol !== "https:")
            throw new Error("Discord OAuth production redirect URI must use HTTPS.");
        return;
    }
    if (redirectUri.protocol === "https:")
        return;
    if (redirectUri.protocol === "http:" &&
        (redirectUri.hostname === "127.0.0.1" ||
            redirectUri.hostname === "localhost" ||
            redirectUri.hostname === "[::1]"))
        return;
    throw new Error("Discord OAuth non-production HTTP redirects must be loopback only.");
}
//# sourceMappingURL=DiscordOAuthConfiguration.js.map