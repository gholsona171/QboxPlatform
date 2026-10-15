import type { PrismaClient } from "@qbox/prisma";
import { PrismaAuthenticationUnitOfWork, type PrismaAuthenticationRepositorySet } from "./PrismaAuthenticationRepositories.js";
/**
 * Import-safe authentication persistence composition over one externally owned
 * Prisma client. The object creates no connection, owns no pool, and requires no
 * disposal; the caller's existing `DatabaseService` lifecycle remains authoritative.
 */
export declare class PrismaAuthenticationPersistence {
    /** Repositories sharing the lifecycle-owned process client. */
    readonly repositories: PrismaAuthenticationRepositorySet;
    /** Transaction boundary that creates one bound repository set per callback. */
    readonly unitOfWork: PrismaAuthenticationUnitOfWork;
    /** Binds authentication infrastructure to the supplied client without connecting. */
    constructor(client: PrismaClient, transactionTimeoutMs?: number);
}
//# sourceMappingURL=PrismaAuthenticationPersistence.d.ts.map