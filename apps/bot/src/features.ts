import { PermissionBootstrapService, PrismaApplicationRepository, PrismaBirthdayRepository, PrismaBuilderRepository, PrismaFivemRepository, PrismaGiveawayRepository, PrismaKnowledgeRepository, PrismaLevelRepository, PrismaModerationRepository, PrismaPollRepository, PrismaScheduledMessageRepository, PrismaStaffRepository, PrismaStreamsRepository, PrismaVerificationRepository, PrismaVoiceRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { applicationsFeature, birthdaysFeature, builderFeature, guildOnboardingFeature, fivemFeature, giveawaysFeature, knowledgeFeature, levelsFeature, moderationFeature, pollsFeature, scheduledMessagesFeature, staffFeature, streamsFeature, ticketsFeature, verificationFeature, voiceRoomsFeature, type DiscordFeatureFactory } from "@qbox/discord";
import type { PersistentPermissionService } from "@qbox/permissions";
import { env } from "@qbox/shared";

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
    streamsFeature(new PrismaStreamsRepository(persistence.prisma), { credentials: streamCredentials() }),
    builderFeature(new PrismaBuilderRepository(persistence.prisma)),
  ];
}

/** Platform credentials from the host environment; empty values mean the platform runs without them (or, for Twitch, is unavailable). */
function streamCredentials() {
  return {
    twitchClientId: env.TWITCH_CLIENT_ID,
    twitchClientSecret: env.TWITCH_CLIENT_SECRET,
    kickClientId: env.KICK_CLIENT_ID,
    kickClientSecret: env.KICK_CLIENT_SECRET,
    youtubeApiKey: env.YOUTUBE_API_KEY,
  };
}
