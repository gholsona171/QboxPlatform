import { PrismaPg } from "@prisma/adapter-pg";

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
export const PRISMA_SAFE_LOG_CONFIGURATION = [
  { emit: "event", level: "warn" },
  { emit: "event", level: "error" },
] as const;

/**
 * PostgreSQL session option required by Prisma 7's JavaScript driver adapter.
 * The adapter transmits UTC date components without an offset, so every pooled
 * connection must interpret those values in UTC to preserve `timestamptz` instants.
 */
export const PRISMA_POSTGRES_SESSION_OPTIONS = "-c timezone=UTC";

/**
 * Interactive transaction limits. The hosted database can be in a different
 * region than the bot, so each query in a transaction costs a network round
 * trip; Prisma's 5 second default is too tight for multi-step writes there.
 */
export const PRISMA_TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 30_000 } as const;

/**
 * PostgreSQL pool settings. The hosted database is reached through a TLS
 * session pooler in another cloud, where opening a connection costs several
 * round trips, so connections are kept and reused: at most 5 (the pooler's
 * per-client budget), idle connections live 2 minutes instead of pg's
 * 10-second default, and TCP keep-alive stops NAT and proxies from dropping
 * them silently.
 */
export const PRISMA_POOL_OPTIONS = {
  max: 5,
  idleTimeoutMillis: 120_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
} as const;

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
export class PrismaClientFactory {
  public constructor(private readonly options: PrismaClientFactoryOptions = {}) {}

  /** Creates one disconnected Prisma Client without invoking `$connect`. */
  public create(configuration: PrismaClientConfiguration): PrismaClient {
    const adapter = new PrismaPg({
      connectionString: configuration.connectionStringForClientFactory(),
      options: PRISMA_POSTGRES_SESSION_OPTIONS,
      ...PRISMA_POOL_OPTIONS,
    });
    const onQuery = this.options.onQuery;

    return new PrismaClient({
      adapter: onQuery ? observeQueries(adapter, onQuery) : adapter,
      log: [...PRISMA_SAFE_LOG_CONFIGURATION],
      transactionOptions: PRISMA_TRANSACTION_OPTIONS,
    });
  }
}

const TIMED_METHODS: ReadonlySet<PropertyKey> = new Set(["queryRaw", "executeRaw", "startTransaction"]);
const WRAPPED_RESULTS: ReadonlySet<PropertyKey> = new Set(["connect", "startTransaction"]);

/**
 * Wraps the driver adapter (and the adapters and transactions it hands out)
 * so every statement reports its duration. Only timing leaves this function.
 */
export function observeQueries<T extends object>(target: T, onQuery: PrismaQueryObserver): T {
  return new Proxy(target, {
    get(object, property) {
      const value: unknown = Reflect.get(object, property, object);
      if (typeof value !== "function") return value;
      const method = value as (...args: unknown[]) => unknown;
      if (!TIMED_METHODS.has(property) && !WRAPPED_RESULTS.has(property)) return method.bind(object);
      return async (...args: unknown[]) => {
        const started = performance.now();
        try {
          const result = await method.apply(object, args);
          return WRAPPED_RESULTS.has(property) && typeof result === "object" && result !== null
            ? observeQueries(result, onQuery)
            : result;
        } finally {
          if (TIMED_METHODS.has(property)) {
            try {
              onQuery(performance.now() - started);
            } catch {
              // Observers never affect queries.
            }
          }
        }
      };
    },
  });
}
