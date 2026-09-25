import { PrismaBirthdayRepository, PrismaModerationRepository, PrismaScheduledMessageRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { birthdaysFeature, moderationFeature, scheduledMessagesFeature, ticketsFeature, type DiscordFeatureFactory } from "@qbox/discord";

/**
 * Every pluggable Discord feature the bot runs. Add one line per feature;
 * repositories share the persistence client's Prisma connection.
 */
export function botFeatures(persistence: PrismaPermissionPersistenceClient): readonly DiscordFeatureFactory[] {
  return [
    ticketsFeature(persistence.repositories.tickets),
    moderationFeature(new PrismaModerationRepository(persistence.prisma)),
    birthdaysFeature(new PrismaBirthdayRepository(persistence.prisma)),
    scheduledMessagesFeature(new PrismaScheduledMessageRepository(persistence.prisma)),
  ];
}
