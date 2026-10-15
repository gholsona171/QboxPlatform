import { type OutgoingMessage, type TemplateValues } from "@qbox/shared/messages";
import type { LiveStream, StreamPlatform, StreamVideo, StreamsSubscription } from "./types.js";
/** Embed colors per platform. */
export declare const PLATFORM_COLORS: Readonly<Record<StreamPlatform, string>>;
/** The creator's channel page. */
export declare function creatorUrl(platform: StreamPlatform, handle: string, platformId: string): string;
/** "2h 5m", "45m". */
export declare function formatDuration(ms: number): string;
/** Adds a timestamp query so Discord fetches a fresh preview image. */
export declare function cacheBusted(url: string, now: Date): string;
export declare function liveValues(subscription: StreamsSubscription, stream: LiveStream, server: string | undefined): TemplateValues;
/** Default "is live" announcement: platform-colored embed with the stream details. */
export declare function liveMessage(subscription: StreamsSubscription, stream: LiveStream, values: TemplateValues, now: Date): OutgoingMessage;
export declare function endedValues(subscription: StreamsSubscription, durationMs: number, url: string): TemplateValues;
/** What the live announcement becomes when the stream ends (edit behavior). */
export declare function endedMessage(subscription: StreamsSubscription, values: TemplateValues): OutgoingMessage;
export declare function videoValues(subscription: StreamsSubscription, video: StreamVideo): TemplateValues;
/** Default "new video" announcement. */
export declare function videoMessage(subscription: StreamsSubscription, video: StreamVideo): OutgoingMessage;
/** Stream used by the portal's "Test" button when the creator is offline. */
export declare function sampleStream(subscription: StreamsSubscription, now: Date): LiveStream;
//# sourceMappingURL=announcements.d.ts.map