import { DiscordRestTicketGateway, TicketService } from "@qbox/tickets";
import { passthroughTemplates } from "@qbox/shared/messages";
import { TicketCommand } from "../commands/Ticket.command.js";
import { TicketsCommand } from "../commands/Tickets.command.js";
import { DiscordTicketEventHandler } from "./DiscordTicketEventHandler.js";
import { DiscordTicketInteractionHandler, TICKET_INTERACTION_PREFIXES } from "./DiscordTicketInteractionHandler.js";
import { TicketElevation } from "./ticketActor.js";
/** Ticket system: `/ticket`, `/tickets`, panel components, and ticket events. */
export function ticketsFeature(repository, templates = passthroughTemplates) {
    return ({ client, authorizer }) => {
        const tickets = new TicketService(repository, new DiscordRestTicketGateway(client.rest), undefined, templates);
        const elevation = new TicketElevation(authorizer);
        const interactions = new DiscordTicketInteractionHandler(tickets, elevation);
        const events = new DiscordTicketEventHandler(tickets);
        return {
            name: "tickets",
            commands: () => [new TicketCommand(tickets, elevation), new TicketsCommand(tickets)],
            interactionPrefixes: [...TICKET_INTERACTION_PREFIXES],
            handleInteraction: (interaction) => interactions.handle(interaction),
            attach: (target) => events.attach(target),
            detach: () => events.detach(),
        };
    };
}
//# sourceMappingURL=TicketsFeature.js.map