import { type StaffRepository } from "@qbox/staff";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
/**
 * Staff management: `/staff`, leave approve and deny buttons in the staff log,
 * and a timer that ends long shifts and starts and ends leave.
 */
export declare function staffFeature(repository: StaffRepository): DiscordFeatureFactory;
//# sourceMappingURL=StaffFeature.d.ts.map