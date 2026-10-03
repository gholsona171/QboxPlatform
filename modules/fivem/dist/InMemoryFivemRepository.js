import { defaultFivemSettings, emptyMonitorState } from "./FivemService.js";
import { FivemError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryFivemRepository {
    configs = new Map();
    snapshots = [];
    async get(guildId) {
        return this.configs.get(guildId);
    }
    async saveSettings(input) {
        const current = this.configs.get(input.guildId) ?? { settings: defaultFivemSettings(input.guildId), state: emptyMonitorState() };
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.settings.revision)
            throw new FivemError("CONFLICT", "FiveM settings changed since they were loaded.", { currentRevision: current.settings.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const settings = { ...rest, revision: current.settings.revision + 1 };
        this.configs.set(input.guildId, { settings, state: current.state });
        return settings;
    }
    async saveState(guildId, state) {
        const current = this.configs.get(guildId) ?? { settings: defaultFivemSettings(guildId), state: emptyMonitorState() };
        const next = { ...current.state };
        for (const [key, value] of Object.entries(state)) {
            if (value === undefined)
                delete next[key];
            else
                next[key] = value;
        }
        this.configs.set(guildId, { settings: current.settings, state: next });
    }
    async listMonitored() {
        return [...this.configs.values()].filter((config) => config.settings.serverAddress);
    }
    async addSnapshot(guildId, snapshot) {
        this.snapshots.push({ guildId, ...snapshot });
    }
    async listSnapshots(guildId, since) {
        return this.snapshots.filter((item) => item.guildId === guildId && item.at >= since).sort((left, right) => left.at.getTime() - right.at.getTime());
    }
    async pruneSnapshots(before) {
        const keep = this.snapshots.filter((item) => item.at >= before);
        const removed = this.snapshots.length - keep.length;
        this.snapshots.splice(0, this.snapshots.length, ...keep);
        return removed;
    }
}
//# sourceMappingURL=InMemoryFivemRepository.js.map