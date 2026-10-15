import { type GamesRepository } from "@qbox/game-servers";
import type { MessageTemplates } from "@qbox/shared/messages";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
/**
 * Game servers: `/server`, auto-updating status messages, player-count
 * channels, down/up alerts, and player-count snapshots for Minecraft and
 * Steam-query games.
 */
export declare function gamesFeature(repository: GamesRepository, templates?: MessageTemplates): DiscordFeatureFactory;
//# sourceMappingURL=GamesFeature.d.ts.map