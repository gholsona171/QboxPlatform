import type { ApiCorsPolicy, ApiRateLimitPolicy } from "../security/ApiTransportPolicies.js";
/** Runtime environments recognized by API security policy. */
export type ApiEnvironment = "development" | "test" | "production";
/** Explicit trusted-proxy policy; unrestricted proxy trust is unsupported. */
export type ApiTrustedProxyPolicy = {
    readonly mode: "disabled";
} | {
    readonly mode: "allowlist";
    readonly addresses: readonly string[];
};
/** Untrusted values accepted by the API configuration parser. */
export interface ApiConfigurationInput {
    readonly environment?: string | undefined;
    readonly host?: string | undefined;
    readonly port?: number | undefined;
    readonly bodySizeLimitBytes?: number | undefined;
    readonly headerSizeLimitBytes?: number | undefined;
    readonly userAgentLimitChars?: number | undefined;
    readonly requestTimeoutMs?: number | undefined;
    readonly keepAliveTimeoutMs?: number | undefined;
    readonly shutdownTimeoutMs?: number | undefined;
    readonly trustProxy?: false | readonly string[] | undefined;
    readonly allowedHosts?: readonly string[] | undefined;
    readonly corsPolicy?: ApiCorsPolicy | undefined;
    readonly rateLimitPolicy?: ApiRateLimitPolicy | undefined;
    readonly publicBaseUrl?: string | undefined;
    readonly logLevel?: string | undefined;
    readonly buildVersion?: string | undefined;
}
/** Redacted API configuration safe for structured diagnostics. */
export interface ApiConfigurationDiagnostics {
    readonly environment: ApiEnvironment;
    readonly host: string;
    readonly port: number;
    readonly bodySizeLimitBytes: number;
    readonly headerSizeLimitBytes: number;
    readonly userAgentLimitChars: number;
    readonly requestTimeoutMs: number;
    readonly keepAliveTimeoutMs: number;
    readonly shutdownTimeoutMs: number;
    readonly trustProxy: ApiTrustedProxyPolicy;
    readonly allowedHosts: readonly string[];
    readonly corsPolicy: ApiCorsPolicy;
    readonly rateLimitPolicy: ApiRateLimitPolicy;
    readonly publicBaseUrl: string;
    readonly logLevel: ApiLogLevel;
    readonly buildVersion: string;
}
/** Stable API configuration validation failure. */
export declare class ApiConfigurationError extends Error {
    constructor(message: string);
}
declare const logLevels: readonly ["fatal", "error", "warn", "info", "debug", "trace", "silent"];
export type ApiLogLevel = (typeof logLevels)[number];
/**
 * Immutable, process-scoped API transport configuration.
 *
 * It performs no environment reads. Callers supply untrusted values at the
 * composition root, and serialization exposes only validated diagnostics.
 */
export declare class ApiConfiguration {
    #private;
    private constructor();
    /** Validates input and constructs one immutable configuration value. */
    static from(input: ApiConfigurationInput): ApiConfiguration;
    /** Returns a frozen, credential-free diagnostic snapshot. */
    diagnostics(): ApiConfigurationDiagnostics;
    /** Serializes only the redacted diagnostic form. */
    toJSON(): ApiConfigurationDiagnostics;
}
export {};
//# sourceMappingURL=ApiConfiguration.d.ts.map