import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { KnowledgeError, type KnowledgeService } from "@qbox/knowledge-base";

import type { ApiFeature, ApiFeatureContext, ApiIdentity } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeParam, snowflakeSchema as snowflake } from "../features/routeHelpers.js";

const isKnowledgeError = errorOf(KnowledgeError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isKnowledgeError);

const settingsSchema = z.strictObject({
  autoAnswerEnabled: z.boolean(),
  autoAnswerChannelIds: z.array(snowflake).max(50),
  autoAnswerThreshold: z.number().int(),
  autoAnswerCooldownSeconds: z.number().int(),
  expectedRevision: z.number().int().min(0),
});

const categorySchema = z.strictObject({
  name: z.string().max(50),
  emoji: z.string().max(64).optional(),
  order: z.number().int(),
});

const articleSchema = z.strictObject({
  title: z.string().max(150),
  slug: z.string().max(80).optional(),
  body: z.string().max(20_000),
  tags: z.array(z.string().max(40)).max(20),
  categoryId: z.string().uuid().optional(),
  published: z.boolean(),
  pinned: z.boolean(),
});

const listSchema = z.object({
  search: z.string().max(200).optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["published", "draft"]).optional(),
});

/** Knowledge base as a pluggable API feature under `/api/v1/knowledge`. */
export function knowledgeApiFeature(knowledge: KnowledgeService): ApiFeature {
  return { name: "knowledge-base", register: (server, context) => registerKnowledgeRoutes(server, context, knowledge) };
}

function registerKnowledgeRoutes(server: FastifyInstance, context: ApiFeatureContext, knowledge: KnowledgeService): void {
  const { guildId, guard, member } = context;
  const editor = (identity: ApiIdentity) => ({ userId: identity.userId, displayName: identity.displayName });
  /** Signed-in member; `manage` is true when they hold knowledge.manage. */
  const reader = async (request: FastifyRequest) => {
    await member(request, { mutation: false });
    return guard(request, "knowledge.manage", { mutation: false }).then(() => true, () => false);
  };

  server.get("/api/v1/knowledge/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const manage = await reader(request);
    const [categories, articles, settings] = await Promise.all([
      knowledge.categories(guildId),
      knowledge.list(guildId, { includeDrafts: manage, limit: 500 }),
      manage ? knowledge.settings(guildId) : Promise.resolve(undefined),
    ]);
    return { data: { categories, articles: articles.map(summary), ...(settings ? { settings } : {}), can: { manage } } };
  });

  server.get("/api/v1/knowledge/articles", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const manage = await reader(request);
    const query = parse(listSchema, request.query ?? {});
    const includeDrafts = manage && query.status !== "published";
    const options = { includeDrafts, ...(query.categoryId ? { categoryId: query.categoryId } : {}) };
    const search = query.search?.trim();
    const articles = search
      ? (await safe(() => knowledge.search(guildId, search, { ...options, limit: 100 }))).map((result) => ({ ...summary(result.article), score: result.score, match: result.match }))
      : (await safe(() => knowledge.list(guildId, { ...options, limit: 500 }))).map(summary);
    return { data: query.status === "draft" ? articles.filter((article) => !article.published) : articles };
  });

  server.get("/api/v1/knowledge/articles/:id", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const manage = await reader(request);
    const id = routeParam(request, "id");
    return { data: await safe(() => (manage ? knowledge.article(guildId, id, true) : knowledge.view(guildId, id))) };
  });

  server.post("/api/v1/knowledge/articles", async (request) => {
    const identity = await guard(request, "knowledge.manage", { mutation: true });
    const body = parse(articleSchema, request.body);
    return { data: await safe(() => knowledge.createArticle(guildId, body, editor(identity))) };
  });

  server.put("/api/v1/knowledge/articles/:id", async (request) => {
    const identity = await guard(request, "knowledge.manage", { mutation: true });
    const body = parse(articleSchema, request.body);
    return { data: await safe(() => knowledge.updateArticle(guildId, routeParam(request, "id"), body, editor(identity))) };
  });

  server.delete("/api/v1/knowledge/articles/:id", async (request) => {
    await guard(request, "knowledge.manage", { mutation: true });
    await safe(() => knowledge.deleteArticle(guildId, routeParam(request, "id")));
    return { success: true };
  });

  server.post("/api/v1/knowledge/articles/:id/post", async (request) => {
    await guard(request, "knowledge.manage", { mutation: true });
    const body = parse(z.strictObject({ channelId: snowflake }), request.body);
    return { data: await safe(() => knowledge.post(guildId, routeParam(request, "id"), body.channelId)) };
  });

  server.post("/api/v1/knowledge/categories", async (request) => {
    await guard(request, "knowledge.manage", { mutation: true });
    const body = parse(categorySchema, request.body);
    return { data: await safe(() => knowledge.createCategory(guildId, body)) };
  });

  server.put("/api/v1/knowledge/categories/:id", async (request) => {
    await guard(request, "knowledge.manage", { mutation: true });
    const body = parse(categorySchema, request.body);
    return { data: await safe(() => knowledge.updateCategory(guildId, routeParam(request, "id"), body)) };
  });

  server.delete("/api/v1/knowledge/categories/:id", async (request) => {
    await guard(request, "knowledge.manage", { mutation: true });
    await safe(() => knowledge.deleteCategory(guildId, routeParam(request, "id")));
    return { success: true };
  });

  server.put("/api/v1/knowledge/settings", async (request) => {
    await guard(request, "knowledge.manage", { mutation: true });
    const body = parse(settingsSchema, request.body);
    return { data: await safe(() => knowledge.saveSettings({ ...body, guildId })) };
  });
}

/** Article without its body, for lists. */
function summary<T extends { readonly body: string }>(article: T) {
  const { body, ...rest } = article;
  return { ...rest, excerpt: body.replace(/[#*_`>[\]()-]/g, "").replace(/\s+/g, " ").trim().slice(0, 160) };
}
