import { PrismaClient } from "./generated/client/client.js";
/**
 * Narrow sensitive configuration accepted from `@qbox/database`.
 *
 * The structural boundary avoids a reverse workspace dependency. Implementors
 * must return a validated PostgreSQL URL and must never expose it through JSON,
 * logs, errors, or diagnostics. The factory reads it once during construction.
 */
export interface PrismaClientConfiguration {
    /** Returns the validated secret solely for PostgreSQL adapter construction. */
    connectionStringForClientFactory(): string;
}
/**
 * Safe event logging configured for every Prisma client created here.
 * Query and informational logging are deliberately absent so SQL, parameters,
 * and connection details cannot enter application logs through this factory.
 */
export declare const PRISMA_SAFE_LOG_CONFIGURATION: readonly [{
    readonly emit: "event";
    readonly level: "warn";
}, {
    readonly emit: "event";
    readonly level: "error";
}];
/**
 * PostgreSQL session option required by Prisma 7's JavaScript driver adapter.
 * The adapter transmits UTC date components without an offset, so every pooled
 * connection must interpret those values in UTC to preserve `timestamptz` instants.
 */
export declare const PRISMA_POSTGRES_SESSION_OPTIONS = "-c timezone=UTC";
/**
 * Interactive transaction limits. The hosted database can be in a different
 * region than the bot, so each query in a transaction costs a network round
 * trip; Prisma's 5 second default is too tight for multi-step writes there.
 */
export declare const PRISMA_TRANSACTION_OPTIONS: {
    readonly maxWait: 10000;
    readonly timeout: 30000;
};
/**
 * PostgreSQL pool settings. The hosted database is reached through a TLS
 * session pooler in another cloud, where opening a connection costs several
 * round trips, so connections are kept and reused: at most 5 (the pooler's
 * per-client budget), idle connections live 2 minutes instead of pg's
 * 10-second default, and TCP keep-alive stops NAT and proxies from dropping
 * them silently.
 */
export declare const PRISMA_POOL_OPTIONS: {
    readonly max: 5;
    readonly idleTimeoutMillis: 120000;
    readonly keepAlive: true;
    readonly keepAliveInitialDelayMillis: 10000;
};
/** Receives the duration of every SQL statement (and transaction start) the client runs; never the SQL itself. */
export type PrismaQueryObserver = (durationMs: number) => void;
/** Options for clients created by one factory. */
export interface PrismaClientFactoryOptions {
    /** Counts and times database round trips, for example per API request. */
    readonly onQuery?: PrismaQueryObserver;
}
/**
 * Prisma 7 client factory for process-level dependency injection.
 *
 * Each call creates a distinct, disconnected Prisma Client backed by the
 * official PostgreSQL driver adapter. It enables event-mode warning and error
 * logs only: queries, bind parameters, and credentials are never configured for
 * logging. The factory owns no global state, connection lifecycle, repository
 * behavior, or shutdown behavior. `@qbox/database` will start and stop returned
 * clients in a later subphase.
 */
export declare class PrismaClientFactory {
    private readonly options;
    constructor(options?: PrismaClientFactoryOptions);
    /** Creates one disconnected Prisma Client without invoking `$connect`. */
    create(configuration: PrismaClientConfiguration): PrismaClient;
}
/**
 * Wraps the driver adapter (and the adapters and transactions it hands out)
 * so every statement reports its duration. Only timing leaves this function.
 */
export declare function observeQueries<T extends object>(target: T, onQuery: PrismaQueryObserver): T;
//# sourceMappingURL=PrismaClientFactory.d.ts.map