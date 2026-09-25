import { PrismaBirthdayRepository, PrismaModerationRepository, PrismaScheduledMessageRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { BirthdayService, DiscordRestBirthdayGateway } from "@qbox/birthdays";
import { DiscordRestModerationGateway, ModerationService } from "@qbox/moderation";
import { DiscordRestScheduledMessageGateway, ScheduledMessageService } from "@qbox/scheduled-messages";
import { DiscordRestTicketGateway, TicketService } from "@qbox/tickets";
import type { REST } from "discord.js";

import { birthdaysApiFeature } from "./birthdays/BirthdayRoutes.js";
import { directoryApiFeature } from "./directory/DirectoryRoutes.js";
import type { ApiFeature } from "./features/ApiFeature.js";
import { moderationApiFeature } from "./moderation/ModerationRoutes.js";
import { scheduledMessagesApiFeature } from "./scheduledMessages/ScheduledMessageRoutes.js";
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
    birthdaysApiFeature(new BirthdayService(new PrismaBirthdayRepository(persistence.prisma), discordRest ? new DiscordRestBirthdayGateway(discordRest) : undefined)),
    scheduledMessagesApiFeature(new ScheduledMessageService(new PrismaScheduledMessageRepository(persistence.prisma), discordRest ? new DiscordRestScheduledMessageGateway(discordRest) : undefined)),
  ];
}
