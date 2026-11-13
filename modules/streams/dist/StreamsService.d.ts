import { type MessageTemplates } from "@qbox/shared/messages";
import type { LiveCheck, StreamCreator, StreamPlatform, StreamPlatformClient, StreamsAvailability, StreamsGateway, StreamsRepository, StreamsSettings, StreamsSettingsInput, StreamsSubscription, StreamsSubscriptionInput, StreamsSubscriptionPatch, StreamsSubscriptionState } from "./types.js";
/** Creators per server. */
export declare const MAX_SUBSCRIPTIONS = 25;
/** Offline answers in a row before a live stream counts as ended. */
export declare const OFFLINE_POLLS_BEFORE_ENDED = 2;
/** Longest wait between checks after repeated failures. */
export declare const MAX_BACKOFF_MS: number;
/** Where the service reports check failures. */
export interface StreamsLog {
    warn(message: string, details: Readonly<Record<string, unknown>>): void;
}
export interface StreamsServiceOptions {
    readonly now?: (() => Date) | undefined;
    readonly templates?: MessageTemplates | undefined;
    readonly log?: StreamsLog | undefined;
}
export declare function defaultStreamsSettings(guildId: string): StreamsSettings;
export declare function emptySubscriptionState(): StreamsSubscriptionState;
/** Wait before the next check: the interval, doubled per failure, capped. */
export declare function checkWaitMs(settings: StreamsSettings, state: StreamsSubscriptionState): number;
/**
 * Go-live and new-video announcements: creators per server, the check loop
 * with per-creator backoff, and the live -> ended state machine. Permission
 * checks happen before the service is called.
 */
export declare class StreamsService {
    private readonly repository;
    private readonly gateway?;
    private readonly clients;
    private readonly now;
    private readonly templates;
    private readonly log;
    private readonly guildNames;
    constructor(repository: StreamsRepository, clients: readonly StreamPlatformClient[], gateway?: StreamsGateway | undefined, options?: StreamsServiceOptions);
    /** Which platforms this host can announce. */
    availability(): StreamsAvailability;
    settings(guildId: string): Promise<StreamsSettings>;
    saveSettings(input: StreamsSettingsInput): Promise<StreamsSettings>;
    list(guildId: string): Promise<readonly StreamsSubscription[]>;
    get(guildId: string, id: string): Promise<StreamsSubscription>;
    /** Looks a creator up on their platform without saving anything (the portal's "Check" button). */
    resolve(platform: StreamPlatform, handle: string): Promise<StreamCreator>;
    add(input: StreamsSubscriptionInput): Promise<StreamsSubscription>;
    update(guildId: string, id: string, patch: StreamsSubscriptionPatch): Promise<StreamsSubscription>;
    remove(guildId: string, id: string): Promise<void>;
    /** Posts the live announcement now, with the current stream or a sample. Leaves the state alone. */
    test(guildId: string, id: string): Promise<{
        readonly live: boolean;
        readonly messageId: string;
    }>;
    /**
     * Checks every creator whose interval (plus backoff) has passed, grouping
     * lookups per platform, and announces changes. Called by the bot's timer.
     * A failing creator never stops the others.
     */
    tick(): Promise<void>;
    /** Applies one live check to a subscription: announces, tracks offline polls, or records the failure. */
    applyCheck(settings: StreamsSettings, subscription: StreamsSubscription, check: LiveCheck, now: Date): Promise<void>;
    private checkVideos;
    private postLive;
    /** Edits or deletes the live announcement as the settings say. Errors (deleted message, missing channel) are ignored. */
    private endAnnouncement;
    private guildName;
    private client;
}
//# sourceMappingURL=StreamsService.d.ts.map