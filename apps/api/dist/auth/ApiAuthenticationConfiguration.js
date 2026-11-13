import { Buffer } from "node:buffer";
import { z } from "zod";
import { discordGuildId, opaqueAuthenticationSecret, } from "@qbox/authentication";
import { DiscordOAuthConfiguration } from "./DiscordOAuthConfiguration.js";
const inputSchema = z.strictObject({
    environment: z.enum(["development", "test", "production"]).default("development"),
    publicBaseUrl: z.string().trim().min(1),
    discordClientId: z.string().trim().min(17).max(20),
    discordClientSecret: z.string().trim().min(1).max(512),
    discordRedirectUri: z.string().trim().min(1).max(2_048),
    discordGuildId: z.string().trim().min(17).max(20).optional(),
    sessionHmacKey: z.string().trim().min(1),
    csrfHmacKey: z.string().trim().min(1),
    metadataHmacKey: z.string().trim().min(1),
    oauthEncryptionKey: z.string().trim().min(1),
    keyVersion: z.string().trim().regex(/^[1-9][0-9]*$/u).default("1"),
});
/** Immutable authentication runtime configuration for the browser POC. */
export class ApiAuthenticationConfiguration {
    #diagnostics;
    #discord;
    #keyRegistrations;
    #defaultGuildId;
    constructor(input) {
        this.#diagnostics = Object.freeze(input.diagnostics);
        this.#discord = input.discord;
        this.#keyRegistrations = Object.freeze(input.keyRegistrations);
        this.#defaultGuildId = input.defaultGuildId;
    }
    /** Validates raw process values and builds one immutable configuration. */
    static from(input) {
        const parsed = inputSchema.safeParse(input);
        if (!parsed.success) {
            const field = parsed.error.issues[0]?.path.join(".") || "configuration";
            throw new Error(`Invalid authentication ${field}.`);
        }
        const publicBaseUrl = parsePublicBaseUrl(parsed.data.publicBaseUrl, parsed.data.environment);
        const dashboardUrl = `${publicBaseUrl}/`;
        const callbackUrl = new URL(parsed.data.discordRedirectUri);
        const expectedCallback = `${publicBaseUrl}/auth/discord/callback`;
        if (callbackUrl.toString() !== expectedCallback)
            throw new Error("Discord OAuth redirect URI must match API_PUBLIC_BASE_URL /auth/discord/callback.");
        const loopback = isLoopback(callbackUrl.hostname);
        const secureCookies = parsed.data.environment === "production" || callbackUrl.protocol === "https:";
        if (parsed.data.environment === "production" && !secureCookies)
            throw new Error("Production authentication cookies require HTTPS.");
        if (!secureCookies && !loopback)
            throw new Error("Insecure authentication cookies are allowed only on loopback development hosts.");
        const version = Number(parsed.data.keyVersion);
        const discord = DiscordOAuthConfiguration.from({
            environment: parsed.data.environment,
            clientId: parsed.data.discordClientId,
            clientSecret: parsed.data.discordClientSecret,
            redirectUri: parsed.data.discordRedirectUri,
            ...(parsed.data.discordGuildId === undefined ? {} : { defaultGuildId: parsed.data.discordGuildId }),
        });
        const diagnostics = {
            environment: parsed.data.environment,
            sessionCookieName: secureCookies ? "__Host-qbox_session" : "qbox_session",
            oauthBindingCookieName: secureCookies ? "__Host-qbox_oauth" : "qbox_oauth",
            csrfCookieName: secureCookies ? "__Host-qbox_csrf" : "qbox_csrf",
            secureCookies,
            keyVersion: version,
            defaultGuildId: parsed.data.discordGuildId,
            dashboardUrl,
            callbackUrl: callbackUrl.toString(),
            discord: discord.diagnostics(),
        };
        return new ApiAuthenticationConfiguration({
            diagnostics,
            discord,
            defaultGuildId: parsed.data.discordGuildId === undefined ? undefined : discordGuildId(parsed.data.discordGuildId),
            keyRegistrations: [
                registration("SESSION_HMAC", version, parsed.data.sessionHmacKey, 32),
                registration("CSRF_HMAC", version, parsed.data.csrfHmacKey, 32),
                registration("METADATA_HMAC", version, parsed.data.metadataHmacKey, 32),
                registration("OAUTH_ENCRYPTION", version, parsed.data.oauthEncryptionKey, 32),
            ],
        });
    }
    /** Returns redacted diagnostics only. */
    diagnostics() {
        return this.#diagnostics;
    }
    /** Returns the validated Discord OAuth configuration. */
    discord() {
        return this.#discord;
    }
    /** Returns copied key registrations for the process-local key ring. */
    keyRegistrations() {
        return this.#keyRegistrations;
    }
    /** Returns the default Discord guild snowflake, when one is configured. */
    defaultDiscordGuildId() {
        return this.#defaultGuildId;
    }
}
/** Converts an ephemeral cookie string to a branded authentication secret. */
export function cookieSecret(value) {
    if (!value)
        return undefined;
    try {
        return opaqueAuthenticationSecret(value);
    }
    catch {
        return undefined;
    }
}
function registration(purpose, version, encoded, expectedBytes) {
    const material = decodeKey(encoded);
    if (material.byteLength !== expectedBytes)
        throw new Error(`${purpose} key must decode to ${expectedBytes} bytes.`);
    return Object.freeze({ purpose, version, material, active: true });
}
function decodeKey(value) {
    const normalized = value.trim();
    if (/^[0-9a-f]{64}$/iu.test(normalized))
        return new Uint8Array(Buffer.from(normalized, "hex"));
    return new Uint8Array(Buffer.from(normalized, "base64url"));
}
function parsePublicBaseUrl(value, environment) {
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash)
        throw new Error("API_PUBLIC_BASE_URL cannot contain credentials, query, or fragment.");
    if (environment === "production" && url.protocol !== "https:")
        throw new Error("Production API_PUBLIC_BASE_URL must use HTTPS.");
    if (url.protocol !== "http:" && url.protocol !== "https:")
        throw new Error("API_PUBLIC_BASE_URL must use HTTP or HTTPS.");
    return url.toString().replace(/\/$/u, "");
}
function isLoopback(hostname) {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}
//# sourceMappingURL=ApiAuthenticationConfiguration.js.map