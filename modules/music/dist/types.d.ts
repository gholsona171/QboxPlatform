import type { OutgoingMessage } from "@qbox/shared/messages";
export declare const LOOP_MODES: readonly ["off", "track", "queue"];
export type MusicLoopMode = (typeof LOOP_MODES)[number];
export declare const PLAYER_STATES: readonly ["idle", "playing", "paused", "buffering"];
export type MusicPlayerState = (typeof PLAYER_STATES)[number];
/** Where a queued song comes from. */
export declare const SOURCE_KINDS: readonly ["library", "link", "radio", "jamendo"];
export type MusicSourceKind = (typeof SOURCE_KINDS)[number];
export interface MusicSettings {
    readonly guildId: string;
    readonly enabled: boolean;
    /** Empty: everyone in the bot's voice channel can control playback. Managers always can. */
    readonly djRoleIds: readonly string[];
    /** 0-200. */
    readonly defaultVolume: number;
    /** Songs waiting in the queue at most. */
    readonly maxQueue: number;
    /** Now-playing announcements; falls back to the channel of the last command. */
    readonly announceChannelId?: string | undefined;
    /** Keep one updating panel message with buttons instead of one post per song. */
    readonly nowPlayingPanel: boolean;
    readonly stayConnected247: boolean;
    /** Voice channel the bot returns to on start in 24/7 mode. */
    readonly homeChannelId?: string | undefined;
    /** Leave after this many minutes alone or idle. 0 = never. Ignored in 24/7 mode. */
    readonly autoLeaveMinutes: number;
    /** Saved station played when the queue runs out. */
    readonly idleRadioStationId?: string | undefined;
    readonly revision: number;
}
export interface MusicSettingsInput extends Omit<MusicSettings, "revision"> {
    readonly expectedRevision?: number | undefined;
}
/** An audio file a manager uploaded. */
export interface MusicTrack {
    readonly id: string;
    readonly guildId: string;
    readonly title: string;
    readonly artist?: string | undefined;
    readonly album?: string | undefined;
    readonly trackNumber?: number | undefined;
    /** Missing when neither ffprobe nor the file told us. */
    readonly durationSeconds?: number | undefined;
    /** `<id>.<ext>` inside the guild's folder. */
    readonly fileName: string;
    /** `<id>.jpg|png` inside the guild's folder, when the file has cover art. */
    readonly coverFileName?: string | undefined;
    readonly contentType: string;
    readonly sizeBytes: number;
    /** Hex SHA-256 of the file, for duplicate detection. */
    readonly sha256: string;
    /** File name as uploaded. Shown only; never used for paths. */
    readonly originalName: string;
    readonly uploadedBy?: string | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export type MusicTrackCreate = Omit<MusicTrack, "createdAt" | "updatedAt">;
/** Fields a manager edits on a track. */
export interface MusicTrackPatch {
    readonly title: string;
    readonly artist?: string | undefined;
    readonly album?: string | undefined;
}
export interface MusicPlaylist {
    readonly id: string;
    readonly guildId: string;
    readonly name: string;
    readonly description?: string | undefined;
    /** Library track IDs in play order. */
    readonly trackIds: readonly string[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface MusicPlaylistInput {
    readonly guildId: string;
    readonly name: string;
    readonly description?: string | undefined;
}
/** An internet radio station saved for the server. */
export interface MusicStation {
    readonly id: string;
    readonly guildId: string;
    readonly name: string;
    readonly url: string;
    readonly faviconUrl?: string | undefined;
    readonly tags: readonly string[];
    readonly createdAt: Date;
}
export type MusicStationInput = Omit<MusicStation, "id" | "createdAt">;
/** What an audio engine needs to play something. */
export interface PlayableSource {
    /** Remote file or stream. */
    readonly url?: string | undefined;
    /** Local file. */
    readonly filePath?: string | undefined;
    readonly seekable: boolean;
}
/** One song or station in the queue, already resolved to something playable. */
export interface MusicQueueEntry extends PlayableSource {
    /** Unique per queue entry. */
    readonly id: string;
    readonly source: MusicSourceKind;
    /** Library track, saved station, or Jamendo track ID. */
    readonly ref?: string | undefined;
    readonly title: string;
    readonly artist?: string | undefined;
    readonly album?: string | undefined;
    /** Null for live streams and unknown lengths. */
    readonly durationSeconds: number | null;
    /** Remote picture (station favicon, Jamendo cover). */
    readonly artworkUrl?: string | undefined;
    /** Local cover file of a library track. */
    readonly coverPath?: string | undefined;
    readonly requestedBy?: string | undefined;
}
/** Saved player state per server so playback survives bot restarts. */
export interface MusicSession {
    readonly guildId: string;
    /** Voice channel the bot was in. */
    readonly channelId?: string | undefined;
    /** Text channel of the last command, for announcements. */
    readonly textChannelId?: string | undefined;
    readonly panelChannelId?: string | undefined;
    readonly panelMessageId?: string | undefined;
    readonly queue: readonly MusicQueueEntry[];
    readonly index: number;
    readonly positionSeconds: number;
    readonly state: MusicPlayerState;
    readonly loop: MusicLoopMode;
    readonly shuffle: boolean;
    readonly volume: number;
    readonly updatedAt: Date;
}
export type MusicSessionSave = Omit<MusicSession, "updatedAt">;
export interface MusicLibraryUsage {
    readonly tracks: number;
    readonly bytes: number;
}
export interface MusicRepository {
    getSettings(guildId: string): Promise<MusicSettings | undefined>;
    saveSettings(input: MusicSettingsInput): Promise<MusicSettings>;
    /** Guilds with music on and 24/7 mode set. */
    listStayConnected(): Promise<readonly MusicSettings[]>;
    listTracks(guildId: string): Promise<readonly MusicTrack[]>;
    getTrack(guildId: string, id: string): Promise<MusicTrack | undefined>;
    findTrackByHash(guildId: string, sha256: string): Promise<MusicTrack | undefined>;
    createTrack(input: MusicTrackCreate): Promise<MusicTrack>;
    updateTrack(guildId: string, id: string, patch: MusicTrackPatch): Promise<MusicTrack>;
    /** True when a track was deleted. Also removes it from playlists. */
    deleteTrack(guildId: string, id: string): Promise<boolean>;
    libraryUsage(guildId: string): Promise<MusicLibraryUsage>;
    listPlaylists(guildId: string): Promise<readonly MusicPlaylist[]>;
    getPlaylist(guildId: string, id: string): Promise<MusicPlaylist | undefined>;
    createPlaylist(input: MusicPlaylistInput): Promise<MusicPlaylist>;
    updatePlaylist(guildId: string, id: string, input: MusicPlaylistInput): Promise<MusicPlaylist>;
    /** Replaces the playlist's tracks in this order. */
    setPlaylistTracks(guildId: string, id: string, trackIds: readonly string[]): Promise<MusicPlaylist>;
    deletePlaylist(guildId: string, id: string): Promise<boolean>;
    listStations(guildId: string): Promise<readonly MusicStation[]>;
    getStation(guildId: string, id: string): Promise<MusicStation | undefined>;
    createStation(input: MusicStationInput): Promise<MusicStation>;
    deleteStation(guildId: string, id: string): Promise<boolean>;
    getSession(guildId: string): Promise<MusicSession | undefined>;
    saveSession(session: MusicSessionSave): Promise<void>;
    /** Sessions saved while playing, to resume after a restart. */
    listActiveSessions(): Promise<readonly MusicSession[]>;
}
/** Title, artist, album, track number, length and cover art read from an audio file. */
export interface MusicFileTags {
    readonly title?: string | undefined;
    readonly artist?: string | undefined;
    readonly album?: string | undefined;
    readonly trackNumber?: number | undefined;
    readonly durationSeconds?: number | undefined;
    /** The embedded picture stream, when the file has cover art. */
    readonly cover?: {
        readonly streamIndex: number;
        readonly extension: "jpg" | "png";
    } | undefined;
}
/** Reads tags and cover art. Implemented with ffprobe and ffmpeg; returns nothing when they are missing. */
export interface MusicProbe {
    probe(input: string): Promise<MusicFileTags | undefined>;
    /** Copies the embedded picture stream to `outputPath`. False when it could not. */
    extractCover(input: string, streamIndex: number, outputPath: string): Promise<boolean>;
}
/** Library files on disk: `<root>/<guildId>/<fileName>`. */
export interface MusicStorage {
    write(guildId: string, fileName: string, data: Buffer): Promise<void>;
    read(guildId: string, fileName: string): Promise<Buffer>;
    remove(guildId: string, fileName: string): Promise<void>;
    /** Absolute path of a stored file. */
    path(guildId: string, fileName: string): string;
}
export interface RadioStation {
    /** Radio Browser station UUID. */
    readonly id: string;
    readonly name: string;
    readonly url: string;
    readonly faviconUrl?: string | undefined;
    readonly tags: readonly string[];
    readonly country?: string | undefined;
    readonly codec?: string | undefined;
    readonly bitrate?: number | undefined;
}
export interface JamendoTrack {
    readonly id: string;
    readonly title: string;
    readonly artist: string;
    readonly album?: string | undefined;
    readonly durationSeconds: number;
    readonly url: string;
    readonly imageUrl?: string | undefined;
}
/** The Radio Browser directory. */
export interface RadioDirectory {
    search(name: string): Promise<readonly RadioStation[]>;
}
/** The Jamendo Creative Commons catalog; only available with a client ID. */
export interface JamendoCatalog {
    readonly available: boolean;
    search(query: string): Promise<readonly JamendoTrack[]>;
    track(id: string): Promise<JamendoTrack | undefined>;
}
/** A direct link resolved to something playable. */
export interface ResolvedLink extends PlayableSource {
    readonly url: string;
    readonly title: string;
    readonly durationSeconds: number | null;
}
/** Checks direct audio links (files, streams, .m3u and .pls playlists). */
export interface LinkResolver {
    resolve(url: string): Promise<ResolvedLink>;
}
export interface AudioPlayOptions {
    readonly seekSeconds: number;
    /** 0-200. */
    readonly volume: number;
}
/** What an audio engine reports back. */
export interface AudioEngineEvents {
    /** The song ended on its own. */
    finished(): void;
    error(message: string): void;
    /** Playback position while playing. */
    position(seconds: number): void;
    /** The voice connection is gone for good. */
    disconnected(): void;
}
/** Voice playback for one server. */
export interface AudioEngine {
    join(channelId: string): Promise<void>;
    leave(): void;
    play(source: PlayableSource, options: AudioPlayOptions): Promise<void>;
    pause(): void;
    resume(): void;
    setVolume(volume: number): void;
    stop(): void;
}
export type AudioEngineFactory = (guildId: string, events: AudioEngineEvents) => AudioEngine;
/** Who is in which voice channel. The bot implements it from the gateway cache. */
export interface MusicPresence {
    /** People (not bots) in a voice channel. */
    listeners(guildId: string, channelId: string): number;
    /** Voice channel a member is in. */
    memberChannel(guildId: string, userId: string): string | undefined;
}
/** A file attached to the now-playing message. */
export interface MusicAttachment {
    readonly name: string;
    readonly data: Buffer;
}
export interface MusicPostOptions {
    /** Discord message components (button rows) as JSON. */
    readonly components: readonly unknown[];
    readonly attachment?: MusicAttachment | undefined;
    /** On edits: keep the attachment already on the message. */
    readonly keepAttachments?: boolean | undefined;
}
/** Discord operations for announcements and the now-playing panel. */
export interface MusicGateway {
    post(channelId: string, message: OutgoingMessage, options: MusicPostOptions): Promise<string>;
    edit(channelId: string, messageId: string, message: OutgoingMessage, options: MusicPostOptions): Promise<void>;
    deleteMessage(channelId: string, messageId: string): Promise<void>;
    guildName(guildId: string): Promise<string | undefined>;
}
/** Who asks for a playback change. */
export interface MusicActor {
    readonly userId: string;
    /** Holds music.manage (or is a Discord administrator). */
    readonly manager: boolean;
    /** Holds music.dj. */
    readonly dj: boolean;
    readonly roleIds: readonly string[];
    /** Text channel the command came from (Discord only). */
    readonly textChannelId?: string | undefined;
}
export type MusicCommand = {
    readonly action: "play";
    readonly query: string;
    readonly title?: string | undefined;
    readonly now?: boolean | undefined;
    readonly channelId?: string | undefined;
} | {
    readonly action: "radio";
    readonly name: string;
    readonly channelId?: string | undefined;
} | {
    readonly action: "playlist";
    readonly id: string;
    readonly shuffle?: boolean | undefined;
    readonly now?: boolean | undefined;
    readonly channelId?: string | undefined;
} | {
    readonly action: "pause" | "resume" | "toggle" | "stop" | "skip" | "previous" | "restart" | "shuffle" | "clear" | "leave";
} | {
    readonly action: "seek";
    readonly seconds: number;
} | {
    readonly action: "rewind" | "forward";
    readonly seconds?: number | undefined;
} | {
    readonly action: "volume";
    readonly volume: number;
} | {
    readonly action: "loop";
    readonly mode?: MusicLoopMode | undefined;
} | {
    readonly action: "remove" | "jump";
    readonly position: number;
} | {
    readonly action: "move";
    readonly from: number;
    readonly to: number;
} | {
    readonly action: "join";
    readonly channelId?: string | undefined;
};
export type MusicAction = MusicCommand["action"];
/** Player state for the portal and commands. */
export interface MusicStateSnapshot {
    readonly guildId: string;
    readonly connected: boolean;
    readonly channelId?: string | undefined;
    readonly state: MusicPlayerState;
    readonly current?: MusicQueueEntry | undefined;
    /** 0-based index of the current entry; equals the queue length when the queue has ended. */
    readonly index: number;
    readonly queue: readonly MusicQueueEntry[];
    readonly positionSeconds: number;
    readonly durationSeconds: number | null;
    readonly live: boolean;
    readonly loop: MusicLoopMode;
    readonly shuffle: boolean;
    readonly volume: number;
    readonly stayConnected: boolean;
    readonly ffmpeg: boolean;
    readonly lastError?: string | undefined;
}
export interface MusicCommandResult {
    /** Plain sentence for the person who asked. */
    readonly message: string;
    readonly state: MusicStateSnapshot;
}
/** The bot process's player as seen from the API. */
export interface MusicControl {
    state(guildId: string): Promise<MusicStateSnapshot>;
    command(guildId: string, command: MusicCommand, actor: MusicActor): Promise<MusicCommandResult>;
}
//# sourceMappingURL=types.d.ts.map