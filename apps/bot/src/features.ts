import { PermissionBootstrapService, PrismaApplicationRepository, PrismaBirthdayRepository, PrismaBuilderRepository, PrismaFivemRepository, PrismaGiveawayRepository, PrismaKnowledgeRepository, PrismaLevelRepository, PrismaModerationRepository, PrismaPollRepository, PrismaScheduledMessageRepository, PrismaStaffRepository, PrismaVerificationRepository, PrismaVoiceRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { applicationsFeature, birthdaysFeature, builderFeature, guildOnboardingFeature, fivemFeature, giveawaysFeature, knowledgeFeature, levelsFeature, moderationFeature, pollsFeature, scheduledMessagesFeature, staffFeature, ticketsFeature, verificationFeature, voiceRoomsFeature, type DiscordFeatureFactory } from "@qbox/discord";
import type { PersistentPermissionService } from "@qbox/permissions";
import { env } from "@qbox/shared";
import { passthroughTemplates, type MessageTemplates } from "@qbox/shared/messages";

/** Custom message templates for every feature that posts to Discord. */
export const templates: MessageTemplates = passthroughTemplates;

/**
 * Every pluggable Discord feature the bot runs. Add one line per feature;
 * repositories share the persistence client's Prisma connection.
 */
export function botFeatures(persistence: PrismaPermissionPersistenceClient, authorizer: PersistentPermissionService): readonly DiscordFeatureFactory[] {
  const bootstrap = new PermissionBootstrapService(
    persistence.repositories.guilds,
    persistence.repositories.principals,
    persistence.repositories.permissions,
    authorizer,
  );
  return [
    guildOnboardingFeature({
      ensureOwner: async (guildId, ownerId) => ({ created: (await bootstrap.applyOwner(guildId, ownerId)).createdAssignments > 0 }),
    }),
    ticketsFeature(persistence.repositories.tickets, templates),
    moderationFeature(new PrismaModerationRepository(persistence.prisma), templates),
    verificationFeature(new PrismaVerificationRepository(persistence.prisma), templates),
    applicationsFeature(new PrismaApplicationRepository(persistence.prisma)),
    staffFeature(new PrismaStaffRepository(persistence.prisma)),
    pollsFeature(new PrismaPollRepository(persistence.prisma)),
    giveawaysFeature(new PrismaGiveawayRepository(persistence.prisma), templates),
    birthdaysFeature(new PrismaBirthdayRepository(persistence.prisma), templates),
    scheduledMessagesFeature(new PrismaScheduledMessageRepository(persistence.prisma)),
    levelsFeature(new PrismaLevelRepository(persistence.prisma), templates),
    voiceRoomsFeature(new PrismaVoiceRepository(persistence.prisma)),
    knowledgeFeature(new PrismaKnowledgeRepository(persistence.prisma), { openAiApiKey: env.OPENAI_API_KEY, openAiModel: env.OPENAI_MODEL }),
    fivemFeature(new PrismaFivemRepository(persistence.prisma)),
    builderFeature(new PrismaBuilderRepository(persistence.prisma)),
  ];
}
