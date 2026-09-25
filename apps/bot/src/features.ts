import { PrismaApplicationRepository, PrismaBirthdayRepository, PrismaGiveawayRepository, PrismaModerationRepository, PrismaPollRepository, PrismaScheduledMessageRepository, PrismaStaffRepository, PrismaVerificationRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { applicationsFeature, birthdaysFeature, giveawaysFeature, moderationFeature, pollsFeature, scheduledMessagesFeature, staffFeature, ticketsFeature, verificationFeature, type DiscordFeatureFactory } from "@qbox/discord";

/**
 * Every pluggable Discord feature the bot runs. Add one line per feature;
 * repositories share the persistence client's Prisma connection.
 */
export function botFeatures(persistence: PrismaPermissionPersistenceClient): readonly DiscordFeatureFactory[] {
  return [
    ticketsFeature(persistence.repositories.tickets),
    moderationFeature(new PrismaModerationRepository(persistence.prisma)),
    verificationFeature(new PrismaVerificationRepository(persistence.prisma)),
    applicationsFeature(new PrismaApplicationRepository(persistence.prisma)),
    staffFeature(new PrismaStaffRepository(persistence.prisma)),
    pollsFeature(new PrismaPollRepository(persistence.prisma)),
    giveawaysFeature(new PrismaGiveawayRepository(persistence.prisma)),
    birthdaysFeature(new PrismaBirthdayRepository(persistence.prisma)),
    scheduledMessagesFeature(new PrismaScheduledMessageRepository(persistence.prisma)),
  ];
}
