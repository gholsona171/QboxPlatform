import { DiscordRestStreamsGateway, StreamsService, createStreamPlatformClients } from "@qbox/streams";
import { logger } from "@qbox/logger";
import { StreamsCommand } from "../commands/Streams.command.js";
const TICK_INTERVAL_MS = 30_000;
/** Stream announcements: `/streams` and a timer that checks followed creators. */
export function streamsFeature(repository, options) {
    return ({ client, authorizer }) => {
        const streams = new StreamsService(repository, createStreamPlatformClients(options.credentials), new DiscordRestStreamsGateway(client.rest), {
            templates: options.templates,
            log: { warn: (message, details) => logger.warn({ ...details, operation: "streams-check" }, message) },
        });
        let timer;
        let running = false;
        const tick = async () => {
            if (running)
                return;
            running = true;
            try {
                await streams.tick();
            }
            catch (error) {
                logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation: "streams-tick" }, "Stream check failed.");
            }
            finally {
                running = false;
            }
        };
        return {
            name: "streams",
            commands: () => [new StreamsCommand(streams, authorizer)],
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
//# sourceMappingURL=StreamsFeature.js.map