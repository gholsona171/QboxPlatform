import type { OutgoingMessage, TemplateValues } from "@qbox/shared/messages";
import type { MusicQueueEntry, MusicSourceKind, MusicStateSnapshot } from "./types.js";
export declare const MUSIC_CUSTOM_ID = "qbox:music:";
export declare const MUSIC_COLOR = 1947988;
/** File name of the cover attached to the now-playing message. */
export declare const COVER_ATTACHMENT = "cover";
/** Panel buttons in two rows, as `qbox:music:<action>` custom IDs. */
export declare const PANEL_BUTTONS: readonly [readonly [readonly ["previous", "⏮"], readonly ["rewind", "⏪"], readonly ["toggle", "⏯"], readonly ["forward", "⏩"], readonly ["skip", "⏭"]], readonly [readonly ["stop", "⏹"], readonly ["loop", "🔁"], readonly ["shuffle", "🔀"], readonly ["voldown", "🔉"], readonly ["volup", "🔊"]]];
export type PanelButton = (typeof PANEL_BUTTONS)[number][number][0];
export declare function sourceLabel(source: MusicSourceKind): string;
/** `▬▬▬🔘▬▬▬ 1:23 / 3:45`, or a live marker for streams. */
export declare function progressBar(positionSeconds: number, durationSeconds: number | null, width?: number): string;
/** Placeholders for the `music.now-playing` message. */
export declare function nowPlayingValues(snapshot: MusicStateSnapshot, entry: MusicQueueEntry, server: string | undefined): TemplateValues;
/**
 * The default now-playing message: title, artist, source, progress, who asked,
 * what is next, volume, loop and shuffle. `thumbnailUrl` is the cover.
 */
export declare function nowPlayingMessage(snapshot: MusicStateSnapshot, entry: MusicQueueEntry, thumbnailUrl: string | undefined): OutgoingMessage;
/** The panel's two button rows as Discord component JSON. Seek buttons are disabled for live streams. */
export declare function panelComponents(live: boolean): readonly unknown[];
//# sourceMappingURL=announcements.d.ts.map