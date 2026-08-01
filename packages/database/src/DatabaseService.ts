import type { DatabaseConfiguration } from "./config/DatabaseConfiguration.js";
import {
  HealthState,
  ReadinessState,
  type ClientFactory,
  type DatabaseClient,
  type DatabaseHealthSnapshot,
  type DatabaseLifecycleState,
  type DatabaseServiceContract,
  type ShutdownResult,
  type StartupResult,
} from "./contracts/DatabaseContracts.js";

/**
 * Pure process-local database lifecycle coordinator.
 *
 * It creates no PostgreSQL or Prisma dependency. An injected factory owns that
 * future boundary. Startup failure always attempts client cleanup, no client is
 * shared across processes, and state observations contain no sensitive values.
 */
export class DatabaseService implements DatabaseServiceContract {
  private state: DatabaseLifecycleState = "CREATED";
  private client: DatabaseClient | undefined;
  private reason: string | undefined;

  public constructor(
    private readonly configuration: DatabaseConfiguration,
    private readonly clientFactory: ClientFactory,
  ) {}

  /** Starts the injected client with a bounded deadline and cleanup on failure. */
  public async start(): Promise<StartupResult> {
    if (this.state === "READY") {
      return { started: true, state: "READY", cleanupAttempted: false };
    }
    if (this.state === "STARTING" || this.state === "STOPPING") {
      return {
        started: false,
        state: this.state,
        reason: "invalid-lifecycle-transition",
        cleanupAttempted: false,
      };
    }

    this.state = "STARTING";
    this.reason = undefined;
    let cleanupAttempted = false;
    let cleanupSucceeded: boolean | undefined;

    try {
      this.client = this.clientFactory.create(this.configuration);
      const controller = new AbortController();
      await withTimeout(
        this.client.start(controller.signal),
        this.configuration.diagnostics().startupTimeoutMs,
        "database-startup-timeout",
        controller,
      );
      this.state = "READY";
      return { started: true, state: "READY", cleanupAttempted: false };
    } catch (error) {
      this.reason = safeReason(error, "database-startup-failed");
      if (this.client !== undefined) {
        cleanupAttempted = true;
        try {
          await this.client.stop();
          cleanupSucceeded = true;
        } catch {
          cleanupSucceeded = false;
          this.reason = "database-startup-cleanup-failed";
        }
      }
      this.client = undefined;
      this.state = "FAILED";
      return {
        started: false,
        state: "FAILED",
        reason: this.reason,
        cleanupAttempted,
        ...(cleanupSucceeded === undefined ? {} : { cleanupSucceeded }),
      };
    }
  }

  /** Stops the owned client; repeated calls after a successful stop are safe. */
  public async stop(): Promise<ShutdownResult> {
    if (this.state === "STOPPED" || this.state === "CREATED") {
      this.state = "STOPPED";
      this.reason = undefined;
      return { stopped: true, state: "STOPPED" };
    }
    if (this.state === "STOPPING") {
      return {
        stopped: false,
        state: "STOPPING",
        reason: "shutdown-already-in-progress",
      };
    }

    this.state = "STOPPING";
    try {
      await this.client?.stop();
      this.client = undefined;
      this.reason = undefined;
      this.state = "STOPPED";
      return { stopped: true, state: "STOPPED" };
    } catch {
      this.reason = "database-shutdown-failed";
      this.state = "FAILED";
      return {
        stopped: false,
        state: "FAILED",
        reason: this.reason,
      };
    }
  }

  /** Returns LIVE, READY, or DEGRADED according to current lifecycle state. */
  public health(): DatabaseHealthSnapshot {
    if (this.state === "READY") {
      return {
        health: HealthState.READY,
        readiness: ReadinessState.ACCEPTING,
        lifecycle: this.state,
      };
    }
    if (this.state === "FAILED") {
      return {
        health: HealthState.DEGRADED,
        readiness: ReadinessState.REJECTING,
        lifecycle: this.state,
        ...(this.reason === undefined ? {} : { reason: this.reason }),
      };
    }
    return {
      health: HealthState.LIVE,
      readiness: ReadinessState.REJECTING,
      lifecycle: this.state,
    };
  }
}

function safeReason(error: unknown, fallback: string): string {
  return error instanceof Error && error.message === "database-startup-timeout"
    ? error.message
    : fallback;
}

async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  reason: string,
  controller: AbortController,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort(reason);
      reject(new Error(reason));
    }, timeoutMs);
  });
  try {
    return await Promise.race([operation, expired]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}
