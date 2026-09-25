import type { Interaction } from "discord.js";
import { describe, expect, it, vi } from "vitest";

import { CommandRegistry } from "../src/commands/CommandRegistry.js";
import { TicketCommand } from "../src/commands/Ticket.command.js";
import { TicketsCommand } from "../src/commands/Tickets.command.js";
import { DiscordInteractionHandler } from "../src/interactions/DiscordInteractionHandler.js";
import { createTestAuthorizer } from "./CommandTestFactory.js";

function button(customId: string): Interaction {
  return {
    id: "1",
    type: 3,
    customId,
    isButton: () => true,
    isStringSelectMenu: () => false,
    isModalSubmit: () => false,
    isChatInputCommand: () => false,
  } as unknown as Interaction;
}

function handlerWith() {
  const tickets = { handle: vi.fn(async () => undefined) };
  const roleMenus = { handleComponent: vi.fn(async () => undefined) };
  const handler = new DiscordInteractionHandler(new CommandRegistry(createTestAuthorizer()), {
    executionTimeoutMs: 100,
    featureInteractions: [{ prefixes: ["qbox:ticket:"], handle: tickets.handle }],
    roleMenuInteractions: roleMenus as never,
    log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  });
  return { handler, tickets, roleMenus };
}

describe("ticket interaction routing", () => {
  it("sends ticket components to the ticket handler only", async () => {
    const { handler, tickets, roleMenus } = handlerWith();
    await handler.handle(button("qbox:ticket:claim:abc"));
    expect(tickets.handle).toHaveBeenCalledTimes(1);
    expect(roleMenus.handleComponent).not.toHaveBeenCalled();
  });

  it("leaves other components to the role-menu handler", async () => {
    const { handler, tickets, roleMenus } = handlerWith();
    await handler.handle(button("qbox:role-menu:abc"));
    expect(tickets.handle).not.toHaveBeenCalled();
    expect(roleMenus.handleComponent).toHaveBeenCalledTimes(1);
  });
});

describe("ticket commands", () => {
  it("lets every member run /ticket and gates /tickets behind tickets.manage", () => {
    const member = new TicketCommand();
    expect(member.policy.permissions).toBeUndefined();
    expect(member.bypassAuthorization()).toBe(true);
    expect(new TicketsCommand().policy.permissions?.required).toEqual(["tickets.manage"]);
  });

  it("explains when tickets are unavailable", async () => {
    const editReply = vi.fn(async () => undefined);
    await new TicketCommand().execute({ editReply } as never);
    expect(editReply).toHaveBeenCalledWith({ content: "Tickets are not available right now." });
  });
});
