const DEFAULT_TTL_MS = 15 * 60_000;
const MAX_ENTRIES = 20_000;
/**
 * Remembers which server an interaction came from, by interaction id and by
 * token, so REST calls that only carry those (`/interactions/:id/:token/callback`,
 * `/webhooks/:appId/:token/...`) can be themed. Entries expire after 15 minutes,
 * the lifetime of an interaction token.
 */
export class InteractionGuildMap {
    now;
    ttlMs;
    ids = new Map();
    tokens = new Map();
    constructor(now = Date.now, ttlMs = DEFAULT_TTL_MS) {
        this.now = now;
        this.ttlMs = ttlMs;
    }
    remember(interactionId, token, guildId) {
        if (!guildId)
            return;
        const entry = { guildId, expiresAt: this.now() + this.ttlMs };
        this.store(this.ids, interactionId, entry);
        this.store(this.tokens, token, entry);
    }
    byId(interactionId) {
        return this.read(this.ids, interactionId);
    }
    byToken(token) {
        return this.read(this.tokens, token);
    }
    get size() {
        return this.ids.size;
    }
    store(map, key, entry) {
        if (map.size >= MAX_ENTRIES)
            this.sweep(map);
        map.set(key, entry);
    }
    read(map, key) {
        const entry = map.get(key);
        if (!entry)
            return undefined;
        if (entry.expiresAt <= this.now()) {
            map.delete(key);
            return undefined;
        }
        return entry.guildId;
    }
    sweep(map) {
        const now = this.now();
        for (const [key, entry] of map)
            if (entry.expiresAt <= now)
                map.delete(key);
        while (map.size >= MAX_ENTRIES) {
            const oldest = map.keys().next().value;
            if (oldest === undefined)
                break;
            map.delete(oldest);
        }
    }
}
//# sourceMappingURL=InteractionGuildMap.js.map