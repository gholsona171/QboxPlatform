import { type BirthdayRepository } from "@qbox/birthdays";
import { type MessageTemplates } from "@qbox/shared/messages";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
/**
 * Birthdays: `/birthday`, the confirmation buttons, and a timer that posts
 * birthday messages and gives and removes the birthday role.
 */
export declare function birthdaysFeature(repository: BirthdayRepository, templates?: MessageTemplates): DiscordFeatureFactory;
//# sourceMappingURL=BirthdaysFeature.d.ts.map