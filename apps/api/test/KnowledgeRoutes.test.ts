import { describe, expect, it } from "vitest";
import { InMemoryKnowledgeRepository, KnowledgeService, defaultKnowledgeSettings, type KnowledgeGateway } from "@qbox/knowledge-base";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { AuthorizationDeniedApiError } from "../src/errors/ApiError.js";
import type { ApiFeatureContext } from "../src/features/ApiFeature.js";
import { knowledgeApiFeature } from "../src/knowledge/KnowledgeRoutes.js";

const GUILD = "100000000000000001";
const host = { host: "127.0.0.1:3000" };
const json = (method: "POST" | "PUT" | "DELETE", url: string, payload: unknown) => ({ method, url, payload: payload as Record<string, unknown>, headers: { ...host, "content-type": "application/json" } });
const article = { title: "How to join", body: "Press **F8** and connect.", tags: ["Join"], published: true, pinned: false };

function setup(allowed: readonly string[]) {
  const calls: { permission: string; mutation: boolean }[] = [];
  const posts: string[] = [];
  const gateway: KnowledgeGateway = {
    postEmbed: async (channelId) => { posts.push(channelId); return { messageId: "700000000000000001" }; },
    replyEmbed: async () => undefined,
  };
  const context: ApiFeatureContext = {
    guildId: GUILD,
    guard: async (_request, permission, options) => {
      const name = typeof permission === "string" ? permission : permission.join("|");
      calls.push({ permission: name, mutation: options.mutation });
      if (!allowed.includes(name)) throw new AuthorizationDeniedApiError();
      return { userId: "300000000000000001", displayName: "Jay", roleIds: [] };
    },
    member: async () => ({ userId: "300000000000000002", displayName: "Sam", roleIds: [] }),
  };
  const service = new KnowledgeService(new InMemoryKnowledgeRepository(), gateway);
  const server = createApiServer({
    configuration: ApiConfiguration.from({ environment: "test", publicBaseUrl: "http://127.0.0.1:3000", buildVersion: "kb-test" }),
    registerRoutes: (instance) => knowledgeApiFeature(service).register(instance, context),
  });
  return { server, calls, posts };
}

describe("knowledge routes", () => {
  it("lets managers write articles and members read published ones", async () => {
    const { server, calls } = setup(["knowledge.manage"]);
    const created = (await server.inject(json("POST", "/api/v1/knowledge/articles", article))).json().data;
    expect(created).toMatchObject({ slug: "how-to-join", tags: ["join"], authorName: "Jay" });
    await server.inject(json("POST", "/api/v1/knowledge/articles", { ...article, title: "Draft rules", published: false }));
    expect(calls[0]).toEqual({ permission: "knowledge.manage", mutation: true });
    const overview = (await server.inject({ method: "GET", url: "/api/v1/knowledge/overview", headers: host })).json().data;
    expect(overview.can.manage).toBe(true);
    expect(overview.articles).toHaveLength(2);
    expect(overview.articles[0].body).toBeUndefined();

    const memberView = setup([]);
    expect((await memberView.server.inject({ method: "GET", url: "/api/v1/knowledge/overview", headers: host })).json().data).toMatchObject({ can: { manage: false }, articles: [] });
    expect((await memberView.server.inject(json("POST", "/api/v1/knowledge/articles", article))).statusCode).toBe(403);
  });

  it("searches, shows, and counts views for members", async () => {
    const { server } = setup(["knowledge.manage"]);
    const created = (await server.inject(json("POST", "/api/v1/knowledge/articles", article))).json().data;
    await server.inject(json("POST", "/api/v1/knowledge/articles", { ...article, title: "Hidden join draft", published: false }));
    const found = (await server.inject({ method: "GET", url: "/api/v1/knowledge/articles?search=join&status=published", headers: host })).json().data;
    expect(found.map((item: { title: string }) => item.title)).toEqual(["How to join"]);
    expect(found[0].match).toBe(100);
    expect((await server.inject({ method: "GET", url: "/api/v1/knowledge/articles?status=draft", headers: host })).json().data).toHaveLength(1);
    expect((await server.inject({ method: "GET", url: `/api/v1/knowledge/articles/${created.id}`, headers: host })).json().data.body).toContain("F8");
    expect((await server.inject({ method: "GET", url: "/api/v1/knowledge/articles/missing-slug", headers: host })).statusCode).toBe(404);
  });

  it("manages categories, settings, and posting", async () => {
    const { server, posts } = setup(["knowledge.manage"]);
    const category = (await server.inject(json("POST", "/api/v1/knowledge/categories", { name: "Start", emoji: "🚀", order: 0 }))).json().data;
    expect((await server.inject(json("PUT", `/api/v1/knowledge/categories/${category.id}`, { name: "Getting started", order: 1 }))).json().data).toMatchObject({ name: "Getting started", order: 1 });
    const created = (await server.inject(json("POST", "/api/v1/knowledge/articles", { ...article, categoryId: category.id }))).json().data;
    expect((await server.inject(json("POST", `/api/v1/knowledge/articles/${created.id}/post`, { channelId: "500000000000000001" }))).statusCode).toBe(200);
    expect(posts).toEqual(["500000000000000001"]);
    expect((await server.inject(json("DELETE", `/api/v1/knowledge/categories/${category.id}`, {}))).statusCode).toBe(200);
    const { guildId: _guild, revision: _revision, ...defaults } = defaultKnowledgeSettings(GUILD);
    const saved = await server.inject(json("PUT", "/api/v1/knowledge/settings", { ...defaults, autoAnswerEnabled: true, expectedRevision: 0 }));
    expect(saved.json().data.revision).toBe(1);
    const stale = await server.inject(json("PUT", "/api/v1/knowledge/settings", { ...defaults, expectedRevision: 0 }));
    expect(stale.statusCode).toBe(409);
    const bad = await server.inject(json("PUT", "/api/v1/knowledge/settings", { ...defaults, autoAnswerThreshold: 500, expectedRevision: 1 }));
    expect(bad.statusCode).toBe(400);
    expect((await server.inject(json("DELETE", `/api/v1/knowledge/articles/${created.id}`, {}))).statusCode).toBe(200);
  });
});
