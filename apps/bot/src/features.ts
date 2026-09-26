import { PermissionBootstrapService, PrismaApplicationRepository, PrismaBirthdayRepository, PrismaBuilderRepository, PrismaFivemRepository, PrismaGamesRepository, PrismaGiveawayRepository, PrismaKnowledgeRepository, PrismaLevelRepository, PrismaMessagesRepository, PrismaModerationRepository, PrismaMusicRepository, type PrismaPermissionPersistenceClient, PrismaPollRepository, PrismaScheduledMessageRepository, PrismaStaffRepository, PrismaStreamsRepository, PrismaVerificationRepository, PrismaVoiceRepository } from "@qbox/database";
import { applicationsFeature, birthdaysFeature, builderFeature, type DiscordFeatureFactory, fivemFeature, gamesFeature, giveawaysFeature, guildOnboardingFeature, knowledgeFeature, levelsFeature, messagesFeature, moderationFeature, musicFeature, pollsFeature, scheduledMessagesFeature, staffFeature, streamsFeature, ticketsFeature, verificationFeature, voiceRoomsFeature } from "@qbox/discord";
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
    streamsFeature(new PrismaStreamsRepository(persistence.prisma), { credentials: streamCredentials(), templates }),
    musicFeature(new PrismaMusicRepository(persistence.prisma), {
      discordToken: env.DISCORD_TOKEN,
      musicBotToken: env.MUSIC_BOT_TOKEN || undefined,
      controlPort: Number(env.MUSIC_CONTROL_PORT),
      storageDir: env.MUSIC_STORAGE_DIR,
      quotaBytes: Number(env.MUSIC_GUILD_QUOTA_MB) * 1024 * 1024,
      ffmpegPath: env.FFMPEG_PATH || undefined,
      jamendoClientId: env.JAMENDO_CLIENT_ID,
      templates,
    }),
    gamesFeature(new PrismaGamesRepository(persistence.prisma), templates),
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
