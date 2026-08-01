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
export class DatabaseConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

const DEFAULT_STARTUP_TIMEOUT_MS = 10_000;
const DEFAULT_QUERY_TIMEOUT_MS = 5_000;
const MIN_TIMEOUT_MS = 100;
const MAX_TIMEOUT_MS = 300_000;

/**
 * Authoritative validated PostgreSQL configuration value object.
 *
 * The instance is immutable for its process lifetime and safe for concurrent
 * reads. JSON serialization returns redacted diagnostics; the connection string
 * is available only to an injected infrastructure client factory. Future pool
 * and certificate settings can extend the input without changing consumers of
 * the diagnostic contract.
 */
export class DatabaseConfiguration {
  readonly #connectionString: string;
  readonly #diagnostics: DatabaseConfigurationDiagnostics;

  private constructor(
    connectionString: string,
    diagnostics: DatabaseConfigurationDiagnostics,
  ) {
    this.#connectionString = connectionString;
    this.#diagnostics = Object.freeze(diagnostics);
  }

  /** Validates untrusted environment input and returns immutable configuration. */
  public static from(input: DatabaseConfigurationInput): DatabaseConfiguration {
    const environment = parseEnvironment(input.environment);
    const startupTimeoutMs = validateTimeout(
      "startupTimeoutMs",
      input.startupTimeoutMs ?? DEFAULT_STARTUP_TIMEOUT_MS,
    );
    const queryTimeoutMs = validateTimeout(
      "queryTimeoutMs",
      input.queryTimeoutMs ?? DEFAULT_QUERY_TIMEOUT_MS,
    );
    const sslMode =
      input.sslMode ?? (environment === "production" ? "require" : "disable");
    if (environment === "production" && sslMode !== "require") {
      throw new DatabaseConfigurationError(
        "Production PostgreSQL configuration requires SSL mode 'require'.",
      );
    }

    const rawUrl = input.databaseUrl?.trim();
    if (!rawUrl) {
      throw new DatabaseConfigurationError("DATABASE_URL is required.");
    }

    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new DatabaseConfigurationError(
        "DATABASE_URL must be a valid PostgreSQL URL.",
      );
    }
    if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
      throw new DatabaseConfigurationError(
        "DATABASE_URL must use the postgresql protocol.",
      );
    }
    if (!url.hostname) {
      throw new DatabaseConfigurationError("DATABASE_URL must include a host.");
    }
    if (!url.username) {
      throw new DatabaseConfigurationError("DATABASE_URL must include a user.");
    }
    const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
    if (!database) {
      throw new DatabaseConfigurationError(
        "DATABASE_URL must include a database name.",
      );
    }
    const port = url.port ? Number(url.port) : 5432;
    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
      throw new DatabaseConfigurationError(
        "DATABASE_URL contains an invalid port.",
      );
    }

    return new DatabaseConfiguration(rawUrl, {
      provider: "postgresql",
      environment,
      host: url.hostname,
      port,
      database,
      startupTimeoutMs,
      queryTimeoutMs,
      sslMode,
    });
  }

  /**
   * Returns the sensitive connection string exclusively for client creation.
   * Callers must never log, serialize, cache outside this object, or expose it.
   */
  public connectionStringForClientFactory(): string {
    return this.#connectionString;
  }

  /** Returns a frozen diagnostic snapshot containing no credentials or query parameters. */
  public diagnostics(): DatabaseConfigurationDiagnostics {
    return this.#diagnostics;
  }

  /** Makes generic JSON and structured logging safe by default. */
  public toJSON(): DatabaseConfigurationDiagnostics {
    return this.#diagnostics;
  }
}

function parseEnvironment(value: string | undefined): DatabaseEnvironment {
  const environment = value ?? "development";
  if (
    environment !== "development" &&
    environment !== "test" &&
    environment !== "production"
  ) {
    throw new DatabaseConfigurationError(
      "Database environment must be development, test, or production.",
    );
  }
  return environment;
}

function validateTimeout(name: string, value: number): number {
  if (
    !Number.isInteger(value) ||
    value < MIN_TIMEOUT_MS ||
    value > MAX_TIMEOUT_MS
  ) {
    throw new DatabaseConfigurationError(
      `${name} must be an integer between ${MIN_TIMEOUT_MS} and ${MAX_TIMEOUT_MS} milliseconds.`,
    );
  }
  return value;
}
