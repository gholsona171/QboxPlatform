import { type Interaction } from "discord.js";
import { type TicketService } from "@qbox/tickets";
import { TicketElevation } from "./ticketActor.js";
/** Custom ID prefixes this handler owns. */
export declare const TICKET_INTERACTION_PREFIXES: readonly ["qbox:ticket:", "qbox:tickets:staffchat:"];
/** Handles ticket panel buttons, select menus, forms, and in-ticket controls. */
export declare class DiscordTicketInteractionHandler {
    private readonly tickets;
    private readonly elevation;
    constructor(tickets: TicketService, elevation: TicketElevation);
    static handles(interaction: Interaction): boolean;
    handle(interaction: Interaction): Promise<void>;
    private button;
    private select;
    private startOpen;
    private requestClose;
    private closeNow;
    private modal;
    private rate;
    private fail;
}
//# sourceMappingURL=DiscordTicketInteractionHandler.d.ts.map