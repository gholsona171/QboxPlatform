import { GamesError, } from "@qbox/game-servers";
const TO_PRISMA_KIND = { "minecraft-java": "MINECRAFT_JAVA", "minecraft-bedrock": "MINECRAFT_BEDROCK", steam: "STEAM" };
const FROM_PRISMA_KIND = { MINECRAFT_JAVA: "minecraft-java", MINECRAFT_BEDROCK: "minecraft-bedrock", STEAM: "steam" };
/** PostgreSQL game server settings, servers with monitor state, and status snapshots. `guildId` is the Discord guild ID. */
export class PrismaGamesRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async getSettings(guildId) {
        const row = await this.client.gamesSettings.findUnique({ where: { guildId } });
        return row ? mapSettings(row) : undefined;
    }
    async saveSettings(input) {
        const data = { playerCountTemplate: input.playerCountTemplate, playerCountOfflineTemplate: input.playerCountOfflineTemplate };
        const existing = await this.client.gamesSettings.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
        if (!existing) {
            if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
                throw new GamesError("CONFLICT", "Game server settings changed since they were loaded.", { currentRevision: 0 });
            return mapSettings(await this.client.gamesSettings.create({ data: { guildId: input.guildId, ...data } }));
        }
        const result = await this.client.gamesSettings.updateMany({
            where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
            data: { ...data, revision: { increment: 1 } },
        });
        if (result.count === 0)
            throw new GamesError("CONFLICT", "Game server settings changed since they were loaded.", { currentRevision: existing.revision });
        return mapSettings(await this.client.gamesSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
    }
    async listServers(guildId) {
        const rows = await this.client.gamesServer.findMany({ where: { guildId }, orderBy: { createdAt: "asc" }, take: 50 });
        return rows.map(mapRecord);
    }
    async getServer(guildId, id) {
        if (!isUuid(id))
            return undefined;
        const row = await this.client.gamesServer.findFirst({ where: { id, guildId } });
        return row ? mapRecord(row) : undefined;
    }
    async createServer(guildId, input) {
        return mapRecord(await this.client.gamesServer.create({ data: { guildId, ...serverData(input) } })).server;
    }
    async updateServer(guildId, id, input) {
        if (!isUuid(id) || (await this.client.gamesServer.updateMany({ where: { id, guildId }, data: serverData(input) })).count === 0)
            throw new GamesError("NOT_FOUND", "That game server is not set up here.");
        return mapRecord(await this.client.gamesServer.findUniqueOrThrow({ where: { id } })).server;
    }
    async deleteServer(guildId, id) {
        if (!isUuid(id))
            return;
        await this.client.gamesServer.deleteMany({ where: { id, guildId } });
    }
    async saveState(id, state) {
        if (!isUuid(id))
            return;
        const data = {};
        if ("statusMessageId" in state)
            data.statusMessageId = state.statusMessageId ?? null;
        if ("lastOnline" in state)
            data.lastOnline = state.lastOnline ?? null;
        if ("onlineSince" in state)
            data.onlineSince = state.onlineSince ?? null;
        if ("offlineSince" in state)
            data.offlineSince = state.offlineSince ?? null;
        if (state.failureStreak !== undefined)
            data.failureStreak = state.failureStreak;
        if ("lastPolledAt" in state)
            data.lastPolledAt = state.lastPolledAt ?? null;
        if ("lastError" in state)
            data.lastError = state.lastError ?? null;
        if (state.lastPlayerCount !== undefined)
            data.lastPlayerCount = state.lastPlayerCount;
        if (state.lastMaxPlayers !== undefined)
            data.lastMaxPlayers = state.lastMaxPlayers;
        if ("lastRenamedAt" in state)
            data.lastRenamedAt = state.lastRenamedAt ?? null;
        if ("lastChannelName" in state)
            data.lastChannelName = state.lastChannelName ?? null;
        await this.client.gamesServer.updateMany({ where: { id }, data });
    }
    async listMonitored() {
        const rows = await this.client.gamesServer.findMany({ where: { enabled: true }, orderBy: { createdAt: "asc" }, take: 2000 });
        return rows.map(mapRecord);
    }
    async addSnapshot(serverId, snapshot) {
        await this.client.gamesStatusSnapshot.create({ data: { serverId, online: snapshot.online, players: snapshot.players, maxPlayers: snapshot.maxPlayers, at: snapshot.at } });
    }
    async listSnapshots(serverId, since) {
        if (!isUuid(serverId))
            return [];
        return this.client.gamesStatusSnapshot.findMany({
            where: { serverId, at: { gte: since } },
            orderBy: { at: "asc" },
            select: { online: true, players: true, maxPlayers: true, at: true },
            take: 20_000,
        });
    }
    async pruneSnapshots(before) {
        return (await this.client.gamesStatusSnapshot.deleteMany({ where: { at: { lt: before } } })).count;
    }
}
function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
function serverData(input) {
    return {
        name: input.name,
        kind: TO_PRISMA_KIND[input.kind],
        address: input.address,
        game: input.game ?? null,
        connectUrl: input.connectUrl ?? null,
        statusChannelId: input.statusChannelId ?? null,
        updateIntervalSeconds: input.updateIntervalSeconds,
        playerCountChannelId: input.playerCountChannelId ?? null,
        alertChannelId: input.alertChannelId ?? null,
        alertRoleId: input.alertRoleId ?? null,
        enabled: input.enabled,
    };
}
function mapSettings(row) {
    return { guildId: row.guildId, playerCountTemplate: row.playerCountTemplate, playerCountOfflineTemplate: row.playerCountOfflineTemplate, revision: row.revision };
}
function mapRecord(row) {
    return {
        server: {
            id: row.id,
            guildId: row.guildId,
            name: row.name,
            kind: FROM_PRISMA_KIND[row.kind],
            address: row.address,
            ...(row.game ? { game: row.game } : {}),
            ...(row.connectUrl ? { connectUrl: row.connectUrl } : {}),
            ...(row.statusChannelId ? { statusChannelId: row.statusChannelId } : {}),
            updateIntervalSeconds: row.updateIntervalSeconds,
            ...(row.playerCountChannelId ? { playerCountChannelId: row.playerCountChannelId } : {}),
            ...(row.alertChannelId ? { alertChannelId: row.alertChannelId } : {}),
            ...(row.alertRoleId ? { alertRoleId: row.alertRoleId } : {}),
            enabled: row.enabled,
            createdAt: row.createdAt,
        },
        state: {
            ...(row.statusMessageId ? { statusMessageId: row.statusMessageId } : {}),
            ...(row.lastOnline === null ? {} : { lastOnline: row.lastOnline }),
            ...(row.onlineSince ? { onlineSince: row.onlineSince } : {}),
            ...(row.offlineSince ? { offlineSince: row.offlineSince } : {}),
            failureStreak: row.failureStreak,
            ...(row.lastPolledAt ? { lastPolledAt: row.lastPolledAt } : {}),
            ...(row.lastError ? { lastError: row.lastError } : {}),
            lastPlayerCount: row.lastPlayerCount,
            lastMaxPlayers: row.lastMaxPlayers,
            ...(row.lastRenamedAt ? { lastRenamedAt: row.lastRenamedAt } : {}),
            ...(row.lastChannelName ? { lastChannelName: row.lastChannelName } : {}),
        },
    };
}
//# sourceMappingURL=PrismaGamesRepository.js.map