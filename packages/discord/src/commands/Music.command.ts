import { SlashCommandBuilder, type APIEmbed, type ChatInputCommandInteraction, type MessageComponentInteraction } from "discord.js";
import { MUSIC_COLOR, MusicError, formatTime, nowPlayingMessage, parseTime, type MusicActor, type MusicCommand as MusicAction, type MusicController, type MusicLoopMode, type MusicService, type MusicStateSnapshot } from "@qbox/music";
import type { PermissionAuthorizer } from "@qbox/permissions";

import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { memberHasPermission } from "../features/featureAuthorization.js";

const QUEUE_PAGE_SIZE = 10;
const LOOP_CHOICES = [{ name: "Off", value: "off" }, { name: "This song", value: "track" }, { name: "Whole queue", value: "queue" }];

/**
 * `/music` - play uploaded songs, playlists, direct links and internet radio
 * in voice. Managers (music.manage), DJs (music.dj or a DJ role), or anyone
 * when no DJ roles are set can control it; non-managers must be in the bot's
 * voice channel.
 */
export class MusicCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public readonly policy: CommandExecutionPolicy = {
    contexts: "guild",
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "user",
  };
  public readonly data = new SlashCommandBuilder()
    .setName("music")
    .setDescription("Play music and radio in voice channels.")
    .addSubcommand((sub) => sub.setName("play").setDescription("Play a song, playlist or station, or a direct audio link.")
      .addStringOption((option) => option.setName("query").setDescription("Song, playlist, saved station, or a direct link to an audio file or stream.").setRequired(true).setMaxLength(500).setAutocomplete(true)))
    .addSubcommand((sub) => sub.setName("playlist").setDescription("Queue one of the server's playlists.")
      .addStringOption((option) => option.setName("name").setDescription("The playlist.").setRequired(true).setMaxLength(200).setAutocomplete(true))
      .addBooleanOption((option) => option.setName("shuffle").setDescription("Play it in random order.")))
    .addSubcommand((sub) => sub.setName("radio").setDescription("Play an internet radio station.")
      .addStringOption((option) => option.setName("name").setDescription("A saved station, or a name to search for.").setRequired(true).setMaxLength(100)))
    .addSubcommand((sub) => sub.setName("pause").setDescription("Pause the music."))
    .addSubcommand((sub) => sub.setName("resume").setDescription("Carry on playing."))
    .addSubcommand((sub) => sub.setName("skip").setDescription("Skip to the next song."))
    .addSubcommand((sub) => sub.setName("previous").setDescription("Go back a song (or restart this one)."))
    .addSubcommand((sub) => sub.setName("stop").setDescription("Stop, clear the queue, and leave."))
    .addSubcommand((sub) => sub.setName("seek").setDescription("Jump to a time in the song.")
      .addStringOption((option) => option.setName("time").setDescription("For example 1:30.").setRequired(true).setMaxLength(10)))
    .addSubcommand((sub) => sub.setName("rewind").setDescription("Go back a few seconds.")
      .addIntegerOption((option) => option.setName("seconds").setDescription("How far (default 10).").setMinValue(1).setMaxValue(3600)))
    .addSubcommand((sub) => sub.setName("forward").setDescription("Skip ahead a few seconds.")
      .addIntegerOption((option) => option.setName("seconds").setDescription("How far (default 10).").setMinValue(1).setMaxValue(3600)))
    .addSubcommand((sub) => sub.setName("volume").setDescription("Set the volume.")
      .addIntegerOption((option) => option.setName("percent").setDescription("0 to 200.").setRequired(true).setMinValue(0).setMaxValue(200)))
    .addSubcommand((sub) => sub.setName("loop").setDescription("Repeat this song or the whole queue.")
      .addStringOption((option) => option.setName("mode").setDescription("What to repeat.").setRequired(true).addChoices(...LOOP_CHOICES)))
    .addSubcommand((sub) => sub.setName("shuffle").setDescription("Turn shuffle on or off."))
    .addSubcommand((sub) => sub.setName("queue").setDescription("Show the queue.")
      .addIntegerOption((option) => option.setName("page").setDescription("Page number.").setMinValue(1)))
    .addSubcommand((sub) => sub.setName("remove").setDescription("Remove a song from the queue.")
      .addIntegerOption((option) => option.setName("position").setDescription("Its number in /music queue.").setRequired(true).setMinValue(1)))
    .addSubcommand((sub) => sub.setName("move").setDescription("Move a song in the queue.")
      .addIntegerOption((option) => option.setName("from").setDescription("Its number now.").setRequired(true).setMinValue(1))
      .addIntegerOption((option) => option.setName("to").setDescription("Its new number.").setRequired(true).setMinValue(1)))
    .addSubcommand((sub) => sub.setName("clear").setDescription("Remove every song except the one playing."))
    .addSubcommand((sub) => sub.setName("nowplaying").setDescription("Show what is playing."))
    .addSubcommand((sub) => sub.setName("join").setDescription("Join your voice channel."))
    .addSubcommand((sub) => sub.setName("leave").setDescription("Leave the voice channel."));

  public constructor(
    private readonly controller?: MusicController,
    private readonly music?: MusicService,
    private readonly authorizer?: PermissionAuthorizer,
  ) {}

  public bypassAuthorization(): boolean {
    return true;
  }

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await this.run(context);
    } catch (error) {
      if (!(error instanceof MusicError)) throw error;
      await context.editReply({ content: error.message });
    }
  }

  private async run(context: CommandExecutionContext): Promise<void> {
    const { controller, music, authorizer } = this;
    const interaction = context.interaction;
    const guildId = interaction.guildId;
    if (!controller || !music || !authorizer || !guildId) throw new MusicError("DEPENDENCY_UNAVAILABLE", "Music is not available right now.");
    const route = context.route.requiredSubcommand();
    if (route === "queue") {
      await context.editReply({ embeds: [queueEmbed(await controller.state(guildId), context.options.optionalInteger("page"))] });
      return;
    }
    if (route === "nowplaying") {
      const state = await controller.state(guildId);
      if (!state.current) {
        await context.editReply({ content: "Nothing is playing." });
        return;
      }
      await context.editReply({ embeds: (nowPlayingMessage(state, state.current, state.current.artworkUrl).embeds ?? []) as APIEmbed[] });
      return;
    }
    const command = await this.parse(music, guildId, route, context);
    const result = await controller.command(guildId, command, await musicActor(authorizer, interaction));
    await context.editReply({ content: result.message });
  }

  private async parse(music: MusicService, guildId: string, route: string, context: CommandExecutionContext): Promise<MusicAction> {
    const options = context.options;
    switch (route) {
      case "play":
        return { action: "play", query: options.requiredString("query") };
      case "playlist": {
        const name = options.requiredString("name");
        const id = name.startsWith("playlist:") ? name.slice("playlist:".length) : (await music.playlists(guildId)).find((item) => item.name.toLowerCase() === name.trim().toLowerCase())?.id;
        if (!id) throw new MusicError("NOT_FOUND", `There is no playlist called "${name.slice(0, 80)}".`);
        return { action: "playlist", id, shuffle: options.optionalBoolean("shuffle") ?? false };
      }
      case "radio":
        return { action: "radio", name: options.requiredString("name") };
      case "seek":
        return { action: "seek", seconds: parseTime(options.requiredString("time")) };
      case "rewind":
      case "forward":
        return { action: route, seconds: options.optionalInteger("seconds") };
      case "volume":
        return { action: "volume", volume: options.requiredInteger("percent") };
      case "loop":
        return { action: "loop", mode: options.requiredString("mode") as MusicLoopMode };
      case "remove":
        return { action: "remove", position: options.requiredInteger("position") };
      case "move":
        return { action: "move", from: options.requiredInteger("from"), to: options.requiredInteger("to") };
      case "pause":
      case "resume":
      case "skip":
      case "previous":
      case "stop":
      case "shuffle":
      case "clear":
      case "join":
      case "leave":
        return { action: route };
      default:
        throw new MusicError("INVALID_INPUT", "That is not a music command.");
    }
  }
}

/** Who ran an interaction, with their music permissions and roles. */
export async function musicActor(authorizer: PermissionAuthorizer, interaction: ChatInputCommandInteraction | MessageComponentInteraction): Promise<MusicActor> {
  const member = interaction.member;
  const roleIds = !member ? [] : Array.isArray(member.roles) ? [...member.roles] : [...member.roles.cache.keys()];
  return {
    userId: interaction.user.id,
    manager: await memberHasPermission(authorizer, interaction, "music.manage"),
    dj: await memberHasPermission(authorizer, interaction, "music.dj"),
    roleIds,
    ...(interaction.channelId ? { textChannelId: interaction.channelId } : {}),
  };
}

/** The queue as an embed, 10 songs a page, opening on the page with the current song. */
export function queueEmbed(state: MusicStateSnapshot, page: number | undefined): APIEmbed {
  if (state.queue.length === 0) return { title: "Queue", description: "The queue is empty. Add songs with /music play.", color: MUSIC_COLOR };
  const pages = Math.ceil(state.queue.length / QUEUE_PAGE_SIZE);
  const current = Math.min(pages, Math.max(1, page ?? Math.floor(Math.min(state.index, state.queue.length - 1) / QUEUE_PAGE_SIZE) + 1));
  const start = (current - 1) * QUEUE_PAGE_SIZE;
  const lines = state.queue.slice(start, start + QUEUE_PAGE_SIZE).map((entry, offset) => {
    const at = start + offset;
    const length = entry.durationSeconds === null ? "live" : formatTime(entry.durationSeconds);
    const text = `${at + 1}. ${entry.title.slice(0, 80)}${entry.artist ? ` - ${entry.artist.slice(0, 40)}` : ""} (${length})`;
    return at === state.index ? `**▶ ${text}**` : at < state.index ? `~~${text}~~` : text;
  });
  const modes = `Loop: ${state.loop} · Shuffle: ${state.shuffle ? "on" : "off"} · Volume: ${state.volume}%`;
  return { title: "Queue", description: lines.join("\n"), color: MUSIC_COLOR, footer: { text: `Page ${current} of ${pages} · ${modes}` } };
}

export const command = new MusicCommand();
