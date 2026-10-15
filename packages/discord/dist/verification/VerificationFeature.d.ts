import { type VerificationRepository } from "@qbox/verification";
import { type MessageTemplates } from "@qbox/shared/messages";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
/**
 * Verification: `/verify`, the panel button and forms, the unverified role and
 * account age check on join, and kicking members who stay unverified.
 */
export declare function verificationFeature(repository: VerificationRepository, templates?: MessageTemplates): DiscordFeatureFactory;
//# sourceMappingURL=VerificationFeature.d.ts.map