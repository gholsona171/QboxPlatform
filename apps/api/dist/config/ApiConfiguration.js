import { isIP } from "node:net";
import { z } from "zod";
import { HttpOriginSchema } from "../transport/ApiTransportSchemas.js";
/** Stable API configuration validation failure. */
export class ApiConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ApiConfigurationError";
    }
}
const environments = ["development", "test", "production"];
const logLevels = ["fatal", "error", "warn", "info", "debug", "trace", "silent"];
const inputSchema = z.strictObject({
    environment: z.enum(environments).default("development"),
    host: z.string().trim().min(1).default("127.0.0.1"),
    port: z.number().int().min(0).max(65_535).default(3_000),
    bodySizeLimitBytes: z.number().int().min(1_024).max(10 * 1024 * 1024).default(1024 * 1024),
    headerSizeLimitBytes: z.number().int().min(4_096).max(65_536).default(16_384),
    userAgentLimitChars: z.number().int().min(128).max(8_192).default(1_024),
    requestTimeoutMs: z.number().int().min(100).max(300_000).default(120_000),
    keepAliveTimeoutMs: z.number().int().min(100).max(300_000).default(5_000),
    shutdownTimeoutMs: z.number().int().min(100).max(300_000).default(10_000),
    trustProxy: z.union([z.literal(false), z.array(z.string().trim().min(1)).min(1)]).default(false),
    allowedHosts: z.array(z.string().trim().min(1)).default([]),
    corsPolicy: z.discriminatedUnion("mode", [
        z.strictObject({ mode: z.literal("disabled") }),
        z.strictObject({
            mode: z.literal("allowlist"),
            origins: z.array(z.union([z.literal("*"), HttpOriginSchema])).min(1),
            credentials: z.boolean().default(false),
        }),
    ]).default({ mode: "disabled" }),
    rateLimitPolicy: z.strictObject({ mode: z.literal("disabled") }).default({ mode: "disabled" }),
    publicBaseUrl: z.string().trim().min(1).default("http://127.0.0.1:3000"),
    logLevel: z.enum(logLevels).default("info"),
    buildVersion: z.string().trim().min(1).max(128).default("0.0.0-dev"),
});
/**
 * Immutable, process-scoped API transport configuration.
 *
 * It performs no environment reads. Callers supply untrusted values at the
 * composition root, and serialization exposes only validated diagnostics.
 */
export class ApiConfiguration {
    #diagnostics;
    constructor(diagnostics) {
        this.#diagnostics = deepFreezeDiagnostics(diagnostics);
    }
    /** Validates input and constructs one immutable configuration value. */
    static from(input) {
        const parsed = inputSchema.safeParse(input);
        if (!parsed.success) {
            const field = parsed.error.issues[0]?.path.join(".") || "configuration";
            throw new ApiConfigurationError(`Invalid API ${field}.`);
        }
        if (parsed.data.environment === "production" && parsed.data.port === 0)
            throw new ApiConfigurationError("Production API port cannot be zero.");
        if (parsed.data.environment === "production" &&
            parsed.data.corsPolicy.mode === "allowlist" &&
            parsed.data.corsPolicy.credentials &&
            parsed.data.corsPolicy.origins.includes("*")) {
            throw new ApiConfigurationError("Production CORS cannot combine wildcard origins and credentials.");
        }
        if (parsed.data.host.includes("://") || /[/?#]/u.test(parsed.data.host))
            throw new ApiConfigurationError("Invalid API host.");
        const publicBaseUrl = parsePublicBaseUrl(parsed.data.publicBaseUrl, parsed.data.environment);
        const trustProxy = parseTrustProxy(parsed.data.trustProxy);
        const allowedHosts = parseAllowedHosts(parsed.data.allowedHosts);
        return new ApiConfiguration({
            ...parsed.data,
            publicBaseUrl,
            trustProxy,
            allowedHosts,
            corsPolicy: parsed.data.corsPolicy,
            rateLimitPolicy: parsed.data.rateLimitPolicy,
        });
    }
    /** Returns a frozen, credential-free diagnostic snapshot. */
    diagnostics() {
        return this.#diagnostics;
    }
    /** Serializes only the redacted diagnostic form. */
    toJSON() {
        return this.#diagnostics;
    }
}
function parsePublicBaseUrl(value, environment) {
    let url;
    try {
        url = new URL(value);
    }
    catch {
        throw new ApiConfigurationError("Invalid API publicBaseUrl.");
    }
    if (!["http:", "https:"].includes(url.protocol))
        throw new ApiConfigurationError("API publicBaseUrl must use HTTP or HTTPS.");
    if (url.username || url.password || url.hash || url.search)
        throw new ApiConfigurationError("API publicBaseUrl cannot contain credentials, query, or fragment.");
    if (environment === "production" && url.protocol !== "https:")
        throw new ApiConfigurationError("Production API publicBaseUrl must use HTTPS.");
    return url.toString().replace(/\/$/u, "");
}
function parseTrustProxy(value) {
    if (value === false)
        return { mode: "disabled" };
    const addresses = value.map((address) => validateProxyAddress(address));
    return { mode: "allowlist", addresses };
}
function validateProxyAddress(address) {
    const [host, prefix, extra] = address.split("/");
    if (!host || extra !== undefined || isIP(host) === 0)
        throw new ApiConfigurationError("Invalid API trustProxy address.");
    if (prefix !== undefined) {
        const maximum = isIP(host) === 4 ? 32 : 128;
        if (!/^\d+$/u.test(prefix) || Number(prefix) > maximum)
            throw new ApiConfigurationError("Invalid API trustProxy CIDR prefix.");
    }
    return address;
}
function parseAllowedHosts(values) {
    const hosts = new Set();
    for (const value of values) {
        if (value.length > 255 || value.includes(","))
            throw new ApiConfigurationError("Invalid API allowedHosts.");
        let parsed;
        try {
            parsed = new URL(`http://${value}`);
        }
        catch {
            throw new ApiConfigurationError("Invalid API allowedHosts.");
        }
        if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash)
            throw new ApiConfigurationError("Invalid API allowedHosts.");
        hosts.add(parsed.host.toLowerCase());
    }
    return [...hosts];
}
function deepFreezeDiagnostics(diagnostics) {
    if (diagnostics.trustProxy.mode === "allowlist")
        Object.freeze(diagnostics.trustProxy.addresses);
    Object.freeze(diagnostics.trustProxy);
    Object.freeze(diagnostics.allowedHosts);
    if (diagnostics.corsPolicy.mode === "allowlist")
        Object.freeze(diagnostics.corsPolicy.origins);
    Object.freeze(diagnostics.corsPolicy);
    Object.freeze(diagnostics.rateLimitPolicy);
    return Object.freeze(diagnostics);
}
//# sourceMappingURL=ApiConfiguration.js.map