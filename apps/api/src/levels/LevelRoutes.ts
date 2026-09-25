import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { LEVEL_CAP, LevelError, type LevelService } from "@qbox/levels";

import type { ApiFeature, ApiFeatureContext } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeParam, routeQuery, snowflakeSchema as snowflake } from "../features/routeHelpers.js";

const isLevelError = errorOf(LevelError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isLevelError);

const multiplierSchema = z.strictObject({ id: snowflake, multiplier: z.number() });

const settingsSchema = z.strictObject({
  enabled: z.boolean(),
  messageXpMin: z.number().int(),
  messageXpMax: z.number().int(),
  cooldownSeconds: z.number().int(),
  voiceXpPerMinute: z.number().int(),
  curve: z.strictObject({ base: z.number(), exponent: z.number(), linear: z.number() }),
  roleMultipliers: z.array(multiplierSchema).max(50),
  channelMultipliers: z.array(multiplierSchema).max(50),
  noXpRoleIds: z.array(snowflake).max(100),
  noXpChannelIds: z.array(snowflake).max(200),
  levelUpMode: z.enum(["CURRENT", "CHANNEL", "DM", "OFF"]),
  levelUpChannelId: snowflake.optional(),
  levelUpMessage: z.string().max(500),
  rewards: z.array(z.strictObject({ level: z.number().int(), roleId: snowflake })).max(50),
  rewardMode: z.enum(["STACK", "HIGHEST"]),
  removeRewardsOnReset: z.boolean(),
  maxLevel: z.number().int(),
  expectedRevision: z.number().int().min(0),
});

const memberActionSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("give"), xp: z.number().int(), displayName: z.string().min(1).max(100).optional() }),
  z.strictObject({ action: z.literal("take"), xp: z.number().int() }),
  z.strictObject({ action: z.literal("set-level"), level: z.number().int().min(0).max(LEVEL_CAP), displayName: z.string().min(1).max(100).optional() }),
  z.strictObject({ action: z.literal("set-xp"), xp: z.number().int(), displayName: z.string().min(1).max(100).optional() }),
  z.strictObject({ action: z.literal("reset") }),
]);

const pageSchema = z.coerce.number().int().min(1).max(100_000);

/** Levels as a pluggable API feature under `/api/v1/levels`. */
export function levelsApiFeature(levels: LevelService): ApiFeature {
  return { name: "levels", register: (server, context) => registerLevelRoutes(server, context, levels) };
}

function registerLevelRoutes(server: FastifyInstance, context: ApiFeatureContext, levels: LevelService): void {
  const { guard, member } = context;

  /** Leaderboard and the viewer's own rank, for any signed-in member. */
  server.get("/api/v1/levels/leaderboard", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const identity = await member(request, { mutation: false });
    const query = routeQuery(request);
    const page = query.page === undefined ? 1 : parse(pageSchema, query.page);
    const [board, me, canManage] = await Promise.all([
      safe(() => levels.leaderboard(context.guildId, page)),
      safe(() => levels.profile(context.guildId, identity.userId)),
      guard(request, "levels.manage", { mutation: false }).then(() => true, () => false),
    ]);
    return { data: { ...board, me, canManage } };
  });

  server.get("/api/v1/levels/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "levels.manage", { mutation: false });
    return { data: { settings: await levels.settings(context.guildId), levelCap: LEVEL_CAP } };
  });

  server.get("/api/v1/levels/members", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "levels.manage", { mutation: false });
    const search = parse(z.string().min(1).max(100), routeQuery(request).search);
    return { data: await safe(() => levels.search(context.guildId, search)) };
  });

  server.get("/api/v1/levels/members/:userId", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "levels.manage", { mutation: false });
    const userId = parse(snowflake, routeParam(request, "userId"));
    return { data: await safe(() => levels.profile(context.guildId, userId)) };
  });

  server.post("/api/v1/levels/members/:userId", async (request) => {
    await guard(request, "levels.manage", { mutation: true });
    const userId = parse(snowflake, routeParam(request, "userId"));
    const body = parse(memberActionSchema, request.body);
    switch (body.action) {
      case "give":
        return { data: await safe(() => levels.give(context.guildId, userId, body.xp, body.displayName)) };
      case "take":
        return { data: await safe(() => levels.take(context.guildId, userId, body.xp)) };
      case "set-level":
        return { data: await safe(() => levels.setLevel(context.guildId, userId, body.level, body.displayName)) };
      case "set-xp":
        return { data: await safe(() => levels.setXp(context.guildId, userId, body.xp, body.displayName)) };
      default:
        await safe(() => levels.reset(context.guildId, userId));
        return { success: true };
    }
  });

  server.put("/api/v1/levels/settings", async (request) => {
    await guard(request, "levels.manage", { mutation: true });
    const body = parse(settingsSchema, request.body);
    return { data: await safe(() => levels.saveSettings({ ...body, guildId: context.guildId })) };
  });

  server.post("/api/v1/levels/reset", async (request) => {
    await guard(request, "levels.manage", { mutation: true });
    parse(z.strictObject({ confirm: z.literal("RESET") }), request.body);
    return { data: await safe(() => levels.resetAll(context.guildId)) };
  });
}
