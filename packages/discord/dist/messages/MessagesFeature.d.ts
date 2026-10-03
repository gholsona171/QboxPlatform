import { type LookProvider } from "@qbox/messages";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
/**
 * Look & Messages: wraps the bot's REST client once so every embed any
 * feature (or discord.js itself, for interaction replies) sends gets the
 * server's look, and remembers which server each interaction came from so
 * replies can be themed too. No commands of its own.
 */
export declare function messagesFeature(looks: LookProvider): DiscordFeatureFactory;
//# sourceMappingURL=MessagesFeature.d.ts.map