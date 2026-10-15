import type { Poll, PollMessage, PollTally } from "./types.js";
/** Text bar like `██████░░░░░░ 50% (5)`. Percent is of voters. */
export declare function resultBar(count: number, voters: number): string;
/** True when vote counts may be shown to members. */
export declare function resultsVisible(poll: Poll): boolean;
/** Option IDs with the most votes (several on a tie, none without votes). */
export declare function leadingOptions(poll: Poll, tally: PollTally): readonly string[];
export declare function optionText(poll: Poll, optionId: string): string;
/** The poll message members vote on. Closed polls show final results and no controls. */
export declare function pollMessage(poll: Poll, tally: PollTally): PollMessage;
/** Final results posted in the channel when a poll closes. */
export declare function resultsMessage(poll: Poll, tally: PollTally): PollMessage;
//# sourceMappingURL=render.d.ts.map