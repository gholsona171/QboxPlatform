import { defaultFivemSettings, emptyMonitorState } from "./FivemService.js";
import type { FivemGuildConfig, FivemMonitorState, FivemRepository, FivemSettings, FivemSettingsInput, FivemSnapshot } from "./types.js";
import { FivemError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryFivemRepository implements FivemRepository {
  public readonly configs = new Map<string, FivemGuildConfig>();
  public readonly snapshots: (FivemSnapshot & { readonly guildId: string })[] = [];

  public async get(guildId: string): Promise<FivemGuildConfig | undefined> {
    return this.configs.get(guildId);
  }

  public async saveSettings(input: FivemSettingsInput): Promise<FivemSettings> {
    const current = this.configs.get(input.guildId) ?? { settings: defaultFivemSettings(input.guildId), state: emptyMonitorState() };
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.settings.revision)
      throw new FivemError("CONFLICT", "FiveM settings changed since they were loaded.", { currentRevision: current.settings.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const settings = { ...rest, revision: current.settings.revision + 1 };
    this.configs.set(input.guildId, { settings, state: current.state });
    return settings;
  }

  public async saveState(guildId: string, state: Partial<FivemMonitorState>): Promise<void> {
    const current = this.configs.get(guildId) ?? { settings: defaultFivemSettings(guildId), state: emptyMonitorState() };
    const next: Record<string, unknown> = { ...current.state };
    for (const [key, value] of Object.entries(state)) {
      if (value === undefined) delete next[key];
      else next[key] = value;
    }
    this.configs.set(guildId, { settings: current.settings, state: next as unknown as FivemMonitorState });
  }

  public async listMonitored(): Promise<readonly FivemGuildConfig[]> {
    return [...this.configs.values()].filter((config) => config.settings.serverAddress);
  }

  public async addSnapshot(guildId: string, snapshot: FivemSnapshot): Promise<void> {
    this.snapshots.push({ guildId, ...snapshot });
  }

  public async listSnapshots(guildId: string, since: Date): Promise<readonly FivemSnapshot[]> {
    return this.snapshots.filter((item) => item.guildId === guildId && item.at >= since).sort((left, right) => left.at.getTime() - right.at.getTime());
  }

  public async pruneSnapshots(before: Date): Promise<number> {
    const keep = this.snapshots.filter((item) => item.at >= before);
    const removed = this.snapshots.length - keep.length;
    this.snapshots.splice(0, this.snapshots.length, ...keep);
    return removed;
  }
}
