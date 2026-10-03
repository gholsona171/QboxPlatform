import { DiscordRestFivemGateway, FivemService, HttpFivemQueryClient } from "@qbox/fivem";
import { logger } from "@qbox/logger";
import { FivemCommand } from "../commands/Fivem.command.js";
const TICK_INTERVAL_MS = 15_000;
/**
 * FiveM server: `/fivem`, the auto-updating status message, down/up alerts,
 * restart warnings, and player-count snapshots.
 */
export function fivemFeature(repository) {
    return ({ client }) => {
        const fivem = new FivemService(repository, new HttpFivemQueryClient(), new DiscordRestFivemGateway(client.rest));
        let timer;
        let running = false;
        const tick = async () => {
            if (running)
                return;
            running = true;
            try {
                await fivem.tick();
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
                timer = setInterval(() => void tick(), TICK_INTERVAL_MS);
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