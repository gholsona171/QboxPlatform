import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import type { Permission } from "@qbox/permissions";
import { CASE_TYPES, MAX_TIMEOUT_MINUTES, ModerationError, type CaseType, type ModerationService, type Moderator } from "@qbox/moderation";

import { ValidationApiError } from "../errors/ApiError.js";
import type { ApiFeature, ApiFeatureContext, ApiIdentity } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, snowflakeSchema as snowflake } from "../features/routeHelpers.js";

const isModerationError = errorOf(ModerationError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isModerationError);

const ACTION_PERMISSIONS: Readonly<Record<CaseType, Permission>> = {
  WARN: "moderation.warn",
  NOTE: "moderation.warn",
  TIMEOUT: "moderation.timeout",
  UNTIMEOUT: "moderation.timeout",
  KICK: "moderation.kick",
  BAN: "moderation.ban",
  UNBAN: "moderation.ban",
  SOFTBAN: "moderation.ban",
};

const CAPABILITIES: readonly (readonly [string, Permission])[] = [
  ["warn", "moderation.warn"],
  ["timeout", "moderation.timeout"],
  ["kick", "moderation.kick"],
  ["ban", "moderation.ban"],
  ["messages", "moderation.messages"],
  ["manage", "moderation.manage"],
];

const ruleSchema = z.strictObject({ enabled: z.boolean(), action: z.enum(["DELETE", "WARN", "TIMEOUT"]), timeoutMinutes: z.number().int() });

const settingsSchema = z.strictObject({
  logChannelId: snowflake.optional(),
  dmOnAction: z.boolean(),
  dmIncludeModerator: z.boolean(),
  appealMessage: z.string().max(500).optional(),
  requireReason: z.boolean(),
  defaultTimeoutMinutes: z.number().int(),
  banDeleteMessageHours: z.number().int(),
  warningExpiryDays: z.number().int(),
  protectedRoleIds: z.array(snowflake).max(25),
  escalation: z.array(z.strictObject({ warnings: z.number().int(), action: z.enum(["TIMEOUT", "KICK", "BAN"]), durationMinutes: z.number().int() })).max(10),
  automod: z.strictObject({
    enabled: z.boolean(),
    exemptRoleIds: z.array(snowflake).max(50),
    exemptChannelIds: z.array(snowflake).max(100),
    spam: ruleSchema.extend({ maxMessages: z.number().int(), perSeconds: z.number().int() }),
    invites: ruleSchema,
    links: ruleSchema.extend({ allowedDomains: z.array(z.string().max(253)).max(100) }),
    words: ruleSchema.extend({ words: z.array(z.string().max(64)).max(500) }),
    mentions: ruleSchema.extend({ maxMentions: z.number().int() }),
    caps: ruleSchema.extend({ minLength: z.number().int(), percent: z.number().int() }),
  }),
  recordExternalActions: z.boolean(),
  expectedRevision: z.number().int().min(0),
});

const actionSchema = z.strictObject({
  type: z.enum(CASE_TYPES as [CaseType, ...CaseType[]]),
  userId: snowflake,
  displayName: z.string().min(1).max(100).optional(),
  reason: z.string().max(1000).optional(),
  durationMinutes: z.number().int().min(1).max(525_600).optional(),
  deleteMessageHours: z.number().int().min(0).max(168).optional(),
  evidence: z.array(z.string().url().max(1000)).max(10).optional(),
});

const listSchema = z.object({
  type: z.string().optional(),
  userId: snowflake.optional(),
  moderatorId: snowflake.optional(),
  active: z.enum(["true", "false"]).optional(),
  source: z.enum(["DISCORD", "WEB", "AUTOMOD", "EXTERNAL"]).optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

/** Moderation as a pluggable API feature under `/api/v1/moderation`. */
export function moderationApiFeature(moderation: ModerationService): ApiFeature {
  return { name: "moderation", register: (server, context) => registerModerationRoutes(server, context, moderation) };
}

function registerModerationRoutes(server: FastifyInstance, context: ApiFeatureContext, moderation: ModerationService): void {
  const { guard } = context;
  const moderator = (identity: ApiIdentity): Moderator => ({ userId: identity.userId, displayName: identity.displayName, source: "WEB" });
  const caseNumber = (request: FastifyRequest) => {
    const value = Number(Reflect.get(request.params as object, "number"));
    if (!Number.isInteger(value) || value < 1) throw new ValidationApiError([{ path: "number", code: "invalid", message: "Case number is invalid." }]);
    return value;
  };

  server.get("/api/v1/moderation/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "moderation.view", { mutation: false });
    const [settings, stats, recent, capabilities] = await Promise.all([
      moderation.settings(context.guildId),
      moderation.stats(context.guildId),
      moderation.list({ guildId: context.guildId, limit: 25 }),
      Promise.all(CAPABILITIES.map(async ([name, permission]) => [name, await guard(request, permission, { mutation: false }).then(() => true, () => false)] as const)),
    ]);
    return { data: { settings, stats, recent, can: Object.fromEntries(capabilities), maxTimeoutMinutes: MAX_TIMEOUT_MINUTES } };
  });

  server.get("/api/v1/moderation/cases", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "moderation.view", { mutation: false });
    const query = parse(listSchema, request.query ?? {});
    const types = query.type?.split(",").filter((type): type is CaseType => (CASE_TYPES as readonly string[]).includes(type));
    return {
      data: await safe(() => moderation.list({
        guildId: context.guildId,
        ...(types?.length ? { types } : {}),
        ...(query.userId ? { targetId: query.userId } : {}),
        ...(query.moderatorId ? { moderatorId: query.moderatorId } : {}),
        ...(query.active ? { active: query.active === "true" } : {}),
        ...(query.source ? { source: query.source } : {}),
        ...(query.search ? { search: query.search } : {}),
        ...(query.limit ? { limit: query.limit } : {}),
      })),
    };
  });

  server.get("/api/v1/moderation/cases/:number", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "moderation.view", { mutation: false });
    return { data: await safe(() => moderation.getCase(context.guildId, caseNumber(request))) };
  });

  server.get("/api/v1/moderation/members/:userId", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "moderation.view", { mutation: false });
    const userId = parse(snowflake, Reflect.get(request.params as object, "userId"));
    return { data: await safe(() => moderation.history(context.guildId, userId)) };
  });

  server.post("/api/v1/moderation/actions", async (request) => {
    const body = parse(actionSchema, request.body);
    const identity = await guard(request, ACTION_PERMISSIONS[body.type], { mutation: true });
    return {
      data: await safe(() => moderation.act({
        guildId: context.guildId,
        type: body.type,
        target: { userId: body.userId, displayName: body.displayName ?? body.userId },
        moderator: moderator(identity),
        reason: body.reason,
        durationMinutes: body.durationMinutes,
        deleteMessageHours: body.deleteMessageHours,
        evidence: body.evidence,
      })),
    };
  });

  server.patch("/api/v1/moderation/cases/:number", async (request) => {
    const identity = await guard(request, "moderation.manage", { mutation: true });
    const body = parse(z.strictObject({ reason: z.string().min(1).max(1000) }), request.body);
    return { data: await safe(() => moderation.updateReason(context.guildId, caseNumber(request), moderator(identity), body.reason)) };
  });

  server.post("/api/v1/moderation/cases/:number/pardon", async (request) => {
    const identity = await guard(request, "moderation.manage", { mutation: true });
    const body = parse(z.strictObject({ reason: z.string().max(1000).optional() }), request.body ?? {});
    return { data: await safe(() => moderation.revoke(context.guildId, caseNumber(request), moderator(identity), body.reason)) };
  });

  server.post("/api/v1/moderation/cases/:number/evidence", async (request) => {
    await guard(request, "moderation.manage", { mutation: true });
    const body = parse(z.strictObject({ url: z.string().max(1000) }), request.body);
    return { data: await safe(() => moderation.addEvidence(context.guildId, caseNumber(request), body.url)) };
  });

  server.put("/api/v1/moderation/settings", async (request) => {
    await guard(request, "moderation.manage", { mutation: true });
    const body = parse(settingsSchema, request.body);
    return { data: await safe(() => moderation.saveSettings({ ...body, guildId: context.guildId })) };
  });

  server.post("/api/v1/moderation/channels/:channelId/lock", async (request) => {
    const identity = await guard(request, "moderation.messages", { mutation: true });
    const channelId = parse(snowflake, Reflect.get(request.params as object, "channelId"));
    const body = parse(z.strictObject({ locked: z.boolean(), reason: z.string().max(500).optional() }), request.body);
    await safe(() => moderation.lock(context.guildId, channelId, body.locked, moderator(identity), body.reason));
    return { success: true };
  });

  server.post("/api/v1/moderation/channels/:channelId/slowmode", async (request) => {
    const identity = await guard(request, "moderation.messages", { mutation: true });
    const channelId = parse(snowflake, Reflect.get(request.params as object, "channelId"));
    const body = parse(z.strictObject({ seconds: z.number().int() }), request.body);
    await safe(() => moderation.slowmode(context.guildId, channelId, body.seconds, moderator(identity)));
    return { success: true };
  });

  server.post("/api/v1/moderation/channels/:channelId/purge", async (request) => {
    const identity = await guard(request, "moderation.messages", { mutation: true });
    const channelId = parse(snowflake, Reflect.get(request.params as object, "channelId"));
    const body = parse(z.strictObject({ count: z.number().int(), userId: snowflake.optional() }), request.body);
    return { data: { deleted: await safe(() => moderation.purge(context.guildId, channelId, body.count, moderator(identity), body.userId)) } };
  });
}
