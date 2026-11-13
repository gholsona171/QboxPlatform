/** Returns a uniform integer in `[0, max)`. */
export type RandomInt = (max: number) => number;
export declare const cryptoRandomInt: RandomInt;
/**
 * Picks up to `count` different members, each weighted by their number of
 * entries, using a cryptographically secure random source.
 */
export declare function drawWinners(entries: readonly {
    readonly userId: string;
    readonly entries: number;
}[], count: number, random?: RandomInt): string[];
/** When a Discord account was created, from its snowflake ID. */
export declare function accountCreatedAt(userId: string): Date;
//# sourceMappingURL=draw.d.ts.map