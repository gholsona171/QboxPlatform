import { StreamsError, defaultStreamsSettings, } from "@qbox/streams";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** PostgreSQL stream settings and subscriptions. `guildId` is the Discord guild ID. */
export class PrismaStreamsRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async getSettings(guildId) {
        const row = await this.client.streamsSettings.findUnique({ where: { guildId } });
        return row ? mapSettings(row) : undefined;
    }
    async saveSettings(input) {
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
        if (result.count === 0)
            throw new StreamsError("CONFLICT", "Stream settings changed since they were loaded.", { currentRevision: existing.revision });
        return mapSettings(await this.client.streamsSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
    }
    async listSubscriptions(guildId) {
        return (await this.client.streamsSubscription.findMany({ where: { guildId }, orderBy: [{ displayName: "asc" }, { createdAt: "asc" }] })).map(mapSubscription);
    }
    async getSubscription(guildId, id) {
        if (!UUID.test(id))
            return undefined;
        const row = await this.client.streamsSubscription.findFirst({ where: { guildId, id } });
        return row ? mapSubscription(row) : undefined;
    }
    countSubscriptions(guildId) {
        return this.client.streamsSubscription.count({ where: { guildId } });
    }
    async createSubscription(input) {
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
    async updateSubscription(id, patch) {
        return mapSubscription(await this.client.streamsSubscription.update({ where: { id }, data: patchColumns(patch) }));
    }
    async deleteSubscription(guildId, id) {
        if (!UUID.test(id))
            return false;
        return (await this.client.streamsSubscription.deleteMany({ where: { guildId, id } })).count > 0;
    }
    async saveState(id, state) {
        const data = {};
        if ("lastStreamId" in state)
            data.lastStreamId = state.lastStreamId ?? null;
        if ("liveSince" in state)
            data.liveSince = state.liveSince ?? null;
        if ("lastAnnouncementChannelId" in state)
            data.lastAnnouncementChannelId = state.lastAnnouncementChannelId ?? null;
        if ("lastAnnouncementMessageId" in state)
            data.lastAnnouncementMessageId = state.lastAnnouncementMessageId ?? null;
        if ("lastVideoId" in state)
            data.lastVideoId = state.lastVideoId ?? null;
        if ("lastCheckedAt" in state)
            data.lastCheckedAt = state.lastCheckedAt ?? null;
        if (state.offlineStreak !== undefined)
            data.offlineStreak = state.offlineStreak;
        if (state.failureStreak !== undefined)
            data.failureStreak = state.failureStreak;
        if ("lastError" in state)
            data.lastError = state.lastError ?? null;
        await this.client.streamsSubscription.updateMany({ where: { id }, data });
    }
    async listActive() {
        const rows = await this.client.streamsSubscription.findMany({ where: { enabled: true }, orderBy: { guildId: "asc" }, take: 5000 });
        const guildIds = [...new Set(rows.map((row) => row.guildId))];
        const settings = new Map((await this.client.streamsSettings.findMany({ where: { guildId: { in: guildIds } } })).map((row) => [row.guildId, mapSettings(row)]));
        return guildIds.map((guildId) => ({
            settings: settings.get(guildId) ?? defaultStreamsSettings(guildId),
            subscriptions: rows.filter((row) => row.guildId === guildId).map(mapSubscription),
        }));
    }
}
function patchColumns(patch) {
    return {
        announceChannelId: patch.announceChannelId ?? null,
        pingRoleId: patch.pingRoleId ?? null,
        messageText: patch.messageText ?? null,
        announceVideos: patch.announceVideos,
        enabled: patch.enabled,
    };
}
function toDbPlatform(platform) {
    return platform.toUpperCase();
}
function toDbEndedBehavior(behavior) {
    return behavior.toUpperCase();
}
function mapSettings(row) {
    return {
        guildId: row.guildId,
        enabled: row.enabled,
        ...(row.defaultChannelId ? { defaultChannelId: row.defaultChannelId } : {}),
        endedBehavior: row.endedBehavior.toLowerCase(),
        checkIntervalSeconds: row.checkIntervalSeconds,
        revision: row.revision,
    };
}
function mapSubscription(row) {
    return {
        id: row.id,
        guildId: row.guildId,
        platform: row.platform.toLowerCase(),
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
//# sourceMappingURL=PrismaStreamsRepository.js.map