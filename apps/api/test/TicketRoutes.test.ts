import { describe, expect, it } from "vitest";
import { InMemoryTicketRepository, TicketService, defaultTicketSettings, type TicketDiscordGateway } from "@qbox/tickets";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import { registerTicketRoutes, type TicketRouteGuard } from "../src/tickets/TicketRoutes.js";

const GUILD = "100000000000000001";
const STAFF = "300000000000000001";
const host = { host: "127.0.0.1:3000" };

const gateway: TicketDiscordGateway = {
  createTicketSpace: async () => ({ channelId: "600000000000000001" }),
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
};

function setup(allowed: readonly string[] = ["tickets.handle", "tickets.manage"]) {
  const tickets = new TicketService(new InMemoryTicketRepository(), gateway);
  const calls: { permission: string; mutation: boolean }[] = [];
  const guard: TicketRouteGuard = async (_request, permission, options) => {
    calls.push({ permission, mutation: options.mutation });
    if (!allowed.includes(permission)) throw new AuthorizationDeniedApiError();
    return { userId: STAFF, displayName: "Staff" };
  };
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "tickets-test" }),
    registerRoutes: (instance) => registerTicketRoutes(instance, { tickets, guildId: GUILD, guard }),
  });
  return { server, tickets, calls };
}

function settingsBody(overrides: Record<string, unknown> = {}) {
  const { guildId: _guild, nextNumber: _next, revision: _revision, ...defaults } = defaultTicketSettings(GUILD);
  return { ...defaults, enabled: true, supportRoleIds: ["400000000000000001"], expectedRevision: 0, ...overrides };
}

const json = (method: "POST" | "PUT", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });

describe("ticket routes", () => {
  it("returns the overview for ticket handlers", async () => {
    const { server, calls } = setup();
    const response = await server.inject({ method: "GET", url: "/api/v1/tickets/overview", headers: host });
    expect(response.statusCode).toBe(200);
    expect(response.json().data).toMatchObject({ settings: { enabled: false }, categories: [], panels: [], stats: { total: 0 } });
    expect(calls).toEqual([{ permission: "tickets.handle", mutation: false }]);
  });

  it("requires tickets.manage and CSRF for configuration", async () => {
    const { server, calls } = setup(["tickets.handle"]);
    const response = await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody()));
    expect(response.statusCode).toBe(403);
    expect(calls).toEqual([{ permission: "tickets.manage", mutation: true }]);
  });

  it("saves settings, rejects stale revisions, and reports validation messages", async () => {
    const { server } = setup();
    expect((await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody()))).json().data.revision).toBe(1);
    const stale = await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody()));
    expect(stale.statusCode).toBe(409);
    const invalid = await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody({ expectedRevision: 1, maxOpenPerUser: 99 })));
    expect(invalid.statusCode).toBe(400);
    expect(invalid.json().errors[0].message).toContain("maxOpenPerUser");
    const malformed = await server.inject(json("PUT", "/api/v1/tickets/settings", { enabled: "yes" }));
    expect(malformed.statusCode).toBe(400);
  });

  it("manages categories and panels", async () => {
    const { server } = setup();
    await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody()));
    const category = (await server.inject(json("POST", "/api/v1/tickets/categories", { name: "Billing", questions: [{ id: "order", label: "Order ID", style: "SHORT", required: true }] }))).json().data;
    expect(category).toMatchObject({ name: "Billing", buttonStyle: "PRIMARY", defaultPriority: "NORMAL" });
    const panel = (await server.inject(json("POST", "/api/v1/tickets/panels", { name: "Main", channelId: "500000000000000001", title: "Support", description: "Pick", categoryIds: [category.id] }))).json().data;
    const published = await server.inject(json("POST", `/api/v1/tickets/panels/${panel.id}/publish`, {}));
    expect(published.json().data.messageId).toBe("800000000000000001");
    expect((await server.inject({ method: "DELETE", url: `/api/v1/tickets/categories/${category.id}`, headers: host })).statusCode).toBe(200);
    expect((await server.inject({ method: "DELETE", url: `/api/v1/tickets/categories/${category.id}`, headers: host })).statusCode).toBe(404);
  });

  it("lists tickets and runs staff actions from the portal", async () => {
    const { server, tickets, calls } = setup();
    await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody()));
    const ticket = await tickets.openTicket({ guildId: GUILD, actor: { userId: "200000000000000001", displayName: "Member", roleIds: [], elevated: false, source: "DISCORD" }, subject: "Refund please" });
    const list = await server.inject({ method: "GET", url: "/api/v1/tickets?status=open,claimed&search=refund", headers: host });
    expect(list.json().data.map((item: { id: string }) => item.id)).toEqual([ticket.id]);
    calls.length = 0;
    expect((await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/claim`, {}))).json().data.claimedById).toBe(STAFF);
    expect(calls).toEqual([{ permission: "tickets.handle", mutation: true }]);
    await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/reply`, { content: "On it!" }));
    await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/notes`, { content: "Checked payment logs" }));
    await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/priority`, { priority: "HIGH" }));
    const detail = (await server.inject({ method: "GET", url: `/api/v1/tickets/${ticket.id}`, headers: host })).json().data;
    expect(detail.ticket).toMatchObject({ priority: "HIGH", status: "CLAIMED" });
    expect(detail.messages.map((message: { internal: boolean }) => message.internal)).toEqual([false, true]);
    const transcript = await server.inject({ method: "GET", url: `/api/v1/tickets/${ticket.id}/transcript`, headers: host });
    expect(transcript.headers["content-disposition"]).toContain("ticket-1-transcript.txt");
    expect(transcript.body).toContain("[internal note]");
    const closed = await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/close`, { reason: "Refunded" }));
    expect(closed.json().data.status).toBe("CLOSED");
    const again = await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/close`, {}));
    expect(again.statusCode).toBe(400);
    expect(again.json().errors[0].message).toBe("This ticket is already closed.");
  });

  it("returns 404 for unknown tickets", async () => {
    const { server } = setup();
    const response = await server.inject({ method: "GET", url: "/api/v1/tickets/00000000-0000-0000-0000-000000000000", headers: host });
    expect(response.statusCode).toBe(404);
  });
});
