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
    });

    return new PrismaClient({
      adapter,
      log: [...PRISMA_SAFE_LOG_CONFIGURATION],
    });
  }
}
