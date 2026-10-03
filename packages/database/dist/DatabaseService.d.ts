import type { DatabaseConfiguration } from "./config/DatabaseConfiguration.js";
import { type ClientFactory, type DatabaseHealthSnapshot, type DatabaseServiceContract, type ShutdownResult, type StartupResult } from "./contracts/DatabaseContracts.js";
/**
 * Pure process-local database lifecycle coordinator.
 *
 * It creates no PostgreSQL or Prisma dependency. An injected factory owns that
 * future boundary. Startup failure always attempts client cleanup, no client is
 * shared across processes, and state observations contain no sensitive values.
 */
export declare class DatabaseService implements DatabaseServiceContract {
    private readonly configuration;
    private readonly clientFactory;
    private state;
    private client;
    private reason;
    constructor(configuration: DatabaseConfiguration, clientFactory: ClientFactory);
    /** Starts the injected client with a bounded deadline and cleanup on failure. */
    start(): Promise<StartupResult>;
    /** Stops the owned client; repeated calls after a successful stop are safe. */
    stop(): Promise<ShutdownResult>;
    /** Returns LIVE, READY, or DEGRADED according to current lifecycle state. */
    health(): DatabaseHealthSnapshot;
}
//# sourceMappingURL=DatabaseService.d.ts.map