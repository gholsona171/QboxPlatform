import { ApplicationService, DiscordRestApplicationGateway } from "@qbox/applications";
import { PrismaApplicationRepository, PrismaBirthdayRepository, PrismaBuilderRepository, PrismaFivemRepository, PrismaGamesRepository, PrismaGiveawayRepository, PrismaKnowledgeRepository, PrismaLevelRepository, PrismaMessagesRepository, PrismaModerationRepository, PrismaMusicRepository, type PrismaPermissionPersistenceClient, PrismaPollRepository, PrismaScheduledMessageRepository, PrismaStaffRepository, PrismaStreamsRepository, PrismaVerificationRepository, PrismaVoiceRepository } from "@qbox/database";
import { DiscordRestLevelGateway, LevelService } from "@qbox/levels";
import { DiscordRestFivemGateway, FivemService, HttpFivemQueryClient } from "@qbox/fivem";
import { DiscordRestGamesGateway, GamesService, ProtocolQueryClient } from "@qbox/game-servers";
import { DiscordRestKnowledgeGateway, KnowledgeService } from "@qbox/knowledge-base";
import { DiscordRestMessagesGateway, MessageTemplateService } from "@qbox/messages";
import { DiscordRestModerationGateway, ModerationService } from "@qbox/moderation";
import { FfmpegMusicProbe, HttpLinkResolver, HttpMusicControlClient, JamendoApiCatalog, LocalMusicStorage, MusicService, RadioBrowserDirectory, botIdFromToken, findMediaTools, voiceBotInviteUrl } from "@qbox/music";
import { DiscordRestStaffGateway, StaffService } from "@qbox/staff";
import { DiscordRestStreamsGateway, StreamsService, createStreamPlatformClients } from "@qbox/streams";
import { env } from "@qbox/shared";
import { DiscordRestGiveawayGateway, GiveawayService } from "@qbox/giveaways";
import { DiscordRestPollGateway, PollService } from "@qbox/polls";
import { BirthdayService, DiscordRestBirthdayGateway } from "@qbox/birthdays";
import { DiscordCommunityService } from "@qbox/discord-community";
import { BuilderService, DiscordRestBuilderGateway, OpenAiBlueprintDesigner } from "@qbox/server-builder";
import { DiscordRestScheduledMessageGateway, ScheduledMessageService } from "@qbox/scheduled-messages";
import { DiscordRestTicketGateway, TicketService } from "@qbox/tickets";
import { DiscordRestVerificationGateway, VerificationService } from "@qbox/verification";
import { DiscordRestVoiceGateway, VoiceRoomService } from "@qbox/voice-rooms";
import type { REST } from "discord.js";

import { applicationsApiFeature } from "./applications/ApplicationRoutes.js";
import { birthdaysApiFeature } from "./birthdays/BirthdayRoutes.js";
import { builderApiFeature } from "./builder/BuilderRoutes.js";
import { ServiceBuilderLinks } from "./builder/builderLinks.js";
import { directoryApiFeature } from "./directory/DirectoryRoutes.js";
import type { ApiFeature } from "./features/ApiFeature.js";
import { giveawaysApiFeature } from "./giveaways/GiveawayRoutes.js";
import { levelsApiFeature } from "./levels/LevelRoutes.js";
import { messagesApiFeature } from "./messages/MessagesRoutes.js";
import { fivemApiFeature } from "./fivem/FivemRoutes.js";
import { gamesApiFeature } from "./games/GamesRoutes.js";
import { knowledgeApiFeature } from "./knowledge/KnowledgeRoutes.js";
import { moderationApiFeature } from "./moderation/ModerationRoutes.js";
import { musicApiFeature, type MusicHostInfo } from "./music/MusicRoutes.js";
import { staffApiFeature } from "./staff/StaffRoutes.js";
import { streamsApiFeature } from "./streams/StreamsRoutes.js";
import { pollsApiFeature } from "./polls/PollRoutes.js";
import { scheduledMessagesApiFeature } from "./scheduledMessages/ScheduledMessageRoutes.js";
import { ticketsApiFeature } from "./tickets/TicketRoutes.js";
import { verificationApiFeature } from "./verification/VerificationRoutes.js";
import { voiceRoomsApiFeature } from "./voiceRooms/VoiceRoutes.js";

export interface ApiFeatureDependencies {
  readonly persistence: PrismaPermissionPersistenceClient;
  /** Discord REST client when a bot token is configured. */
  readonly discordRest: REST | undefined;
  /** Custom messages and the server-wide look; created here when the composition root does not pass one. */
  readonly templates?: MessageTemplateService | undefined;
}

/** Every pluggable API feature. Add one line per feature. */
export function apiFeatures({ persistence, discordRest, ...dependencies }: ApiFeatureDependencies): readonly ApiFeature[] {
  /** Custom messages and the server-wide look; passed to every service that posts to Discord. */
  const templates = dependencies.templates ?? new MessageTemplateService(new PrismaMessagesRepository(persistence.prisma), { gateway: discordRest ? new DiscordRestMessagesGateway(discordRest) : undefined });
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
    messagesApiFeature(templates),
    musicApiFeature(musicService(persistence), new HttpMusicControlClient(env.DISCORD_TOKEN, `http://127.0.0.1:${Number(env.MUSIC_CONTROL_PORT)}`), musicHost(discordRest)),
    streamsApiFeature(new StreamsService(new PrismaStreamsRepository(persistence.prisma), createStreamPlatformClients(streamCredentials()), discordRest ? new DiscordRestStreamsGateway(discordRest) : undefined, { templates })),
    gamesApiFeature(new GamesService(new PrismaGamesRepository(persistence.prisma), new ProtocolQueryClient(), discordRest ? new DiscordRestGamesGateway(discordRest) : undefined, templates)),
    builderApiFeature(new BuilderService(new PrismaBuilderRepository(persistence.prisma), discordRest ? new DiscordRestBuilderGateway(discordRest) : undefined, builderLinks, {
      designer: env.OPENAI_API_KEY ? new OpenAiBlueprintDesigner(env.OPENAI_API_KEY, env.OPENAI_MODEL) : undefined,
    })),
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

/** Music library, playlists and stations; files go to MUSIC_STORAGE_DIR, which the bot reads. */
function musicService(persistence: PrismaPermissionPersistenceClient): MusicService {
  const probe = new FfmpegMusicProbe(findMediaTools(env.FFMPEG_PATH || undefined));
  return new MusicService(new PrismaMusicRepository(persistence.prisma), {
    storage: new LocalMusicStorage(env.MUSIC_STORAGE_DIR),
    probe,
    links: new HttpLinkResolver(fetch, probe),
    radio: new RadioBrowserDirectory(),
    jamendo: new JamendoApiCatalog(env.JAMENDO_CLIENT_ID),
    quotaBytes: Number(env.MUSIC_GUILD_QUOTA_MB) * 1024 * 1024,
  });
}

/** Whether ffmpeg is installed, and the optional second music bot (MUSIC_BOT_TOKEN): its invite link and whether it joined the server. */
function musicHost(discordRest: REST | undefined): MusicHostInfo {
  const ffmpeg = findMediaTools(env.FFMPEG_PATH || undefined).ffmpeg !== undefined;
  if (!env.MUSIC_BOT_TOKEN) return { ffmpeg };
  const botId = botIdFromToken(env.MUSIC_BOT_TOKEN);
  return {
    ffmpeg,
    secondBot: {
      inviteUrl: botId ? voiceBotInviteUrl(botId) : undefined,
      inGuild: async (guildId) => {
        if (!botId || !discordRest) return false;
        return discordRest.get(`/guilds/${guildId}/members/${botId}`).then(() => true, () => false);
      },
    },
  };
}
