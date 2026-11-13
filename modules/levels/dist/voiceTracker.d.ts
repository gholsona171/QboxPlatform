import type { VoiceMinutes } from "./types.js";
/** One member in a voice channel, as seen by the bot. */
export interface VoiceParticipant {
    readonly userId: string;
    readonly displayName: string;
    readonly roleIds: readonly string[];
    readonly bot: boolean;
    /** Self or server muted. */
    readonly muted: boolean;
    /** Self or server deafened. */
    readonly deafened: boolean;
}
/**
 * Members who earn voice XP: people in a channel with at least one other
 * person (bots don't count), who are not muted or deafened.
 */
export declare function eligibleVoiceMembers(participants: readonly VoiceParticipant[]): readonly VoiceParticipant[];
/**
 * Tracks eligible voice time per member from voice state updates. Call
 * `syncChannel` whenever someone joins, leaves, or changes state in a
 * channel, and `flush` periodically to collect whole minutes.
 */
export declare class VoiceTracker {
    private readonly sessions;
    /** Replaces what is known about one channel with its current participants. */
    syncChannel(guildId: string, channelId: string, participants: readonly VoiceParticipant[], now: number): void;
    /** Returns whole minutes earned since the last flush and keeps the remainder. */
    flush(now: number): readonly VoiceMinutes[];
    /** Number of members being tracked. */
    get size(): number;
    private stop;
}
//# sourceMappingURL=voiceTracker.d.ts.map