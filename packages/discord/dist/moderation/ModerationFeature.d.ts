import { type ModerationRepository } from "@qbox/moderation";
import { type MessageTemplates } from "@qbox/shared/messages";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
/**
 * Moderation: `/mod`, automod on every message, recording bans, unbans, and
 * kicks done directly in Discord, and lifting expired temporary bans.
 */
export declare function moderationFeature(repository: ModerationRepository, templates?: MessageTemplates): DiscordFeatureFactory;
//# sourceMappingURL=ModerationFeature.d.ts.map