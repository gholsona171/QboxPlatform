import {
  StreamsError,
  defaultStreamsSettings,
  type StreamPlatform,
  type StreamsEndedBehavior,
  type StreamsGuildConfig,
  type StreamsRepository,
  type StreamsSettings,
  type StreamsSettingsInput,
  type StreamsSubscription,
  type StreamsSubscriptionCreate,
  type StreamsSubscriptionPatch,
  type StreamsSubscriptionState,
} from "@qbox/streams";
import type { Prisma, PrismaClient, StreamsEndedBehavior as DbEndedBehavior, StreamsPlatform as DbPlatform } from "@qbox/prisma";

type Client = Pick<PrismaClient, "streamsSettings" | "streamsSubscription">;
type SettingsRow = Prisma.StreamsSettingsGetPayload<object>;
type SubscriptionRow = Prisma.StreamsSubscriptionGetPayload<object>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** PostgreSQL stream settings and subscriptions. `guildId` is the Discord guild ID. */
export class PrismaStreamsRepository implements StreamsRepository {
  public constructor(private readonly client: Client) {}

  public async getSettings(guildId: string): Promise<StreamsSettings | undefined> {
    const row = await this.client.streamsSettings.findUnique({ where: { guildId } });
    return row ? mapSettings(row) : undefined;
  }

  public async saveSettings(input: StreamsSettingsInput): Promise<StreamsSettings> {
    const data = {
      enabled: input.enabled,
      defaultChannelId: input.defaultChannelId ?? null,
      endedBehavior: toDbEndedBehavior(input.endedBehavior),
      checkIntervalSeconds: input.checkIntervalSeconds,
    };
    const existing = await this.client.streamsSettings.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
    if (!existing) {
      if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
        throw new StreamsError("CONFLICT", "Stream settings changed since they were loaded.", { currentRevision: 0 });
      return mapSettings(await this.client.streamsSettings.create({ data: { guildId: input.guildId, ...data } }));
    }
    const result = await this.client.streamsSettings.updateMany({
      where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
      data: { ...data, revision: { increment: 1 } },
    });
    if (result.count === 0) throw new StreamsError("CONFLICT", "Stream settings changed since they were loaded.", { currentRevision: existing.revision });
    return mapSettings(await this.client.streamsSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
  }

  public async listSubscriptions(guildId: string): Promise<readonly StreamsSubscription[]> {
    return (await this.client.streamsSubscription.findMany({ where: { guildId }, orderBy: [{ displayName: "asc" }, { createdAt: "asc" }] })).map(mapSubscription);
  }

  public async getSubscription(guildId: string, id: string): Promise<StreamsSubscription | undefined> {
    if (!UUID.test(id)) return undefined;
    const row = await this.client.streamsSubscription.findFirst({ where: { guildId, id } });
    return row ? mapSubscription(row) : undefined;
  }

  public countSubscriptions(guildId: string): Promise<number> {
    return this.client.streamsSubscription.count({ where: { guildId } });
  }

  public async createSubscription(input: StreamsSubscriptionCreate): Promise<StreamsSubscription> {
    return mapSubscription(await this.client.streamsSubscription.create({
      data: {
        guildId: input.guildId,
        platform: toDbPlatform(input.platform),
        handle: input.handle,
        displayName: input.displayName,
        avatarUrl: input.avatarUrl ?? null,
        platformId: input.platformId,
        ...patchColumns(input),
      },
    }));
  }

  public async updateSubscription(id: string, patch: StreamsSubscriptionPatch): Promise<StreamsSubscription> {
    return mapSubscription(await this.client.streamsSubscription.update({ where: { id }, data: patchColumns(patch) }));
  }

  public async deleteSubscription(guildId: string, id: string): Promise<boolean> {
    if (!UUID.test(id)) return false;
    return (await this.client.streamsSubscription.deleteMany({ where: { guildId, id } })).count > 0;
  }

  public async saveState(id: string, state: Partial<StreamsSubscriptionState>): Promise<void> {
    const data: Prisma.StreamsSubscriptionUpdateManyMutationInput = {};
    if ("lastStreamId" in state) data.lastStreamId = state.lastStreamId ?? null;
    if ("liveSince" in state) data.liveSince = state.liveSince ?? null;
    if ("lastAnnouncementChannelId" in state) data.lastAnnouncementChannelId = state.lastAnnouncementChannelId ?? null;
    if ("lastAnnouncementMessageId" in state) data.lastAnnouncementMessageId = state.lastAnnouncementMessageId ?? null;
    if ("lastVideoId" in state) data.lastVideoId = state.lastVideoId ?? null;
    if ("lastCheckedAt" in state) data.lastCheckedAt = state.lastCheckedAt ?? null;
    if (state.offlineStreak !== undefined) data.offlineStreak = state.offlineStreak;
    if (state.failureStreak !== undefined) data.failureStreak = state.failureStreak;
    if ("lastError" in state) data.lastError = state.lastError ?? null;
    await this.client.streamsSubscription.updateMany({ where: { id }, data });
  }

  public async listActive(): Promise<readonly StreamsGuildConfig[]> {
    const rows = await this.client.streamsSubscription.findMany({ where: { enabled: true }, orderBy: { guildId: "asc" }, take: 5000 });
    const guildIds = [...new Set(rows.map((row) => row.guildId))];
    const settings = new Map((await this.client.streamsSettings.findMany({ where: { guildId: { in: guildIds } } })).map((row) => [row.guildId, mapSettings(row)]));
    return guildIds.map((guildId) => ({
      settings: settings.get(guildId) ?? defaultStreamsSettings(guildId),
      subscriptions: rows.filter((row) => row.guildId === guildId).map(mapSubscription),
    }));
  }
}

function patchColumns(patch: StreamsSubscriptionPatch) {
  return {
    announceChannelId: patch.announceChannelId ?? null,
    pingRoleId: patch.pingRoleId ?? null,
    messageText: patch.messageText ?? null,
    announceVideos: patch.announceVideos,
    enabled: patch.enabled,
  };
}

function toDbPlatform(platform: StreamPlatform): DbPlatform {
  return platform.toUpperCase() as DbPlatform;
}

function toDbEndedBehavior(behavior: StreamsEndedBehavior): DbEndedBehavior {
  return behavior.toUpperCase() as DbEndedBehavior;
}

function mapSettings(row: SettingsRow): StreamsSettings {
  return {
    guildId: row.guildId,
    enabled: row.enabled,
    ...(row.defaultChannelId ? { defaultChannelId: row.defaultChannelId } : {}),
    endedBehavior: row.endedBehavior.toLowerCase() as StreamsEndedBehavior,
    checkIntervalSeconds: row.checkIntervalSeconds,
    revision: row.revision,
  };
}

function mapSubscription(row: SubscriptionRow): StreamsSubscription {
  return {
    id: row.id,
    guildId: row.guildId,
    platform: row.platform.toLowerCase() as StreamPlatform,
    handle: row.handle,
    displayName: row.displayName,
    ...(row.avatarUrl ? { avatarUrl: row.avatarUrl } : {}),
    platformId: row.platformId,
    ...(row.announceChannelId ? { announceChannelId: row.announceChannelId } : {}),
    ...(row.pingRoleId ? { pingRoleId: row.pingRoleId } : {}),
    ...(row.messageText ? { messageText: row.messageText } : {}),
    announceVideos: row.announceVideos,
    enabled: row.enabled,
    state: {
      ...(row.lastStreamId ? { lastStreamId: row.lastStreamId } : {}),
      ...(row.liveSince ? { liveSince: row.liveSince } : {}),
      ...(row.lastAnnouncementChannelId ? { lastAnnouncementChannelId: row.lastAnnouncementChannelId } : {}),
      ...(row.lastAnnouncementMessageId ? { lastAnnouncementMessageId: row.lastAnnouncementMessageId } : {}),
      ...(row.lastVideoId ? { lastVideoId: row.lastVideoId } : {}),
      ...(row.lastCheckedAt ? { lastCheckedAt: row.lastCheckedAt } : {}),
      offlineStreak: row.offlineStreak,
      failureStreak: row.failureStreak,
      ...(row.lastError ? { lastError: row.lastError } : {}),
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
