import { passthroughTemplates, renderPlaceholders } from "@qbox/shared/messages";
import { GamesError, isServerKind, normalizeAddress, requireSnowflake, validateServerInput, validateSettings } from "./validation.js";
/** Failed polls in a row before a server counts as down. */
export const FAILURES_BEFORE_DOWN = 3;
/** Names shown in the status message and `/server players`. */
export const PLAYER_LIST_LIMIT = 20;
/** Servers per guild. */
export const MAX_SERVERS = 10;
/** Discord allows two channel renames per ten minutes, so the player-count channel changes at most this often. */
export const RENAME_MIN_INTERVAL_MS = 5 * 60_000;
const SNAPSHOT_RETENTION_MS = 7 * 86_400_000;
const PRUNE_EVERY_MS = 3_600_000;
const HOUR_MS = 3_600_000;
const RANGES = { "24h": { spanMs: 24 * HOUR_MS, buckets: 96 }, "7d": { spanMs: 7 * 24 * HOUR_MS, buckets: 84 } };
const GREEN = 0x57f287;
const RED = 0xed4245;
export function defaultGamesSettings(guildId) {
    return { guildId, playerCountTemplate: "🎮 {online}/{max} online", playerCountOfflineTemplate: "🔴 Offline", revision: 0 };
}
export function emptyServerState() {
    return { failureStreak: 0, lastPlayerCount: 0, lastMaxPlayers: 0 };
}
/** What people call the game: "Minecraft", "Minecraft Bedrock", or the Steam label. */
export function gameLabel(server) {
    if (server.kind === "minecraft-java")
        return "Minecraft";
    if (server.kind === "minecraft-bedrock")
        return "Minecraft Bedrock";
    return server.game?.trim() || "Steam game";
}
/** "2h 5m", "3d 4h". */
export function formatDuration(ms) {
    const minutes = Math.max(0, Math.floor(ms / 60_000));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const rest = minutes % 60;
    if (days > 0)
        return `${days}d ${hours}h`;
    if (hours > 0)
        return `${hours}h ${rest}m`;
    return `${rest}m`;
}
function escapeMarkdown(value) {
    return value.replace(/([*_`~|>\\])/g, "\\$1");
}
/** Player names for Discord, escaped and cut to the list limit. */
export function playerLines(status, limit = PLAYER_LIST_LIMIT) {
    if (!status.online)
        return "The server is offline.";
    if (status.players.length === 0)
        return status.playerCount > 0 ? "The player list is hidden on this server." : "Nobody is online.";
    const shown = status.players.slice(0, limit).map((player) => `• ${escapeMarkdown(player.name)}${player.duration ? ` (${formatDuration(player.duration * 1000)})` : ""}`);
    const more = Math.max(status.players.length, status.playerCount) - shown.length;
    return `${shown.join("\n")}${more > 0 ? `\n…and ${more} more` : ""}`.slice(0, 1000);
}
/** Placeholder values shared by every message key. */
export function templateValues(server, status, state) {
    return {
        name: status.name || server.name,
        server: server.name,
        game: gameLabel(server),
        address: server.address,
        players: status.playerCount,
        maxPlayers: status.maxPlayers,
        map: status.map ?? "",
        version: status.version ?? "",
        latency: status.latencyMs,
        playerList: playerLines(status),
        connectUrl: server.connectUrl ?? "",
        downFor: state.offlineSince ? formatDuration(status.checkedAt.getTime() - state.offlineSince.getTime()) : "",
    };
}
function isLinkButtonUrl(url) {
    return url !== undefined && /^https?:\/\//i.test(url);
}
/** Default status message (`games.status`). */
export function statusMessage(server, status, onlineSince) {
    const title = `${status.name || server.name}`.slice(0, 256);
    const updated = `Updated <t:${Math.floor(status.checkedAt.getTime() / 1000)}:R>`;
    if (!status.online)
        return { embeds: [{ title, description: `🔴 **Offline**\n${status.error ?? "The server is not answering."}\n${updated}`, color: RED, footer: { text: `${gameLabel(server)} · ${server.address}` } }] };
    const uptime = onlineSince ? ` · up ${formatDuration(status.checkedAt.getTime() - onlineSince.getTime())}` : "";
    return {
        embeds: [{
                title,
                description: `🟢 **Online** · ${status.playerCount}/${status.maxPlayers} players${uptime}\n${updated}`,
                color: GREEN,
                fields: [
                    { name: `Players (${status.playerCount})`, value: playerLines(status) },
                    ...(status.map ? [{ name: "Map", value: status.map, inline: true }] : []),
                    ...(status.version ? [{ name: "Version", value: status.version, inline: true }] : []),
                    { name: "Latency", value: `${status.latencyMs} ms`, inline: true },
                    ...(server.connectUrl && !isLinkButtonUrl(server.connectUrl) ? [{ name: "Connect", value: server.connectUrl }] : []),
                ],
                footer: { text: `${gameLabel(server)} · ${server.address}` },
            }],
    };
}
/** Default down alert (`games.down`). */
export function downMessage(server, status) {
    return { content: `🔴 **${server.name}** is down.`, ...statusMessage(server, status) };
}
/** Default back-up alert (`games.up`). */
export function upMessage(server, status, downFor) {
    return { content: `🟢 **${server.name}** is back online${downFor ? ` after ${downFor}` : ""}.`, ...statusMessage(server, status) };
}
function cleanInput(input) {
    const optional = (value) => (value === undefined || value.trim() === "" ? undefined : value.trim());
    return {
        name: input.name.trim(),
        kind: input.kind,
        address: normalizeAddress(input.kind, input.address),
        game: input.kind === "steam" ? optional(input.game) : undefined,
        connectUrl: optional(input.connectUrl),
        statusChannelId: optional(input.statusChannelId),
        updateIntervalSeconds: input.updateIntervalSeconds,
        playerCountChannelId: optional(input.playerCountChannelId),
        alertChannelId: optional(input.alertChannelId),
        alertRoleId: optional(input.alertRoleId),
        enabled: input.enabled,
    };
}
/**
 * Game server monitoring shared by the bot and the API: live status for
 * Minecraft and Steam-query games, auto-updating status messages, player-count
 * channels, down/up alerts, and player-count history. Permission checks
 * happen before the service is called.
 */
export class GamesService {
    repository;
    query;
    gateway;
    templates;
    now;
    lastPrune = 0;
    constructor(repository, query, gateway, templates = passthroughTemplates, now = () => new Date()) {
        this.repository = repository;
        this.query = query;
        this.gateway = gateway;
        this.templates = templates;
        this.now = now;
    }
    async settings(guildId) {
        requireSnowflake("guildId", guildId);
        return (await this.repository.getSettings(guildId)) ?? defaultGamesSettings(guildId);
    }
    async saveSettings(input) {
        validateSettings(input);
        return this.repository.saveSettings({ ...input, playerCountTemplate: input.playerCountTemplate.trim(), playerCountOfflineTemplate: input.playerCountOfflineTemplate.trim() });
    }
    async servers(guildId) {
        requireSnowflake("guildId", guildId);
        return this.repository.listServers(guildId);
    }
    async server(guildId, id) {
        requireSnowflake("guildId", guildId);
        const record = await this.repository.getServer(guildId, id);
        if (!record)
            throw new GamesError("NOT_FOUND", "That game server is not set up here.");
        return record;
    }
    /** Finds a server by name (case-insensitive, prefix allowed); the first enabled one when no name is given. */
    async findServer(guildId, name) {
        const servers = await this.servers(guildId);
        if (servers.length === 0)
            throw new GamesError("INVALID_STATE", "No game servers are set up yet. Add one in the portal.");
        const wanted = name?.trim().toLowerCase();
        if (!wanted) {
            const record = servers.find((item) => item.server.enabled) ?? servers[0];
            if (!record)
                throw new GamesError("INVALID_STATE", "No game servers are set up yet. Add one in the portal.");
            return record;
        }
        const match = servers.find((item) => item.server.name.toLowerCase() === wanted) ?? servers.find((item) => item.server.name.toLowerCase().startsWith(wanted));
        if (!match)
            throw new GamesError("NOT_FOUND", `No server called "${name?.trim()}". Servers: ${servers.map((item) => item.server.name).join(", ")}.`);
        return match;
    }
    /** Saves a server after querying it once; the status tells the form whether it was reached. */
    async createServer(guildId, input) {
        requireSnowflake("guildId", guildId);
        validateServerInput(input);
        const clean = cleanInput(input);
        const existing = await this.repository.listServers(guildId);
        if (existing.length >= MAX_SERVERS)
            throw new GamesError("LIMIT_REACHED", `You can have at most ${MAX_SERVERS} game servers.`);
        if (existing.some((item) => item.server.name.toLowerCase() === clean.name.toLowerCase()))
            throw new GamesError("CONFLICT", "A server with that name already exists.");
        const status = await this.query.query(clean.kind, clean.address);
        const server = await this.repository.createServer(guildId, clean);
        return { server, status };
    }
    async updateServer(guildId, id, input) {
        const before = await this.server(guildId, id);
        validateServerInput(input);
        const clean = cleanInput(input);
        const others = await this.repository.listServers(guildId);
        if (others.some((item) => item.server.id !== id && item.server.name.toLowerCase() === clean.name.toLowerCase()))
            throw new GamesError("CONFLICT", "A server with that name already exists.");
        const saved = await this.repository.updateServer(guildId, id, clean);
        const moved = before.server.statusChannelId !== saved.statusChannelId;
        const changedTarget = before.server.address !== saved.address || before.server.kind !== saved.kind;
        const movedCounter = before.server.playerCountChannelId !== saved.playerCountChannelId;
        if (moved || changedTarget || movedCounter)
            await this.repository.saveState(id, {
                ...(moved ? { statusMessageId: undefined } : {}),
                ...(changedTarget ? { lastOnline: undefined, onlineSince: undefined, offlineSince: undefined, failureStreak: 0, lastPolledAt: undefined, lastError: undefined } : {}),
                ...(movedCounter ? { lastChannelName: undefined } : {}),
            });
        return saved;
    }
    async deleteServer(guildId, id) {
        await this.server(guildId, id);
        await this.repository.deleteServer(guildId, id);
    }
    /** Queries a saved server now. */
    async status(guildId, id) {
        const { server } = await this.server(guildId, id);
        return this.query.query(server.kind, server.address);
    }
    /** Queries an address without saving it (the portal's test button). */
    async test(kind, address) {
        if (!isServerKind(kind))
            throw new GamesError("INVALID_INPUT", "Choose a server kind: Minecraft (Java), Minecraft (Bedrock), or Steam.");
        return this.query.query(kind, normalizeAddress(kind, address));
    }
    /** Highest player count per time bucket for a chart, with uptime. */
    async history(guildId, id, range) {
        await this.server(guildId, id);
        const { spanMs, buckets } = RANGES[range];
        const end = this.now().getTime();
        const start = end - spanMs;
        const size = spanMs / buckets;
        const snapshots = await this.repository.listSnapshots(id, new Date(start));
        const grouped = Array.from({ length: buckets }, () => ({ players: -1, maxPlayers: 0, online: 0, total: 0 }));
        for (const snapshot of snapshots) {
            const bucket = grouped[Math.min(buckets - 1, Math.max(0, Math.floor((snapshot.at.getTime() - start) / size)))];
            if (!bucket)
                continue;
            bucket.players = Math.max(bucket.players, snapshot.players);
            bucket.maxPlayers = Math.max(bucket.maxPlayers, snapshot.maxPlayers);
            bucket.total += 1;
            if (snapshot.online)
                bucket.online += 1;
        }
        const points = grouped.map((bucket, index) => ({
            at: new Date(start + index * size),
            ...(bucket.total > 0 ? { players: bucket.players, maxPlayers: bucket.maxPlayers, online: bucket.online === bucket.total } : {}),
        }));
        const online = snapshots.filter((snapshot) => snapshot.online).length;
        return {
            range,
            points,
            peak: snapshots.reduce((peak, snapshot) => Math.max(peak, snapshot.players), 0),
            ...(snapshots.length ? { uptimePercent: Math.round((online / snapshots.length) * 1000) / 10 } : {}),
        };
    }
    /** Polls every enabled server whose interval has passed. Called by the bot's timer. */
    async tick() {
        const now = this.now();
        for (const record of await this.repository.listMonitored()) {
            const last = record.state.lastPolledAt?.getTime();
            if (last === undefined || now.getTime() - last >= record.server.updateIntervalSeconds * 1000 - 1000)
                await this.refresh(record).catch(() => undefined);
        }
        if (now.getTime() - this.lastPrune >= PRUNE_EVERY_MS) {
            this.lastPrune = now.getTime();
            await this.repository.pruneSnapshots(new Date(now.getTime() - SNAPSHOT_RETENTION_MS));
        }
    }
    /** Polls one server: records a snapshot, sends down/up alerts, updates the status message and player-count channel. */
    async refresh(record) {
        const { server, state } = record;
        const status = await this.query.query(server.kind, server.address);
        const now = status.checkedAt;
        const snapshot = { online: status.online, players: status.playerCount, maxPlayers: status.maxPlayers, at: now };
        await this.repository.addSnapshot(server.id, snapshot);
        const values = templateValues(server, status, state);
        const next = { lastPolledAt: now, lastError: status.error, lastPlayerCount: status.playerCount, lastMaxPlayers: status.maxPlayers };
        let confirmed = status.online;
        let onlineSince = state.onlineSince;
        if (status.online) {
            next.failureStreak = 0;
            if (state.lastOnline !== true) {
                onlineSince = now;
                next.onlineSince = now;
                next.lastOnline = true;
                if (state.lastOnline === false) {
                    await this.alert(server, "games.up", upMessage(server, status, String(values.downFor ?? "")), values);
                    next.offlineSince = undefined;
                }
            }
        }
        else {
            const streak = state.failureStreak + 1;
            next.failureStreak = streak;
            if (state.lastOnline === true && streak < FAILURES_BEFORE_DOWN)
                confirmed = true;
            else if (state.lastOnline !== false) {
                next.lastOnline = false;
                next.onlineSince = undefined;
                next.offlineSince = now;
                if (state.lastOnline === true)
                    await this.alert(server, "games.down", downMessage(server, status), values);
            }
        }
        if (confirmed === status.online) {
            if (this.gateway && server.statusChannelId) {
                const message = await this.templates.apply(server.guildId, "games.status", values, statusMessage(server, status, onlineSince));
                const messageId = await this.gateway
                    .upsertStatusMessage(server.statusChannelId, state.statusMessageId, message, isLinkButtonUrl(server.connectUrl) ? server.connectUrl : undefined)
                    .catch(() => undefined);
                if (messageId && messageId !== state.statusMessageId)
                    next.statusMessageId = messageId;
            }
            Object.assign(next, await this.renamePlayerCountChannel(server, state, status, now));
        }
        await this.repository.saveState(server.id, next);
        return status;
    }
    /** The player-count channel name for a status, rendered from the guild's template. */
    async playerCountName(server, status) {
        const settings = await this.settings(server.guildId);
        const template = status.online ? settings.playerCountTemplate : settings.playerCountOfflineTemplate;
        return renderPlaceholders(template, { online: status.playerCount, max: status.maxPlayers, name: status.name || server.name, game: gameLabel(server) }).slice(0, 100);
    }
    async renamePlayerCountChannel(server, state, status, now) {
        if (!this.gateway || !server.playerCountChannelId)
            return {};
        const name = await this.playerCountName(server, status);
        if (name === state.lastChannelName)
            return {};
        if (state.lastRenamedAt && now.getTime() - state.lastRenamedAt.getTime() < RENAME_MIN_INTERVAL_MS)
            return {};
        const renamed = await this.gateway.renameChannel(server.playerCountChannelId, name).then(() => true, () => false);
        return renamed ? { lastRenamedAt: now, lastChannelName: name } : {};
    }
    async alert(server, key, fallback, values) {
        if (!this.gateway || !server.alertChannelId)
            return;
        const message = await this.templates.apply(server.guildId, key, values, fallback);
        await this.gateway.postAlert(server.alertChannelId, message, server.alertRoleId).catch(() => undefined);
    }
}
//# sourceMappingURL=GamesService.js.map