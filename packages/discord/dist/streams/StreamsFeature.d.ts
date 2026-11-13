import { type StreamPlatformCredentials, type StreamsRepository } from "@qbox/streams";
import type { MessageTemplates } from "@qbox/shared/messages";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
export interface StreamsFeatureOptions {
    readonly credentials: StreamPlatformCredentials;
    readonly templates?: MessageTemplates | undefined;
}
/** Stream announcements: `/streams` and a timer that checks followed creators. */
export declare function streamsFeature(repository: StreamsRepository, options: StreamsFeatureOptions): DiscordFeatureFactory;
//# sourceMappingURL=StreamsFeature.d.ts.map