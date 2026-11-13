import { type FivemRepository, type FivemTickResult } from "@qbox/fivem";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
/**
 * Chooses the bot's presence line. Only when exactly one FiveM server is
 * monitored across every Discord server the bot is in ("Watching 12/64 on
 * Cloud Nine RP"); with none or several it shows nothing, since one line
 * cannot speak for several servers.
 */
export declare class FivemPresence {
    private readonly now;
    private readonly latest;
    private shown;
    constructor(now?: () => number);
    /** Records results and returns the text to show (`""` clears it), or undefined when nothing changes. */
    update(results: readonly FivemTickResult[]): string | undefined;
}
/**
 * FiveM server: `/fivem`, the auto-updating status message with the player
 * graph, restart / down / back-online posts, player-count snapshots, and the
 * bot's presence.
 */
export declare function fivemFeature(repository: FivemRepository): DiscordFeatureFactory;
//# sourceMappingURL=FivemFeature.d.ts.map