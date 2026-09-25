import { randomInt } from "node:crypto";

/** Returns a uniform integer in `[0, max)`. */
export type RandomInt = (max: number) => number;

export const cryptoRandomInt: RandomInt = (max) => randomInt(0, max);

/**
 * Picks up to `count` different members, each weighted by their number of
 * entries, using a cryptographically secure random source.
 */
export function drawWinners(
  entries: readonly { readonly userId: string; readonly entries: number }[],
  count: number,
  random: RandomInt = cryptoRandomInt,
): string[] {
  const pool = entries.filter((entry) => entry.entries > 0).map((entry) => ({ userId: entry.userId, weight: entry.entries }));
  const winners: string[] = [];
  while (winners.length < count && pool.length > 0) {
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let ticket = random(total);
    const index = pool.findIndex((entry) => {
      ticket -= entry.weight;
      return ticket < 0;
    });
    const [winner] = pool.splice(index, 1);
    if (winner) winners.push(winner.userId);
  }
  return winners;
}

/** When a Discord account was created, from its snowflake ID. */
export function accountCreatedAt(userId: string): Date {
  return new Date(Number((BigInt(userId) >> 22n) + 1_420_070_400_000n));
}
