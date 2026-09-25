import { PrismaModerationRepository, PrismaVerificationRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { moderationFeature, ticketsFeature, verificationFeature, type DiscordFeatureFactory } from "@qbox/discord";

/**
 * Every pluggable Discord feature the bot runs. Add one line per feature;
 * repositories share the persistence client's Prisma connection.
 */
export function botFeatures(persistence: PrismaPermissionPersistenceClient): readonly DiscordFeatureFactory[] {
  return [
    ticketsFeature(persistence.repositories.tickets),
    moderationFeature(new PrismaModerationRepository(persistence.prisma)),
    verificationFeature(new PrismaVerificationRepository(persistence.prisma)),
  ];
}
