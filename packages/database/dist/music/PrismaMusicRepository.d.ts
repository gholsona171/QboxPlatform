import { type MusicLibraryUsage, type MusicPlaylist, type MusicPlaylistInput, type MusicRepository, type MusicSession, type MusicSessionSave, type MusicSettings, type MusicSettingsInput, type MusicStation, type MusicStationInput, type MusicTrack, type MusicTrackCreate, type MusicTrackPatch } from "@qbox/music";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "musicSettings" | "musicTrack" | "musicPlaylist" | "musicPlaylistTrack" | "musicStation" | "musicSession" | "$transaction">;
/** PostgreSQL music settings, library, playlists, stations and sessions. `guildId` is the Discord guild ID. */
export declare class PrismaMusicRepository implements MusicRepository {
    private readonly client;
    constructor(client: Client);
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
}
export {};
//# sourceMappingURL=PrismaMusicRepository.d.ts.map