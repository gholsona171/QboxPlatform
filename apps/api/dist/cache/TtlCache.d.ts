/** Options for a bounded in-process cache. */
export interface TtlCacheOptions {
    /** How long an entry is served. */
    readonly ttlMs: number;
    /** Most entries kept; the oldest entry is dropped first. */
    readonly maxEntries: number;
    readonly now?: () => number;
}
/**
 * Small in-process cache with a time limit per entry and a size bound.
 *
 * `getOrLoad` shares one pending load between concurrent callers and stores
 * only successful results, so a failure is retried by the next caller. A
 * `delete` during a pending load wins: the load's result is not stored.
 */
export declare class TtlCache<K, V> {
    private readonly entries;
    private readonly pending;
    private readonly ttlMs;
    private readonly maxEntries;
    private readonly now;
    private generation;
    constructor(options: TtlCacheOptions);
    /** The cached value, or `undefined` when absent or expired. */
    get(key: K): V | undefined;
    has(key: K): boolean;
    /** Stores a value for the cache's time limit, or until `expiresAt` when that is sooner. */
    set(key: K, value: V, expiresAt?: number): void;
    /** Returns the cached value or loads, stores, and returns it. */
    getOrLoad(key: K, load: () => Promise<V>, expiresAt?: (value: V) => number | undefined): Promise<V>;
    delete(key: K): void;
    /** Drops every entry whose key or value matches. */
    deleteWhere(matches: (key: K, value: V | undefined) => boolean): void;
    clear(): void;
    get size(): number;
}
//# sourceMappingURL=TtlCache.d.ts.map