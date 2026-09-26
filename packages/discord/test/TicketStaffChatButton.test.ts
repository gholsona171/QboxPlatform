import type { Interaction } from "discord.js";
import { InMemoryTicketRepository, TicketService, defaultTicketSettings, type TicketDiscordGateway } from "@qbox/tickets";
import type { PermissionAuthorizer } from "@qbox/permissions";
import { describe, expect, it, vi } from "vitest";

import { CommandRegistry } from "../src/commands/CommandRegistry.js";
import { DiscordInteractionHandler } from "../src/interactions/DiscordInteractionHandler.js";
import { DiscordTicketInteractionHandler, TICKET_INTERACTION_PREFIXES } from "../src/tickets/DiscordTicketInteractionHandler.js";
import { TicketElevation } from "../src/tickets/ticketActor.js";
import { createTestAuthorizer } from "./CommandTestFactory.js";

const GUILD = "100000000000000001";
const OPENER = "200000000000000001";
const STAFF = "300000000000000001";
const SUPPORT_ROLE = "400000000000000001";

function gateway(members: string[]): TicketDiscordGateway {
  let channel = 600000000000000000n;
  return {
    guildName: async () => "Guildhall HQ",
    createTicketSpace: async () => ({ channelId: String((channel += 1n)) }),
    postOpening: async () => undefined,
    postNotice: async () => ({ messageId: "700000000000000001" }),
    setAccess: async () => undefined,
    closeSpace: async () => undefined,
    reopenSpace: async () => undefined,
    deleteSpace: async () => undefined,
    renameSpace: async () => undefined,
    publishPanel: async () => ({ messageId: "800000000000000001" }),
    deletePanelMessage: async () => undefined,
    postTranscript: async () => ({ messageId: "900000000000000001" }),
    directMessage: async () => true,
    createStaffThread: async () => ({ threadId: String((channel += 1n)) }),
    addThreadMember: async (_threadId, userId) => { members.push(userId); },
    setThreadArchived: async () => undefined,
  };
}

function press(customId: string, userId: string, roleIds: string[]) {
  const replies: string[] = [];
  const interaction = {
    id: "1",
    customId,
    guildId: GUILD,
    user: { id: userId, username: `user-${userId.slice(-2)}`, globalName: null },
    member: { roles: roleIds, displayName: `user-${userId.slice(-2)}` },
    memberPermissions: { has: () => false },
    deferred: false,
    replied: false,
    isButton: () => true,
    isStringSelectMenu: () => false,
    isModalSubmit: () => false,
    isRepliable: () => true,
    deferReply: vi.fn(async function (this: { deferred: boolean }) { interaction.deferred = true; }),
    editReply: vi.fn(async (options: { content: string }) => { replies.push(options.content); }),
    reply: vi.fn(async (options: { content: string }) => { replies.push(options.content); }),
  };
  return { interaction: interaction as unknown as Interaction, replies };
}

async function setup() {
  const members: string[] = [];
  const tickets = new TicketService(new InMemoryTicketRepository(), gateway(members));
  const { nextNumber: _n, revision: _r, ...defaults } = defaultTicketSettings(GUILD);
  await tickets.saveSettings({ ...defaults, enabled: true, supportRoleIds: [SUPPORT_ROLE], source: "WEB" });
  const ticket = await tickets.openTicket({ guildId: GUILD, actor: { userId: OPENER, displayName: "Member", roleIds: [], elevated: false, source: "DISCORD" } });
  const authorizer = { authorize: async () => ({ allowed: false }) } as unknown as PermissionAuthorizer;
  const handler = new DiscordTicketInteractionHandler(tickets, new TicketElevation(authorizer));
  return { ticket, handler, members };
}

describe("staff chat button", () => {
  it("is routed to the ticket handler", async () => {
    expect(DiscordTicketInteractionHandler.handles(press("qbox:tickets:staffchat:abc", STAFF, []).interaction)).toBe(true);
    const handle = vi.fn(async () => undefined);
    const router = new DiscordInteractionHandler(new CommandRegistry(createTestAuthorizer()), {
      executionTimeoutMs: 100,
      featureInteractions: [{ prefixes: [...TICKET_INTERACTION_PREFIXES], handle }],
      roleMenuInteractions: { handleComponent: vi.fn(async () => undefined) } as never,
      log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    });
    await router.handle({ ...press("qbox:tickets:staffchat:abc", STAFF, []).interaction, type: 3, isChatInputCommand: () => false } as unknown as Interaction);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  it("adds staff to the thread and replies with a link", async () => {
    const { ticket, handler, members } = await setup();
    const { interaction, replies } = press(`qbox:tickets:staffchat:${ticket.id}`, STAFF, [SUPPORT_ROLE]);
    await handler.handle(interaction);
    expect(members).toEqual([STAFF]);
    const threadId = (await (handler as unknown as { tickets: TicketService }).tickets.ticket(GUILD, ticket.id)).staffThreadId;
    expect(replies).toEqual([`You're in the staff chat: <#${threadId}> (https://discord.com/channels/${GUILD}/${threadId})`]);
  });

  it("tells non-staff only staff can open it", async () => {
    const { ticket, handler, members } = await setup();
    const { interaction, replies } = press(`qbox:tickets:staffchat:${ticket.id}`, OPENER, []);
    await handler.handle(interaction);
    expect(members).toEqual([]);
    expect(replies).toEqual(["Only staff can open the staff chat."]);
  });
});
