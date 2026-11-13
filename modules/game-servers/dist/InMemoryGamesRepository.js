import { defaultGamesSettings, emptyServerState } from "./GamesService.js";
import { GamesError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryGamesRepository {
    settings = new Map();
    servers = new Map();
    snapshots = [];
    nextId = 1;
    async getSettings(guildId) {
        return this.settings.get(guildId);
    }
    async saveSettings(input) {
        const current = this.settings.get(input.guildId) ?? defaultGamesSettings(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new GamesError("CONFLICT", "Game server settings changed since they were loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const settings = { ...rest, revision: current.revision + 1 };
        this.settings.set(input.guildId, settings);
        return settings;
    }
    async listServers(guildId) {
        return [...this.servers.values()].filter((record) => record.server.guildId === guildId).sort((left, right) => left.server.createdAt.getTime() - right.server.createdAt.getTime());
    }
    async getServer(guildId, id) {
        const record = this.servers.get(id);
        return record?.server.guildId === guildId ? record : undefined;
    }
    async createServer(guildId, input) {
        const id = `server-${this.nextId}`;
        this.nextId += 1;
        const server = { ...input, id, guildId, createdAt: new Date(Date.now() + this.nextId) };
        this.servers.set(id, { server, state: emptyServerState() });
        return server;
    }
    async updateServer(guildId, id, input) {
        const current = await this.getServer(guildId, id);
        if (!current)
            throw new GamesError("NOT_FOUND", "That game server is not set up here.");
        const server = { ...current.server, ...input };
        this.servers.set(id, { server, state: current.state });
        return server;
    }
    async deleteServer(guildId, id) {
        if ((await this.getServer(guildId, id)) === undefined)
            return;
        this.servers.delete(id);
        this.snapshots.splice(0, this.snapshots.length, ...this.snapshots.filter((item) => item.serverId !== id));
    }
    async saveState(id, state) {
        const current = this.servers.get(id);
        if (!current)
            return;
        const next = { ...current.state };
        for (const [key, value] of Object.entries(state)) {
            if (value === undefined)
                delete next[key];
            else
                next[key] = value;
        }
        this.servers.set(id, { server: current.server, state: next });
    }
    async listMonitored() {
        return [...this.servers.values()].filter((record) => record.server.enabled);
    }
    async addSnapshot(serverId, snapshot) {
        this.snapshots.push({ serverId, ...snapshot });
    }
    async listSnapshots(serverId, since) {
        return this.snapshots.filter((item) => item.serverId === serverId && item.at >= since).sort((left, right) => left.at.getTime() - right.at.getTime());
    }
    async pruneSnapshots(before) {
        const keep = this.snapshots.filter((item) => item.at >= before);
        const removed = this.snapshots.length - keep.length;
        this.snapshots.splice(0, this.snapshots.length, ...keep);
        return removed;
    }
}
//# sourceMappingURL=InMemoryGamesRepository.js.map