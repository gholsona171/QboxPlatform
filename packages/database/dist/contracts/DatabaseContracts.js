/** Process health states exposed without requiring a database connection. */
export const HealthState = {
    /** The process is alive but its required database resources are not ready. */
    LIVE: "LIVE",
    /** The process is alive and all required database resources are operational. */
    READY: "READY",
    /** The process is alive with a known failure or reduced database capability. */
    DEGRADED: "DEGRADED",
};
/** Whether new database-dependent work may be accepted. */
export const ReadinessState = {
    /** Database-dependent work may be accepted. */
    ACCEPTING: "ACCEPTING",
    /** Database-dependent work must be rejected. */
    REJECTING: "REJECTING",
};
//# sourceMappingURL=DatabaseContracts.js.map