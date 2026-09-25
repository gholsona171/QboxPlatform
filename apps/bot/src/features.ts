import { PermissionBootstrapService, PrismaApplicationRepository, PrismaBirthdayRepository, PrismaBuilderRepository, PrismaFivemRepository, PrismaGiveawayRepository, PrismaKnowledgeRepository, PrismaLevelRepository, PrismaMessagesRepository, PrismaModerationRepository, PrismaPollRepository, PrismaScheduledMessageRepository, PrismaStaffRepository, PrismaVerificationRepository, PrismaVoiceRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { applicationsFeature, birthdaysFeature, builderFeature, guildOnboardingFeature, fivemFeature, giveawaysFeature, knowledgeFeature, levelsFeature, messagesFeature, moderationFeature, pollsFeature, scheduledMessagesFeature, staffFeature, ticketsFeature, verificationFeature, voiceRoomsFeature, type DiscordFeatureFactory } from "@qbox/discord";
import { MessageTemplateService } from "@qbox/messages";
import type { PersistentPermissionService } from "@qbox/permissions";
import { env } from "@qbox/shared";

/** Custom messages and the server-wide look, shared by every feature that posts to Discord. */
export function createTemplates(persistence: PrismaPermissionPersistenceClient): MessageTemplateService {
  return new MessageTemplateService(new PrismaMessagesRepository(persistence.prisma));
}

/**
 * Every pluggable Discord feature the bot runs. Add one line per feature;
 * repositories share the persistence client's Prisma connection.
 */
export function botFeatures(persistence: PrismaPermissionPersistenceClient, authorizer: PersistentPermissionService, templates: MessageTemplateService): readonly DiscordFeatureFactory[] {
  const bootstrap = new PermissionBootstrapService(
    persistence.repositories.guilds,
    persistence.repositories.principals,
    persistence.repositories.permissions,
    authorizer,
  );
  return [
    messagesFeature(templates),
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
