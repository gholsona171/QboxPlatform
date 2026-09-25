import { ApplicationService, DiscordRestApplicationGateway } from "@qbox/applications";
import { PrismaApplicationRepository, PrismaBirthdayRepository, PrismaFivemRepository, PrismaGiveawayRepository, PrismaKnowledgeRepository, PrismaLevelRepository, PrismaModerationRepository, PrismaPollRepository, PrismaScheduledMessageRepository, PrismaStaffRepository, PrismaVerificationRepository, PrismaVoiceRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { DiscordRestLevelGateway, LevelService } from "@qbox/levels";
import { DiscordRestFivemGateway, FivemService, HttpFivemQueryClient } from "@qbox/fivem";
import { DiscordRestKnowledgeGateway, KnowledgeService } from "@qbox/knowledge-base";
import { DiscordRestModerationGateway, ModerationService } from "@qbox/moderation";
import { DiscordRestStaffGateway, StaffService } from "@qbox/staff";
import { DiscordRestGiveawayGateway, GiveawayService } from "@qbox/giveaways";
import { DiscordRestPollGateway, PollService } from "@qbox/polls";
import { BirthdayService, DiscordRestBirthdayGateway } from "@qbox/birthdays";
import { DiscordRestScheduledMessageGateway, ScheduledMessageService } from "@qbox/scheduled-messages";
import { DiscordRestTicketGateway, TicketService } from "@qbox/tickets";
import { DiscordRestVerificationGateway, VerificationService } from "@qbox/verification";
import { DiscordRestVoiceGateway, VoiceRoomService } from "@qbox/voice-rooms";
import type { REST } from "discord.js";

import { applicationsApiFeature } from "./applications/ApplicationRoutes.js";
import { birthdaysApiFeature } from "./birthdays/BirthdayRoutes.js";
import { directoryApiFeature } from "./directory/DirectoryRoutes.js";
import type { ApiFeature } from "./features/ApiFeature.js";
import { giveawaysApiFeature } from "./giveaways/GiveawayRoutes.js";
import { levelsApiFeature } from "./levels/LevelRoutes.js";
import { fivemApiFeature } from "./fivem/FivemRoutes.js";
import { knowledgeApiFeature } from "./knowledge/KnowledgeRoutes.js";
import { moderationApiFeature } from "./moderation/ModerationRoutes.js";
import { staffApiFeature } from "./staff/StaffRoutes.js";
import { pollsApiFeature } from "./polls/PollRoutes.js";
import { scheduledMessagesApiFeature } from "./scheduledMessages/ScheduledMessageRoutes.js";
import { ticketsApiFeature } from "./tickets/TicketRoutes.js";
import { verificationApiFeature } from "./verification/VerificationRoutes.js";
import { voiceRoomsApiFeature } from "./voiceRooms/VoiceRoutes.js";

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
    birthdaysApiFeature(new BirthdayService(new PrismaBirthdayRepository(persistence.prisma), discordRest ? new DiscordRestBirthdayGateway(discordRest) : undefined)),
    scheduledMessagesApiFeature(new ScheduledMessageService(new PrismaScheduledMessageRepository(persistence.prisma), discordRest ? new DiscordRestScheduledMessageGateway(discordRest) : undefined)),
    levelsApiFeature(new LevelService(new PrismaLevelRepository(persistence.prisma), discordRest ? new DiscordRestLevelGateway(discordRest) : undefined)),
    voiceRoomsApiFeature(new VoiceRoomService(new PrismaVoiceRepository(persistence.prisma), discordRest ? new DiscordRestVoiceGateway(discordRest) : undefined)),
    knowledgeApiFeature(new KnowledgeService(new PrismaKnowledgeRepository(persistence.prisma), discordRest ? new DiscordRestKnowledgeGateway(discordRest) : undefined)),
    fivemApiFeature(new FivemService(new PrismaFivemRepository(persistence.prisma), new HttpFivemQueryClient(), discordRest ? new DiscordRestFivemGateway(discordRest) : undefined)),
  ];
}
