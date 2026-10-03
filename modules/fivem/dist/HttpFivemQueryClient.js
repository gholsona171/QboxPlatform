const DEFAULT_TIMEOUT_MS = 5_000;
const MAX_PLAYERS_KEPT = 1024;
/** Removes FiveM color codes (`^1`) and trims. */
export function cleanHostname(value) {
    return value.replace(/\^\d/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
}
/**
 * Queries a FiveM server's `info.json`, `players.json`, and `dynamic.json`
 * with a timeout. Never throws: an unreachable server is reported offline.
 */
export class HttpFivemQueryClient {
    fetchImpl;
    timeoutMs;
    now;
    constructor(fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS, now = () => new Date()) {
        this.fetchImpl = fetchImpl;
        this.timeoutMs = timeoutMs;
        this.now = now;
    }
    async query(address) {
        const [info, players, dynamic] = await Promise.allSettled([
            this.json(address, "info.json"),
            this.json(address, "players.json"),
            this.json(address, "dynamic.json"),
        ]);
        const checkedAt = this.now();
        if (info.status === "rejected" && dynamic.status === "rejected")
            return { online: false, players: [], playerCount: 0, maxPlayers: 0, error: reason(dynamic.reason), checkedAt };
        const infoData = info.status === "fulfilled" ? info.value : undefined;
        const dynamicData = dynamic.status === "fulfilled" ? dynamic.value : undefined;
        const list = players.status === "fulfilled" && Array.isArray(players.value)
            ? players.value.slice(0, MAX_PLAYERS_KEPT).map((player, index) => ({ id: typeof player.id === "number" ? player.id : index + 1, name: cleanHostname(String(player.name ?? "Unknown")) || "Unknown", ping: typeof player.ping === "number" ? player.ping : 0 }))
            : [];
        list.sort((left, right) => left.id - right.id);
        const maxPlayers = Number(dynamicData?.sv_maxclients ?? infoData?.vars?.sv_maxClients ?? 0);
        const hostname = dynamicData?.hostname ?? infoData?.vars?.sv_projectName ?? infoData?.vars?.sv_hostname;
        return {
            online: true,
            ...(hostname ? { hostname: cleanHostname(hostname) } : {}),
            players: list,
            playerCount: players.status === "fulfilled" ? list.length : Number(dynamicData?.clients ?? 0),
            maxPlayers: Number.isFinite(maxPlayers) ? maxPlayers : 0,
            ...(dynamicData?.gametype ? { gametype: dynamicData.gametype.slice(0, 100) } : {}),
            ...(dynamicData?.mapname ? { mapname: dynamicData.mapname.slice(0, 100) } : {}),
            ...(infoData?.server ? { version: infoData.server.slice(0, 100) } : {}),
            checkedAt,
        };
    }
    async json(address, path) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await this.fetchImpl(`http://${address}/${path}`, { signal: controller.signal, headers: { accept: "application/json" } });
            if (!response.ok)
                throw new Error(`The server answered with status ${response.status}.`);
            return (await response.json());
        }
        finally {
            clearTimeout(timer);
        }
    }
}
function reason(error) {
    if (error instanceof Error && error.name === "AbortError")
        return "The server did not answer in time.";
    if (error instanceof Error && error.message.startsWith("The server answered"))
        return error.message;
    return "The server could not be reached.";
}
//# sourceMappingURL=HttpFivemQueryClient.js.map