import { describe, expect, it } from "vitest";
import { InMemoryTicketRepository, TicketError, TicketService, defaultTicketSettings, type TicketDiscordGateway } from "@qbox/tickets";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiPermissionGuard } from "../src/features/ApiFeature.js";
import { registerTicketRoutes } from "../src/tickets/TicketRoutes.js";

const GUILD = "100000000000000001";
const STAFF = "300000000000000001";
const host = { host: "127.0.0.1:3000" };

const gateway: TicketDiscordGateway = {
  guildName: async () => "Qbox",
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
  const guard: ApiPermissionGuard = async (_request, permission, options) => {
    calls.push({ permission, mutation: options.mutation });
    if (!allowed.includes(permission)) throw new AuthorizationDeniedApiError();
    return { userId: STAFF, displayName: "Staff", roleIds: [] };
  };
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "tickets-test" }),
    registerRoutes: (instance) => registerTicketRoutes(instance, { tickets, currentGuildId: () => GUILD, guard }),
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
    expect(response.json().data).toMatchObject({ settings: { enabled: false }, categories: [], panels: [], stats: { total: 0 }, canManage: true });
    expect(calls).toEqual([{ permission: "tickets.handle", mutation: false }, { permission: "tickets.manage", mutation: false }]);
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

  it("saves panel button rows and rejects bad arrangements", async () => {
    const { server } = setup();
    await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody()));
    const ids: string[] = [];
    for (const name of ["General", "Billing", "Reports"]) ids.push((await server.inject(json("POST", "/api/v1/tickets/categories", { name }))).json().data.id);
    const [a, b, c] = ids as [string, string, string];
    const body = { name: "Main", channelId: "500000000000000001", title: "Support", description: "Pick", categoryIds: ids };
    const created = await server.inject(json("POST", "/api/v1/tickets/panels", { ...body, rows: [[c], [a, b]] }));
    expect(created.statusCode).toBe(200);
    expect(created.json().data.rows).toEqual([[c], [a, b]]);
    const missing = await server.inject(json("PUT", `/api/v1/tickets/panels/${created.json().data.id}`, { ...body, rows: [[a, b]] }));
    expect(missing.statusCode).toBe(400);
    expect(missing.json().errors?.[0]?.message ?? missing.json().message).toContain("Every reason");
    const tooMany = await server.inject(json("PUT", `/api/v1/tickets/panels/${created.json().data.id}`, { ...body, rows: [[a], [b], [c], [a], [b], [c]] }));
    expect(tooMany.statusCode).toBe(400);
    const automatic = await server.inject(json("PUT", `/api/v1/tickets/panels/${created.json().data.id}`, { ...body, rows: null }));
    expect(automatic.json().data.rows).toBeNull();
    const omitted = await server.inject(json("PUT", `/api/v1/tickets/panels/${created.json().data.id}`, body));
    expect(omitted.json().data.rows).toBeNull();
    const malformed = await server.inject(json("PUT", `/api/v1/tickets/panels/${created.json().data.id}`, { ...body, rows: [["not-a-uuid"]] }));
    expect(malformed.statusCode).toBe(400);
  });

  it("explains a deleted panel channel when posting", async () => {
    const tickets = new TicketService(new InMemoryTicketRepository(), {
      ...gateway,
      publishPanel: async () => { throw new TicketError("INVALID_STATE", "The panel's channel no longer exists. Pick a new channel for this panel and post it again."); },
    });
    const server = createApiServer({
      configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "tickets-test" }),
      registerRoutes: (instance) => registerTicketRoutes(instance, { tickets, currentGuildId: () => GUILD, guard: async () => ({ userId: STAFF, displayName: "Staff", roleIds: [] }) }),
    });
    await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody()));
    const category = (await server.inject(json("POST", "/api/v1/tickets/categories", { name: "General" }))).json().data;
    const panel = (await server.inject(json("POST", "/api/v1/tickets/panels", { name: "Main", channelId: "500000000000000001", title: "Support", description: "Pick", categoryIds: [category.id] }))).json().data;
    const published = await server.inject(json("POST", `/api/v1/tickets/panels/${panel.id}/publish`, {}));
    expect(published.statusCode).toBe(400);
    expect(published.json().errors[0]).toMatchObject({ code: "INVALID_STATE" });
    expect(JSON.stringify(published.json())).toContain("The panel's channel no longer exists. Pick a new channel for this panel and post it again.");
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
    expect(transcript.body).toContain("[staff chat]");
    const closed = await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/close`, { reason: "Refunded" }));
    expect(closed.json().data.status).toBe("CLOSED");
    const again = await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/close`, {}));
    expect(again.statusCode).toBe(400);
    expect(again.json().errors[0].message).toBe("This ticket is already closed.");
  });

  it("saves the staff thread and retention settings and each reason's staff thread override", async () => {
    const { server } = setup();
    const saved = (await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody({ staffThreadEnabled: false, retentionMonths: 6 })))).json().data;
    expect(saved).toMatchObject({ staffThreadEnabled: false, retentionMonths: 6, transcriptDmUser: true });
    // Left out: the saved values stay.
    const { staffThreadEnabled: _s, retentionMonths: _r, ...older } = settingsBody({ expectedRevision: 1 });
    expect((await server.inject(json("PUT", "/api/v1/tickets/settings", older))).json().data).toMatchObject({ staffThreadEnabled: false, retentionMonths: 6 });
    const forever = await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody({ expectedRevision: 2, retentionMonths: 0 })));
    expect(forever.json().data.retentionMonths).toBe(0);
    const invalid = await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody({ expectedRevision: 3, retentionMonths: 3 })));
    expect(invalid.statusCode).toBe(400);
    expect(invalid.json().errors[0].message).toContain("retentionMonths");
    const category = (await server.inject(json("POST", "/api/v1/tickets/categories", { name: "Appeals", staffThread: "OFF" }))).json().data;
    expect(category.staffThread).toBe("OFF");
    expect((await server.inject(json("POST", "/api/v1/tickets/categories", { name: "General" }))).json().data.staffThread).toBe("INHERIT");
    expect((await server.inject(json("PUT", `/api/v1/tickets/categories/${category.id}`, { name: "Appeals" }))).json().data.staffThread).toBe("OFF");
    expect((await server.inject(json("POST", "/api/v1/tickets/categories", { name: "Bad", staffThread: "MAYBE" }))).statusCode).toBe(400);
  });

  it("downloads the HTML transcript and retries the transcript DM for closed tickets", async () => {
    let dmsOpen = false;
    const dms: unknown[] = [];
    const tickets = new TicketService(new InMemoryTicketRepository(), { ...gateway, directMessage: async (input) => { dms.push(input); return dmsOpen; } });
    const allowed = new Set(["tickets.manage"]);
    const calls: string[] = [];
    const server = createApiServer({
      configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "tickets-test" }),
      registerRoutes: (instance) => registerTicketRoutes(instance, {
        tickets,
        currentGuildId: () => GUILD,
        guard: async (_request, permission) => {
          calls.push(permission);
          if (!allowed.has(permission)) throw new AuthorizationDeniedApiError();
          return { userId: STAFF, displayName: "Staff", roleIds: [] };
        },
      }),
    });
    await server.inject(json("PUT", "/api/v1/tickets/settings", settingsBody()));
    const ticket = await tickets.openTicket({ guildId: GUILD, actor: { userId: "200000000000000001", displayName: "Member", roleIds: [], elevated: false, source: "DISCORD" }, subject: "<script>x</script>" });
    // Not closed yet.
    expect((await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/send-transcript`, {}))).statusCode).toBe(400);
    await tickets.close(GUILD, ticket.id, { userId: STAFF, displayName: "Staff", roleIds: [], elevated: true, source: "WEB" });
    calls.length = 0;
    const refused = await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/send-transcript`, {}));
    expect(refused.statusCode).toBe(400);
    expect(refused.json().errors[0].message).toBe("The member's DMs are closed, so the transcript could not be sent.");
    // A ticket manager without tickets.handle may send it.
    expect(calls).toEqual(["tickets.handle", "tickets.manage"]);
    dmsOpen = true;
    const sent = await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/send-transcript`, {}));
    expect(sent.json().data).toEqual({ sent: true });
    expect((dms.at(-1) as { files: { fileName: string }[] }).files.map((file) => file.fileName)).toEqual(["ticket-1-transcript.txt", "ticket-1-transcript.html"]);
    allowed.clear();
    expect((await server.inject(json("POST", `/api/v1/tickets/${ticket.id}/send-transcript`, {}))).statusCode).toBe(403);

    allowed.add("tickets.handle");
    const html = await server.inject({ method: "GET", url: `/api/v1/tickets/${ticket.id}/transcript?format=html`, headers: host });
    expect(html.headers["content-type"]).toContain("text/html");
    expect(html.headers["content-disposition"]).toContain("ticket-1-transcript.html");
    expect(html.body).toContain("&lt;script&gt;x&lt;/script&gt;");
    expect(html.body).not.toContain("<script>");
  });

  it("returns 404 for unknown tickets", async () => {
    const { server } = setup();
    const response = await server.inject({ method: "GET", url: "/api/v1/tickets/00000000-0000-0000-0000-000000000000", headers: host });
    expect(response.statusCode).toBe(404);
  });
});
