import { ApplicationService, DiscordRestApplicationGateway } from "@qbox/applications";
import { PrismaApplicationRepository, PrismaGiveawayRepository, PrismaModerationRepository, PrismaPollRepository, PrismaStaffRepository, PrismaVerificationRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { DiscordRestModerationGateway, ModerationService } from "@qbox/moderation";
import { DiscordRestStaffGateway, StaffService } from "@qbox/staff";
import { DiscordRestGiveawayGateway, GiveawayService } from "@qbox/giveaways";
import { DiscordRestPollGateway, PollService } from "@qbox/polls";
import { DiscordRestTicketGateway, TicketService } from "@qbox/tickets";
import { DiscordRestVerificationGateway, VerificationService } from "@qbox/verification";
import type { REST } from "discord.js";

import { applicationsApiFeature } from "./applications/ApplicationRoutes.js";
import { directoryApiFeature } from "./directory/DirectoryRoutes.js";
import type { ApiFeature } from "./features/ApiFeature.js";
import { giveawaysApiFeature } from "./giveaways/GiveawayRoutes.js";
import { moderationApiFeature } from "./moderation/ModerationRoutes.js";
import { staffApiFeature } from "./staff/StaffRoutes.js";
import { pollsApiFeature } from "./polls/PollRoutes.js";
import { ticketsApiFeature } from "./tickets/TicketRoutes.js";
import { verificationApiFeature } from "./verification/VerificationRoutes.js";

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
    verificationApiFeature(new VerificationService(new PrismaVerificationRepository(persistence.prisma), discordRest ? new DiscordRestVerificationGateway(discordRest) : undefined)),
    applicationsApiFeature(new ApplicationService(new PrismaApplicationRepository(persistence.prisma), discordRest ? new DiscordRestApplicationGateway(discordRest) : undefined)),
    staffApiFeature(new StaffService(new PrismaStaffRepository(persistence.prisma), discordRest ? new DiscordRestStaffGateway(discordRest) : undefined)),
    pollsApiFeature(new PollService(new PrismaPollRepository(persistence.prisma), discordRest ? new DiscordRestPollGateway(discordRest) : undefined)),
    giveawaysApiFeature(new GiveawayService(new PrismaGiveawayRepository(persistence.prisma), discordRest ? new DiscordRestGiveawayGateway(discordRest) : undefined)),
  ];
}
