import { DiscordRestScheduledMessageGateway, ScheduledMessageService } from "@qbox/scheduled-messages";
import { logger } from "@qbox/logger";
import { ScheduleCommand } from "../commands/Schedule.command.js";
const TICK_INTERVAL_MS = 30_000;
/** Scheduled messages: `/schedule` and a timer that posts due messages. */
export function scheduledMessagesFeature(repository) {
    return ({ client, authorizer }) => {
        const scheduled = new ScheduledMessageService(repository, new DiscordRestScheduledMessageGateway(client.rest));
        let timer;
        let running = false;
        const tick = async () => {
            if (running)
                return;
            running = true;
            try {
                const result = await scheduled.runDue();
                if (result.failed > 0)
                    logger.warn({ ...result }, "Some scheduled messages failed to post.");
            }
            catch (error) {
                logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined }, "Scheduled message timer failed.");
            }
            finally {
                running = false;
            }
        };
        return {
            name: "scheduled-messages",
            commands: () => [new ScheduleCommand(scheduled, authorizer)],
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
//# sourceMappingURL=ScheduledMessagesFeature.js.map