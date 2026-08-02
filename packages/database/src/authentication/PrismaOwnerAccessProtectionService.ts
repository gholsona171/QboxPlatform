import {
  AuthenticationInfrastructureError,
  OwnerAccessInvariantError,
  type OwnerAccessProtectionInput,
  type OwnerAccessProtectionService,
} from "@qbox/authentication";
import { Prisma, type PrismaClient } from "@qbox/prisma";

import { createPrismaAuthenticationRepositorySet } from "./PrismaAuthenticationRepositories.js";

interface UsableOwnerPath {
  readonly platformUserId: string;
  readonly externalIdentityId: string;
}

/**
 * PostgreSQL owner-access safety boundary.
 *
 * Each protected account/identity mutation acquires the same advisory transaction
 * lock as permission owner mutations, re-reads permission and authentication
 * state inside that transaction, runs the supplied mutation through repositories
 * bound to that exact transaction, and appends the mandatory audit before commit.
 * No cache or process-local owner count participates in the decision.
 */
export class PrismaOwnerAccessProtectionService
  implements OwnerAccessProtectionService
{
  /** Binds protection to the lifecycle-owned client and bounded transaction policy. */
  public constructor(
    private readonly client: PrismaClient,
    private readonly timeoutMs = 5_000,
  ) {
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 300_000)
      throw new RangeError("Owner-access transaction timeout is outside reviewed bounds.");
  }

  /** Protects one account/identity mutation and atomically records its outcome. */
  public async protect<TResult>(
    input: OwnerAccessProtectionInput<TResult>,
  ): Promise<TResult> {
    try {
      const result = await this.client.$transaction(
        async (transaction) => {
          await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended('qbox:platform-owner-mutation', 0))`;
          const before = await loadUsableOwnerPaths(transaction, input.occurredAt);
          if (targetRemovesLastPath(input.target, before)) {
            await createPrismaAuthenticationRepositorySet(transaction).audit.append(
              input.rejectionAudit,
            );
            return { rejected: true as const };
          }

          const repositories = createPrismaAuthenticationRepositorySet(transaction);
          const value = await input.operation(repositories);
          const after = await loadUsableOwnerPaths(transaction, input.occurredAt);
          if (before.length > 0 && after.length === 0)
            throw new OwnerAccessInvariantError();
          await repositories.audit.append(input.successAudit);
          return { rejected: false as const, value };
        },
        { timeout: this.timeoutMs, maxWait: this.timeoutMs },
      );
      if (result.rejected) throw new OwnerAccessInvariantError();
      return result.value;
    } catch (error) {
      if (
        error instanceof OwnerAccessInvariantError ||
        error instanceof AuthenticationInfrastructureError
      )
        throw error;
      throw new AuthenticationInfrastructureError({
        code: "dependency-unavailable",
        operation: "owner-access.protect",
        retryable: true,
      });
    }
  }
}

async function loadUsableOwnerPaths(
  transaction: Prisma.TransactionClient,
  now: Date,
): Promise<readonly UsableOwnerPath[]> {
  return transaction.$queryRaw<UsableOwnerPath[]>`
    SELECT DISTINCT
      pu."id"::text AS "platformUserId",
      ei."id"::text AS "externalIdentityId"
    FROM "permission_assignments" pa
    INNER JOIN "permission_principals" pp ON pp."id" = pa."principal_id"
    INNER JOIN "permission_definitions" pd ON pd."id" = pa."permission_definition_id"
    INNER JOIN "guilds" g ON g."id" = pp."guild_id"
    INNER JOIN "external_identities" ei
      ON ei."provider" = 'discord'
     AND ei."provider_subject_id" = pp."external_id"
    INNER JOIN "platform_users" pu ON pu."id" = ei."platform_user_id"
    WHERE pd."key" = 'platform.owner'
      AND pd."enabled" = true
      AND pp."type" = 'discord-user'
      AND pp."enabled" = true
      AND g."enabled" = true
      AND pa."scope" = 'platform'
      AND pa."effect" = 'allow'
      AND pa."enabled" = true
      AND pa."revoked_at" IS NULL
      AND (pa."expires_at" IS NULL OR pa."expires_at" > ${now})
      AND pu."status" = 'active'
      AND ei."enabled" = true
      AND ei."unlinked_at" IS NULL
    ORDER BY pu."id"::text, ei."id"::text
  `;
}

function targetRemovesLastPath(
  target: OwnerAccessProtectionInput<unknown>["target"],
  paths: readonly UsableOwnerPath[],
): boolean {
  if (paths.length === 0) return false;
  const affected = paths.some((path) =>
    target.type === "platform-user"
      ? path.platformUserId === target.id
      : path.externalIdentityId === target.id,
  );
  if (!affected) return false;
  return !paths.some((path) =>
    target.type === "platform-user"
      ? path.platformUserId !== target.id
      : path.externalIdentityId !== target.id,
  );
}
