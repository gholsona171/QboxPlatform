import { createHash } from "node:crypto";
import { z } from "zod";
import { discordRoleId, discordUserId, providerIssuedSecret, } from "@qbox/authentication";
const DISCORD_ORIGIN = "https://discord.com";
const AUTHORIZATION_ENDPOINT = new URL("/oauth2/authorize", DISCORD_ORIGIN);
const TOKEN_ENDPOINT = new URL("/api/v10/oauth2/token", DISCORD_ORIGIN);
const REVOCATION_ENDPOINT = new URL("/api/v10/oauth2/token/revoke", DISCORD_ORIGIN);
const AUTHORIZATION_INFO_ENDPOINT = new URL("/api/v10/oauth2/@me", DISCORD_ORIGIN);
const CURRENT_USER_ENDPOINT = new URL("/api/v10/users/@me", DISCORD_ORIGIN);
const CURRENT_USER_GUILDS_ENDPOINT = new URL("/api/v10/users/@me/guilds", DISCORD_ORIGIN);
/** Discord returns at most 200 guilds per page; each carries a feature list, so the page is large. */
const USER_GUILDS_MAXIMUM_RESPONSE_BYTES = 1_024 * 1_024;
const USER_GUILDS_LIMIT = 200;
const tokenResponseSchema = z.object({
    access_token: z.string().min(1).max(4096),
    refresh_token: z.string().min(1).max(4096),
    token_type: z.literal("Bearer"),
    expires_in: z.number().int().min(1).max(31_536_000),
    scope: z.string().min(1).max(512),
}).strict();
const authorizationInfoSchema = z.object({
    application: z.object({ id: z.string().regex(/^[1-9][0-9]{16,19}$/) }).passthrough(),
    scopes: z.array(z.string()).optional(),
    expires: z.string().datetime({ offset: true }).nullable().optional(),
    user: z.object({ id: z.string().regex(/^[1-9][0-9]{16,19}$/) }).passthrough().optional(),
}).passthrough();
const userSchema = z.object({
    id: z.string().regex(/^[1-9][0-9]{16,19}$/),
    username: z.string().min(1).max(80).optional(),
    global_name: z.string().min(1).max(80).nullable().optional(),
    avatar: z.string().min(1).max(512).nullable().optional(),
}).passthrough();
const userGuildSchema = z.object({
    id: z.string().regex(/^[1-9][0-9]{16,19}$/),
    name: z.string().min(1).max(200),
    icon: z.string().min(1).max(512).nullable().optional(),
    owner: z.boolean().optional(),
    permissions: z.string().regex(/^[0-9]{1,30}$/).optional(),
}).passthrough();
const userGuildsSchema = z.array(userGuildSchema).max(USER_GUILDS_LIMIT);
const guildMemberSchema = z.object({
    user: z.object({ id: z.string().regex(/^[1-9][0-9]{16,19}$/) }).passthrough().optional(),
    roles: z.array(z.string().regex(/^[1-9][0-9]{16,19}$/)).max(250),
    pending: z.boolean().optional(),
}).passthrough();
/**
 * Native-fetch Discord OAuth adapter.
 *
 * The adapter performs no work on import or construction, never follows
 * provider redirects for API calls, never logs credentials, and translates
 * provider failures into bounded safe categories.
 */
export class NativeDiscordOAuthProvider {
    configuration;
    fetchImplementation;
    /** Constructs a provider over fixed official Discord endpoints. */
    constructor(configuration, fetchImplementation = fetch) {
        this.configuration = configuration;
        this.fetchImplementation = fetchImplementation;
    }
    /** Builds a state-bearing authorization URL without logging or network work. */
    createAuthorizationUrl(input) {
        const scopes = normalizeScopes(input.scopes ?? this.configuration.scopes);
        assertExactScopes(scopes, this.configuration.scopes);
        const redirectUri = input.redirectUri ?? this.configuration.redirectUri;
        if (redirectUri.toString() !== this.configuration.redirectUri.toString())
            throw providerError("MALFORMED_PROVIDER_RESPONSE", "authorization-url", false);
        if (this.configuration.pkceCapability === "DISABLED_UNVERIFIED" && input.pkceChallenge)
            throw providerError("MALFORMED_PROVIDER_RESPONSE", "authorization-url", false);
        const url = new URL(AUTHORIZATION_ENDPOINT);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("client_id", this.configuration.clientId);
        url.searchParams.set("redirect_uri", redirectUri.toString());
        url.searchParams.set("scope", scopes.join(" "));
        url.searchParams.set("state", input.state);
        url.searchParams.set("prompt", this.configuration.prompt);
        if (this.configuration.pkceCapability === "S256_VERIFIED") {
            if (!input.pkceChallenge)
                throw providerError("PKCE_MISMATCH", "authorization-url", false);
            url.searchParams.set("code_challenge", input.pkceChallenge);
            url.searchParams.set("code_challenge_method", "S256");
        }
        return url;
    }
    /** Exchanges one authorization code using form encoding and confidential auth. */
    async exchangeCode(request) {
        const body = new URLSearchParams({
            grant_type: "authorization_code",
            code: request.authorizationCode,
            redirect_uri: request.redirectUri.toString(),
        });
        if (this.configuration.pkceCapability === "S256_VERIFIED") {
            if (!request.pkceVerifier)
                throw providerError("PKCE_MISMATCH", "token.exchange", false);
            body.set("code_verifier", request.pkceVerifier);
        }
        return this.#tokenRequest("token.exchange", body, request.signal);
    }
    /** Refreshes one grant without automatic retry after possible token rotation. */
    async refreshToken(request) {
        const body = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: request.refreshToken,
        });
        return this.#tokenRequest("token.refresh", body, request.signal);
    }
    /** Performs best-effort provider revocation; local revocation remains final. */
    async revokeCredential(request) {
        const body = new URLSearchParams({ token: request.token });
        if (request.tokenHint)
            body.set("token_type_hint", request.tokenHint);
        try {
            const response = await this.#request(REVOCATION_ENDPOINT, {
                method: "POST",
                headers: {
                    authorization: this.#basicAuthorization(),
                    "content-type": "application/x-www-form-urlencoded",
                    accept: "application/json",
                },
                body,
                signal: request.signal,
            });
            if (response.status >= 200 && response.status < 300)
                return Object.freeze({ providerAccepted: true });
            return Object.freeze({
                providerAccepted: false,
                failure: statusFailure(response.status, "token.revoke"),
            });
        }
        catch (error) {
            return Object.freeze({
                providerAccepted: false,
                failure: normalizeCaughtFailure(error, "token.revoke"),
            });
        }
    }
    /** Retrieves and validates current Discord OAuth authorization information. */
    async inspectAuthorization(accessToken, signal) {
        const json = await this.#json(AUTHORIZATION_INFO_ENDPOINT, "authorization.inspect", accessToken, signal);
        const parsed = authorizationInfoSchema.safeParse(json);
        if (!parsed.success)
            throw providerError("MALFORMED_PROVIDER_RESPONSE", "authorization.inspect", false);
        if (parsed.data.application.id !== this.configuration.clientId)
            throw providerError("APPLICATION_MISMATCH", "authorization.inspect", false);
        const scopes = normalizeScopes(parsed.data.scopes ?? []);
        assertExactScopes(scopes, this.configuration.scopes);
        return Object.freeze({
            clientId: parsed.data.application.id,
            scopes,
            ...(parsed.data.expires ? { expiresAt: new Date(parsed.data.expires) } : {}),
            ...(parsed.data.user ? { userId: discordUserId(parsed.data.user.id) } : {}),
        });
    }
    /** Fetches the immutable Discord subject and display-only profile snapshot. */
    async fetchIdentity(accessToken, signal) {
        const json = await this.#json(CURRENT_USER_ENDPOINT, "identity.fetch", accessToken, signal);
        const parsed = userSchema.safeParse(json);
        if (!parsed.success)
            throw providerError("MALFORMED_PROVIDER_RESPONSE", "identity.fetch", false);
        return Object.freeze({
            userId: discordUserId(parsed.data.id),
            ...(parsed.data.username ? { username: parsed.data.username } : {}),
            ...(parsed.data.global_name ? { globalName: parsed.data.global_name } : {}),
            ...(parsed.data.avatar ? { avatar: parsed.data.avatar } : {}),
        });
    }
    /** Lists the servers the signed-in user belongs to (`guilds` scope). */
    async fetchGuilds(accessToken, signal) {
        const endpoint = new URL(CURRENT_USER_GUILDS_ENDPOINT);
        endpoint.searchParams.set("limit", String(USER_GUILDS_LIMIT));
        const json = await this.#json(endpoint, "guilds.fetch", accessToken, signal, USER_GUILDS_MAXIMUM_RESPONSE_BYTES);
        const parsed = userGuildsSchema.safeParse(json);
        if (!parsed.success)
            throw providerError("MALFORMED_PROVIDER_RESPONSE", "guilds.fetch", false);
        return Object.freeze(parsed.data.map((guild) => Object.freeze({
            id: guild.id,
            name: guild.name,
            icon: guild.icon ?? null,
            owner: guild.owner === true,
            permissions: guild.permissions ?? "0",
        })));
    }
    /** Verifies current-user membership in the requested Discord guild. */
    async verify(request) {
        if (!/^[1-9][0-9]{16,19}$/.test(request.guildId))
            throw providerError("MALFORMED_PROVIDER_RESPONSE", "membership.fetch", false);
        const endpoint = new URL(`/api/v10/users/@me/guilds/${request.guildId}/member`, DISCORD_ORIGIN);
        const response = await this.#request(endpoint, {
            method: "GET",
            headers: {
                authorization: `Bearer ${request.accessToken}`,
                accept: "application/json",
            },
            signal: request.signal,
        });
        const verifiedAt = new Date();
        if (response.status === 404)
            return Object.freeze({
                guildId: request.guildId,
                status: "ABSENT",
                roleIds: Object.freeze([]),
                source: "DISCORD_OAUTH",
                verifiedAt,
            });
        if (response.status === 401 || response.status === 403)
            throw providerError("EXPIRED_OR_REVOKED_PROVIDER_TOKEN", "membership.fetch", false);
        if (response.status === 429)
            throw statusFailure(response.status, "membership.fetch");
        if (response.status < 200 || response.status >= 300)
            throw statusFailure(response.status, "membership.fetch");
        const parsed = guildMemberSchema.safeParse(await readJsonResponse(response, this.configuration.maximumResponseBytes, "membership.fetch"));
        if (!parsed.success)
            throw providerError("MALFORMED_PROVIDER_RESPONSE", "membership.fetch", false);
        if (parsed.data.user && parsed.data.user.id !== request.identity.userId)
            throw providerError("IDENTITY_MISMATCH", "membership.fetch", false);
        if (parsed.data.pending)
            return Object.freeze({
                guildId: request.guildId,
                status: "UNKNOWN",
                roleIds: Object.freeze([]),
                source: "DISCORD_OAUTH",
                verifiedAt,
                failure: providerError("MEMBERSHIP_PENDING", "membership.fetch", false),
            });
        return Object.freeze({
            guildId: request.guildId,
            status: "PRESENT",
            roleIds: Object.freeze([...new Set(parsed.data.roles.map(discordRoleId))].sort()),
            source: "DISCORD_OAUTH",
            verifiedAt,
            validUntil: new Date(verifiedAt.getTime() + 5 * 60_000),
        });
    }
    async #tokenRequest(operation, body, signal) {
        const response = await this.#request(TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
                authorization: this.#basicAuthorization(),
                "content-type": "application/x-www-form-urlencoded",
                accept: "application/json",
            },
            body,
            signal,
        });
        if (response.status === 400 || response.status === 401)
            throw providerError("INVALID_CALLBACK", operation, false, "4xx");
        if (response.status < 200 || response.status >= 300)
            throw statusFailure(response.status, operation);
        const parsed = tokenResponseSchema.safeParse(await readJsonResponse(response, this.configuration.maximumResponseBytes, operation));
        if (!parsed.success)
            throw providerError("MALFORMED_PROVIDER_RESPONSE", operation, false);
        const scopes = normalizeScopes(parsed.data.scope.split(/\s+/));
        assertExactScopes(scopes, this.configuration.scopes);
        return Object.freeze({
            accessToken: providerIssuedSecret(parsed.data.access_token),
            refreshToken: providerIssuedSecret(parsed.data.refresh_token),
            scopes,
            expiresAt: new Date(Date.now() + parsed.data.expires_in * 1_000),
        });
    }
    async #json(endpoint, operation, accessToken, signal, maximumResponseBytes = this.configuration.maximumResponseBytes) {
        const response = await this.#request(endpoint, {
            method: "GET",
            headers: {
                authorization: `Bearer ${accessToken}`,
                accept: "application/json",
            },
            signal,
        });
        if (response.status === 401 || response.status === 403)
            throw providerError("EXPIRED_OR_REVOKED_PROVIDER_TOKEN", operation, false, "4xx");
        if (response.status < 200 || response.status >= 300)
            throw statusFailure(response.status, operation);
        return readJsonResponse(response, maximumResponseBytes, operation);
    }
    async #request(endpoint, init) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.configuration.requestTimeoutMs);
        const abort = () => controller.abort();
        init.signal?.addEventListener("abort", abort, { once: true });
        try {
            const response = await this.fetchImplementation(endpoint, {
                ...init,
                redirect: "manual",
                signal: controller.signal,
            });
            if (response.status >= 300 && response.status < 400)
                throw providerError("MALFORMED_PROVIDER_RESPONSE", "discord.redirect", false);
            return response;
        }
        catch (error) {
            if (controller.signal.aborted)
                throw providerError(init.signal?.aborted ? "CANCELLED" : "PROVIDER_TIMEOUT", "discord.request", !init.signal?.aborted);
            throw error;
        }
        finally {
            clearTimeout(timeout);
            init.signal?.removeEventListener("abort", abort);
        }
    }
    #basicAuthorization() {
        return `Basic ${Buffer.from(`${this.configuration.clientId}:${this.configuration.secretForProvider()}`, "utf8").toString("base64")}`;
    }
}
/** Computes an RFC 7636 S256 challenge for an already-generated verifier. */
export function createS256PkceChallenge(verifier) {
    return createHash("sha256").update(verifier, "utf8").digest("base64url");
}
async function readJsonResponse(response, maximumBytes, operation) {
    const contentType = response.headers.get("content-type") ?? "";
    if (!/^application\/json(?:;|$)/i.test(contentType))
        throw providerError("MALFORMED_PROVIDER_RESPONSE", operation, false);
    const text = await readBoundedText(response, maximumBytes, operation);
    try {
        return JSON.parse(text);
    }
    catch {
        throw providerError("MALFORMED_PROVIDER_RESPONSE", operation, false);
    }
}
async function readBoundedText(response, maximumBytes, operation) {
    const reader = response.body?.getReader();
    if (!reader) {
        const text = await response.text();
        if (Buffer.byteLength(text, "utf8") > maximumBytes)
            throw providerError("MALFORMED_PROVIDER_RESPONSE", operation, false);
        return text;
    }
    const chunks = [];
    let total = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done)
            break;
        total += value.byteLength;
        if (total > maximumBytes)
            throw providerError("MALFORMED_PROVIDER_RESPONSE", operation, false);
        chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
}
function normalizeScopes(scopes) {
    return Object.freeze([...new Set(scopes)].sort());
}
function assertExactScopes(actual, expected) {
    const left = normalizeScopes(actual);
    const right = normalizeScopes(expected);
    if (left.length !== right.length || left.some((scope, index) => scope !== right[index]))
        throw providerError("MISSING_REQUIRED_SCOPE", "scope.validate", false, "4xx");
}
function statusFailure(status, operation) {
    if (status === 429)
        return providerError("RATE_LIMITED", operation, true, "4xx");
    if (status >= 500)
        return providerError("PROVIDER_UNAVAILABLE", operation, true, "5xx");
    return providerError("PROVIDER_REJECTED", operation, false, "4xx");
}
function normalizeCaughtFailure(error, operation) {
    if (isProviderFailure(error))
        return error;
    return providerError("PROVIDER_UNAVAILABLE", operation, true);
}
function providerError(code, operation, retryable, httpStatusCategory) {
    return Object.freeze({
        code,
        operation,
        retryable,
        ...(httpStatusCategory ? { httpStatusCategory } : {}),
    });
}
function isProviderFailure(error) {
    return Boolean(error &&
        typeof error === "object" &&
        "code" in error &&
        "retryable" in error);
}
//# sourceMappingURL=DiscordOAuthProvider.js.map