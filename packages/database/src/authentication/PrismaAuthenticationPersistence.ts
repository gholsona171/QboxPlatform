import type { PrismaClient } from "@qbox/prisma";

import {
  createPrismaAuthenticationRepositorySet,
  PrismaAuthenticationUnitOfWork,
  type PrismaAuthenticationRepositorySet,
} from "./PrismaAuthenticationRepositories.js";

/**
 * Import-safe authentication persistence composition over one externally owned
 * Prisma client. The object creates no connection, owns no pool, and requires no
 * disposal; the caller's existing `DatabaseService` lifecycle remains authoritative.
 */
export class PrismaAuthenticationPersistence {
  /** Repositories sharing the lifecycle-owned process client. */
  public readonly repositories: PrismaAuthenticationRepositorySet;
  /** Transaction boundary that creates one bound repository set per callback. */
  public readonly unitOfWork: PrismaAuthenticationUnitOfWork;

  /** Binds authentication infrastructure to the supplied client without connecting. */
  public constructor(client: PrismaClient, transactionTimeoutMs = 5_000) {
    this.repositories = createPrismaAuthenticationRepositorySet(client);
    this.unitOfWork = new PrismaAuthenticationUnitOfWork(
      client,
      transactionTimeoutMs,
    );
  }
}
