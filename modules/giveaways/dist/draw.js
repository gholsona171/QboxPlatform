import { randomInt } from "node:crypto";
export const cryptoRandomInt = (max) => randomInt(0, max);
/**
 * Picks up to `count` different members, each weighted by their number of
 * entries, using a cryptographically secure random source.
 */
export function drawWinners(entries, count, random = cryptoRandomInt) {
    const pool = entries.filter((entry) => entry.entries > 0).map((entry) => ({ userId: entry.userId, weight: entry.entries }));
    const winners = [];
    while (winners.length < count && pool.length > 0) {
        const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
        let ticket = random(total);
        const index = pool.findIndex((entry) => {
            ticket -= entry.weight;
            return ticket < 0;
        });
        const [winner] = pool.splice(index, 1);
        if (winner)
            winners.push(winner.userId);
    }
    return winners;
}
/** When a Discord account was created, from its snowflake ID. */
export function accountCreatedAt(userId) {
    return new Date(Number((BigInt(userId) >> 22n) + 1420070400000n));
}
//# sourceMappingURL=draw.js.map