import { PrismaLevelRepository, PrismaModerationRepository, PrismaVoiceRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { levelsFeature, moderationFeature, ticketsFeature, voiceRoomsFeature, type DiscordFeatureFactory } from "@qbox/discord";

/**
 * Every pluggable Discord feature the bot runs. Add one line per feature;
 * repositories share the persistence client's Prisma connection.
 */
export function botFeatures(persistence: PrismaPermissionPersistenceClient): readonly DiscordFeatureFactory[] {
  return [
    ticketsFeature(persistence.repositories.tickets),
    moderationFeature(new PrismaModerationRepository(persistence.prisma)),
    levelsFeature(new PrismaLevelRepository(persistence.prisma)),
    voiceRoomsFeature(new PrismaVoiceRepository(persistence.prisma)),
  ];
}
