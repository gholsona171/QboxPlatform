import type { JamendoCatalog, JamendoTrack, LinkResolver, MusicLibraryUsage, MusicPlaylist, MusicProbe, MusicQueueEntry, MusicRepository, MusicSettings, MusicSettingsInput, MusicStation, MusicStorage, MusicTrack, MusicTrackPatch, RadioDirectory, RadioStation } from "./types.js";
export declare const DEFAULT_QUOTA_BYTES: number;
export declare function defaultMusicSettings(guildId: string): MusicSettings;
export interface MusicUpload {
    readonly guildId: string;
    /** File name as the browser sent it; used for the extension and fallback title only. */
    readonly fileName: string;
    readonly contentType: string;
    readonly data: Buffer;
    readonly uploadedBy?: string | undefined;
}
export interface MusicUploadResult {
    readonly track: MusicTrack;
    /** The same file was already in the library; nothing new was stored. */
    readonly duplicate: boolean;
}
export interface MusicServiceOptions {
    readonly storage: MusicStorage;
    readonly probe?: MusicProbe | undefined;
    readonly links?: LinkResolver | undefined;
    readonly radio?: RadioDirectory | undefined;
    readonly jamendo?: JamendoCatalog | undefined;
    /** Library size limit per server. */
    readonly quotaBytes?: number | undefined;
    readonly newId?: (() => string) | undefined;
}
/** One autocomplete choice: the value is a `library:`, `playlist:` or `station:` reference. */
export interface MusicSuggestion {
    readonly name: string;
    readonly value: string;
}
export interface MusicPlaylistDetail extends MusicPlaylist {
    readonly tracks: readonly MusicTrack[];
    /** Library track whose cover stands for the playlist. */
    readonly coverTrackId?: string | undefined;
    readonly durationSeconds: number;
}
/**
 * Music rules: settings, the uploaded library, playlists, saved stations, and
 * turning what a member asks for into playable queue entries. Playback lives
 * in `MusicController`; permission checks happen before the service is called.
 */
export declare class MusicService {
    private readonly repository;
    readonly quotaBytes: number;
    private readonly storage;
    private readonly probe;
    private readonly links;
    private readonly radio;
    private readonly jamendo;
    private readonly newId;
    constructor(repository: MusicRepository, options: MusicServiceOptions);
    get jamendoAvailable(): boolean;
    settings(guildId: string): Promise<MusicSettings>;
    saveSettings(input: MusicSettingsInput): Promise<MusicSettings>;
    library(guildId: string): Promise<readonly MusicTrack[]>;
    usage(guildId: string): Promise<MusicLibraryUsage>;
    track(guildId: string, id: string): Promise<MusicTrack>;
    /** Stores an upload, reading tags and cover art when ffprobe is available. Duplicates are not stored twice. */
    upload(input: MusicUpload): Promise<MusicUploadResult>;
    updateTrack(guildId: string, id: string, patch: MusicTrackPatch): Promise<MusicTrack>;
    deleteTrack(guildId: string, id: string): Promise<void>;
    /** The cover image of a library track. */
    cover(guildId: string, id: string): Promise<{
        readonly data: Buffer;
        readonly contentType: string;
    }>;
    playlists(guildId: string): Promise<readonly MusicPlaylistDetail[]>;
    playlist(guildId: string, id: string): Promise<MusicPlaylistDetail>;
    createPlaylist(guildId: string, name: string, description?: string | undefined): Promise<MusicPlaylist>;
    updatePlaylist(guildId: string, id: string, name: string, description?: string | undefined): Promise<MusicPlaylist>;
    /** Replaces a playlist's songs, in order. Every ID must be in the library. */
    setPlaylistTracks(guildId: string, id: string, trackIds: readonly string[]): Promise<MusicPlaylist>;
    /** Adds songs to the end of a playlist, skipping ones already on it. */
    addToPlaylist(guildId: string, id: string, trackIds: readonly string[]): Promise<MusicPlaylist>;
    deletePlaylist(guildId: string, id: string): Promise<void>;
    stations(guildId: string): Promise<readonly MusicStation[]>;
    saveStation(guildId: string, input: {
        readonly name: string;
        readonly url: string;
        readonly faviconUrl?: string | undefined;
        readonly tags?: readonly string[] | undefined;
    }): Promise<MusicStation>;
    deleteStation(guildId: string, id: string): Promise<void>;
    station(guildId: string, id: string): Promise<MusicStation>;
    searchRadio(name: string): Promise<readonly RadioStation[]>;
    searchJamendo(query: string): Promise<readonly JamendoTrack[]>;
    /** Autocomplete choices for `/music play` and `/music playlist`. */
    suggest(guildId: string, text: string, kinds?: readonly ("library" | "playlist" | "station")[]): Promise<readonly MusicSuggestion[]>;
    /**
     * Turns a play request into queue entries: `library:`, `playlist:`,
     * `station:`, `radio:` and `jamendo:` references, direct links, or words
     * matched against the library, playlists and saved stations.
     */
    resolve(guildId: string, query: string, options?: {
        readonly requestedBy?: string | undefined;
        readonly title?: string | undefined;
    }): Promise<readonly MusicQueueEntry[]>;
    /** The first saved station matching a name, else the first Radio Browser result. */
    radioEntry(guildId: string, name: string, requestedBy?: string | undefined): Promise<MusicQueueEntry>;
    playlistEntries(guildId: string, id: string, requestedBy?: string | undefined): Promise<readonly MusicQueueEntry[]>;
    trackEntry(track: MusicTrack, requestedBy?: string | undefined): MusicQueueEntry;
    stationEntry(station: {
        readonly id?: string | undefined;
        readonly name: string;
        readonly url: string;
        readonly faviconUrl?: string | undefined;
    }, requestedBy?: string | undefined): MusicQueueEntry;
    private jamendoEntry;
    private jamendoTrack;
}
/** "2 GB", "512 MB". */
export declare function formatBytes(bytes: number): string;
//# sourceMappingURL=MusicService.d.ts.map