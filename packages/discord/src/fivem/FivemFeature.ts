import { ActivityType, type Client } from "discord.js";
import { CHECK_INTERVAL_MS, DiscordRestFivemGateway, FivemService, HttpFivemQueryClient, presenceText, type FivemRepository, type FivemTickResult } from "@qbox/fivem";
import { logger } from "@qbox/logger";

import { FivemCommand } from "../commands/Fivem.command.js";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";

/** Results older than this no longer count toward the presence (a server removed or unmonitored). */
const RESULT_STALE_MS = 5 * 60_000;

/**
 * Chooses the bot's presence line. Only when exactly one FiveM server is
 * monitored across every Discord server the bot is in ("Watching 12/64 on
 * Cloud Nine RP"); with none or several it shows nothing, since one line
 * cannot speak for several servers.
 */
export class FivemPresence {
  private readonly latest = new Map<string, { readonly result: FivemTickResult; readonly at: number }>();
  private shown: string | undefined;

  public constructor(private readonly now: () => number = Date.now) {}

  /** Records results and returns the text to show (`""` clears it), or undefined when nothing changes. */
  public update(results: readonly FivemTickResult[]): string | undefined {
    const now = this.now();
    for (const result of results) this.latest.set(result.guildId, { result, at: now });
    for (const [guildId, entry] of this.latest) if (now - entry.at > RESULT_STALE_MS) this.latest.delete(guildId);
    const only = this.latest.size === 1 ? [...this.latest.values()][0]?.result : undefined;
    const text = only ? presenceText(only).slice(0, 128) : "";
    if (text === (this.shown ?? "")) return undefined;
    this.shown = text;
    return text;
  }
}

function applyPresence(client: Client, text: string): void {
  client.user?.setPresence({ activities: text ? [{ name: text, type: ActivityType.Watching }] : [] });
}

/**
 * FiveM server: `/fivem`, the auto-updating status message with the player
 * graph, restart / down / back-online posts, player-count snapshots, and the
 * bot's presence.
 */
export function fivemFeature(repository: FivemRepository): DiscordFeatureFactory {
  return ({ client }) => {
    const fivem = new FivemService(repository, new HttpFivemQueryClient(), new DiscordRestFivemGateway(client.rest), () => new Date(), logger);
    const presence = new FivemPresence();
    let timer: ReturnType<typeof setInterval> | undefined;
    let running = false;
    const tick = async (): Promise<void> => {
      if (running) return;
      running = true;
      try {
        const text = presence.update(await fivem.tick());
        if (text !== undefined) applyPresence(client, text);
      } catch (error) {
        logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation: "fivem-tick" }, "FiveM status update failed.");
      } finally {
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
        if (timer) clearInterval(timer);
        timer = undefined;
      },
    };
  };
}
