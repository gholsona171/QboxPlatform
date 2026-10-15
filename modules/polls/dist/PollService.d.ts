import type { Poll, PollActor, PollCreateInput, PollGateway, PollRepository, PollResults, PollStatus, PollSummary, PollVote, PollVoter } from "./types.js";
export interface PollServiceOptions {
    /** Delay before the poll message is refreshed after votes. 0 refreshes right away. */
    readonly refreshDelayMs?: number | undefined;
}
export interface PollExport {
    readonly fileName: string;
    readonly content: string;
}
/**
 * Poll rules shared by the bot and the API.
 *
 * The caller checks `polls.create` before `create` and sets `canManage` from
 * `polls.manage`. Creators can close and reopen their own polls; deleting and
 * exporting need `polls.manage`. Polls are referred to by ID or by number.
 */
export declare class PollService {
    private readonly repository;
    private readonly gateway?;
    private readonly now;
    private readonly pending;
    private readonly refreshDelayMs;
    constructor(repository: PollRepository, gateway?: PollGateway | undefined, now?: () => Date, options?: PollServiceOptions);
    create(input: PollCreateInput, actor: PollActor): Promise<Poll>;
    list(guildId: string, status?: PollStatus, limit?: number): Promise<readonly PollSummary[]>;
    /** Finds a poll by ID or by number (`7` or `#7`). */
    get(guildId: string, ref: string): Promise<Poll>;
    /**
     * Counts and, for public polls, who voted for what. Only the creator and
     * members with `polls.manage` see counts of open polls that hide results.
     */
    results(guildId: string, ref: string, viewer: Pick<PollActor, "userId" | "canManage">): Promise<PollResults>;
    /** Records a member's choice, replacing their earlier vote when changes are allowed. */
    vote(guildId: string, ref: string, voter: PollVoter, optionIds: readonly string[]): Promise<PollVote>;
    removeVote(guildId: string, ref: string, userId: string): Promise<void>;
    /** Closes a poll, shows final results on its message, and posts them in the channel. */
    close(guildId: string, ref: string, actor: PollActor): Promise<Poll>;
    /** Reopens a closed poll. A past end time is cleared unless a new one is given. */
    reopen(guildId: string, ref: string, actor: PollActor, endsAt?: Date, durationMinutes?: number): Promise<Poll>;
    delete(guildId: string, ref: string, actor: PollActor): Promise<void>;
    /** CSV with totals and, for public polls, one row per voter. */
    exportCsv(guildId: string, ref: string, actor: PollActor): Promise<PollExport>;
    /** Closes open polls whose end time has passed. Returns how many closed. */
    sweepEnded(): Promise<number>;
    private finish;
    private scheduleRefresh;
    private cancelRefresh;
    private refreshById;
    private refreshMessage;
    private options;
    private endTime;
    private requireOpen;
    private requireOwnerOrManager;
    private requireGateway;
}
//# sourceMappingURL=PollService.d.ts.map