import { ActivityType } from "discord.js";
import { CHECK_INTERVAL_MS, DiscordRestFivemGateway, FivemService, HttpFivemQueryClient, presenceText } from "@qbox/fivem";
import { logger } from "@qbox/logger";
import { FivemCommand } from "../commands/Fivem.command.js";
/** Results older than this no longer count toward the presence (a server removed or unmonitored). */
const RESULT_STALE_MS = 5 * 60_000;
/**
 * Chooses the bot's presence line. Only when exactly one FiveM server is
 * monitored across every Discord server the bot is in ("Watching 12/64 on
 * Cloud Nine RP"); with none or several it shows nothing, since one line
 * cannot speak for several servers.
 */
export class FivemPresence {
    now;
    latest = new Map();
    shown;
    constructor(now = Date.now) {
        this.now = now;
    }
    /** Records results and returns the text to show (`""` clears it), or undefined when nothing changes. */
    update(results) {
        const now = this.now();
        for (const result of results)
            this.latest.set(result.guildId, { result, at: now });
        for (const [guildId, entry] of this.latest)
            if (now - entry.at > RESULT_STALE_MS)
                this.latest.delete(guildId);
        const only = this.latest.size === 1 ? [...this.latest.values()][0]?.result : undefined;
        const text = only ? presenceText(only).slice(0, 128) : "";
        if (text === (this.shown ?? ""))
            return undefined;
        this.shown = text;
        return text;
    }
}
function applyPresence(client, text) {
    client.user?.setPresence({ activities: text ? [{ name: text, type: ActivityType.Watching }] : [] });
}
/**
 * FiveM server: `/fivem`, the auto-updating status message with the player
 * graph, restart / down / back-online posts, player-count snapshots, and the
 * bot's presence.
 */
export function fivemFeature(repository) {
    return ({ client }) => {
        const fivem = new FivemService(repository, new HttpFivemQueryClient(), new DiscordRestFivemGateway(client.rest), () => new Date(), logger);
        const presence = new FivemPresence();
        let timer;
        let running = false;
        const tick = async () => {
            if (running)
                return;
            running = true;
            try {
                const text = presence.update(await fivem.tick());
                if (text !== undefined)
                    applyPresence(client, text);
            }
            catch (error) {
                logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation: "fivem-tick" }, "FiveM status update failed.");
            }
            finally {
                running = false;
            }
        };
        return {
            name: "fivem-server",
            commands: () => [new FivemCommand(fivem)],
            attach: () => {
                timer = setInterval(() => void tick(), CHECK_INTERVAL_MS);
                timer.unref?.();
            },
            detach: () => {
                if (timer)
                    clearInterval(timer);
                timer = undefined;
            },
        };
    };
}
//# sourceMappingURL=FivemFeature.js.map