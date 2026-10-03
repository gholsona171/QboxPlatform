import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { AudioPlayerStatus, NoSubscriberBehavior, StreamType, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, } from "@discordjs/voice";
import { FFMPEG_MISSING, MusicError, USER_AGENT, extensionOf } from "@qbox/music";
const READY_TIMEOUT_MS = 10_000;
const RECONNECT_WINDOW_MS = 5_000;
const POSITION_INTERVAL_MS = 5_000;
/**
 * Voice playback with @discordjs/voice for one server. Audio goes through an
 * ffmpeg process (seek, any format, 48 kHz PCM) into the Opus encoder with
 * inline volume; `.opus` files at 100% volume from the start play directly.
 * The voice connection uses `voiceClient`, which is the second music bot
 * when MUSIC_BOT_TOKEN is set.
 */
export class DiscordVoiceEngine {
    voiceClient;
    guildId;
    events;
    ffmpegPath;
    connection;
    player;
    resource;
    process;
    stderr = "";
    seekOffset = 0;
    leaving = false;
    positionTimer;
    constructor(voiceClient, guildId, events, ffmpegPath) {
        this.voiceClient = voiceClient;
        this.guildId = guildId;
        this.events = events;
        this.ffmpegPath = ffmpegPath;
        this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
        this.player.on("stateChange", (oldState, newState) => {
            if (oldState.status !== AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Idle && "resource" in oldState && oldState.resource === this.resource)
                this.ended(oldState.resource);
        });
        this.player.on("error", (error) => {
            if (error.resource !== this.resource)
                return;
            this.resource = undefined;
            this.stopProcess();
            this.events.error(error.message);
        });
    }
    async join(channelId) {
        const guild = this.voiceClient.guilds.cache.get(this.guildId);
        if (!guild)
            throw new MusicError("INVALID_STATE", "The music bot is not in this server yet. Invite it with the link in the portal (Music).");
        if (this.connection && this.connection.state.status !== VoiceConnectionStatus.Destroyed && this.connection.joinConfig.channelId === channelId)
            return;
        this.leaving = false;
        const connection = joinVoiceChannel({ channelId, guildId: this.guildId, adapterCreator: guild.voiceAdapterCreator, selfDeaf: true, selfMute: false, group: this.voiceClient.user?.id ?? "default" });
        if (connection !== this.connection)
            this.watch(connection);
        this.connection = connection;
        connection.subscribe(this.player);
        try {
            await entersState(connection, VoiceConnectionStatus.Ready, READY_TIMEOUT_MS);
        }
        catch {
            this.leave();
            throw new MusicError("DEPENDENCY_UNAVAILABLE", "I could not connect to that voice channel. Check that I can see it, connect, and speak there.");
        }
    }
    leave() {
        this.leaving = true;
        this.stop();
        if (this.connection && this.connection.state.status !== VoiceConnectionStatus.Destroyed)
            this.connection.destroy();
        this.connection = undefined;
    }
    async play(source, options) {
        const input = source.filePath ?? source.url;
        if (!input)
            throw new MusicError("INVALID_INPUT", "That song has nothing to play.");
        this.stop();
        const direct = extensionOf(input.split("?")[0] ?? "") === "opus" && options.seekSeconds === 0 && options.volume === 100;
        let resource;
        if (direct && !this.ffmpegPath)
            resource = createAudioResource(await this.openDirect(source), { inputType: StreamType.OggOpus });
        else {
            if (!this.ffmpegPath)
                throw new MusicError("DEPENDENCY_UNAVAILABLE", FFMPEG_MISSING);
            resource = createAudioResource(this.transcode(input, source.url !== undefined && source.filePath === undefined, options.seekSeconds), { inputType: StreamType.Raw, inlineVolume: true });
            resource.volume?.setVolume(options.volume / 100);
        }
        this.seekOffset = options.seekSeconds;
        this.resource = resource;
        this.player.play(resource);
        this.startPositions();
    }
    pause() {
        this.player.pause(true);
    }
    resume() {
        this.player.unpause();
    }
    setVolume(volume) {
        this.resource?.volume?.setVolume(volume / 100);
    }
    stop() {
        this.resource = undefined;
        this.player.stop(true);
        this.stopProcess();
        if (this.positionTimer)
            clearInterval(this.positionTimer);
        this.positionTimer = undefined;
    }
    /** Reconnects within 5 seconds after a disconnect (moved or network blip), else gives up. */
    watch(connection) {
        connection.on(VoiceConnectionStatus.Disconnected, () => {
            void Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, RECONNECT_WINDOW_MS),
                entersState(connection, VoiceConnectionStatus.Connecting, RECONNECT_WINDOW_MS),
            ]).catch(() => {
                if (connection.state.status !== VoiceConnectionStatus.Destroyed)
                    connection.destroy();
            });
        });
        connection.on(VoiceConnectionStatus.Destroyed, () => {
            if (this.connection !== connection)
                return;
            this.connection = undefined;
            this.stop();
            if (!this.leaving)
                this.events.disconnected();
        });
    }
    transcode(input, remote, seekSeconds) {
        const args = [
            "-hide_banner", "-loglevel", "error", "-nostdin",
            ...(remote ? ["-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "5", "-user_agent", USER_AGENT] : []),
            ...(seekSeconds > 0 ? ["-ss", String(seekSeconds)] : []),
            "-i", input,
            "-vn", "-f", "s16le", "-ar", "48000", "-ac", "2", "pipe:1",
        ];
        const child = spawn(this.ffmpegPath, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
        this.stderr = "";
        child.stderr.on("data", (chunk) => {
            this.stderr = `${this.stderr}${chunk.toString("utf8")}`.slice(-500);
        });
        child.on("error", () => undefined);
        child.stdout.on("error", () => undefined);
        this.process = child;
        return child.stdout;
    }
    async openDirect(source) {
        if (source.filePath)
            return createReadStream(source.filePath);
        const response = await fetch(source.url, { headers: { "user-agent": USER_AGENT } }).catch(() => undefined);
        if (!response?.ok || !response.body)
            throw new MusicError("DEPENDENCY_UNAVAILABLE", "That link did not answer.");
        return Readable.fromWeb(response.body);
    }
    /** The player went idle: a finished song, or ffmpeg failing. */
    ended(resource) {
        const child = this.process;
        const decide = () => {
            if (this.resource !== resource)
                return;
            this.resource = undefined;
            if (this.positionTimer)
                clearInterval(this.positionTimer);
            this.positionTimer = undefined;
            const failed = child !== undefined && child.exitCode !== null && child.exitCode !== 0 && resource.playbackDuration < 1000;
            if (failed)
                this.events.error(this.stderr.trim().split("\n").pop() || "The song could not be played.");
            else
                this.events.finished();
        };
        if (child && child.exitCode === null && child.signalCode === null)
            child.once("close", decide);
        else
            decide();
    }
    stopProcess() {
        const child = this.process;
        this.process = undefined;
        if (child && child.exitCode === null)
            child.kill("SIGKILL");
    }
    startPositions() {
        if (this.positionTimer)
            clearInterval(this.positionTimer);
        this.positionTimer = setInterval(() => {
            const resource = this.resource;
            if (resource && this.player.state.status === AudioPlayerStatus.Playing)
                this.events.position(this.seekOffset + resource.playbackDuration / 1000);
        }, POSITION_INTERVAL_MS);
        this.positionTimer.unref?.();
    }
}
//# sourceMappingURL=DiscordVoiceEngine.js.map