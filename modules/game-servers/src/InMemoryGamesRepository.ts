import { defaultGamesSettings, emptyServerState } from "./GamesService.js";
import type { GamesRepository, GamesServer, GamesServerInput, GamesServerRecord, GamesServerState, GamesSettings, GamesSettingsInput, GamesSnapshot } from "./types.js";
import { GamesError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryGamesRepository implements GamesRepository {
  public readonly settings = new Map<string, GamesSettings>();
  public readonly servers = new Map<string, GamesServerRecord>();
  public readonly snapshots: (GamesSnapshot & { readonly serverId: string })[] = [];
  private nextId = 1;

  public async getSettings(guildId: string): Promise<GamesSettings | undefined> {
    return this.settings.get(guildId);
  }

  public async saveSettings(input: GamesSettingsInput): Promise<GamesSettings> {
    const current = this.settings.get(input.guildId) ?? defaultGamesSettings(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new GamesError("CONFLICT", "Game server settings changed since they were loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const settings = { ...rest, revision: current.revision + 1 };
    this.settings.set(input.guildId, settings);
    return settings;
  }

  public async listServers(guildId: string): Promise<readonly GamesServerRecord[]> {
    return [...this.servers.values()].filter((record) => record.server.guildId === guildId).sort((left, right) => left.server.createdAt.getTime() - right.server.createdAt.getTime());
  }

  public async getServer(guildId: string, id: string): Promise<GamesServerRecord | undefined> {
    const record = this.servers.get(id);
    return record?.server.guildId === guildId ? record : undefined;
  }

  public async createServer(guildId: string, input: GamesServerInput): Promise<GamesServer> {
    const id = `server-${this.nextId}`;
    this.nextId += 1;
    const server: GamesServer = { ...input, id, guildId, createdAt: new Date(Date.now() + this.nextId) };
    this.servers.set(id, { server, state: emptyServerState() });
    return server;
  }

  public async updateServer(guildId: string, id: string, input: GamesServerInput): Promise<GamesServer> {
    const current = await this.getServer(guildId, id);
    if (!current) throw new GamesError("NOT_FOUND", "That game server is not set up here.");
    const server: GamesServer = { ...current.server, ...input };
    this.servers.set(id, { server, state: current.state });
    return server;
  }

  public async deleteServer(guildId: string, id: string): Promise<void> {
    if ((await this.getServer(guildId, id)) === undefined) return;
    this.servers.delete(id);
    this.snapshots.splice(0, this.snapshots.length, ...this.snapshots.filter((item) => item.serverId !== id));
  }

  public async saveState(id: string, state: Partial<GamesServerState>): Promise<void> {
    const current = this.servers.get(id);
    if (!current) return;
    const next: Record<string, unknown> = { ...current.state };
    for (const [key, value] of Object.entries(state)) {
      if (value === undefined) delete next[key];
      else next[key] = value;
    }
    this.servers.set(id, { server: current.server, state: next as unknown as GamesServerState });
  }

  public async listMonitored(): Promise<readonly GamesServerRecord[]> {
    return [...this.servers.values()].filter((record) => record.server.enabled);
  }

  public async addSnapshot(serverId: string, snapshot: GamesSnapshot): Promise<void> {
    this.snapshots.push({ serverId, ...snapshot });
  }

  public async listSnapshots(serverId: string, since: Date): Promise<readonly GamesSnapshot[]> {
    return this.snapshots.filter((item) => item.serverId === serverId && item.at >= since).sort((left, right) => left.at.getTime() - right.at.getTime());
  }

  public async pruneSnapshots(before: Date): Promise<number> {
    const keep = this.snapshots.filter((item) => item.at >= before);
    const removed = this.snapshots.length - keep.length;
    this.snapshots.splice(0, this.snapshots.length, ...keep);
    return removed;
  }
}
