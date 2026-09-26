import { describe, expect, it } from "vitest";
import {
  BuilderService,
  InMemoryBuilderRepository,
  templateFor,
  type BlueprintDesigner,
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

function gateway(ownerId = "300000000000000001"): BuilderGateway {
  let next = 700000000000000001n;
  return {
    listRoles: async () => [],
    listChannels: async () => [],
    botStatus: async () => ({ userId: "900000000000000001", permissions: 8n, topRolePosition: 5, highestRolePosition: 5, community: true, ownerId }),
    createRole: async () => String(next++),
    setRolePositions: async () => undefined,
    createChannel: async () => String(next++),
    createForumPost: async () => ({ threadId: String(next++) }),
    pinForumPost: async () => undefined,
    deleteChannel: async () => undefined,
    deleteRole: async () => undefined,
    readLayout: async () => ({ name: "Test City", community: false, roles: [], channels: [] }),
    listEmojis: async () => [],
    listStickers: async () => [],
    deleteEmoji: async () => undefined,
    deleteSticker: async () => undefined,
  };
}

function setup(allowed: readonly string[] = ["builder.manage"], designer?: BlueprintDesigner, options: { ownerId?: string; platformOwner?: boolean } = {}) {
  const calls: { permission: string; mutation: boolean }[] = [];
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission, opts) => {
      const name = typeof permission === "string" ? permission : permission.join("|");
      calls.push({ permission: name, mutation: opts.mutation });
      if (!allowed.includes(name)) throw new AuthorizationDeniedApiError();
      return { userId: "300000000000000001", displayName: "Jay", roleIds: [] };
    },
    member: async () => ({ userId: "300000000000000001", displayName: "Jay", roleIds: [] }),
    platformOwner: async () => options.platformOwner === true,
  };
  const tasks: (() => Promise<void>)[] = [];
  const links: BuilderLinkPort = { apply: async (link) => `${link} linked` };
  const repository = new InMemoryBuilderRepository();
  const service = new BuilderService(repository, gateway(options.ownerId ?? "300000000000000001"), links, { schedule: (task) => void tasks.push(task), designer });
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
    const help = saved.blueprint.categories.flatMap((category: { channels: { name: string; type: string }[] }) => category.channels).find((channel: { name: string }) => channel.name.endsWith("help"));
    expect(help.forum.firstPost.pin).toBe(true);
    const edited = {
      ...saved.blueprint,
      categories: saved.blueprint.categories.map((category: { channels: { name: string; overwrites: unknown[]; forum?: unknown }[] }) => ({
        ...category,
        channels: category.channels.map((channel) => channel.name.endsWith("help")
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
    const tooMany = { ...edited, categories: edited.categories.map((category: { channels: { name: string; forum?: { tags: unknown[] } }[] }) => ({ ...category, channels: category.channels.map((channel) => channel.name.endsWith("help") ? { ...channel, forum: { ...channel.forum, tags: Array.from({ length: 21 }, (_, index) => ({ name: `t${index}` })) } } : channel) })) };
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

  it("accepts the channel emoji answers and defaults them for older drafts", async () => {
    const { server } = setup();
    const { channelEmojis: _mode, emojiSeparator: _separator, ...legacy } = templateFor("GAMING").answers;
    const saved = (await server.inject(json("POST", "/api/v1/builder/generate", { answers: legacy, save: true, expectedRevision: 0 }))).json().data;
    expect(saved.answers).toMatchObject({ channelEmojis: "ALL", emojiSeparator: "BAR" });
    const names = saved.blueprint.categories.flatMap((category: { channels: { name: string }[] }) => category.channels.map((channel) => channel.name));
    expect(names).toContain("👋┃welcome");
    const spaced = (await server.inject(json("POST", "/api/v1/builder/generate", { answers: { ...legacy, channelEmojis: "KEY", emojiSeparator: "SPACE", description: "A gaming server" } }))).json().data;
    const spacedNames = spaced.blueprint.categories.flatMap((category: { channels: { name: string }[] }) => category.channels.map((channel) => channel.name));
    expect(spacedNames).toContain("👋-welcome");
    expect(spacedNames).toContain("general");
    expect((await server.inject(json("POST", "/api/v1/builder/generate", { answers: { ...legacy, channelEmojis: "SOME" } }))).statusCode).toBe(400);
  });

  it("designs a draft from a description, or says the AI designer is missing", async () => {
    const without = setup();
    expect((await without.server.inject({ method: "GET", url: "/api/v1/builder/overview", headers: host })).json().data.aiAvailable).toBe(false);
    const missing = await without.server.inject(json("POST", "/api/v1/builder/design", { prompt: "A Rust server", expectedRevision: 0 }));
    expect(missing.statusCode).toBe(503);
    expect(missing.json().errors[0].message).toContain("OPENAI_API_KEY");

    const prompts: string[] = [];
    const designer: BlueprintDesigner = {
      design: async (prompt) => {
        prompts.push(prompt);
        return {
          serverType: "GAMING",
          serverName: "Rust Haven",
          extraCategories: [{ name: "Trading", emoji: "💰", access: "everyone", channels: [{ name: "market", type: "TEXT" }] }],
          summary: "A Rust community with a market.",
        };
      },
    };
    const { server, calls } = setup(["builder.manage"], designer);
    expect((await server.inject({ method: "GET", url: "/api/v1/builder/overview", headers: host })).json().data.aiAvailable).toBe(true);
    const designed = await server.inject(json("POST", "/api/v1/builder/design", { prompt: "A Rust community with a market", expectedRevision: 0 }));
    expect(designed.statusCode).toBe(200);
    expect(designed.json().data.summary).toBe("A Rust community with a market.");
    expect(designed.json().data.draft).toMatchObject({ revision: 1, answers: { serverType: "GAMING", serverName: "Rust Haven", description: "A Rust community with a market" } });
    expect(designed.json().data.draft.blueprint.categories.map((category: { name: string }) => category.name)).toContain("💰 TRADING");
    expect(prompts).toEqual(["A Rust community with a market"]);
    expect(calls.at(-1)).toEqual({ permission: "builder.manage", mutation: true });
    expect((await server.inject(json("POST", "/api/v1/builder/design", { prompt: "Again", expectedRevision: 0 }))).statusCode).toBe(409);
    expect((await server.inject(json("POST", "/api/v1/builder/design", { prompt: "", expectedRevision: 1 }))).statusCode).toBe(400);
    expect((await server.inject(json("POST", "/api/v1/builder/design", { prompt: "x".repeat(2001), expectedRevision: 1 }))).statusCode).toBe(400);

    const junk = setup(["builder.manage"], { design: async () => ({ nope: true }) as never });
    const unexpected = await junk.server.inject(json("POST", "/api/v1/builder/design", { prompt: "Hi", expectedRevision: 0 }));
    expect(unexpected.statusCode).toBe(503);
    expect(unexpected.json().errors[0].message).toContain("unexpected");
  });

  it("previews and starts a wipe for the owner, and refuses non-owners", async () => {
    const owner = setup();
    const preview = await owner.server.inject({ method: "GET", url: "/api/v1/builder/wipe/preview", headers: host });
    expect(preview.statusCode).toBe(200);
    expect(preview.json().data).toMatchObject({ serverName: "Test City", channels: 0, roles: 0 });
    const started = await owner.server.inject(json("POST", "/api/v1/builder/wipe", { confirmName: "Test City", include: { channels: true, roles: true, emojis: false } }));
    expect(started.statusCode).toBe(202);
    expect(started.json().data.mode).toBe("WIPE");
    /* The name must match exactly. */
    const mismatch = setup();
    expect((await mismatch.server.inject(json("POST", "/api/v1/builder/wipe", { confirmName: "test city", include: { channels: true, roles: true, emojis: false } }))).statusCode).toBe(400);
    /* A member who is not the owner, an admin, or a platform owner gets 403. */
    const denied = setup(["builder.manage"], undefined, { ownerId: "999999999999999999" });
    const forbidden = await denied.server.inject(json("POST", "/api/v1/builder/wipe", { confirmName: "Test City", include: { channels: true, roles: true, emojis: false } }));
    expect(forbidden.statusCode).toBe(403);
    expect(forbidden.json().detail).toBe("Only the server owner or an administrator can wipe the server.");
    /* A platform owner is allowed even when not the guild owner. */
    const platform = setup(["builder.manage"], undefined, { ownerId: "999999999999999999", platformOwner: true });
    expect((await platform.server.inject(json("POST", "/api/v1/builder/wipe", { confirmName: "Test City", include: { channels: true, roles: true, emojis: false } }))).statusCode).toBe(202);
    /* The overview tells the portal whether the viewer may wipe. */
    expect((await owner.server.inject({ method: "GET", url: "/api/v1/builder/overview", headers: host })).json().data.wipe.allowed).toBe(true);
    expect((await denied.server.inject({ method: "GET", url: "/api/v1/builder/overview", headers: host })).json().data.wipe.allowed).toBe(false);
  });

  it("wipes then builds, and can load a wipe snapshot back as a blueprint", async () => {
    const { server, settle } = setup();
    await server.inject(json("POST", "/api/v1/builder/generate", { answers: templateFor("COMMUNITY").answers, save: true, expectedRevision: 0 }));
    const started = await server.inject(json("POST", "/api/v1/builder/runs", { mode: "WIPE_AND_BUILD", links: [], confirmName: "Test City", include: { channels: true, roles: true, emojis: false } }));
    expect(started.statusCode).toBe(202);
    const run = started.json().data;
    expect(run.mode).toBe("WIPE_AND_BUILD");
    await settle();
    const detail = (await server.inject({ method: "GET", url: `/api/v1/builder/runs/${run.id}`, headers: host })).json().data;
    expect(detail.run.status).toBe("SUCCEEDED");
    expect(detail.run.snapshot).toBeUndefined();
    const loaded = await server.inject(json("POST", `/api/v1/builder/runs/${run.id}/load-blueprint`, {}));
    expect(loaded.statusCode).toBe(200);
    expect(Array.isArray(loaded.json().data.notes)).toBe(true);
  });

  it("marks runs interrupted by a restart as failed when the server starts", async () => {
    const { server, repository } = setup();
    await repository.createRun({ guildId: GUILD, mode: "ADD", links: [], planned: 1, startedById: "1", startedByName: "Jay" });
    await server.ready();
    expect((await repository.listRuns(GUILD, 1))[0]).toMatchObject({ status: "FAILED" });
  });
});
