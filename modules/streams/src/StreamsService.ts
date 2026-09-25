import { passthroughTemplates, type MessageTemplates } from "@qbox/shared/messages";

import { creatorUrl, endedMessage, endedValues, liveMessage, liveValues, sampleStream, videoMessage, videoValues } from "./announcements.js";
import type {
  LiveCheck,
  LiveStream,
  StreamCreator,
  StreamPlatform,
  StreamPlatformClient,
  StreamsAvailability,
  StreamsGateway,
  StreamsRepository,
  StreamsSettings,
  StreamsSettingsInput,
  StreamsSubscription,
  StreamsSubscriptionInput,
  StreamsSubscriptionPatch,
  StreamsSubscriptionState,
} from "./types.js";
import { StreamsError, normalizeHandle, platformLabel, requireSnowflake, validateSettings, validateSubscriptionFields } from "./validation.js";

/** Creators per server. */
export const MAX_SUBSCRIPTIONS = 25;
/** Offline answers in a row before a live stream counts as ended. */
export const OFFLINE_POLLS_BEFORE_ENDED = 2;
/** Longest wait between checks after repeated failures. */
export const MAX_BACKOFF_MS = 30 * 60_000;
/** Uploads announced at once when several appeared since the last check. */
const MAX_VIDEOS_PER_CHECK = 3;

/** Where the service reports check failures. */
export interface StreamsLog {
  warn(message: string, details: Readonly<Record<string, unknown>>): void;
}

export interface StreamsServiceOptions {
  readonly now?: (() => Date) | undefined;
  readonly templates?: MessageTemplates | undefined;
  readonly log?: StreamsLog | undefined;
}

export function defaultStreamsSettings(guildId: string): StreamsSettings {
  return { guildId, enabled: true, endedBehavior: "edit", checkIntervalSeconds: 90, revision: 0 };
}

export function emptySubscriptionState(): StreamsSubscriptionState {
  return { offlineStreak: 0, failureStreak: 0 };
}

/** Wait before the next check: the interval, doubled per failure, capped. */
export function checkWaitMs(settings: StreamsSettings, state: StreamsSubscriptionState): number {
  return Math.min(MAX_BACKOFF_MS, settings.checkIntervalSeconds * 1000 * 2 ** Math.min(state.failureStreak, 12));
}

type MutableState = { -readonly [K in keyof StreamsSubscriptionState]?: StreamsSubscriptionState[K] };

/**
 * Go-live and new-video announcements: creators per server, the check loop
 * with per-creator backoff, and the live -> ended state machine. Permission
 * checks happen before the service is called.
 */
export class StreamsService {
  private readonly clients: ReadonlyMap<StreamPlatform, StreamPlatformClient>;
  private readonly now: () => Date;
  private readonly templates: MessageTemplates;
  private readonly log: StreamsLog;
  private readonly guildNames = new Map<string, string | undefined>();

  public constructor(
    private readonly repository: StreamsRepository,
    clients: readonly StreamPlatformClient[],
    private readonly gateway?: StreamsGateway,
    options: StreamsServiceOptions = {},
  ) {
    this.clients = new Map(clients.map((client) => [client.platform, client]));
    this.now = options.now ?? (() => new Date());
    this.templates = options.templates ?? passthroughTemplates;
    this.log = options.log ?? { warn: () => undefined };
  }

  /** Which platforms this host can announce. */
  public availability(): StreamsAvailability {
    return {
      twitch: this.clients.get("twitch")?.available ?? false,
      kick: this.clients.get("kick")?.available ?? false,
      youtube: this.clients.get("youtube")?.available ?? false,
    };
  }

  public async settings(guildId: string): Promise<StreamsSettings> {
    requireSnowflake("guildId", guildId);
    return (await this.repository.getSettings(guildId)) ?? defaultStreamsSettings(guildId);
  }

  public async saveSettings(input: StreamsSettingsInput): Promise<StreamsSettings> {
    validateSettings(input);
    return this.repository.saveSettings(input);
  }

  public async list(guildId: string): Promise<readonly StreamsSubscription[]> {
    requireSnowflake("guildId", guildId);
    return this.repository.listSubscriptions(guildId);
  }

  public async get(guildId: string, id: string): Promise<StreamsSubscription> {
    requireSnowflake("guildId", guildId);
    const subscription = await this.repository.getSubscription(guildId, id);
    if (!subscription) throw new StreamsError("NOT_FOUND", "That creator is not on the list.");
    return subscription;
  }

  /** Looks a creator up on their platform without saving anything (the portal's "Check" button). */
  public async resolve(platform: StreamPlatform, handle: string): Promise<StreamCreator> {
    const client = this.client(platform);
    return client.resolve(normalizeHandle(platform, handle));
  }

  public async add(input: StreamsSubscriptionInput): Promise<StreamsSubscription> {
    requireSnowflake("guildId", input.guildId);
    validateSubscriptionFields(input);
    const creator = await this.resolve(input.platform, input.handle);
    const existing = await this.repository.listSubscriptions(input.guildId);
    if (existing.length >= MAX_SUBSCRIPTIONS) throw new StreamsError("LIMIT_REACHED", `You can follow up to ${MAX_SUBSCRIPTIONS} creators.`);
    if (existing.some((item) => item.platform === creator.platform && item.platformId === creator.platformId))
      throw new StreamsError("CONFLICT", `${creator.displayName} is already on the list.`);
    return this.repository.createSubscription({
      ...input,
      handle: creator.handle,
      displayName: creator.displayName,
      avatarUrl: creator.avatarUrl,
      platformId: creator.platformId,
      announceVideos: input.platform === "youtube" && input.announceVideos,
    });
  }

  public async update(guildId: string, id: string, patch: StreamsSubscriptionPatch): Promise<StreamsSubscription> {
    const current = await this.get(guildId, id);
    validateSubscriptionFields(patch);
    return this.repository.updateSubscription(current.id, { ...patch, announceVideos: current.platform === "youtube" && patch.announceVideos });
  }

  public async remove(guildId: string, id: string): Promise<void> {
    const current = await this.get(guildId, id);
    await this.repository.deleteSubscription(guildId, current.id);
  }

  /** Posts the live announcement now, with the current stream or a sample. Leaves the state alone. */
  public async test(guildId: string, id: string): Promise<{ readonly live: boolean; readonly messageId: string }> {
    const subscription = await this.get(guildId, id);
    const settings = await this.settings(guildId);
    const channelId = subscription.announceChannelId ?? settings.defaultChannelId;
    if (!channelId) throw new StreamsError("INVALID_STATE", "Choose a channel for the announcement first.");
    if (!this.gateway) throw new StreamsError("DEPENDENCY_UNAVAILABLE", "Discord is not connected right now.");
    const check = (await this.client(subscription.platform).liveStatus([subscription.platformId])).get(subscription.platformId);
    const live = check?.status === "live";
    const stream = check?.status === "live" ? check.stream : sampleStream(subscription, this.now());
    const messageId = await this.postLive(channelId, subscription, stream);
    return { live, messageId };
  }

  /**
   * Checks every creator whose interval (plus backoff) has passed, grouping
   * lookups per platform, and announces changes. Called by the bot's timer.
   * A failing creator never stops the others.
   */
  public async tick(): Promise<void> {
    const now = this.now();
    const due: { readonly settings: StreamsSettings; readonly subscription: StreamsSubscription }[] = [];
    for (const { settings, subscriptions } of await this.repository.listActive()) {
      if (!settings.enabled) continue;
      for (const subscription of subscriptions) {
        if (!subscription.enabled) continue;
        const last = subscription.state.lastCheckedAt?.getTime();
        if (last === undefined || now.getTime() - last >= checkWaitMs(settings, subscription.state) - 1000) due.push({ settings, subscription });
      }
    }
    for (const platform of new Set(due.map((item) => item.subscription.platform))) {
      const batch = due.filter((item) => item.subscription.platform === platform);
      const client = this.clients.get(platform);
      const results = client
        ? await client.liveStatus([...new Set(batch.map((item) => item.subscription.platformId))]).catch(() => new Map<string, LiveCheck>())
        : new Map<string, LiveCheck>();
      for (const { settings, subscription } of batch) {
        const check = client
          ? results.get(subscription.platformId) ?? { status: "error" as const, error: `${platformLabel(platform)} did not answer.` }
          : { status: "error" as const, error: `${platformLabel(platform)} is not available on this host.` };
        await this.applyCheck(settings, subscription, check, now).catch((error: unknown) => this.log.warn("Stream check failed.", { err: error, subscriptionId: subscription.id }));
        if (client?.latestVideos && subscription.announceVideos && check.status !== "error")
          await this.checkVideos(settings, subscription, client, check).catch((error: unknown) => this.log.warn("Video check failed.", { err: error, subscriptionId: subscription.id }));
      }
    }
  }

  /** Applies one live check to a subscription: announces, tracks offline polls, or records the failure. */
  public async applyCheck(settings: StreamsSettings, subscription: StreamsSubscription, check: LiveCheck, now: Date): Promise<void> {
    const state = subscription.state;
    const next: MutableState = { lastCheckedAt: now };
    if (check.status === "error") {
      next.failureStreak = state.failureStreak + 1;
      next.lastError = check.error;
      if (check.error !== state.lastError || state.failureStreak === 0)
        this.log.warn("Stream check failed.", { guildId: subscription.guildId, platform: subscription.platform, handle: subscription.handle, streak: next.failureStreak, error: check.error });
      await this.repository.saveState(subscription.id, next);
      return;
    }
    next.failureStreak = 0;
    next.lastError = undefined;
    if (check.status === "live") {
      next.offlineStreak = 0;
      if (state.lastStreamId !== check.stream.id) {
        if (state.lastStreamId) await this.endAnnouncement(settings, subscription, now);
        const channelId = subscription.announceChannelId ?? settings.defaultChannelId;
        next.lastStreamId = check.stream.id;
        next.liveSince = check.stream.startedAt ?? now;
        next.lastAnnouncementMessageId = undefined;
        next.lastAnnouncementChannelId = channelId;
        if (!channelId || !this.gateway) next.lastError = channelId ? "Discord is not connected." : "Choose a channel for announcements.";
        else {
          try {
            next.lastAnnouncementMessageId = await this.postLive(channelId, subscription, check.stream);
          } catch (error) {
            next.lastError = `Could not post in the channel: ${error instanceof Error ? error.message : "Discord rejected it."}`;
          }
        }
      }
    } else if (state.lastStreamId) {
      const streak = state.offlineStreak + 1;
      if (streak >= OFFLINE_POLLS_BEFORE_ENDED) {
        await this.endAnnouncement(settings, subscription, now);
        next.lastStreamId = undefined;
        next.liveSince = undefined;
        next.lastAnnouncementChannelId = undefined;
        next.lastAnnouncementMessageId = undefined;
        next.offlineStreak = 0;
      } else next.offlineStreak = streak;
    }
    await this.repository.saveState(subscription.id, next);
  }

  private async checkVideos(settings: StreamsSettings, subscription: StreamsSubscription, client: StreamPlatformClient, check: LiveCheck): Promise<void> {
    const videos = await client.latestVideos?.(subscription.platformId);
    const newest = videos?.[0];
    if (!videos || !newest) return;
    const state = subscription.state;
    if (state.lastVideoId === undefined) {
      await this.repository.saveState(subscription.id, { lastVideoId: newest.id });
      return;
    }
    if (state.lastVideoId === newest.id) return;
    const seenAt = videos.findIndex((video) => video.id === state.lastVideoId);
    const liveId = check.status === "live" ? check.stream.id : state.lastStreamId;
    const fresh = (seenAt === -1 ? videos : videos.slice(0, seenAt)).filter((video) => video.id !== liveId).slice(0, MAX_VIDEOS_PER_CHECK).reverse();
    const channelId = subscription.announceChannelId ?? settings.defaultChannelId;
    if (this.gateway && channelId) {
      for (const video of fresh) {
        const values = videoValues(subscription, video);
        const message = await this.templates.apply(subscription.guildId, "streams.video", values, videoMessage(subscription, video));
        await this.gateway.post(channelId, message, { watchUrl: video.url }).catch((error: unknown) => this.log.warn("Could not post a video announcement.", { err: error, subscriptionId: subscription.id }));
      }
    }
    await this.repository.saveState(subscription.id, { lastVideoId: newest.id });
  }

  private async postLive(channelId: string, subscription: StreamsSubscription, stream: LiveStream): Promise<string> {
    if (!this.gateway) throw new StreamsError("DEPENDENCY_UNAVAILABLE", "Discord is not connected right now.");
    const now = this.now();
    const values = liveValues(subscription, stream, await this.guildName(subscription.guildId));
    const message = await this.templates.apply(subscription.guildId, "streams.live", values, liveMessage(subscription, stream, values, now));
    return this.gateway.post(channelId, message, { watchUrl: stream.url, pingRoleId: subscription.pingRoleId });
  }

  /** Edits or deletes the live announcement as the settings say. Errors (deleted message, missing channel) are ignored. */
  private async endAnnouncement(settings: StreamsSettings, subscription: StreamsSubscription, now: Date): Promise<void> {
    const { lastAnnouncementChannelId: channelId, lastAnnouncementMessageId: messageId } = subscription.state;
    if (!this.gateway || !channelId || !messageId || settings.endedBehavior === "keep") return;
    try {
      if (settings.endedBehavior === "delete") {
        await this.gateway.deleteMessage(channelId, messageId);
        return;
      }
      const url = creatorUrl(subscription.platform, subscription.handle, subscription.platformId);
      const values = endedValues(subscription, now.getTime() - (subscription.state.liveSince ?? now).getTime(), url);
      const message = await this.templates.apply(subscription.guildId, "streams.ended", values, endedMessage(subscription, values));
      await this.gateway.edit(channelId, messageId, message, { watchUrl: url });
    } catch (error) {
      this.log.warn("Could not update the announcement after the stream ended.", { err: error, subscriptionId: subscription.id });
    }
  }

  private async guildName(guildId: string): Promise<string | undefined> {
    if (!this.guildNames.has(guildId)) this.guildNames.set(guildId, await this.gateway?.guildName(guildId).catch(() => undefined));
    return this.guildNames.get(guildId);
  }

  private client(platform: StreamPlatform): StreamPlatformClient {
    const client = this.clients.get(platform);
    if (!client) throw new StreamsError("DEPENDENCY_UNAVAILABLE", `${platformLabel(platform)} is not available on this host.`);
    if (!client.available) throw new StreamsError("DEPENDENCY_UNAVAILABLE", `${platformLabel(platform)} needs app credentials on the host. Ask whoever runs the bot to add them.`);
    return client;
  }
}
