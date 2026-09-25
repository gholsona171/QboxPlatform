import { DiscordRestTicketGateway, TicketService, type TicketRepository } from "@qbox/tickets";

import { TicketCommand } from "../commands/Ticket.command.js";
import { TicketsCommand } from "../commands/Tickets.command.js";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
import { DiscordTicketEventHandler } from "./DiscordTicketEventHandler.js";
import { DiscordTicketInteractionHandler } from "./DiscordTicketInteractionHandler.js";
import { TicketElevation } from "./ticketActor.js";

/** Ticket system: `/ticket`, `/tickets`, panel components, and ticket events. */
export function ticketsFeature(repository: TicketRepository): DiscordFeatureFactory {
  return ({ client, authorizer }) => {
    const tickets = new TicketService(repository, new DiscordRestTicketGateway(client.rest));
    const elevation = new TicketElevation(authorizer);
    const interactions = new DiscordTicketInteractionHandler(tickets, elevation);
    const events = new DiscordTicketEventHandler(tickets);
    return {
      name: "tickets",
      commands: () => [new TicketCommand(tickets, elevation), new TicketsCommand(tickets)],
      interactionPrefixes: ["qbox:ticket:"],
      handleInteraction: (interaction) => interactions.handle(interaction),
      attach: (target) => events.attach(target),
      detach: () => events.detach(),
    };
  };
}
