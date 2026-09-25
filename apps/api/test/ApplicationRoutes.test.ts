import { describe, expect, it } from "vitest";
import { ApplicationService, InMemoryApplicationRepository, type ApplicationGateway } from "@qbox/applications";

import { applicationsApiFeature } from "../src/applications/ApplicationRoutes.js";
import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";

const GUILD = "100000000000000001";
const STAFF = "300000000000000001";
const MEMBER = "800000000000000000";
const REVIEWER_ROLE = "400000000000000004";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT" | "DELETE", url: string, payload?: unknown) => ({
  method,
  url,
  ...(payload === undefined ? {} : { payload: payload as Record<string, unknown> }),
  headers: { ...host, ...(payload === undefined ? {} : { "content-type": "application/json" }) },
});

const gateway: ApplicationGateway = {
  postReview: async () => ({ messageId: "700000000000000001" }),
  updateReview: async () => undefined,
  createDiscussion: async () => ({ threadId: "600000000000000001" }),
  postMessage: async () => undefined,
  addRoles: async () => undefined,
  removeRoles: async () => undefined,
  directMessage: async () => true,
  publishPanel: async () => ({ messageId: "700000000000000009" }),
  deleteMessage: async () => undefined,
  guildName: async () => "Qbox",
};

const form = {
  name: "Staff",
  description: "Join the team.",
  enabled: true,
  questions: [
    { id: "why", label: "Why do you want to join?", type: "PARAGRAPH", required: true, choices: [] },
    { id: "mic", label: "Microphone?", type: "YES_NO", required: true, choices: [] },
  ],
  cooldownDays: 0,
  onePending: true,
  requiredRoleIds: [],
  blockedRoleIds: [],
  reviewChannelId: "500000000000000001",
  reviewerRoleIds: [REVIEWER_ROLE],
  pingMemberIds: [],
  acceptRoleIds: ["400000000000000001"],
  removeRoleIds: [],
  buttonStyle: "PRIMARY",
  position: 0,
};

/** `user` decides who is signed in; `allowed` lists the permissions they hold. */
function setup() {
  const session = { userId: STAFF, roleIds: [] as string[], allowed: [] as string[] };
  const calls: { permission: string; mutation: boolean }[] = [];
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission, options) => {
      const names = typeof permission === "string" ? [permission] : [...permission];
      calls.push({ permission: names.join("|"), mutation: options.mutation });
      if (!names.some((name) => session.allowed.includes(name))) throw new AuthorizationDeniedApiError();
      return { userId: session.userId, displayName: "Jay", roleIds: session.roleIds };
    },
    member: async () => ({ userId: session.userId, displayName: session.userId === MEMBER ? "Alex" : "Jay", roleIds: session.roleIds }),
  };
  const service = new ApplicationService(new InMemoryApplicationRepository(), gateway);
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "applications-test" }),
    registerRoutes: (instance) => applicationsApiFeature(service).register(instance, context),
  });
  const as = (userId: string, allowed: string[] = [], roleIds: string[] = []) => Object.assign(session, { userId, allowed, roleIds });
  return { server, calls, as };
}

describe("application routes", () => {
  it("lets managers create forms and panels with CSRF", async () => {
    const { server, calls, as } = setup();
    as(STAFF, ["applications.manage"]);
    const created = await server.inject(json("POST", "/api/v1/applications/forms", form));
    expect(created.statusCode).toBe(200);
    const formId = created.json().data.id;
    const panel = await server.inject(json("POST", "/api/v1/applications/panels", { channelId: "500000000000000002", title: "Apply", description: "Pick one", color: "#5865F2", formIds: [formId] }));
    const published = await server.inject(json("POST", `/api/v1/applications/panels/${panel.json().data.id}/publish`, {}));
    expect(published.json().data.messageId).toBe("700000000000000009");
    expect(calls.every((call) => call.permission === "applications.manage" && call.mutation)).toBe(true);
    const listed = (await server.inject({ method: "GET", url: "/api/v1/applications/forms", headers: host })).json().data;
    expect(listed.forms).toHaveLength(1);
    expect(listed.panels).toHaveLength(1);
    const bad = await server.inject(json("PUT", `/api/v1/applications/forms/${formId}`, { ...form, questions: [] }));
    expect(bad.statusCode).toBe(400);
    expect(bad.json().errors[0].message).toContain("at least one question");
    as(MEMBER);
    expect((await server.inject(json("POST", "/api/v1/applications/forms", form))).statusCode).toBe(403);
  });

  it("lets members see forms, apply, see their own applications, and withdraw", async () => {
    const { server, as } = setup();
    as(STAFF, ["applications.manage"]);
    const formId = (await server.inject(json("POST", "/api/v1/applications/forms", form))).json().data.id;
    as(MEMBER);
    const me = (await server.inject({ method: "GET", url: "/api/v1/applications/me", headers: host })).json().data;
    expect(me.forms[0]).toMatchObject({ id: formId, name: "Staff", canApply: true });
    expect(me.forms[0].reviewChannelId).toBeUndefined();
    expect(me.can).toEqual({ review: false, manage: false });
    const missing = await server.inject(json("POST", `/api/v1/applications/forms/${formId}/submit`, { answers: { mic: "Yes" } }));
    expect(missing.statusCode).toBe(400);
    const sent = await server.inject(json("POST", `/api/v1/applications/forms/${formId}/submit`, { answers: { why: "I want to help.", mic: "Yes" } }));
    expect(sent.json().data).toMatchObject({ number: 1, status: "PENDING", source: "WEB" });
    const again = (await server.inject({ method: "GET", url: "/api/v1/applications/me", headers: host })).json().data;
    expect(again.forms[0]).toMatchObject({ canApply: false, reason: "You already have a pending Staff application (#1)." });
    expect(again.applications).toHaveLength(1);
    expect((await server.inject({ method: "GET", url: "/api/v1/applications", headers: host })).statusCode).toBe(403);
    const withdrawn = await server.inject(json("POST", `/api/v1/applications/${sent.json().data.id}/withdraw`, {}));
    expect(withdrawn.json().data.status).toBe("WITHDRAWN");
  });

  it("lets reviewers with a reviewer role list, vote, note, and decide", async () => {
    const { server, as } = setup();
    as(STAFF, ["applications.manage"]);
    const formId = (await server.inject(json("POST", "/api/v1/applications/forms", form))).json().data.id;
    as(MEMBER);
    const id = (await server.inject(json("POST", `/api/v1/applications/forms/${formId}/submit`, { answers: { why: "I want to help.", mic: "no" } }))).json().data.id;
    as("300000000000000002", [], [REVIEWER_ROLE]);
    const overview = (await server.inject({ method: "GET", url: "/api/v1/applications/overview", headers: host })).json().data;
    expect(overview).toMatchObject({ can: { review: true, manage: false }, stats: { total: 1, byStatus: { PENDING: 1 } } });
    expect((await server.inject({ method: "GET", url: "/api/v1/applications?status=PENDING", headers: host })).json().data).toHaveLength(1);
    expect((await server.inject(json("POST", `/api/v1/applications/${id}/vote`, { vote: "UP" }))).json().data.votes).toHaveLength(1);
    expect((await server.inject(json("POST", `/api/v1/applications/${id}/notes`, { body: "Solid" }))).json().data.notes[0].body).toBe("Solid");
    const decided = await server.inject(json("POST", `/api/v1/applications/${id}/decision`, { status: "DENIED", reason: "No mic" }));
    expect(decided.json().data).toMatchObject({ status: "DENIED", decisionReason: "No mic", dmDelivered: true });
    const detail = (await server.inject({ method: "GET", url: `/api/v1/applications/${id}`, headers: host })).json().data;
    expect(detail.answers[1]).toMatchObject({ answer: "No" });
    expect((await server.inject({ method: "GET", url: "/api/v1/applications/00000000-0000-0000-0000-000000000000", headers: host })).statusCode).toBe(404);
  });
});
