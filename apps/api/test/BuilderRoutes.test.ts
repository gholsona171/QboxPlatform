import { describe, expect, it } from "vitest";
import {
  BuilderService,
  InMemoryBuilderRepository,
  templateFor,
  type BuilderGateway,
  type BuilderLinkPort,
} from "@qbox/server-builder";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { builderApiFeature } from "../src/builder/BuilderRoutes.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";

const GUILD = "100000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });

function gateway(): BuilderGateway {
  let next = 700000000000000001n;
  return {
    listRoles: async () => [],
    listChannels: async () => [],
    botStatus: async () => ({ userId: "900000000000000001", permissions: 8n, topRolePosition: 5, highestRolePosition: 5, community: true }),
    createRole: async () => String(next++),
    setRolePositions: async () => undefined,
    createChannel: async () => String(next++),
    createForumPost: async () => ({ threadId: String(next++) }),
    pinForumPost: async () => undefined,
    deleteChannel: async () => undefined,
    deleteRole: async () => undefined,
  };
}

function setup(allowed: readonly string[] = ["builder.manage"]) {
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
  const tasks: (() => Promise<void>)[] = [];
  const links: BuilderLinkPort = { apply: async (link) => `${link} linked` };
  const repository = new InMemoryBuilderRepository();
  const service = new BuilderService(repository, gateway(), links, { schedule: (task) => void tasks.push(task) });
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "builder-test" }),
    registerRoutes: (instance) => builderApiFeature(service).register(instance, context),
  });
  const settle = () => Promise.all(tasks.splice(0).map((task) => task()));
  return { server, calls, settle, repository };
}

describe("server builder routes", () => {
  it("requires builder.manage, with CSRF for changes", async () => {
    const denied = setup([]);
    expect((await denied.server.inject({ method: "GET", url: "/api/v1/builder/overview", headers: host })).statusCode).toBe(403);
    const { server, calls } = setup();
    const overview = await server.inject({ method: "GET", url: "/api/v1/builder/overview", headers: host });
    expect(overview.statusCode).toBe(200);
    expect(overview.json().data.templates.map((template: { type: string }) => template.type)).toEqual(["FIVEM_RP", "GAMING", "COMMUNITY", "BUSINESS"]);
    expect(overview.json().data.preflight.ready).toBe(true);
    await server.inject(json("POST", "/api/v1/builder/generate", { answers: templateFor("GAMING").answers }));
    expect(calls).toEqual([{ permission: "builder.manage", mutation: false }, { permission: "builder.manage", mutation: true }]);
  });

  it("generates, saves drafts with revisions, and rejects invalid blueprints", async () => {
    const { server } = setup();
    const answers = templateFor("FIVEM_RP").answers;
    const preview = (await server.inject(json("POST", "/api/v1/builder/generate", { answers }))).json().data;
    expect(preview.summary.channels).toBeGreaterThanOrEqual(80);
    expect(preview.revision).toBeUndefined();
    const saved = (await server.inject(json("POST", "/api/v1/builder/generate", { answers, save: true, expectedRevision: 0 }))).json().data;
    expect(saved.revision).toBe(1);
    const renamed = { ...saved.blueprint, categories: saved.blueprint.categories.map((category: { key: string; name: string }, index: number) => index === 0 ? { ...category, name: "Welcome Area" } : category) };
    const updated = await server.inject(json("PUT", "/api/v1/builder/draft", { answers, blueprint: renamed, expectedRevision: 1 }));
    expect(updated.json().data.blueprint.categories[0].name).toBe("Welcome Area");
    const stale = await server.inject(json("PUT", "/api/v1/builder/draft", { answers, blueprint: renamed, expectedRevision: 1 }));
    expect(stale.statusCode).toBe(409);
    const broken = { ...renamed, categories: [{ key: "bad", name: "Bad", overwrites: [{ target: "ghost", allow: ["ViewChannel"], deny: [] }], channels: [] }] };
    const invalid = await server.inject(json("PUT", "/api/v1/builder/draft", { answers, blueprint: broken, expectedRevision: 2 }));
    expect(invalid.statusCode).toBe(400);
    expect(invalid.json().errors[0].message).toContain("not in the blueprint");
  });

  it("accepts edited access, forum setup, and the staff access answer", async () => {
    const { server } = setup();
    const { staffAccess: _staffAccess, ...legacy } = templateFor("FIVEM_RP").answers;
    const saved = (await server.inject(json("POST", "/api/v1/builder/generate", { answers: legacy, save: true, expectedRevision: 0 }))).json().data;
    expect(saved.answers.staffAccess).toBe("ALL");
    const help = saved.blueprint.categories.flatMap((category: { channels: { name: string; type: string }[] }) => category.channels).find((channel: { name: string }) => channel.name === "help");
    expect(help.forum.firstPost.pin).toBe(true);
    const edited = {
      ...saved.blueprint,
      categories: saved.blueprint.categories.map((category: { channels: { name: string; overwrites: unknown[]; forum?: unknown }[] }) => ({
        ...category,
        channels: category.channels.map((channel) => channel.name === "help"
          ? {
            ...channel,
            overwrites: [{ target: "@everyone", allow: [], deny: ["ViewChannel"] }, { target: "dept-ems", allow: ["ViewChannel", "SendMessages"], deny: [] }],
            forum: { guidelines: "Be kind.", tags: [{ name: "Question", emoji: "❓" }, { name: "Custom", emoji: "pepe:123456789012345678" }], defaultReactionEmoji: "👍", firstPost: { title: "Hi", content: "Read this.", pin: false } },
          }
          : channel),
      })),
    };
    const answers = { ...legacy, staffAccess: "NONE" };
    const updated = await server.inject(json("PUT", "/api/v1/builder/draft", { answers, blueprint: edited, expectedRevision: 1 }));
    expect(updated.statusCode).toBe(200);
    expect(updated.json().data.answers.staffAccess).toBe("NONE");
    expect(updated.json().data.access.help).toEqual({ see: "Verified, EMS", post: "Verified, EMS" });
    const tooMany = { ...edited, categories: edited.categories.map((category: { channels: { name: string; forum?: { tags: unknown[] } }[] }) => ({ ...category, channels: category.channels.map((channel) => channel.name === "help" ? { ...channel, forum: { ...channel.forum, tags: Array.from({ length: 21 }, (_, index) => ({ name: `t${index}` })) } } : channel) })) };
    expect((await server.inject(json("PUT", "/api/v1/builder/draft", { answers, blueprint: tooMany, expectedRevision: 2 }))).statusCode).toBe(400);
    expect((await server.inject(json("PUT", "/api/v1/builder/draft", { answers: { ...answers, staffAccess: "SOME" }, blueprint: edited, expectedRevision: 2 }))).statusCode).toBe(400);
  });

  it("starts a run in the background, reports progress, and undoes it", async () => {
    const { server, settle } = setup();
    await server.inject(json("POST", "/api/v1/builder/generate", { answers: templateFor("COMMUNITY").answers, save: true, expectedRevision: 0 }));
    const started = await server.inject(json("POST", "/api/v1/builder/runs", { mode: "ADD", links: ["moderation", "levels"] }));
    expect(started.statusCode).toBe(202);
    const run = started.json().data;
    expect(run.status).toBe("QUEUED");
    const conflict = await server.inject(json("POST", "/api/v1/builder/runs", { mode: "ADD", links: [] }));
    expect(conflict.statusCode).toBe(409);
    await settle();
    const detail = (await server.inject({ method: "GET", url: `/api/v1/builder/runs/${run.id}`, headers: host })).json().data;
    expect(detail.run.status).toBe("SUCCEEDED");
    expect(detail.items.filter((item: { kind: string }) => item.kind === "LINK").map((item: { note: string }) => item.note)).toEqual(["moderation linked", "levels linked"]);
    expect((await server.inject({ method: "GET", url: "/api/v1/builder/runs", headers: host })).json().data).toHaveLength(1);
    const undo = await server.inject(json("POST", `/api/v1/builder/runs/${run.id}/undo`, {}));
    expect(undo.statusCode).toBe(202);
    await settle();
    expect((await server.inject({ method: "GET", url: `/api/v1/builder/runs/${run.id}`, headers: host })).json().data.run.status).toBe("UNDONE");
    expect((await server.inject({ method: "GET", url: "/api/v1/builder/runs/unknown", headers: host })).statusCode).toBe(404);
    expect((await server.inject(json("POST", "/api/v1/builder/runs", { mode: "WIPE", links: [] }))).statusCode).toBe(400);
  });

  it("marks runs interrupted by a restart as failed when the server starts", async () => {
    const { server, repository } = setup();
    await repository.createRun({ guildId: GUILD, mode: "ADD", links: [], planned: 1, startedById: "1", startedByName: "Jay" });
    await server.ready();
    expect((await repository.listRuns(GUILD, 1))[0]).toMatchObject({ status: "FAILED" });
  });
});
