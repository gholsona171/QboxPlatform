import type { Client } from "discord.js";
import { type AudioEngine, type AudioEngineEvents, type AudioPlayOptions, type PlayableSource } from "@qbox/music";
/**
 * Voice playback with @discordjs/voice for one server. Audio goes through an
 * ffmpeg process (seek, any format, 48 kHz PCM) into the Opus encoder with
 * inline volume; `.opus` files at 100% volume from the start play directly.
 * The voice connection uses `voiceClient`, which is the second music bot
 * when MUSIC_BOT_TOKEN is set.
 */
export declare class DiscordVoiceEngine implements AudioEngine {
    private readonly voiceClient;
    private readonly guildId;
    private readonly events;
    private readonly ffmpegPath;
    private connection;
    private readonly player;
    private resource;
    private process;
    private stderr;
    private seekOffset;
    private leaving;
    private positionTimer;
    constructor(voiceClient: Client, guildId: string, events: AudioEngineEvents, ffmpegPath: string | undefined);
    join(channelId: string): Promise<void>;
    leave(): void;
    play(source: PlayableSource, options: AudioPlayOptions): Promise<void>;
    pause(): void;
    resume(): void;
    setVolume(volume: number): void;
    stop(): void;
    /** Reconnects within 5 seconds after a disconnect (moved or network blip), else gives up. */
    private watch;
    private transcode;
    private openDirect;
    /** The player went idle: a finished song, or ffmpeg failing. */
    private ended;
    private stopProcess;
    private startPositions;
}
//# sourceMappingURL=DiscordVoiceEngine.d.ts.map