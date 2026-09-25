import { describe, expect, it } from "vitest";
import { InMemoryMessagesRepository, MessageTemplateService, type MessagesGateway, type OutgoingMessage } from "@qbox/messages";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { messagesApiFeature } from "../src/messages/MessagesRoutes.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT" | "DELETE", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });

function setup(allowed: readonly string[]) {
  const posted: { channelId: string; message: OutgoingMessage }[] = [];
  const gateway: MessagesGateway = {
    postMessage: async (channelId, message) => { posted.push({ channelId, message }); return { messageId: "700000000000000001" }; },
    guildName: async () => "Nightfall",
  };
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission) => {
      const name = typeof permission === "string" ? permission : permission.join("|");
      if (!allowed.includes(name)) throw new AuthorizationDeniedApiError();
      return { userId: "300000000000000001", displayName: "Jay", roleIds: [] };
    },
    member: async () => ({ userId: "300000000000000002", displayName: "Sam", roleIds: [] }),
  };
  const service = new MessageTemplateService(new InMemoryMessagesRepository(), { gateway });
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "messages-test" }),
    registerRoutes: (instance) => messagesApiFeature(service).register(instance, context),
  });
  return { server, posted, service };
}

describe("messages routes", () => {
  it("saves the look and lists the catalog", async () => {
    const { server } = setup(["messages.manage"]);
    const before = (await server.inject({ method: "GET", url: "/api/v1/messages/overview", headers: host })).json().data;
    expect(before).toMatchObject({ look: { revision: 0, mode: "fill" }, brand: "Guildhall", can: { manage: true } });
    expect(before.templates.map((entry: { key: string }) => entry.key)).toContain("tickets.opened");
    expect(before.templates.every((entry: { customized: boolean }) => !entry.customized)).toBe(true);
    const saved = await server.inject(json("PUT", "/api/v1/messages/look", { enabled: true, accentColor: "5865f2", footerText: "{server}", showTimestamp: true, mode: "override", expectedRevision: 0 }));
    expect(saved.json().data).toMatchObject({ accentColor: "#5865F2", footerText: "{server}", mode: "override", revision: 1 });
    const stale = await server.inject(json("PUT", "/api/v1/messages/look", { enabled: true, showTimestamp: false, mode: "fill", expectedRevision: 0 }));
    expect(stale.statusCode).toBe(409);
    const bad = await server.inject(json("PUT", "/api/v1/messages/look", { enabled: true, accentColor: "blue", showTimestamp: false, mode: "fill", expectedRevision: 1 }));
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors[0].message).toContain("hex color");
  });

  it("customizes, previews, tests, and resets a message", async () => {
    const { server, posted } = setup(["messages.manage"]);
    const draft = { content: "Welcome {user} to {server}", embeds: [{ title: "Ticket #{number}", description: "{subject}", color: "#FF0000", fields: [{ name: "Reason", value: "{reason}", inline: true }] }] };
    const saved = await server.inject(json("PUT", "/api/v1/messages/templates/tickets.opened", draft));
    expect(saved.statusCode).toBe(200);
    expect(saved.json().data).toMatchObject({ key: "tickets.opened", customized: true, enabled: true, updatedBy: "300000000000000001", template: { content: "Welcome {user} to {server}" } });
    expect(saved.json().data.template.embeds[0].color).toBe(0xff0000);

    const preview = (await server.inject(json("POST", "/api/v1/messages/templates/tickets.opened/preview", draft))).json().data;
    expect(preview.content).toBe("Welcome <@123456789012345678> to Nightfall");
    expect(preview.embeds[0]).toMatchObject({ title: "Ticket #12", description: "I need help with my account", fields: [{ name: "Reason", value: "General support", inline: true }] });

    expect((await server.inject(json("POST", "/api/v1/messages/templates/tickets.opened/test", { channelId: CHANNEL }))).statusCode).toBe(200);
    expect((await server.inject(json("POST", "/api/v1/messages/templates/tickets.opened/test", { channelId: CHANNEL, content: "Draft {username}" }))).statusCode).toBe(200);
    expect(posted.map((item) => item.message.content)).toEqual(["Welcome <@123456789012345678> to Nightfall", "Draft Alex"]);

    const templates = (await server.inject({ method: "GET", url: "/api/v1/messages/templates", headers: host })).json().data;
    expect(templates.filter((entry: { customized: boolean }) => entry.customized).map((entry: { key: string }) => entry.key)).toEqual(["tickets.opened"]);

    const reset = await server.inject({ method: "DELETE", url: "/api/v1/messages/templates/tickets.opened", headers: host });
    expect(reset.json().data).toMatchObject({ key: "tickets.opened", customized: false });
    expect((await server.inject(json("POST", "/api/v1/messages/templates/tickets.opened/test", { channelId: CHANNEL }))).statusCode).toBe(400);
  });

  it("returns readable validation errors and 404 for unknown keys", async () => {
    const { server } = setup(["messages.manage"]);
    const empty = await server.inject(json("PUT", "/api/v1/messages/templates/tickets.opened", { content: "", embeds: [{ title: "" }] }));
    expect(empty.statusCode).toBe(400);
    expect(empty.json().errors[0].message).toContain("Write some text");
    const tooLong = await server.inject(json("PUT", "/api/v1/messages/templates/tickets.opened", { embeds: [{ title: "x".repeat(257) }] }));
    expect(tooLong.json().errors[0].message).toContain("256");
    const badUrl = await server.inject(json("PUT", "/api/v1/messages/templates/tickets.opened", { embeds: [{ title: "t", image: { url: "javascript:x" } }] }));
    expect(badUrl.json().errors[0].message).toContain("http(s)");
    expect((await server.inject(json("PUT", "/api/v1/messages/templates/nope.nope", { content: "x" }))).statusCode).toBe(404);
  });

  it("rejects everyone without messages.manage", async () => {
    const { server } = setup([]);
    expect((await server.inject({ method: "GET", url: "/api/v1/messages/overview", headers: host })).statusCode).toBe(403);
    expect((await server.inject({ method: "GET", url: "/api/v1/messages/templates", headers: host })).statusCode).toBe(403);
    expect((await server.inject(json("PUT", "/api/v1/messages/look", { enabled: true, showTimestamp: false, mode: "fill", expectedRevision: 0 }))).statusCode).toBe(403);
    expect((await server.inject(json("PUT", "/api/v1/messages/templates/tickets.opened", { content: "x" }))).statusCode).toBe(403);
    expect((await server.inject({ method: "DELETE", url: "/api/v1/messages/templates/tickets.opened", headers: host })).statusCode).toBe(403);
    expect((await server.inject(json("POST", "/api/v1/messages/templates/tickets.opened/preview", { content: "x" }))).statusCode).toBe(403);
    expect((await server.inject(json("POST", "/api/v1/messages/templates/tickets.opened/test", { channelId: CHANNEL }))).statusCode).toBe(403);
  });
});
