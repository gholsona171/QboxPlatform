import { defaultMusicSettings } from "./MusicService.js";
import type {
  MusicLibraryUsage,
  MusicPlaylist,
  MusicPlaylistInput,
  MusicRepository,
  MusicSession,
  MusicSessionSave,
  MusicSettings,
  MusicSettingsInput,
  MusicStation,
  MusicStationInput,
  MusicTrack,
  MusicTrackCreate,
  MusicTrackPatch,
} from "./types.js";
import { MusicError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryMusicRepository implements MusicRepository {
  public readonly settings = new Map<string, MusicSettings>();
  public readonly tracks = new Map<string, MusicTrack>();
  public readonly playlists = new Map<string, MusicPlaylist>();
  public readonly stations = new Map<string, MusicStation>();
  public readonly sessions = new Map<string, MusicSession>();
  private sequence = 0;

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async getSettings(guildId: string): Promise<MusicSettings | undefined> {
    return this.settings.get(guildId);
  }

  public async saveSettings(input: MusicSettingsInput): Promise<MusicSettings> {
    const current = this.settings.get(input.guildId) ?? defaultMusicSettings(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new MusicError("CONFLICT", "Music settings changed since they were loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const settings = { ...rest, revision: current.revision + 1 };
    this.settings.set(input.guildId, settings);
    return settings;
  }

  public async listStayConnected(): Promise<readonly MusicSettings[]> {
    return [...this.settings.values()].filter((item) => item.enabled && item.stayConnected247);
  }

  public async listTracks(guildId: string): Promise<readonly MusicTrack[]> {
    return [...this.tracks.values()].filter((item) => item.guildId === guildId).sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  public async getTrack(guildId: string, id: string): Promise<MusicTrack | undefined> {
    const track = this.tracks.get(id);
    return track?.guildId === guildId ? track : undefined;
  }

  public async findTrackByHash(guildId: string, sha256: string): Promise<MusicTrack | undefined> {
    return [...this.tracks.values()].find((item) => item.guildId === guildId && item.sha256 === sha256);
  }

  public async createTrack(input: MusicTrackCreate): Promise<MusicTrack> {
    const track: MusicTrack = { ...input, createdAt: this.now(), updatedAt: this.now() };
    this.tracks.set(track.id, track);
    return track;
  }

  public async updateTrack(guildId: string, id: string, patch: MusicTrackPatch): Promise<MusicTrack> {
    const current = await this.getTrack(guildId, id);
    if (!current) throw new MusicError("NOT_FOUND", "That song is not in the library.");
    const { artist: _artist, album: _album, ...rest } = current;
    const updated: MusicTrack = { ...rest, ...patch, updatedAt: this.now() };
    this.tracks.set(id, updated);
    return updated;
  }

  public async deleteTrack(guildId: string, id: string): Promise<boolean> {
    if (!(await this.getTrack(guildId, id))) return false;
    this.tracks.delete(id);
    for (const playlist of this.playlists.values())
      if (playlist.trackIds.includes(id)) this.playlists.set(playlist.id, { ...playlist, trackIds: playlist.trackIds.filter((trackId) => trackId !== id) });
    return true;
  }

  public async libraryUsage(guildId: string): Promise<MusicLibraryUsage> {
    const tracks = await this.listTracks(guildId);
    return { tracks: tracks.length, bytes: tracks.reduce((total, track) => total + track.sizeBytes, 0) };
  }

  public async listPlaylists(guildId: string): Promise<readonly MusicPlaylist[]> {
    return [...this.playlists.values()].filter((item) => item.guildId === guildId).sort((left, right) => left.name.localeCompare(right.name));
  }

  public async getPlaylist(guildId: string, id: string): Promise<MusicPlaylist | undefined> {
    const playlist = this.playlists.get(id);
    return playlist?.guildId === guildId ? playlist : undefined;
  }

  public async createPlaylist(input: MusicPlaylistInput): Promise<MusicPlaylist> {
    const playlist: MusicPlaylist = { id: this.id(), ...input, trackIds: [], createdAt: this.now(), updatedAt: this.now() };
    this.playlists.set(playlist.id, playlist);
    return playlist;
  }

  public async updatePlaylist(guildId: string, id: string, input: MusicPlaylistInput): Promise<MusicPlaylist> {
    const current = await this.getPlaylist(guildId, id);
    if (!current) throw new MusicError("NOT_FOUND", "That playlist does not exist.");
    const { description: _description, ...rest } = current;
    const updated: MusicPlaylist = { ...rest, ...input, updatedAt: this.now() };
    this.playlists.set(id, updated);
    return updated;
  }

  public async setPlaylistTracks(guildId: string, id: string, trackIds: readonly string[]): Promise<MusicPlaylist> {
    const current = await this.getPlaylist(guildId, id);
    if (!current) throw new MusicError("NOT_FOUND", "That playlist does not exist.");
    const updated: MusicPlaylist = { ...current, trackIds: [...trackIds], updatedAt: this.now() };
    this.playlists.set(id, updated);
    return updated;
  }

  public async deletePlaylist(guildId: string, id: string): Promise<boolean> {
    if (!(await this.getPlaylist(guildId, id))) return false;
    return this.playlists.delete(id);
  }

  public async listStations(guildId: string): Promise<readonly MusicStation[]> {
    return [...this.stations.values()].filter((item) => item.guildId === guildId).sort((left, right) => left.name.localeCompare(right.name));
  }

  public async getStation(guildId: string, id: string): Promise<MusicStation | undefined> {
    const station = this.stations.get(id);
    return station?.guildId === guildId ? station : undefined;
  }

  public async createStation(input: MusicStationInput): Promise<MusicStation> {
    const station: MusicStation = { id: this.id(), ...input, createdAt: this.now() };
    this.stations.set(station.id, station);
    return station;
  }

  public async deleteStation(guildId: string, id: string): Promise<boolean> {
    if (!(await this.getStation(guildId, id))) return false;
    return this.stations.delete(id);
  }

  public async getSession(guildId: string): Promise<MusicSession | undefined> {
    return this.sessions.get(guildId);
  }

  public async saveSession(session: MusicSessionSave): Promise<void> {
    this.sessions.set(session.guildId, { ...session, queue: [...session.queue], updatedAt: this.now() });
  }

  public async listActiveSessions(): Promise<readonly MusicSession[]> {
    return [...this.sessions.values()].filter((item) => item.state === "playing" || item.state === "buffering");
  }

  private id(): string {
    this.sequence += 1;
    return `00000000-0000-4000-8000-${String(this.sequence).padStart(12, "0")}`;
  }
}
