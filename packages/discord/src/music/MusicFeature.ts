import { Client, Events, GatewayIntentBits, MessageFlags, type APIEmbed, type AutocompleteInteraction, type ButtonInteraction, type Interaction, type InteractionUpdateOptions } from "discord.js";
import { logger } from "@qbox/logger";
import {
  DiscordRestMusicGateway,
  FfmpegMusicProbe,
  HttpLinkResolver,
  JamendoApiCatalog,
  LocalMusicStorage,
  MUSIC_CUSTOM_ID,
  MusicController,
  MusicError,
  MusicService,
  PANEL_BUTTONS,
  RadioBrowserDirectory,
  findMediaTools,
  type MusicCommand as MusicAction,
  type MusicPresence,
  type MusicRepository,
  type PanelButton,
} from "@qbox/music";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { MessageTemplates } from "@qbox/shared/messages";

import { MusicCommand, musicActor } from "../commands/Music.command.js";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
import { DiscordVoiceEngine } from "./DiscordVoiceEngine.js";
import { MusicControlServer } from "./MusicControlServer.js";

/** Positions are saved and the panel refreshed this often while playing. */
const TICK_INTERVAL_MS = 15_000;
const BUTTONS = new Set<string>(PANEL_BUTTONS.flat().map(([action]) => action));

export interface MusicFeatureOptions {
  /** The main bot token; also keys the control server's request signatures. */
  readonly discordToken: string;
  /** Optional second bot that joins voice instead of the main bot. */
  readonly musicBotToken?: string | undefined;
  readonly controlPort: number;
  readonly storageDir: string;
  readonly quotaBytes: number;
  /** FFMPEG_PATH override; otherwise ffmpeg is looked up on PATH. */
  readonly ffmpegPath?: string | undefined;
  readonly jamendoClientId?: string | undefined;
  readonly templates?: MessageTemplates | undefined;
}

/**
 * Music in voice: `/music`, the now-playing panel buttons, a 15-second timer
 * (positions, panel, auto-leave, 24/7), resuming after restarts, and the local
 * control server the portal uses. With MUSIC_BOT_TOKEN, a second client
 * (Guilds + GuildVoiceStates only) joins voice; commands stay on the main bot.
 */
export function musicFeature(repository: MusicRepository, options: MusicFeatureOptions): DiscordFeatureFactory {
  return ({ client, authorizer }) => {
    const log = { warn: (message: string, details: Readonly<Record<string, unknown>>) => logger.warn({ ...details, operation: "music" }, message) };
    const tools = findMediaTools(options.ffmpegPath);
    const probe = new FfmpegMusicProbe(tools);
    const music = new MusicService(repository, {
      storage: new LocalMusicStorage(options.storageDir),
      probe,
      links: new HttpLinkResolver(fetch, probe),
      radio: new RadioBrowserDirectory(),
      jamendo: new JamendoApiCatalog(options.jamendoClientId ?? ""),
      quotaBytes: options.quotaBytes,
    });
    const voiceClient = options.musicBotToken ? new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] }) : client;
    const presence: MusicPresence = {
      listeners: (guildId, channelId) => client.guilds.cache.get(guildId)?.voiceStates.cache.filter((state) => state.channelId === channelId && !(state.member?.user.bot ?? false)).size ?? 0,
      memberChannel: (guildId, userId) => client.guilds.cache.get(guildId)?.voiceStates.cache.get(userId)?.channelId ?? undefined,
    };
    const controller = new MusicController(music, repository, {
      engines: (guildId, events) => new DiscordVoiceEngine(voiceClient, guildId, events, tools.ffmpeg),
      gateway: new DiscordRestMusicGateway(client.rest),
      presence,
      templates: options.templates,
      ffmpeg: tools.ffmpeg !== undefined,
      log,
    });
    const server = new MusicControlServer(controller, options.discordToken, log);
    let timer: ReturnType<typeof setInterval> | undefined;
    let attached: Client | undefined;
    let running = false;
    const tick = async (): Promise<void> => {
      if (running) return;
      running = true;
      try {
        await controller.tick();
      } catch (error) {
        logger.error({ err: error, operation: "music-tick" }, "Music check failed.");
      } finally {
        running = false;
      }
    };
    const onInteraction = (interaction: Interaction): void => {
      if (interaction.isAutocomplete() && interaction.commandName === "music")
        void autocomplete(music, interaction).catch((error: unknown) => logger.warn({ err: error, operation: "music-autocomplete" }, "Music autocomplete failed."));
    };
    return {
      name: "music",
      commands: () => [new MusicCommand(controller, music, authorizer)],
      interactionPrefixes: [MUSIC_CUSTOM_ID],
      handleInteraction: (interaction) => handleButton(controller, authorizer, interaction),
      attach: (target) => {
        attached = target;
        target.on(Events.InteractionCreate, onInteraction);
        if (!tools.ffmpeg) logger.warn({ operation: "music" }, "Music needs ffmpeg on the host. Install it with: sudo apt-get install -y ffmpeg");
        void server.listen(options.controlPort).then(
          (port) => logger.info({ port, operation: "music" }, "Music control server listening on 127.0.0.1."),
          (error: unknown) => logger.error({ err: error, operation: "music" }, "Music control server could not start; the portal cannot control music."),
        );
        if (voiceClient !== target && options.musicBotToken)
          void voiceClient.login(options.musicBotToken).catch((error: unknown) => logger.error({ err: error, operation: "music" }, "The music bot (MUSIC_BOT_TOKEN) could not log in."));
        void Promise.all([ready(target), ready(voiceClient)]).then(() => controller.resume()).catch((error: unknown) => logger.warn({ err: error, operation: "music" }, "Could not resume music."));
        timer = setInterval(() => void tick(), TICK_INTERVAL_MS);
        timer.unref?.();
      },
      detach: () => {
        if (timer) clearInterval(timer);
        timer = undefined;
        attached?.off(Events.InteractionCreate, onInteraction);
        attached = undefined;
        void controller.shutdown().catch((error: unknown) => logger.warn({ err: error, operation: "music" }, "Could not save music sessions."));
        void server.close();
        if (voiceClient !== client) void voiceClient.destroy();
      },
    };
  };
}

function ready(client: Client): Promise<void> {
  if (client.isReady()) return Promise.resolve();
  return new Promise((resolve) => client.once(Events.ClientReady, () => resolve()));
}

/** Library songs, playlists and saved stations for `/music play`; playlists for `/music playlist`. */
async function autocomplete(music: MusicService, interaction: AutocompleteInteraction): Promise<void> {
  if (!interaction.guildId) return interaction.respond([]);
  const kinds = interaction.options.getSubcommand(false) === "playlist" ? (["playlist"] as const) : (["library", "playlist", "station"] as const);
  await interaction.respond([...(await music.suggest(interaction.guildId, String(interaction.options.getFocused()), kinds))]);
}

/** Now-playing panel buttons. Updates the panel in place, or answers privately with the result. */
async function handleButton(controller: MusicController, authorizer: PermissionAuthorizer, interaction: Interaction): Promise<void> {
  if (!interaction.isButton() || !interaction.customId.startsWith(MUSIC_CUSTOM_ID)) return;
  const button = interaction.customId.slice(MUSIC_CUSTOM_ID.length);
  if (!BUTTONS.has(button) || !interaction.guildId) return;
  try {
    const guildId = interaction.guildId;
    const command = await panelCommand(controller, guildId, button as PanelButton);
    const result = await controller.command(guildId, command, await musicActor(authorizer, interaction));
    const view = await controller.panelView(guildId);
    if (view && result.state.current) await interaction.update({ embeds: (view.message.embeds ?? []) as APIEmbed[], components: view.components as NonNullable<InteractionUpdateOptions["components"]> });
    else await interaction.reply({ content: result.message, flags: MessageFlags.Ephemeral });
  } catch (error) {
    await answerError(interaction, error);
  }
}

async function panelCommand(controller: MusicController, guildId: string, button: PanelButton): Promise<MusicAction> {
  if (button === "voldown" || button === "volup") {
    const { volume } = await controller.state(guildId);
    return { action: "volume", volume: volume + (button === "volup" ? 10 : -10) };
  }
  return { action: button };
}

async function answerError(interaction: ButtonInteraction, error: unknown): Promise<void> {
  const message = error instanceof MusicError ? error.message : "Something went wrong. Please try again.";
  if (!(error instanceof MusicError)) logger.error({ err: error, interactionId: interaction.id, operation: "music-button" }, "Music button failed.");
  if (interaction.deferred || interaction.replied) await interaction.followUp({ content: message, flags: MessageFlags.Ephemeral }).catch(() => undefined);
  else await interaction.reply({ content: message, flags: MessageFlags.Ephemeral }).catch(() => undefined);
}
