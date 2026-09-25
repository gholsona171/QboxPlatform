import { PrismaGiveawayRepository, PrismaModerationRepository, PrismaPollRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { DiscordRestGiveawayGateway, GiveawayService } from "@qbox/giveaways";
import { DiscordRestModerationGateway, ModerationService } from "@qbox/moderation";
import { DiscordRestPollGateway, PollService } from "@qbox/polls";
import { DiscordRestTicketGateway, TicketService } from "@qbox/tickets";
import type { REST } from "discord.js";

import { directoryApiFeature } from "./directory/DirectoryRoutes.js";
import type { ApiFeature } from "./features/ApiFeature.js";
import { giveawaysApiFeature } from "./giveaways/GiveawayRoutes.js";
import { moderationApiFeature } from "./moderation/ModerationRoutes.js";
import { pollsApiFeature } from "./polls/PollRoutes.js";
import { ticketsApiFeature } from "./tickets/TicketRoutes.js";

export interface ApiFeatureDependencies {
  readonly persistence: PrismaPermissionPersistenceClient;
  /** Discord REST client when a bot token is configured. */
  readonly discordRest: REST | undefined;
}

/** Every pluggable API feature. Add one line per feature. */
export function apiFeatures({ persistence, discordRest }: ApiFeatureDependencies): readonly ApiFeature[] {
  return [
    directoryApiFeature(discordRest),
    ticketsApiFeature(new TicketService(persistence.repositories.tickets, discordRest ? new DiscordRestTicketGateway(discordRest) : undefined)),
    moderationApiFeature(new ModerationService(new PrismaModerationRepository(persistence.prisma), discordRest ? new DiscordRestModerationGateway(discordRest) : undefined)),
    pollsApiFeature(new PollService(new PrismaPollRepository(persistence.prisma), discordRest ? new DiscordRestPollGateway(discordRest) : undefined)),
    giveawaysApiFeature(new GiveawayService(new PrismaGiveawayRepository(persistence.prisma), discordRest ? new DiscordRestGiveawayGateway(discordRest) : undefined)),
  ];
}
