import { DiscordRestGamesGateway, GamesService, ProtocolQueryClient, type GamesRepository } from "@qbox/game-servers";
import { logger } from "@qbox/logger";
import type { MessageTemplates } from "@qbox/shared/messages";

import { ServerCommand } from "../commands/Server.command.js";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";

const TICK_INTERVAL_MS = 30_000;

/**
 * Game servers: `/server`, auto-updating status messages, player-count
 * channels, down/up alerts, and player-count snapshots for Minecraft and
 * Steam-query games.
 */
export function gamesFeature(repository: GamesRepository, templates?: MessageTemplates): DiscordFeatureFactory {
  return ({ client }) => {
    const games = new GamesService(repository, new ProtocolQueryClient(), new DiscordRestGamesGateway(client.rest), templates);
    let timer: ReturnType<typeof setInterval> | undefined;
    let running = false;
    const tick = async (): Promise<void> => {
      if (running) return;
      running = true;
      try {
        await games.tick();
      } catch (error) {
        logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation: "games-tick" }, "Game server status update failed.");
      } finally {
        running = false;
      }
    };
    return {
      name: "game-servers",
      commands: () => [new ServerCommand(games)],
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
