import { FivemError, normalizeAddress, requireSnowflake, validateSettings } from "./validation.js";
/** Failed polls in a row before the server counts as down (avoids alerts on one slow answer). */
export const FAILURES_BEFORE_DOWN = 2;
/** Players listed in the status message and `/fivem players`. */
export const PLAYER_LIST_LIMIT = 40;
const SNAPSHOT_RETENTION_MS = 8 * 86_400_000;
const PRUNE_EVERY_MS = 3_600_000;
const HOUR_MS = 3_600_000;
const RANGES = { "24h": { spanMs: 24 * HOUR_MS, buckets: 96 }, "7d": { spanMs: 7 * 24 * HOUR_MS, buckets: 84 } };
const GREEN = "#57F287";
const RED = "#ED4245";
export function defaultFivemSettings(guildId) {
    return { guildId, updateIntervalSeconds: 60, restartTimes: [], timeZone: "UTC", restartWarningMinutes: [15, 5, 1], revision: 0 };
}
export function emptyMonitorState() {
    return { failureStreak: 0, sentRestartWarnings: [] };
}
/** "2h 5m", "3d 4h". */
export function formatUptime(ms) {
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
/** Date and `HH:MM` for an instant in a time zone. */
export function localTime(at, timeZone) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(at)
        .map((part) => [part.type, part.value]));
    return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}
/** Player names for Discord, escaped and cut to the list limit. */
export function playerLines(status, limit = PLAYER_LIST_LIMIT) {
    if (status.players.length === 0)
        return status.playerCount > 0 ? "The player list is hidden on this server." : "Nobody is online.";
    const shown = status.players.slice(0, limit).map((player) => `\`${String(player.id).padStart(3, " ")}\` ${player.name.replace(/([*_`~|>\\])/g, "\\$1")}`);
    const more = status.players.length - shown.length;
    return `${shown.join("\n")}${more > 0 ? `\n…and ${more} more` : ""}`.slice(0, 4000);
}
/** Embed for the status message and `/fivem status`. */
export function statusEmbed(settings, status, onlineSince) {
    const title = status.hostname || "FiveM server";
    if (!status.online)
        return {
            title,
            description: `🔴 **Offline**\n${status.error ?? "The server is not answering."}`,
            color: RED,
            footer: "Last checked",
            timestamp: status.checkedAt,
        };
    return {
        title,
        description: `🟢 **Online** · ${status.playerCount}/${status.maxPlayers} players${onlineSince ? ` · up ${formatUptime(status.checkedAt.getTime() - onlineSince.getTime())}` : ""}`,
        color: GREEN,
        fields: [
            { name: `Players (${status.playerCount})`, value: playerLines(status).slice(0, 1024) },
            ...(settings.connectUrl ? [{ name: "Connect", value: settings.connectUrl, inline: true }] : []),
            ...(settings.restartTimes.length ? [{ name: "Restarts", value: `${settings.restartTimes.join(", ")} (${settings.timeZone})`, inline: true }] : []),
        ],
        footer: "Last checked",
        timestamp: status.checkedAt,
    };
}
/**
 * FiveM server monitoring shared by the bot and the API: live status,
 * the auto-updating status message, down/up alerts, restart warnings, and
 * player-count history. Permission checks happen before the service is called.
 */
export class FivemService {
    repository;
    query;
    gateway;
    now;
    lastPrune = 0;
    constructor(repository, query, gateway, now = () => new Date()) {
        this.repository = repository;
        this.query = query;
        this.gateway = gateway;
        this.now = now;
    }
    async config(guildId) {
        requireSnowflake("guildId", guildId);
        return (await this.repository.get(guildId)) ?? { settings: defaultFivemSettings(guildId), state: emptyMonitorState() };
    }
    async settings(guildId) {
        return (await this.config(guildId)).settings;
    }
    async saveSettings(input) {
        validateSettings(input);
        const before = await this.config(input.guildId);
        const saved = await this.repository.saveSettings({
            ...input,
            ...(input.serverAddress === undefined ? {} : { serverAddress: normalizeAddress(input.serverAddress) }),
            restartTimes: [...new Set(input.restartTimes)].sort(),
            restartWarningMinutes: [...new Set(input.restartWarningMinutes)].sort((left, right) => right - left),
        });
        const moved = before.settings.statusChannelId !== saved.statusChannelId;
        const newServer = before.settings.serverAddress !== saved.serverAddress;
        if (moved || newServer)
            await this.repository.saveState(input.guildId, {
                ...(moved ? { statusMessageId: undefined } : {}),
                ...(newServer ? { lastOnline: undefined, onlineSince: undefined, failureStreak: 0, lastPolledAt: undefined } : {}),
            });
        return saved;
    }
    /** Queries the configured server now. */
    async status(guildId) {
        const { settings } = await this.config(guildId);
        if (!settings.serverAddress)
            throw new FivemError("INVALID_STATE", "The FiveM server address is not set yet.");
        return this.query.query(settings.serverAddress);
    }
    /** Queries an address without saving it (the portal's test button). */
    async test(address) {
        return this.query.query(normalizeAddress(address));
    }
    /** Highest player count per time bucket for a chart, with uptime. */
    async history(guildId, range) {
        requireSnowflake("guildId", guildId);
        const { spanMs, buckets } = RANGES[range];
        const end = this.now().getTime();
        const start = end - spanMs;
        const size = spanMs / buckets;
        const snapshots = await this.repository.listSnapshots(guildId, new Date(start));
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
    /**
     * Runs due work for every monitored server: polls when the update interval
     * has passed, and posts restart warnings. Called by the bot's timer.
     */
    async tick() {
        const now = this.now();
        for (const config of await this.repository.listMonitored()) {
            const last = config.state.lastPolledAt?.getTime();
            if (last === undefined || now.getTime() - last >= config.settings.updateIntervalSeconds * 1000 - 1000)
                await this.refresh(config).catch(() => undefined);
            await this.restartWarnings(config).catch(() => undefined);
        }
        if (now.getTime() - this.lastPrune >= PRUNE_EVERY_MS) {
            this.lastPrune = now.getTime();
            await this.repository.pruneSnapshots(new Date(now.getTime() - SNAPSHOT_RETENTION_MS));
        }
    }
    /** Polls one server: records a snapshot, sends down/up alerts, and updates the status message. */
    async refresh(config) {
        const { settings, state } = config;
        if (!settings.serverAddress)
            return undefined;
        const status = await this.query.query(settings.serverAddress);
        const now = status.checkedAt;
        await this.repository.addSnapshot(settings.guildId, { online: status.online, players: status.playerCount, maxPlayers: status.maxPlayers, at: now });
        const next = { lastPolledAt: now };
        let confirmed = status.online;
        let onlineSince = state.onlineSince;
        if (status.online) {
            next.failureStreak = 0;
            if (state.lastOnline !== true) {
                onlineSince = now;
                next.onlineSince = now;
                next.lastOnline = true;
                if (state.lastOnline === false)
                    await this.alert(settings, "🟢 The FiveM server is back online.", status);
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
                if (state.lastOnline === true)
                    await this.alert(settings, "🔴 The FiveM server is down.", status);
            }
        }
        if (this.gateway && settings.statusChannelId && confirmed === status.online) {
            const messageId = await this.gateway
                .upsertStatusMessage(settings.statusChannelId, state.statusMessageId, statusEmbed(settings, status, onlineSince), settings.connectUrl)
                .catch(() => undefined);
            if (messageId && messageId !== state.statusMessageId)
                next.statusMessageId = messageId;
        }
        await this.repository.saveState(settings.guildId, next);
        return status;
    }
    /** Posts restart warnings that are due now. Returns the keys it sent. */
    async restartWarnings(config) {
        const { settings, state } = config;
        if (!this.gateway || !settings.alertChannelId || settings.restartTimes.length === 0)
            return [];
        const now = this.now().getTime();
        const sent = [];
        for (const minutes of settings.restartWarningMinutes) {
            const local = localTime(new Date(now + minutes * 60_000), settings.timeZone);
            if (!settings.restartTimes.includes(local.time))
                continue;
            const key = `${local.date} ${local.time}|${minutes}`;
            if (state.sentRestartWarnings.includes(key) || sent.includes(key))
                continue;
            const content = minutes === 0 ? "🔄 The server is restarting now." : `⚠️ Server restart in **${minutes} minute${minutes === 1 ? "" : "s"}** (${local.time} ${settings.timeZone}).`;
            await this.gateway.postAlert(settings.alertChannelId, content, { title: "Scheduled restart", description: minutes === 0 ? "Reconnect in a few minutes." : "Finish what you are doing and find a safe spot.", color: "#FEE75C" }, undefined);
            sent.push(key);
        }
        if (sent.length)
            await this.repository.saveState(settings.guildId, { sentRestartWarnings: [...sent, ...state.sentRestartWarnings].slice(0, 20) });
        return sent;
    }
    async alert(settings, content, status) {
        if (!this.gateway || !settings.alertChannelId)
            return;
        await this.gateway.postAlert(settings.alertChannelId, content, statusEmbed(settings, status), settings.alertRoleId).catch(() => undefined);
    }
}
//# sourceMappingURL=FivemService.js.map