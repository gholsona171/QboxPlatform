/**
 * Small in-process cache with a time limit per entry and a size bound.
 *
 * `getOrLoad` shares one pending load between concurrent callers and stores
 * only successful results, so a failure is retried by the next caller. A
 * `delete` during a pending load wins: the load's result is not stored.
 */
export class TtlCache {
    entries = new Map();
    pending = new Map();
    ttlMs;
    maxEntries;
    now;
    generation = 0;
    constructor(options) {
        if (!(options.ttlMs > 0) || !Number.isInteger(options.maxEntries) || options.maxEntries < 1)
            throw new RangeError("Cache limits must be positive.");
        this.ttlMs = options.ttlMs;
        this.maxEntries = options.maxEntries;
        this.now = options.now ?? Date.now;
    }
    /** The cached value, or `undefined` when absent or expired. */
    get(key) {
        const entry = this.entries.get(key);
        if (entry === undefined)
            return undefined;
        if (entry.expiresAt <= this.now()) {
            this.entries.delete(key);
            return undefined;
        }
        return entry.value;
    }
    has(key) {
        return this.get(key) !== undefined;
    }
    /** Stores a value for the cache's time limit, or until `expiresAt` when that is sooner. */
    set(key, value, expiresAt) {
        const limit = this.now() + this.ttlMs;
        const until = expiresAt === undefined ? limit : Math.min(limit, expiresAt);
        this.pending.delete(key);
        this.entries.delete(key);
        if (until <= this.now())
            return;
        this.entries.set(key, { value, expiresAt: until });
        while (this.entries.size > this.maxEntries) {
            const oldest = this.entries.keys().next();
            if (oldest.done)
                break;
            this.entries.delete(oldest.value);
        }
    }
    /** Returns the cached value or loads, stores, and returns it. */
    async getOrLoad(key, load, expiresAt) {
        const cached = this.get(key);
        if (cached !== undefined)
            return cached;
        const inFlight = this.pending.get(key);
        if (inFlight !== undefined)
            return inFlight.promise;
        const generation = this.generation;
        const promise = load().then((value) => {
            if (this.pending.get(key)?.promise === promise && this.generation === generation)
                this.set(key, value, expiresAt?.(value));
            return value;
        }).finally(() => {
            if (this.pending.get(key)?.promise === promise)
                this.pending.delete(key);
        });
        this.pending.set(key, { promise, generation });
        return promise;
    }
    delete(key) {
        this.entries.delete(key);
        this.pending.delete(key);
    }
    /** Drops every entry whose key or value matches. */
    deleteWhere(matches) {
        for (const [key, entry] of this.entries)
            if (matches(key, entry.value))
                this.entries.delete(key);
        for (const key of this.pending.keys())
            if (matches(key, undefined))
                this.pending.delete(key);
    }
    clear() {
        this.entries.clear();
        this.pending.clear();
        this.generation += 1;
    }
    get size() {
        return this.entries.size;
    }
}
//# sourceMappingURL=TtlCache.js.map