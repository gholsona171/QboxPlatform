import type { DatabaseConfiguration } from "../config/DatabaseConfiguration.js";

/** Process health states exposed without requiring a database connection. */
export const HealthState = {
  /** The process is alive but its required database resources are not ready. */
  LIVE: "LIVE",
  /** The process is alive and all required database resources are operational. */
  READY: "READY",
  /** The process is alive with a known failure or reduced database capability. */
  DEGRADED: "DEGRADED",
} as const;

/** Exact process health state. */
export type HealthState = (typeof HealthState)[keyof typeof HealthState];

/** Whether new database-dependent work may be accepted. */
export const ReadinessState = {
  /** Database-dependent work may be accepted. */
  ACCEPTING: "ACCEPTING",
  /** Database-dependent work must be rejected. */
  REJECTING: "REJECTING",
} as const;

/** Exact database readiness state. */
export type ReadinessState =
  (typeof ReadinessState)[keyof typeof ReadinessState];

/** Observable process-local lifecycle states for a database service. */
export type DatabaseLifecycleState =
  "CREATED" | "STARTING" | "READY" | "STOPPING" | "STOPPED" | "FAILED";

/** Redacted health snapshot safe for concurrent diagnostics and structured logs. */
export interface DatabaseHealthSnapshot {
  /** Liveness/readiness summary. */
  readonly health: HealthState;
  /** Whether callers may begin new database-dependent work. */
  readonly readiness: ReadinessState;
  /** Current process-local lifecycle state. */
  readonly lifecycle: DatabaseLifecycleState;
  /** Stable non-secret reason code for degraded or unavailable states. */
  readonly reason?: string;
}

/** Successful or failed startup outcome; failures imply cleanup was attempted. */
export interface StartupResult {
  /** Whether the service reached READY. */
  readonly started: boolean;
  /** Final lifecycle state after startup and any required cleanup. */
  readonly state: DatabaseLifecycleState;
  /** Safe failure category without connection details. */
  readonly reason?: string;
  /** Whether a created client was cleaned up after failure. */
  readonly cleanupAttempted: boolean;
  /** Whether cleanup completed successfully when attempted. */
  readonly cleanupSucceeded?: boolean;
}

/** Idempotent shutdown outcome safe for operational reporting. */
export interface ShutdownResult {
  /** Whether all owned client resources were released. */
  readonly stopped: boolean;
  /** Final lifecycle state. */
  readonly state: DatabaseLifecycleState;
  /** Safe failure category without client or credential data. */
  readonly reason?: string;
}

/**
 * Minimal process-owned client lifecycle required by DatabaseService.
 * Implementations may wrap Prisma later; consumers must not depend on Prisma.
 */
export interface DatabaseClient {
  /** Establishes resources and verifies readiness; must cooperate with abort. */
  start(signal: AbortSignal): Promise<void>;
  /** Releases all process-local resources; implementations should be idempotent. */
  stop(): Promise<void>;
}

/**
 * Infrastructure factory for one process-local database client.
 * It receives validated configuration and must not retain or log credentials.
 */
export interface ClientFactory<
  TClient extends DatabaseClient = DatabaseClient,
> {
  /** Creates an unstarted client owned by the caller. */
  create(configuration: DatabaseConfiguration): TClient;
}

/**
 * Transaction boundary independent of Prisma and SQL.
 * Implementations run callbacks atomically, never permit a transaction context
 * to escape, and may later add bounded isolation/retry policy.
 */
export interface TransactionRunner<TContext = unknown> {
  /** Runs one complete use case inside an implementation-owned transaction. */
  run<TResult>(
    operation: (context: TContext) => Promise<TResult>,
  ): Promise<TResult>;
}

/**
 * Public lifecycle contract consumed by application composition.
 * One implementation instance owns one process-local client and is safe under
 * sequential kernel lifecycle calls; it accepts no work until startup succeeds.
 */
export interface DatabaseServiceContract {
  /** Starts and verifies owned resources within the configured deadline. */
  start(): Promise<StartupResult>;
  /** Stops owned resources and rejects new work. */
  stop(): Promise<ShutdownResult>;
  /** Returns a redacted synchronous snapshot of current state. */
  health(): DatabaseHealthSnapshot;
}
