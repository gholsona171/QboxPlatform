import { PrismaFivemRepository, PrismaKnowledgeRepository, PrismaModerationRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { fivemFeature, knowledgeFeature, moderationFeature, ticketsFeature, type DiscordFeatureFactory } from "@qbox/discord";
import { env } from "@qbox/shared";

/**
 * Every pluggable Discord feature the bot runs. Add one line per feature;
 * repositories share the persistence client's Prisma connection.
 */
export function botFeatures(persistence: PrismaPermissionPersistenceClient): readonly DiscordFeatureFactory[] {
  return [
    ticketsFeature(persistence.repositories.tickets),
    moderationFeature(new PrismaModerationRepository(persistence.prisma)),
    knowledgeFeature(new PrismaKnowledgeRepository(persistence.prisma), { openAiApiKey: env.OPENAI_API_KEY, openAiModel: env.OPENAI_MODEL }),
    fivemFeature(new PrismaFivemRepository(persistence.prisma)),
  ];
}
