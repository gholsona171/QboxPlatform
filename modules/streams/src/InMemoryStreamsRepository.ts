import { defaultStreamsSettings, emptySubscriptionState } from "./StreamsService.js";
import type {
  StreamsGuildConfig,
  StreamsRepository,
  StreamsSettings,
  StreamsSettingsInput,
  StreamsSubscription,
  StreamsSubscriptionCreate,
  StreamsSubscriptionPatch,
  StreamsSubscriptionState,
} from "./types.js";
import { StreamsError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryStreamsRepository implements StreamsRepository {
  public readonly settings = new Map<string, StreamsSettings>();
  public readonly subscriptions = new Map<string, StreamsSubscription>();
  private sequence = 0;

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async getSettings(guildId: string): Promise<StreamsSettings | undefined> {
    return this.settings.get(guildId);
  }

  public async saveSettings(input: StreamsSettingsInput): Promise<StreamsSettings> {
    const current = this.settings.get(input.guildId) ?? defaultStreamsSettings(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new StreamsError("CONFLICT", "Stream settings changed since they were loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const settings = { ...rest, revision: current.revision + 1 };
    this.settings.set(input.guildId, settings);
    return settings;
  }

  public async listSubscriptions(guildId: string): Promise<readonly StreamsSubscription[]> {
    return [...this.subscriptions.values()].filter((item) => item.guildId === guildId).sort((left, right) => left.displayName.localeCompare(right.displayName));
  }

  public async getSubscription(guildId: string, id: string): Promise<StreamsSubscription | undefined> {
    const subscription = this.subscriptions.get(id);
    return subscription?.guildId === guildId ? subscription : undefined;
  }

  public async countSubscriptions(guildId: string): Promise<number> {
    return (await this.listSubscriptions(guildId)).length;
  }

  public async createSubscription(input: StreamsSubscriptionCreate): Promise<StreamsSubscription> {
    this.sequence += 1;
    const subscription: StreamsSubscription = { id: `sub-${this.sequence}`, ...input, state: emptySubscriptionState(), createdAt: this.now(), updatedAt: this.now() };
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  public async updateSubscription(id: string, patch: StreamsSubscriptionPatch): Promise<StreamsSubscription> {
    const current = this.subscriptions.get(id);
    if (!current) throw new StreamsError("NOT_FOUND", "That creator is not on the list.");
    const { announceChannelId: _channel, pingRoleId: _role, messageText: _text, ...rest } = current;
    const updated: StreamsSubscription = { ...rest, ...patch, updatedAt: this.now() };
    this.subscriptions.set(id, updated);
    return updated;
  }

  public async deleteSubscription(guildId: string, id: string): Promise<boolean> {
    const current = this.subscriptions.get(id);
    if (current?.guildId !== guildId) return false;
    return this.subscriptions.delete(id);
  }

  public async saveState(id: string, state: Partial<StreamsSubscriptionState>): Promise<void> {
    const current = this.subscriptions.get(id);
    if (!current) return;
    const next: Record<string, unknown> = { ...current.state };
    for (const [key, value] of Object.entries(state)) {
      if (value === undefined) delete next[key];
      else next[key] = value;
    }
    this.subscriptions.set(id, { ...current, state: next as unknown as StreamsSubscriptionState });
  }

  public async listActive(): Promise<readonly StreamsGuildConfig[]> {
    const guilds = new Map<string, StreamsSubscription[]>();
    for (const subscription of this.subscriptions.values()) {
      if (!subscription.enabled) continue;
      guilds.set(subscription.guildId, [...(guilds.get(subscription.guildId) ?? []), subscription]);
    }
    return [...guilds.entries()].map(([guildId, subscriptions]) => ({ settings: this.settings.get(guildId) ?? defaultStreamsSettings(guildId), subscriptions }));
  }
}
