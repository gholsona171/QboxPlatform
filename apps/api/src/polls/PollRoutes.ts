import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { MAX_POLL_MINUTES, MAX_POLL_OPTIONS, PollError, type PollActor, type PollService } from "@qbox/polls";

import type { ApiFeature, ApiFeatureContext } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeParam, snowflakeSchema as snowflake } from "../features/routeHelpers.js";

const safe = <T>(operation: () => Promise<T>) => featureCall(operation, errorOf(PollError));

const createSchema = z.strictObject({
  question: z.string().min(1).max(200),
  options: z.array(z.strictObject({ label: z.string().min(1).max(80), emoji: z.string().max(64).optional() })).min(2).max(MAX_POLL_OPTIONS),
  maxChoices: z.number().int().min(1).max(MAX_POLL_OPTIONS).optional(),
  anonymous: z.boolean().optional(),
  resultsVisibility: z.enum(["LIVE", "AFTER_CLOSE"]).optional(),
  allowVoteChange: z.boolean().optional(),
  allowedRoleIds: z.array(snowflake).max(25).optional(),
  channelId: snowflake,
  pingRoleId: snowflake.optional(),
  endsAt: z.string().datetime({ offset: true }).optional(),
  durationMinutes: z.number().int().min(1).max(MAX_POLL_MINUTES).optional(),
});

const reopenSchema = z.strictObject({
  endsAt: z.string().datetime({ offset: true }).optional(),
  durationMinutes: z.number().int().min(1).max(MAX_POLL_MINUTES).optional(),
});

const listSchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

/** Polls as a pluggable API feature under `/api/v1/polls`. */
export function pollsApiFeature(polls: PollService): ApiFeature {
  return { name: "polls", register: (server, context) => registerPollRoutes(server, context, polls) };
}

function registerPollRoutes(server: FastifyInstance, context: ApiFeatureContext, polls: PollService): void {
  const { guard } = context;
  const canManage = (request: FastifyRequest) => guard(request, "polls.manage", { mutation: false }).then(() => true, () => false);
  const canCreate = (request: FastifyRequest) => guard(request, "polls.create", { mutation: false }).then(() => true, () => false);
  /** Staff with polls.create or polls.manage. */
  const staff = async (request: FastifyRequest, mutation: boolean): Promise<PollActor> => {
    const identity = await guard(request, ["polls.create", "polls.manage"], { mutation });
    return { userId: identity.userId, displayName: identity.displayName, canManage: await canManage(request) };
  };

  server.get("/api/v1/polls/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const actor = await staff(request, false);
    const [open, closed, create] = await Promise.all([polls.list(context.guildId, "OPEN", 100), polls.list(context.guildId, "CLOSED", 100), canCreate(request)]);
    return { data: { open, closed, me: actor.userId, can: { create, manage: actor.canManage }, maxOptions: MAX_POLL_OPTIONS } };
  });

  server.get("/api/v1/polls", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await staff(request, false);
    const query = parse(listSchema, request.query ?? {});
    return { data: await safe(() => polls.list(context.guildId, query.status, query.limit)) };
  });

  server.get("/api/v1/polls/:id", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const actor = await staff(request, false);
    return { data: await safe(() => polls.results(context.guildId, routeParam(request, "id"), actor)) };
  });

  server.get("/api/v1/polls/:id/export", async (request, reply) => {
    const actor = await staff(request, false);
    const file = await safe(() => polls.exportCsv(context.guildId, routeParam(request, "id"), actor));
    return reply
      .header("cache-control", "no-store")
      .header("content-type", "text/csv; charset=utf-8")
      .header("content-disposition", `attachment; filename="${file.fileName}"`)
      .send(file.content);
  });

  server.post("/api/v1/polls", async (request) => {
    const identity = await guard(request, "polls.create", { mutation: true });
    const { endsAt, ...rest } = parse(createSchema, request.body);
    const actor = { userId: identity.userId, displayName: identity.displayName, canManage: await canManage(request) };
    return {
      data: await safe(() => polls.create({ ...rest, guildId: context.guildId, ...(endsAt ? { endsAt: new Date(endsAt) } : {}) }, actor)),
    };
  });

  server.post("/api/v1/polls/:id/close", async (request) => {
    const actor = await staff(request, true);
    return { data: await safe(() => polls.close(context.guildId, routeParam(request, "id"), actor)) };
  });

  server.post("/api/v1/polls/:id/reopen", async (request) => {
    const actor = await staff(request, true);
    const body = parse(reopenSchema, request.body ?? {});
    return { data: await safe(() => polls.reopen(context.guildId, routeParam(request, "id"), actor, body.endsAt ? new Date(body.endsAt) : undefined, body.durationMinutes)) };
  });

  server.delete("/api/v1/polls/:id", async (request) => {
    const actor = await staff(request, true);
    await safe(() => polls.delete(context.guildId, routeParam(request, "id"), actor));
    return { success: true };
  });
}

