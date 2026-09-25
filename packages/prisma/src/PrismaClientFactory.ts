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
  /** Creates one disconnected Prisma Client without invoking `$connect`. */
  public create(configuration: PrismaClientConfiguration): PrismaClient {
    const adapter = new PrismaPg({
      connectionString: configuration.connectionStringForClientFactory(),
      options: PRISMA_POSTGRES_SESSION_OPTIONS,
    });

    return new PrismaClient({
      adapter,
      log: [...PRISMA_SAFE_LOG_CONFIGURATION],
      transactionOptions: PRISMA_TRANSACTION_OPTIONS,
    });
  }
}
