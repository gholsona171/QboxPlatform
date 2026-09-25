import { ApplicationService, DiscordRestApplicationGateway } from "@qbox/applications";
import { PrismaApplicationRepository, PrismaBirthdayRepository, PrismaBuilderRepository, PrismaFivemRepository, PrismaGiveawayRepository, PrismaKnowledgeRepository, PrismaLevelRepository, PrismaModerationRepository, PrismaPollRepository, PrismaScheduledMessageRepository, PrismaStaffRepository, PrismaVerificationRepository, PrismaVoiceRepository, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { DiscordRestLevelGateway, LevelService } from "@qbox/levels";
import { DiscordRestFivemGateway, FivemService, HttpFivemQueryClient } from "@qbox/fivem";
import { DiscordRestKnowledgeGateway, KnowledgeService } from "@qbox/knowledge-base";
import { DiscordRestModerationGateway, ModerationService } from "@qbox/moderation";
import { DiscordRestStaffGateway, StaffService } from "@qbox/staff";
import { DiscordRestGiveawayGateway, GiveawayService } from "@qbox/giveaways";
import { DiscordRestPollGateway, PollService } from "@qbox/polls";
import { BirthdayService, DiscordRestBirthdayGateway } from "@qbox/birthdays";
import { DiscordCommunityService } from "@qbox/discord-community";
import { BuilderService, DiscordRestBuilderGateway } from "@qbox/server-builder";
import { DiscordRestScheduledMessageGateway, ScheduledMessageService } from "@qbox/scheduled-messages";
import { DiscordRestTicketGateway, TicketService } from "@qbox/tickets";
import { DiscordRestVerificationGateway, VerificationService } from "@qbox/verification";
import { DiscordRestVoiceGateway, VoiceRoomService } from "@qbox/voice-rooms";
import type { REST } from "discord.js";
import { passthroughTemplates, type MessageTemplates } from "@qbox/shared/messages";

import { applicationsApiFeature } from "./applications/ApplicationRoutes.js";
import { birthdaysApiFeature } from "./birthdays/BirthdayRoutes.js";
import { builderApiFeature } from "./builder/BuilderRoutes.js";
import { ServiceBuilderLinks } from "./builder/builderLinks.js";
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
/** Custom message templates for every feature that posts to Discord. */
const templates: MessageTemplates = passthroughTemplates;

export function apiFeatures({ persistence, discordRest }: ApiFeatureDependencies): readonly ApiFeature[] {
  const tickets = new TicketService(persistence.repositories.tickets, discordRest ? new DiscordRestTicketGateway(discordRest) : undefined, undefined, templates);
  const moderation = new ModerationService(new PrismaModerationRepository(persistence.prisma), discordRest ? new DiscordRestModerationGateway(discordRest) : undefined, undefined, templates);
  const verification = new VerificationService(new PrismaVerificationRepository(persistence.prisma), discordRest ? new DiscordRestVerificationGateway(discordRest) : undefined, undefined, templates);
  const applications = new ApplicationService(new PrismaApplicationRepository(persistence.prisma), discordRest ? new DiscordRestApplicationGateway(discordRest) : undefined);
  const staff = new StaffService(new PrismaStaffRepository(persistence.prisma), discordRest ? new DiscordRestStaffGateway(discordRest) : undefined);
  const birthdays = new BirthdayService(new PrismaBirthdayRepository(persistence.prisma), discordRest ? new DiscordRestBirthdayGateway(discordRest) : undefined, undefined, templates);
  const levels = new LevelService(new PrismaLevelRepository(persistence.prisma), discordRest ? new DiscordRestLevelGateway(discordRest) : undefined, undefined, undefined, templates);
  const voice = new VoiceRoomService(new PrismaVoiceRepository(persistence.prisma), discordRest ? new DiscordRestVoiceGateway(discordRest) : undefined);
  const fivem = new FivemService(new PrismaFivemRepository(persistence.prisma), new HttpFivemQueryClient(), discordRest ? new DiscordRestFivemGateway(discordRest) : undefined);
  const community = new DiscordCommunityService(persistence.repositories.discordCommunity, undefined, templates);
  const builderLinks = new ServiceBuilderLinks({ moderation, verification, tickets, applications, staff, levels, birthdays, fivem, voice, community });
  return [
    directoryApiFeature(discordRest),
    ticketsApiFeature(tickets),
    moderationApiFeature(moderation),
    verificationApiFeature(verification),
    applicationsApiFeature(applications),
    staffApiFeature(staff),
    pollsApiFeature(new PollService(new PrismaPollRepository(persistence.prisma), discordRest ? new DiscordRestPollGateway(discordRest) : undefined)),
    giveawaysApiFeature(new GiveawayService(new PrismaGiveawayRepository(persistence.prisma), discordRest ? new DiscordRestGiveawayGateway(discordRest) : undefined, undefined, { templates })),
    birthdaysApiFeature(birthdays),
    scheduledMessagesApiFeature(new ScheduledMessageService(new PrismaScheduledMessageRepository(persistence.prisma), discordRest ? new DiscordRestScheduledMessageGateway(discordRest) : undefined)),
    levelsApiFeature(levels),
    voiceRoomsApiFeature(voice),
    knowledgeApiFeature(new KnowledgeService(new PrismaKnowledgeRepository(persistence.prisma), discordRest ? new DiscordRestKnowledgeGateway(discordRest) : undefined)),
    fivemApiFeature(fivem),
    builderApiFeature(new BuilderService(new PrismaBuilderRepository(persistence.prisma), discordRest ? new DiscordRestBuilderGateway(discordRest) : undefined, builderLinks)),
  ];
}
