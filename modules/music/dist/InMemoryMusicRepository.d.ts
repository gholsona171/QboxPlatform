import type { MusicLibraryUsage, MusicPlaylist, MusicPlaylistInput, MusicRepository, MusicSession, MusicSessionSave, MusicSettings, MusicSettingsInput, MusicStation, MusicStationInput, MusicTrack, MusicTrackCreate, MusicTrackPatch } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryMusicRepository implements MusicRepository {
    private readonly now;
    readonly settings: Map<string, MusicSettings>;
    readonly tracks: Map<string, MusicTrack>;
    readonly playlists: Map<string, MusicPlaylist>;
    readonly stations: Map<string, MusicStation>;
    readonly sessions: Map<string, MusicSession>;
    private sequence;
    constructor(now?: () => Date);
    getSettings(guildId: string): Promise<MusicSettings | undefined>;
    saveSettings(input: MusicSettingsInput): Promise<MusicSettings>;
    listStayConnected(): Promise<readonly MusicSettings[]>;
    listTracks(guildId: string): Promise<readonly MusicTrack[]>;
    getTrack(guildId: string, id: string): Promise<MusicTrack | undefined>;
    findTrackByHash(guildId: string, sha256: string): Promise<MusicTrack | undefined>;
    createTrack(input: MusicTrackCreate): Promise<MusicTrack>;
    updateTrack(guildId: string, id: string, patch: MusicTrackPatch): Promise<MusicTrack>;
    deleteTrack(guildId: string, id: string): Promise<boolean>;
    libraryUsage(guildId: string): Promise<MusicLibraryUsage>;
    listPlaylists(guildId: string): Promise<readonly MusicPlaylist[]>;
    getPlaylist(guildId: string, id: string): Promise<MusicPlaylist | undefined>;
    createPlaylist(input: MusicPlaylistInput): Promise<MusicPlaylist>;
    updatePlaylist(guildId: string, id: string, input: MusicPlaylistInput): Promise<MusicPlaylist>;
    setPlaylistTracks(guildId: string, id: string, trackIds: readonly string[]): Promise<MusicPlaylist>;
    deletePlaylist(guildId: string, id: string): Promise<boolean>;
    listStations(guildId: string): Promise<readonly MusicStation[]>;
    getStation(guildId: string, id: string): Promise<MusicStation | undefined>;
    createStation(input: MusicStationInput): Promise<MusicStation>;
    deleteStation(guildId: string, id: string): Promise<boolean>;
    getSession(guildId: string): Promise<MusicSession | undefined>;
    saveSession(session: MusicSessionSave): Promise<void>;
    listActiveSessions(): Promise<readonly MusicSession[]>;
    private id;
}
//# sourceMappingURL=InMemoryMusicRepository.d.ts.map