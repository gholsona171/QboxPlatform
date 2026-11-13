/** Mutable process-local health coordinator owned by one API composition. */
export class ApiLifecycleHealth {
    database;
    httpState = "created";
    catalogState = "pending";
    stopping = false;
    constructor(database) {
        this.database = database;
    }
    markHttp(state) {
        this.httpState = state;
    }
    markCatalogSynchronized() {
        this.catalogState = "synchronized";
    }
    markCatalogFailed() {
        this.catalogState = "failed";
    }
    beginShutdown() {
        this.stopping = true;
        if (this.httpState === "listening")
            this.httpState = "stopping";
    }
    snapshot() {
        const database = this.database.health();
        return [
            {
                name: "database",
                required: true,
                state: database.readiness === "ACCEPTING"
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
                state: this.catalogState === "synchronized"
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
                state: this.httpState === "listening"
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
    isStopping() {
        return this.stopping;
    }
}
//# sourceMappingURL=ApiLifecycleHealth.js.map