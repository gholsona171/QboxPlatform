import { PrismaApplicationRepository, PrismaBirthdayRepository, PrismaFivemRepository, PrismaGiveawayRepository, PrismaKnowledgeRepository, PrismaLevelRepository, PrismaModerationRepository, PrismaPollRepository, PrismaScheduledMessageRepository, PrismaStaffRepository, PrismaVerificationRepository, PrismaVoiceRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { applicationsFeature, birthdaysFeature, fivemFeature, giveawaysFeature, knowledgeFeature, levelsFeature, moderationFeature, pollsFeature, scheduledMessagesFeature, staffFeature, ticketsFeature, verificationFeature, voiceRoomsFeature, type DiscordFeatureFactory } from "@qbox/discord";
import { env } from "@qbox/shared";

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
    levelsFeature(new PrismaLevelRepository(persistence.prisma)),
    voiceRoomsFeature(new PrismaVoiceRepository(persistence.prisma)),
    knowledgeFeature(new PrismaKnowledgeRepository(persistence.prisma), { openAiApiKey: env.OPENAI_API_KEY, openAiModel: env.OPENAI_MODEL }),
    fivemFeature(new PrismaFivemRepository(persistence.prisma)),
  ];
}
