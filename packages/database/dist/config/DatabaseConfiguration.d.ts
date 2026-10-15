/** Runtime environments recognized by database configuration policy. */
export type DatabaseEnvironment = "development" | "test" | "production";
/** PostgreSQL transport-security modes supported by the platform. */
export type DatabaseSslMode = "disable" | "require";
/** Untrusted values used to construct validated database configuration. */
export interface DatabaseConfigurationInput {
    /** Raw PostgreSQL connection string. This value must never be logged. */
    readonly databaseUrl: string | undefined;
    /** Runtime environment controlling production security requirements. */
    readonly environment?: string | undefined;
    /** Maximum time allowed for initial client startup. */
    readonly startupTimeoutMs?: number | undefined;
    /** Maximum default duration allowed for a database query. */
    readonly queryTimeoutMs?: number | undefined;
    /** Explicit PostgreSQL TLS policy. */
    readonly sslMode?: DatabaseSslMode | undefined;
}
/** Redacted, JSON-safe database diagnostics suitable for structured logs. */
export interface DatabaseConfigurationDiagnostics {
    /** The only supported production provider. */
    readonly provider: "postgresql";
    /** Validated runtime environment. */
    readonly environment: DatabaseEnvironment;
    /** Database hostname without credentials. */
    readonly host: string;
    /** Effective PostgreSQL port. */
    readonly port: number;
    /** Database name without URL encoding. */
    readonly database: string;
    /** Validated startup deadline in milliseconds. */
    readonly startupTimeoutMs: number;
    /** Validated default query deadline in milliseconds. */
    readonly queryTimeoutMs: number;
    /** Effective TLS policy; production always requires TLS. */
    readonly sslMode: DatabaseSslMode;
}
/** Stable validation failure that never embeds the rejected connection string. */
export declare class DatabaseConfigurationError extends Error {
    constructor(message: string);
}
/**
 * Authoritative validated PostgreSQL configuration value object.
 *
 * The instance is immutable for its process lifetime and safe for concurrent
 * reads. JSON serialization returns redacted diagnostics; the connection string
 * is available only to an injected infrastructure client factory. Future pool
 * and certificate settings can extend the input without changing consumers of
 * the diagnostic contract.
 */
export declare class DatabaseConfiguration {
    #private;
    private constructor();
    /** Validates untrusted environment input and returns immutable configuration. */
    static from(input: DatabaseConfigurationInput): DatabaseConfiguration;
    /**
     * Returns the sensitive connection string exclusively for client creation.
     * Callers must never log, serialize, cache outside this object, or expose it.
     */
    connectionStringForClientFactory(): string;
    /** Returns a frozen diagnostic snapshot containing no credentials or query parameters. */
    diagnostics(): DatabaseConfigurationDiagnostics;
    /** Makes generic JSON and structured logging safe by default. */
    toJSON(): DatabaseConfigurationDiagnostics;
}
//# sourceMappingURL=DatabaseConfiguration.d.ts.map