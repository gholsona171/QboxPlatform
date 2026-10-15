import { defaultStreamsSettings, emptySubscriptionState } from "./StreamsService.js";
import { StreamsError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryStreamsRepository {
    now;
    settings = new Map();
    subscriptions = new Map();
    sequence = 0;
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async getSettings(guildId) {
        return this.settings.get(guildId);
    }
    async saveSettings(input) {
        const current = this.settings.get(input.guildId) ?? defaultStreamsSettings(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new StreamsError("CONFLICT", "Stream settings changed since they were loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const settings = { ...rest, revision: current.revision + 1 };
        this.settings.set(input.guildId, settings);
        return settings;
    }
    async listSubscriptions(guildId) {
        return [...this.subscriptions.values()].filter((item) => item.guildId === guildId).sort((left, right) => left.displayName.localeCompare(right.displayName));
    }
    async getSubscription(guildId, id) {
        const subscription = this.subscriptions.get(id);
        return subscription?.guildId === guildId ? subscription : undefined;
    }
    async countSubscriptions(guildId) {
        return (await this.listSubscriptions(guildId)).length;
    }
    async createSubscription(input) {
        this.sequence += 1;
        const subscription = { id: `sub-${this.sequence}`, ...input, state: emptySubscriptionState(), createdAt: this.now(), updatedAt: this.now() };
        this.subscriptions.set(subscription.id, subscription);
        return subscription;
    }
    async updateSubscription(id, patch) {
        const current = this.subscriptions.get(id);
        if (!current)
            throw new StreamsError("NOT_FOUND", "That creator is not on the list.");
        const { announceChannelId: _channel, pingRoleId: _role, messageText: _text, ...rest } = current;
        const updated = { ...rest, ...patch, updatedAt: this.now() };
        this.subscriptions.set(id, updated);
        return updated;
    }
    async deleteSubscription(guildId, id) {
        const current = this.subscriptions.get(id);
        if (current?.guildId !== guildId)
            return false;
        return this.subscriptions.delete(id);
    }
    async saveState(id, state) {
        const current = this.subscriptions.get(id);
        if (!current)
            return;
        const next = { ...current.state };
        for (const [key, value] of Object.entries(state)) {
            if (value === undefined)
                delete next[key];
            else
                next[key] = value;
        }
        this.subscriptions.set(id, { ...current, state: next });
    }
    async listActive() {
        const guilds = new Map();
        for (const subscription of this.subscriptions.values()) {
            if (!subscription.enabled)
                continue;
            guilds.set(subscription.guildId, [...(guilds.get(subscription.guildId) ?? []), subscription]);
        }
        return [...guilds.entries()].map(([guildId, subscriptions]) => ({ settings: this.settings.get(guildId) ?? defaultStreamsSettings(guildId), subscriptions }));
    }
}
//# sourceMappingURL=InMemoryStreamsRepository.js.map