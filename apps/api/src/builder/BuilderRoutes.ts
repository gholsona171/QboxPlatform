import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { logger } from "@qbox/logger";
import {
  BUILDER_CATEGORY_PURPOSES,
  BUILDER_CHANNEL_PURPOSES,
  BUILDER_CHANNEL_TYPES,
  BUILDER_LINKS,
  BUILDER_PERMISSIONS,
  BUILDER_ROLE_PURPOSES,
  BUILDER_RUN_MODES,
  BUILDER_SECTIONS,
  BUILDER_SERVER_TYPES,
  BuilderError,
  type BuilderService,
} from "@qbox/server-builder";

import type { ApiFeature, ApiFeatureContext } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeParam, routeQuery } from "../features/routeHelpers.js";

const isBuilderError = errorOf(BuilderError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isBuilderError);

const enumOf = <T extends string>(values: readonly T[]) => z.enum(values as [T, ...T[]]);
const permission = enumOf(BUILDER_PERMISSIONS);
const key = z.string().min(1).max(60);
const name = z.string().min(1).max(100);

const overwriteSchema = z.strictObject({ target: z.string().min(1).max(60), allow: z.array(permission).max(40), deny: z.array(permission).max(40) });

const channelSchema = z.strictObject({
  key,
  name,
  type: enumOf(BUILDER_CHANNEL_TYPES),
  topic: z.string().max(1024).optional(),
  slowmodeSeconds: z.number().int(),
  nsfw: z.boolean(),
  userLimit: z.number().int(),
  overwrites: z.array(overwriteSchema).max(100),
  purpose: enumOf(BUILDER_CHANNEL_PURPOSES).optional(),
});

const blueprintSchema = z.strictObject({
  roles: z.array(z.strictObject({
    key,
    name,
    color: z.string().max(7),
    hoist: z.boolean(),
    mentionable: z.boolean(),
    permissions: z.array(permission).max(40),
    purpose: enumOf(BUILDER_ROLE_PURPOSES).optional(),
  })).max(250),
  categories: z.array(z.strictObject({
    key,
    name,
    overwrites: z.array(overwriteSchema).max(100),
    channels: z.array(channelSchema).max(50),
    purpose: enumOf(BUILDER_CATEGORY_PURPOSES).optional(),
  })).max(500),
});

const answersSchema = z.strictObject({
  serverType: enumOf(BUILDER_SERVER_TYPES),
  serverName: z.string().max(100),
  staffRanks: z.array(z.string().max(60)).max(15),
  departments: z.array(z.string().max(60)).max(20),
  include: z.strictObject(Object.fromEntries(BUILDER_SECTIONS.map((section) => [section, z.boolean()])) as Record<(typeof BUILDER_SECTIONS)[number], z.ZodBoolean>),
  voiceLounges: z.number().int(),
  useMediaChannels: z.boolean(),
  emojiCategories: z.boolean(),
});

const draftSchema = z.strictObject({ answers: answersSchema, blueprint: blueprintSchema, expectedRevision: z.number().int().min(0) });
const generateSchema = z.strictObject({ answers: answersSchema, save: z.boolean().optional(), expectedRevision: z.number().int().min(0).optional() });
const runSchema = z.strictObject({ mode: enumOf(BUILDER_RUN_MODES), links: z.array(enumOf(BUILDER_LINKS)).max(BUILDER_LINKS.length) });
const listSchema = z.object({ limit: z.coerce.number().int().min(1).max(100).optional() });

/** Server builder as a pluggable API feature under `/api/v1/builder`. */
export function builderApiFeature(builder: BuilderService): ApiFeature {
  return { name: "server-builder", register: (server, context) => registerBuilderRoutes(server, context, builder) };
}

function registerBuilderRoutes(server: FastifyInstance, context: ApiFeatureContext, builder: BuilderService): void {
  const { guard } = context;

  server.addHook("onReady", async () => {
    try {
      const failed = await builder.recoverInterrupted();
      if (failed > 0) logger.warn({ failed }, "Server builder runs interrupted by a restart were marked failed.");
    } catch (error) {
      logger.error({ err: error, operation: "builder-recover" }, "Could not check for interrupted server builder runs.");
    }
  });

  server.get("/api/v1/builder/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "builder.manage", { mutation: false });
    return { data: await safe(() => builder.overview(context.guildId)) };
  });

  server.put("/api/v1/builder/draft", async (request) => {
    const identity = await guard(request, "builder.manage", { mutation: true });
    const body = parse(draftSchema, request.body);
    return {
      data: await safe(() => builder.saveDraft({
        guildId: context.guildId,
        answers: body.answers,
        blueprint: body.blueprint,
        updatedById: identity.userId,
        expectedRevision: body.expectedRevision,
      })),
    };
  });

  server.post("/api/v1/builder/generate", async (request) => {
    const identity = await guard(request, "builder.manage", { mutation: true });
    const body = parse(generateSchema, request.body);
    const answers = body.answers;
    return {
      data: await safe(async () => {
        const plan = await builder.generate(answers);
        if (!body.save) return plan;
        return builder.saveDraft({ guildId: context.guildId, answers, blueprint: plan.blueprint, updatedById: identity.userId, expectedRevision: body.expectedRevision });
      }),
    };
  });

  server.get("/api/v1/builder/runs", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "builder.manage", { mutation: false });
    const query = parse(listSchema, routeQuery(request));
    return { data: await safe(() => builder.runs(context.guildId, query.limit)) };
  });

  server.post("/api/v1/builder/runs", async (request, reply) => {
    const identity = await guard(request, "builder.manage", { mutation: true });
    const body = parse(runSchema, request.body);
    const run = await safe(() => builder.startRun(context.guildId, body, { userId: identity.userId, displayName: identity.displayName }));
    reply.code(202);
    return { data: run };
  });

  server.get("/api/v1/builder/runs/:id", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "builder.manage", { mutation: false });
    return { data: await safe(() => builder.run(context.guildId, routeParam(request, "id"))) };
  });

  server.post("/api/v1/builder/runs/:id/undo", async (request, reply) => {
    await guard(request, "builder.manage", { mutation: true });
    const run = await safe(() => builder.undo(context.guildId, routeParam(request, "id")));
    reply.code(202);
    return { data: run };
  });
}
