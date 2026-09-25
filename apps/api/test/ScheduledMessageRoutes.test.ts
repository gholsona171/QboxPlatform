import { describe, expect, it } from "vitest";
import { InMemoryScheduledMessageRepository, ScheduledMessageService, type ScheduledMessageGateway } from "@qbox/scheduled-messages";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { scheduledMessagesApiFeature } from "../src/scheduledMessages/ScheduledMessageRoutes.js";

const GUILD = "100000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT" | "DELETE", url: string, payload?: unknown) => ({ method, url, ...(payload === undefined ? {} : { payload: payload as Record<string, unknown> }), headers: payload === undefined ? host : { ...host, "content-type": "application/json" } });

const gateway: ScheduledMessageGateway = {
  post: async () => ({ messageId: "700000000000000001" }),
  deleteMessage: async () => undefined,
  pin: async () => undefined,
};

const body = {
  name: "Morning",
  channelId: "500000000000000001",
  content: "Good morning!",
  embed: { title: "Today", fields: [{ name: "Event", value: "Race at 8", inline: true }] },
  pingRoleIds: [],
  schedule: { type: "DAILY", timeZone: "Europe/Amsterdam", time: "08:00" },
  enabled: true,
  deletePrevious: false,
  pin: false,
};

function setup(allowed: readonly string[]) {
  const calls: { permission: string; mutation: boolean }[] = [];
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission, options) => {
      const name = typeof permission === "string" ? permission : permission.join("|");
      calls.push({ permission: name, mutation: options.mutation });
      if (!allowed.includes(name)) throw new AuthorizationDeniedApiError();
      return { userId: "300000000000000001", displayName: "Jay", roleIds: [] };
    },
    member: async () => ({ userId: "300000000000000001", displayName: "Jay", roleIds: [] }),
  };
  const service = new ScheduledMessageService(new InMemoryScheduledMessageRepository(), gateway, () => new Date("2026-09-25T12:00:00.000Z"));
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "scheduled-test" }),
    registerRoutes: (instance) => scheduledMessagesApiFeature(service).register(instance, context),
  });
  return { server, calls };
}

describe("scheduled message routes", () => {
  it("requires scheduled.manage", async () => {
    const { server, calls } = setup([]);
    expect((await server.inject({ method: "GET", url: "/api/v1/scheduled-messages", headers: host })).statusCode).toBe(403);
    expect((await server.inject(json("POST", "/api/v1/scheduled-messages", body))).statusCode).toBe(403);
    expect(calls).toEqual([{ permission: "scheduled.manage", mutation: false }, { permission: "scheduled.manage", mutation: true }]);
  });

  it("creates, lists, sends, pauses, resumes, edits, and deletes", async () => {
    const { server } = setup(["scheduled.manage"]);
    const created = (await server.inject(json("POST", "/api/v1/scheduled-messages", body))).json().data;
    expect(created).toMatchObject({ name: "Morning", summary: "Every day at 08:00 (Europe/Amsterdam)", nextRunAt: "2026-09-26T06:00:00.000Z" });
    expect((await server.inject({ method: "GET", url: "/api/v1/scheduled-messages", headers: host })).json().data).toHaveLength(1);
    const sent = (await server.inject(json("POST", `/api/v1/scheduled-messages/${created.id}/send`, {}))).json().data;
    expect(sent).toMatchObject({ success: true, manual: true, discordMessageId: "700000000000000001" });
    expect((await server.inject(json("POST", `/api/v1/scheduled-messages/${created.id}/pause`, {}))).json().data.enabled).toBe(false);
    expect((await server.inject(json("POST", `/api/v1/scheduled-messages/${created.id}/resume`, {}))).json().data.enabled).toBe(true);
    const edited = await server.inject(json("PUT", `/api/v1/scheduled-messages/${created.id}`, { ...body, schedule: { type: "INTERVAL", timeZone: "UTC", intervalMinutes: 30 } }));
    expect(edited.json().data.summary).toBe("Every 30 minutes (UTC)");
    const runs = (await server.inject({ method: "GET", url: `/api/v1/scheduled-messages/runs?messageId=${created.id}`, headers: host })).json().data;
    expect(runs).toHaveLength(1);
    expect((await server.inject(json("DELETE", `/api/v1/scheduled-messages/${created.id}`))).statusCode).toBe(200);
    expect((await server.inject(json("POST", `/api/v1/scheduled-messages/${created.id}/send`, {}))).statusCode).toBe(404);
  });

  it("returns readable validation errors", async () => {
    const { server } = setup(["scheduled.manage"]);
    const bad = await server.inject(json("POST", "/api/v1/scheduled-messages", { ...body, schedule: { type: "INTERVAL", timeZone: "UTC", intervalMinutes: 5 } }));
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors[0].message).toContain("Interval");
    const shape = await server.inject(json("POST", "/api/v1/scheduled-messages", { ...body, schedule: { type: "HOURLY", timeZone: "UTC" } }));
    expect(shape.statusCode).toBe(400);
  });
});
