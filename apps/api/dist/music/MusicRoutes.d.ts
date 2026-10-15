import { type MusicControl, type MusicService } from "@qbox/music";
import type { ApiFeature } from "../features/ApiFeature.js";
/** Host facts the overview reports. */
export interface MusicHostInfo {
    /** ffmpeg is installed where the API runs (the same host as the bot). */
    readonly ffmpeg: boolean;
    /** Set when MUSIC_BOT_TOKEN is configured. */
    readonly secondBot?: {
        readonly inviteUrl?: string | undefined;
        inGuild(guildId: string): Promise<boolean>;
    } | undefined;
}
/** Music as a pluggable API feature under `/api/v1/music`. Playback goes to the bot through `control`. */
export declare function musicApiFeature(music: MusicService, control: MusicControl, host: MusicHostInfo): ApiFeature;
//# sourceMappingURL=MusicRoutes.d.ts.map