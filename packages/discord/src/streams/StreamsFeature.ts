import { DiscordRestStreamsGateway, StreamsService, createStreamPlatformClients, type StreamPlatformCredentials, type StreamsRepository } from "@qbox/streams";
import { logger } from "@qbox/logger";
import type { MessageTemplates } from "@qbox/shared/messages";

import { StreamsCommand } from "../commands/Streams.command.js";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";

const TICK_INTERVAL_MS = 30_000;

export interface StreamsFeatureOptions {
  readonly credentials: StreamPlatformCredentials;
  readonly templates?: MessageTemplates | undefined;
}

/** Stream announcements: `/streams` and a timer that checks followed creators. */
export function streamsFeature(repository: StreamsRepository, options: StreamsFeatureOptions): DiscordFeatureFactory {
  return ({ client, authorizer }) => {
    const streams = new StreamsService(repository, createStreamPlatformClients(options.credentials), new DiscordRestStreamsGateway(client.rest), {
      templates: options.templates,
      log: { warn: (message, details) => logger.warn({ ...details, operation: "streams-check" }, message) },
    });
    let timer: ReturnType<typeof setInterval> | undefined;
    let running = false;
    const tick = async (): Promise<void> => {
      if (running) return;
      running = true;
      try {
        await streams.tick();
      } catch (error) {
        logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation: "streams-tick" }, "Stream check failed.");
      } finally {
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
        if (timer) clearInterval(timer);
        timer = undefined;
      },
    };
  };
}
