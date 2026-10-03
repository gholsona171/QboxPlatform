import { type MusicRepository } from "@qbox/music";
import type { MessageTemplates } from "@qbox/shared/messages";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
export interface MusicFeatureOptions {
    /** The main bot token; also keys the control server's request signatures. */
    readonly discordToken: string;
    /** Optional second bot that joins voice instead of the main bot. */
    readonly musicBotToken?: string | undefined;
    readonly controlPort: number;
    readonly storageDir: string;
    readonly quotaBytes: number;
    /** FFMPEG_PATH override; otherwise ffmpeg is looked up on PATH. */
    readonly ffmpegPath?: string | undefined;
    readonly jamendoClientId?: string | undefined;
    readonly templates?: MessageTemplates | undefined;
}
/**
 * Music in voice: `/music`, the now-playing panel buttons, a 15-second timer
 * (positions, panel, auto-leave, 24/7), resuming after restarts, and the local
 * control server the portal uses. With MUSIC_BOT_TOKEN, a second client
 * (Guilds + GuildVoiceStates only) joins voice; commands stay on the main bot.
 */
export declare function musicFeature(repository: MusicRepository, options: MusicFeatureOptions): DiscordFeatureFactory;
//# sourceMappingURL=MusicFeature.d.ts.map