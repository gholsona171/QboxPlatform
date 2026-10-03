import { type TicketRepository } from "@qbox/tickets";
import { type MessageTemplates } from "@qbox/shared/messages";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
/** Ticket system: `/ticket`, `/tickets`, panel components, and ticket events. */
export declare function ticketsFeature(repository: TicketRepository, templates?: MessageTemplates): DiscordFeatureFactory;
//# sourceMappingURL=TicketsFeature.d.ts.map