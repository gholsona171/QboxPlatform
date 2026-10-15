import { type OwnerAccessProtectionInput, type OwnerAccessProtectionService } from "@qbox/authentication";
import { type PrismaClient } from "@qbox/prisma";
/**
 * PostgreSQL owner-access safety boundary.
 *
 * Each protected account/identity mutation acquires the same advisory transaction
 * lock as permission owner mutations, re-reads permission and authentication
 * state inside that transaction, runs the supplied mutation through repositories
 * bound to that exact transaction, and appends the mandatory audit before commit.
 * No cache or process-local owner count participates in the decision.
 */
export declare class PrismaOwnerAccessProtectionService implements OwnerAccessProtectionService {
    private readonly client;
    private readonly timeoutMs;
    /** Binds protection to the lifecycle-owned client and bounded transaction policy. */
    constructor(client: PrismaClient, timeoutMs?: number);
    /** Protects one account/identity mutation and atomically records its outcome. */
    protect<TResult>(input: OwnerAccessProtectionInput<TResult>): Promise<TResult>;
}
//# sourceMappingURL=PrismaOwnerAccessProtectionService.d.ts.map