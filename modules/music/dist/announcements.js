import { formatTime } from "./validation.js";
export const MUSIC_CUSTOM_ID = "qbox:music:";
export const MUSIC_COLOR = 0x1db954;
/** File name of the cover attached to the now-playing message. */
export const COVER_ATTACHMENT = "cover";
/** Panel buttons in two rows, as `qbox:music:<action>` custom IDs. */
export const PANEL_BUTTONS = [
    [["previous", "⏮"], ["rewind", "⏪"], ["toggle", "⏯"], ["forward", "⏩"], ["skip", "⏭"]],
    [["stop", "⏹"], ["loop", "🔁"], ["shuffle", "🔀"], ["voldown", "🔉"], ["volup", "🔊"]],
];
const SOURCE_LABELS = { library: "Library", link: "Link", radio: "Radio", jamendo: "Jamendo" };
export function sourceLabel(source) {
    return SOURCE_LABELS[source];
}
/** `▬▬▬🔘▬▬▬ 1:23 / 3:45`, or a live marker for streams. */
export function progressBar(positionSeconds, durationSeconds, width = 14) {
    if (durationSeconds === null || durationSeconds <= 0)
        return `🔴 LIVE ${formatTime(positionSeconds)}`;
    const ratio = Math.min(1, Math.max(0, positionSeconds / durationSeconds));
    const at = Math.min(width - 1, Math.floor(ratio * width));
    return `${"▬".repeat(at)}🔘${"▬".repeat(width - 1 - at)} ${formatTime(positionSeconds)} / ${formatTime(durationSeconds)}`;
}
function loopLabel(snapshot) {
    return snapshot.loop === "off" ? "Off" : snapshot.loop === "track" ? "This song" : "Queue";
}
/** Placeholders for the `music.now-playing` message. */
export function nowPlayingValues(snapshot, entry, server) {
    const next = snapshot.queue[snapshot.index + 1];
    return {
        title: entry.title,
        artist: entry.artist ?? "",
        album: entry.album ?? "",
        source: sourceLabel(entry.source),
        duration: entry.durationSeconds === null ? "Live" : formatTime(entry.durationSeconds),
        progress: progressBar(snapshot.positionSeconds, entry.durationSeconds),
        requester: entry.requestedBy ? `<@${entry.requestedBy}>` : "",
        upNext: next ? next.title : "",
        volume: `${snapshot.volume}%`,
        loop: loopLabel(snapshot),
        shuffle: snapshot.shuffle ? "On" : "Off",
        server: server ?? "",
    };
}
/**
 * The default now-playing message: title, artist, source, progress, who asked,
 * what is next, volume, loop and shuffle. `thumbnailUrl` is the cover.
 */
export function nowPlayingMessage(snapshot, entry, thumbnailUrl) {
    const next = snapshot.queue[snapshot.index + 1];
    const state = snapshot.state === "paused" ? "⏸ Paused" : snapshot.state === "buffering" ? "⏳ Loading" : "▶ Now playing";
    const fields = [
        { name: "Requested by", value: entry.requestedBy ? `<@${entry.requestedBy}>` : "Auto", inline: true },
        { name: "Volume", value: `${snapshot.volume}%`, inline: true },
        { name: "Loop / Shuffle", value: `${loopLabel(snapshot)} / ${snapshot.shuffle ? "On" : "Off"}`, inline: true },
        { name: "Up next", value: next ? next.title.slice(0, 200) : "Nothing", inline: false },
    ];
    const credit = [entry.artist, entry.album].filter(Boolean).join(" · ");
    return {
        embeds: [{
                author: { name: `${state} · ${sourceLabel(entry.source)}` },
                title: entry.title.slice(0, 256),
                description: `${credit ? `${credit}\n` : ""}${progressBar(snapshot.positionSeconds, entry.durationSeconds)}`,
                color: MUSIC_COLOR,
                fields,
                ...(thumbnailUrl ? { thumbnail: { url: thumbnailUrl } } : {}),
            }],
    };
}
/** The panel's two button rows as Discord component JSON. Seek buttons are disabled for live streams. */
export function panelComponents(live) {
    return PANEL_BUTTONS.map((row) => ({
        type: 1,
        components: row.map(([action, emoji]) => ({
            type: 2,
            style: action === "stop" ? 4 : action === "toggle" ? 1 : 2,
            custom_id: `${MUSIC_CUSTOM_ID}${action}`,
            emoji: { name: emoji },
            disabled: live && (action === "rewind" || action === "forward"),
        })),
    }));
}
//# sourceMappingURL=announcements.js.map