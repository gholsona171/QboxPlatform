import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { logger } from "@qbox/logger";
import {
  BUILDER_CATEGORY_PURPOSES,
  BUILDER_CHANNEL_EMOJIS,
  BUILDER_CHANNEL_PURPOSES,
  BUILDER_EMOJI_SEPARATORS,
  BUILDER_LIMITS,
  BUILDER_CHANNEL_TYPES,
  BUILDER_LINKS,
  BUILDER_PERMISSIONS,
  BUILDER_ROLE_PURPOSES,
  BUILDER_START_MODES,
  BUILDER_SECTIONS,
  BUILDER_SERVER_TYPES,
  BUILDER_STAFF_ACCESS,
  BuilderError,
  type BuilderService,
} from "@qbox/server-builder";

import { ForbiddenApiError } from "../errors/ApiError.js";
import type { ApiFeature, ApiFeatureContext } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeParam, routeQuery } from "../features/routeHelpers.js";

const isBuilderError = errorOf(BuilderError);
/** Maps a builder FORBIDDEN to a 403 with its message; everything else goes through the usual mapping. */
const safe = <T>(operation: () => Promise<T>) =>
  featureCall(async () => {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof BuilderError && error.code === "FORBIDDEN") throw new ForbiddenApiError(error.message);
      throw error;
    }
  }, isBuilderError);

const enumOf = <T extends string>(values: readonly T[]) => z.enum(values as [T, ...T[]]);
const permission = enumOf(BUILDER_PERMISSIONS);
const key = z.string().min(1).max(60);
const name = z.string().min(1).max(100);

const overwriteSchema = z.strictObject({ target: z.string().min(1).max(60), allow: z.array(permission).max(40), deny: z.array(permission).max(40) });

const emoji = z.string().min(1).max(100);
const forumSchema = z.strictObject({
  guidelines: z.string().max(4096).optional(),
  tags: z.array(z.strictObject({ name: z.string().min(1).max(20), emoji: emoji.optional() })).max(20),
  defaultReactionEmoji: emoji.optional(),
  firstPost: z.strictObject({ title: z.string().min(1).max(100), content: z.string().min(1).max(2000), pin: z.boolean() }).optional(),
});

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
  forum: forumSchema.optional(),
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
  staffAccess: enumOf(BUILDER_STAFF_ACCESS).default("ALL"),
  include: z.strictObject(Object.fromEntries(BUILDER_SECTIONS.map((section) => [section, z.boolean()])) as Record<(typeof BUILDER_SECTIONS)[number], z.ZodBoolean>),
  voiceLounges: z.number().int(),
  useMediaChannels: z.boolean(),
  emojiCategories: z.boolean(),
  channelEmojis: enumOf(BUILDER_CHANNEL_EMOJIS).default("ALL"),
  emojiSeparator: enumOf(BUILDER_EMOJI_SEPARATORS).default("BAR"),
  description: z.string().max(BUILDER_LIMITS.description).optional(),
});

const draftSchema = z.strictObject({ answers: answersSchema, blueprint: blueprintSchema, expectedRevision: z.number().int().min(0) });
const generateSchema = z.strictObject({ answers: answersSchema, save: z.boolean().optional(), expectedRevision: z.number().int().min(0).optional() });
const designSchema = z.strictObject({ prompt: z.string().min(1).max(BUILDER_LIMITS.description), expectedRevision: z.number().int().min(0) });
const wipeIncludeSchema = z.strictObject({ channels: z.boolean(), roles: z.boolean(), emojis: z.boolean() });
const runSchema = z.strictObject({
  mode: enumOf(BUILDER_START_MODES),
  links: z.array(enumOf(BUILDER_LINKS)).max(BUILDER_LINKS.length),
  confirmName: z.string().min(1).max(100).optional(),
  include: wipeIncludeSchema.optional(),
});
const wipeSchema = z.strictObject({ confirmName: z.string().min(1).max(100), include: wipeIncludeSchema });
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

  const platformOwnerOf = async (request: Parameters<typeof guard>[0]): Promise<boolean> =>
    context.platformOwner ? context.platformOwner(request).catch(() => false) : false;

  server.get("/api/v1/builder/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const identity = await guard(request, "builder.manage", { mutation: false });
    const platformOwner = await platformOwnerOf(request);
    return { data: await safe(() => builder.overview(context.guildId, { userId: identity.userId, displayName: identity.displayName, roleIds: identity.roleIds }, { platformOwner })) };
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

  server.post("/api/v1/builder/design", async (request) => {
    const identity = await guard(request, "builder.manage", { mutation: true });
    const body = parse(designSchema, request.body);
    return { data: await safe(() => builder.designFromPrompt(context.guildId, body.prompt, body.expectedRevision, identity.userId)) };
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
    const platformOwner = body.mode === "WIPE_AND_BUILD" ? await platformOwnerOf(request) : false;
    const run = await safe(() => builder.startRun(context.guildId, body, { userId: identity.userId, displayName: identity.displayName, roleIds: identity.roleIds }, { platformOwner }));
    reply.code(202);
    return { data: run };
  });

  server.get("/api/v1/builder/wipe/preview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "builder.manage", { mutation: false });
    return { data: await safe(() => builder.wipePreview(context.guildId)) };
  });

  server.post("/api/v1/builder/wipe", async (request, reply) => {
    const identity = await guard(request, "builder.manage", { mutation: true });
    const body = parse(wipeSchema, request.body);
    const platformOwner = await platformOwnerOf(request);
    const run = await safe(() => builder.startWipe(context.guildId, body, { userId: identity.userId, displayName: identity.displayName, roleIds: identity.roleIds }, { platformOwner }));
    reply.code(202);
    return { data: run };
  });

  server.post("/api/v1/builder/runs/:id/load-blueprint", async (request) => {
    const identity = await guard(request, "builder.manage", { mutation: true });
    return { data: await safe(() => builder.loadBlueprintFromRun(context.guildId, routeParam(request, "id"), { userId: identity.userId, displayName: identity.displayName })) };
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
