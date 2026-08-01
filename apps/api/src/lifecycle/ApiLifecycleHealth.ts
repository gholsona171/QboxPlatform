import type { DatabaseServiceContract } from "@qbox/database";
import type {
  ApiComponentHealth,
  ApiHealthProvider,
} from "../health/ApiHealth.js";

/** Observable HTTP lifecycle states used by readiness and diagnostics. */
export type ApiHttpLifecycleState =
  | "created"
  | "starting"
  | "listening"
  | "stopping"
  | "stopped"
  | "failed";

/** Mutable process-local health coordinator owned by one API composition. */
export class ApiLifecycleHealth implements ApiHealthProvider {
  private httpState: ApiHttpLifecycleState = "created";
  private catalogState: "pending" | "synchronized" | "failed" = "pending";
  private stopping = false;

  public constructor(private readonly database: DatabaseServiceContract) {}

  public markHttp(state: ApiHttpLifecycleState): void {
    this.httpState = state;
  }

  public markCatalogSynchronized(): void {
    this.catalogState = "synchronized";
  }

  public markCatalogFailed(): void {
    this.catalogState = "failed";
  }

  public beginShutdown(): void {
    this.stopping = true;
    if (this.httpState === "listening") this.httpState = "stopping";
  }

  public snapshot(): readonly ApiComponentHealth[] {
    const database = this.database.health();
    return [
      {
        name: "database",
        required: true,
        state:
          database.readiness === "ACCEPTING"
            ? "ready"
            : database.health === "DEGRADED"
              ? "degraded"
              : "live",
        ...(database.reason === undefined
          ? {}
          : { reasonCode: database.reason }),
      },
      {
        name: "permission-catalog",
        required: true,
        state:
          this.catalogState === "synchronized"
            ? "ready"
            : this.catalogState === "failed"
              ? "degraded"
              : "live",
        ...(this.catalogState === "failed"
          ? { reasonCode: "catalog-synchronization-failed" }
          : {}),
      },
      {
        name: "http",
        required: true,
        state:
          this.httpState === "listening"
            ? "ready"
            : this.httpState === "failed"
              ? "degraded"
              : "live",
        ...(this.httpState === "failed"
          ? { reasonCode: "http-lifecycle-failed" }
          : {}),
      },
    ];
  }

  public isStopping(): boolean {
    return this.stopping;
  }
}
