import { type RandomInt } from "./draw.js";
import type { Giveaway, GiveawayActor, GiveawayDetail, GiveawayEntrant, GiveawayGateway, GiveawayRepository, GiveawayStartInput, GiveawaySummary } from "./types.js";
import { type MessageTemplates } from "@qbox/shared/messages";
export interface GiveawayServiceOptions {
    /** Delay before the entry count on the message is refreshed. 0 refreshes right away. */
    readonly refreshDelayMs?: number | undefined;
    readonly random?: RandomInt | undefined;
    readonly templates?: MessageTemplates | undefined;
}
export interface EntryResult {
    /** True when the member is now entered, false when they left. */
    readonly entered: boolean;
    readonly entries: number;
}
/** "active" is running or paused; "ended" is ended or cancelled. */
export type GiveawayListState = "active" | "ended";
/**
 * Giveaway rules shared by the bot and the API. The caller checks
 * `giveaways.manage` before staff actions; any member can enter.
 * Giveaways are referred to by ID or by number.
 */
export declare class GiveawayService {
    private readonly repository;
    private readonly gateway?;
    private readonly now;
    private readonly pending;
    private readonly refreshDelayMs;
    private readonly random;
    private readonly templates;
    constructor(repository: GiveawayRepository, gateway?: GiveawayGateway | undefined, now?: () => Date, options?: GiveawayServiceOptions);
    start(input: GiveawayStartInput, actor: GiveawayActor): Promise<Giveaway>;
    list(guildId: string, state?: GiveawayListState, limit?: number): Promise<readonly GiveawaySummary[]>;
    /** Finds a giveaway by ID or by number (`7` or `#7`). */
    get(guildId: string, ref: string): Promise<Giveaway>;
    detail(guildId: string, ref: string): Promise<GiveawayDetail>;
    /** Enter button: joins the giveaway, or leaves it when already entered. */
    toggleEntry(guildId: string, ref: string, entrant: GiveawayEntrant): Promise<EntryResult>;
    /** Ends a running or paused giveaway now and draws winners. */
    end(guildId: string, ref: string, actor: GiveawayActor): Promise<Giveaway>;
    /** Draws new winners for an ended giveaway, skipping the current winners. */
    reroll(guildId: string, ref: string, count?: number): Promise<Giveaway>;
    cancel(guildId: string, ref: string, actor: GiveawayActor): Promise<Giveaway>;
    /** Stops entries and the timer until resumed. */
    pause(guildId: string, ref: string): Promise<Giveaway>;
    /** Resumes entries and pushes the end time back by the time spent paused. */
    resume(guildId: string, ref: string): Promise<Giveaway>;
    /** Ends running giveaways whose time is up. Returns how many ended. */
    sweepDue(): Promise<number>;
    private checkRequirements;
    private finish;
    private announce;
    /** The giveaway post (`giveaways.started`) while it runs; other states keep the built-in message. */
    private runningMessage;
    private values;
    private scheduleRefresh;
    private cancelRefresh;
    private refreshById;
    /** Updates the giveaway post and returns the entry count. */
    private refreshMessage;
    private bonus;
    private endTime;
    private requireGateway;
}
//# sourceMappingURL=GiveawayService.d.ts.map