import type { Giveaway, GiveawayMessage } from "./types.js";
/** Plain-language requirement lines, empty when anyone can enter. */
export declare function requirementLines(giveaway: Giveaway): string[];
/** The giveaway message with the Enter button while it runs. */
export declare function giveawayMessage(giveaway: Giveaway, entrantCount: number): GiveawayMessage;
/** Channel announcement of the winners. */
export declare function winnersMessage(giveaway: Giveaway, winnerIds: readonly string[], reroll: boolean): GiveawayMessage;
/** DM sent to each winner when `dmWinners` is on. */
export declare function winnerDirectMessage(giveaway: Giveaway): GiveawayMessage;
//# sourceMappingURL=render.d.ts.map