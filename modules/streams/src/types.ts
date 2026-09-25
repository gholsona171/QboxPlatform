import type { OutgoingMessage } from "@qbox/shared/messages";

export const STREAM_PLATFORMS = ["twitch", "kick", "youtube"] as const;
export type StreamPlatform = (typeof STREAM_PLATFORMS)[number];

export const ENDED_BEHAVIORS = ["keep", "edit", "delete"] as const;
/** What happens to the live announcement when the stream ends. */
export type StreamsEndedBehavior = (typeof ENDED_BEHAVIORS)[number];

export interface StreamsSettings {
  readonly guildId: string;
  /** Off pauses every check for the server. */
  readonly enabled: boolean;
  /** Channel used when a subscription has no channel of its own. */
  readonly defaultChannelId?: string | undefined;
  readonly endedBehavior: StreamsEndedBehavior;
  /** Seconds between checks per creator (60-600). */
  readonly checkIntervalSeconds: number;
  readonly revision: number;
}

export interface StreamsSettingsInput extends Omit<StreamsSettings, "revision"> {
  readonly expectedRevision?: number | undefined;
}

/** Polling state kept per subscription. Not edited by staff. */
export interface StreamsSubscriptionState {
  /** Platform stream ID of the stream announced last; set while it counts as live. */
  readonly lastStreamId?: string | undefined;
  readonly liveSince?: Date | undefined;
  readonly lastAnnouncementChannelId?: string | undefined;
  readonly lastAnnouncementMessageId?: string | undefined;
  /** Newest YouTube upload seen, so only later uploads are announced. */
  readonly lastVideoId?: string | undefined;
  readonly lastCheckedAt?: Date | undefined;
  /** Offline answers in a row while a stream was live. */
  readonly offlineStreak: number;
  /** Failed checks in a row; drives the backoff. */
  readonly failureStreak: number;
  readonly lastError?: string | undefined;
}

export interface StreamsSubscription {
  readonly id: string;
  readonly guildId: string;
  readonly platform: StreamPlatform;
  /** Login (Twitch), slug (Kick), or handle (YouTube), as typed by staff. */
  readonly handle: string;
  readonly displayName: string;
  readonly avatarUrl?: string | undefined;
  /** The platform's own ID: Twitch user ID, Kick slug, YouTube channel ID. */
  readonly platformId: string;
  /** Falls back to the settings' default channel when missing. */
  readonly announceChannelId?: string | undefined;
  readonly pingRoleId?: string | undefined;
  /** Replaces the message text above the embed. Placeholders allowed. */
  readonly messageText?: string | undefined;
  /** YouTube only: also announce new uploads. */
  readonly announceVideos: boolean;
  readonly enabled: boolean;
  readonly state: StreamsSubscriptionState;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Fields staff edit when adding a creator. */
export interface StreamsSubscriptionInput {
  readonly guildId: string;
  readonly platform: StreamPlatform;
  readonly handle: string;
  readonly announceChannelId?: string | undefined;
  readonly pingRoleId?: string | undefined;
  readonly messageText?: string | undefined;
  readonly announceVideos: boolean;
  readonly enabled: boolean;
}

/** Fields staff edit on an existing creator. Platform and handle stay. */
export type StreamsSubscriptionPatch = Omit<StreamsSubscriptionInput, "guildId" | "platform" | "handle">;

/** What the repository stores when a creator is added: the input plus the resolved creator. */
export interface StreamsSubscriptionCreate extends StreamsSubscriptionInput {
  readonly displayName: string;
  readonly avatarUrl?: string | undefined;
  readonly platformId: string;
}

export interface StreamsGuildConfig {
  readonly settings: StreamsSettings;
  readonly subscriptions: readonly StreamsSubscription[];
}

export interface StreamsRepository {
  getSettings(guildId: string): Promise<StreamsSettings | undefined>;
  saveSettings(input: StreamsSettingsInput): Promise<StreamsSettings>;
  listSubscriptions(guildId: string): Promise<readonly StreamsSubscription[]>;
  getSubscription(guildId: string, id: string): Promise<StreamsSubscription | undefined>;
  countSubscriptions(guildId: string): Promise<number>;
  createSubscription(input: StreamsSubscriptionCreate): Promise<StreamsSubscription>;
  updateSubscription(id: string, patch: StreamsSubscriptionPatch): Promise<StreamsSubscription>;
  /** True when a subscription was deleted. */
  deleteSubscription(guildId: string, id: string): Promise<boolean>;
  /** Merges state; `undefined` values clear a field. */
  saveState(id: string, state: Partial<StreamsSubscriptionState>): Promise<void>;
  /** Every guild with at least one enabled subscription, with its settings (defaults when unsaved). */
  listActive(): Promise<readonly StreamsGuildConfig[]>;
}

/** A creator as the platform describes them. */
export interface StreamCreator {
  readonly platform: StreamPlatform;
  readonly platformId: string;
  readonly handle: string;
  readonly displayName: string;
  readonly avatarUrl?: string | undefined;
  readonly url: string;
}

export interface LiveStream {
  /** Platform stream ID, used to announce each stream once. */
  readonly id: string;
  readonly title: string;
  readonly game?: string | undefined;
  readonly viewers?: number | undefined;
  readonly thumbnailUrl?: string | undefined;
  readonly startedAt?: Date | undefined;
  readonly url: string;
}

export interface StreamVideo {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly publishedAt: Date;
}

export type LiveCheck =
  | { readonly status: "live"; readonly stream: LiveStream }
  | { readonly status: "offline" }
  | { readonly status: "error"; readonly error: string };

/** One streaming platform. Implemented with `fetch`; fakes in tests. */
export interface StreamPlatformClient {
  readonly platform: StreamPlatform;
  /** False when the host lacks credentials the platform needs. */
  readonly available: boolean;
  /** Finds a creator by handle. Throws `StreamsError` (NOT_FOUND, DEPENDENCY_UNAVAILABLE). */
  resolve(handle: string): Promise<StreamCreator>;
  /** Live status per platform ID. IDs missing from the result count as an error. Never throws. */
  liveStatus(platformIds: readonly string[]): Promise<ReadonlyMap<string, LiveCheck>>;
  /** Newest uploads first. Only YouTube implements it. */
  latestVideos?(platformId: string): Promise<readonly StreamVideo[]>;
}

export interface StreamsPostOptions {
  /** URL for the "Watch" link button. */
  readonly watchUrl?: string | undefined;
  /** Role that may be mentioned in the content. */
  readonly pingRoleId?: string | undefined;
}

/** Discord operations the streams feature needs. */
export interface StreamsGateway {
  /** Posts an announcement and returns its message ID. */
  post(channelId: string, message: OutgoingMessage, options: StreamsPostOptions): Promise<string>;
  edit(channelId: string, messageId: string, message: OutgoingMessage, options: StreamsPostOptions): Promise<void>;
  deleteMessage(channelId: string, messageId: string): Promise<void>;
  /** The server's name for the `{server}` placeholder. */
  guildName(guildId: string): Promise<string | undefined>;
}

/** Which platforms the host can use. */
export type StreamsAvailability = Readonly<Record<StreamPlatform, boolean>>;
