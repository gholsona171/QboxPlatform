import type { DatabaseServiceContract } from "@qbox/database";
import type { ApiComponentHealth, ApiHealthProvider } from "../health/ApiHealth.js";
/** Observable HTTP lifecycle states used by readiness and diagnostics. */
export type ApiHttpLifecycleState = "created" | "starting" | "listening" | "stopping" | "stopped" | "failed";
/** Mutable process-local health coordinator owned by one API composition. */
export declare class ApiLifecycleHealth implements ApiHealthProvider {
    private readonly database;
    private httpState;
    private catalogState;
    private stopping;
    constructor(database: DatabaseServiceContract);
    markHttp(state: ApiHttpLifecycleState): void;
    markCatalogSynchronized(): void;
    markCatalogFailed(): void;
    beginShutdown(): void;
    snapshot(): readonly ApiComponentHealth[];
    isStopping(): boolean;
}
//# sourceMappingURL=ApiLifecycleHealth.d.ts.map