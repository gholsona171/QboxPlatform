import { defaultMusicSettings } from "./MusicService.js";
import { MusicError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryMusicRepository {
    now;
    settings = new Map();
    tracks = new Map();
    playlists = new Map();
    stations = new Map();
    sessions = new Map();
    sequence = 0;
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async getSettings(guildId) {
        return this.settings.get(guildId);
    }
    async saveSettings(input) {
        const current = this.settings.get(input.guildId) ?? defaultMusicSettings(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new MusicError("CONFLICT", "Music settings changed since they were loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const settings = { ...rest, revision: current.revision + 1 };
        this.settings.set(input.guildId, settings);
        return settings;
    }
    async listStayConnected() {
        return [...this.settings.values()].filter((item) => item.enabled && item.stayConnected247);
    }
    async listTracks(guildId) {
        return [...this.tracks.values()].filter((item) => item.guildId === guildId).sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    }
    async getTrack(guildId, id) {
        const track = this.tracks.get(id);
        return track?.guildId === guildId ? track : undefined;
    }
    async findTrackByHash(guildId, sha256) {
        return [...this.tracks.values()].find((item) => item.guildId === guildId && item.sha256 === sha256);
    }
    async createTrack(input) {
        const track = { ...input, createdAt: this.now(), updatedAt: this.now() };
        this.tracks.set(track.id, track);
        return track;
    }
    async updateTrack(guildId, id, patch) {
        const current = await this.getTrack(guildId, id);
        if (!current)
            throw new MusicError("NOT_FOUND", "That song is not in the library.");
        const { artist: _artist, album: _album, ...rest } = current;
        const updated = { ...rest, ...patch, updatedAt: this.now() };
        this.tracks.set(id, updated);
        return updated;
    }
    async deleteTrack(guildId, id) {
        if (!(await this.getTrack(guildId, id)))
            return false;
        this.tracks.delete(id);
        for (const playlist of this.playlists.values())
            if (playlist.trackIds.includes(id))
                this.playlists.set(playlist.id, { ...playlist, trackIds: playlist.trackIds.filter((trackId) => trackId !== id) });
        return true;
    }
    async libraryUsage(guildId) {
        const tracks = await this.listTracks(guildId);
        return { tracks: tracks.length, bytes: tracks.reduce((total, track) => total + track.sizeBytes, 0) };
    }
    async listPlaylists(guildId) {
        return [...this.playlists.values()].filter((item) => item.guildId === guildId).sort((left, right) => left.name.localeCompare(right.name));
    }
    async getPlaylist(guildId, id) {
        const playlist = this.playlists.get(id);
        return playlist?.guildId === guildId ? playlist : undefined;
    }
    async createPlaylist(input) {
        const playlist = { id: this.id(), ...input, trackIds: [], createdAt: this.now(), updatedAt: this.now() };
        this.playlists.set(playlist.id, playlist);
        return playlist;
    }
    async updatePlaylist(guildId, id, input) {
        const current = await this.getPlaylist(guildId, id);
        if (!current)
            throw new MusicError("NOT_FOUND", "That playlist does not exist.");
        const { description: _description, ...rest } = current;
        const updated = { ...rest, ...input, updatedAt: this.now() };
        this.playlists.set(id, updated);
        return updated;
    }
    async setPlaylistTracks(guildId, id, trackIds) {
        const current = await this.getPlaylist(guildId, id);
        if (!current)
            throw new MusicError("NOT_FOUND", "That playlist does not exist.");
        const updated = { ...current, trackIds: [...trackIds], updatedAt: this.now() };
        this.playlists.set(id, updated);
        return updated;
    }
    async deletePlaylist(guildId, id) {
        if (!(await this.getPlaylist(guildId, id)))
            return false;
        return this.playlists.delete(id);
    }
    async listStations(guildId) {
        return [...this.stations.values()].filter((item) => item.guildId === guildId).sort((left, right) => left.name.localeCompare(right.name));
    }
    async getStation(guildId, id) {
        const station = this.stations.get(id);
        return station?.guildId === guildId ? station : undefined;
    }
    async createStation(input) {
        const station = { id: this.id(), ...input, createdAt: this.now() };
        this.stations.set(station.id, station);
        return station;
    }
    async deleteStation(guildId, id) {
        if (!(await this.getStation(guildId, id)))
            return false;
        return this.stations.delete(id);
    }
    async getSession(guildId) {
        return this.sessions.get(guildId);
    }
    async saveSession(session) {
        this.sessions.set(session.guildId, { ...session, queue: [...session.queue], updatedAt: this.now() });
    }
    async listActiveSessions() {
        return [...this.sessions.values()].filter((item) => item.state === "playing" || item.state === "buffering");
    }
    id() {
        this.sequence += 1;
        return `00000000-0000-4000-8000-${String(this.sequence).padStart(12, "0")}`;
    }
}
//# sourceMappingURL=InMemoryMusicRepository.js.map