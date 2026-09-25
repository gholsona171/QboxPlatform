import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ENDED_BEHAVIORS, MESSAGE_TEXT_LIMIT, STREAM_PLATFORMS, StreamsError, type StreamsService } from "@qbox/streams";

import type { ApiFeature, ApiFeatureContext } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeParam, snowflakeSchema as snowflake } from "../features/routeHelpers.js";

const isStreamsError = errorOf(StreamsError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isStreamsError);

const settingsSchema = z.strictObject({
  enabled: z.boolean(),
  defaultChannelId: snowflake.optional(),
  endedBehavior: z.enum(ENDED_BEHAVIORS),
  checkIntervalSeconds: z.number().int(),
  expectedRevision: z.number().int().min(0),
});

const fieldsSchema = {
  announceChannelId: snowflake.optional(),
  pingRoleId: snowflake.optional(),
  messageText: z.string().max(MESSAGE_TEXT_LIMIT).optional(),
  announceVideos: z.boolean(),
  enabled: z.boolean(),
};
const lookupSchema = z.strictObject({ platform: z.enum(STREAM_PLATFORMS), handle: z.string().min(1).max(200) });
const createSchema = z.strictObject({ ...lookupSchema.shape, ...fieldsSchema });
const patchSchema = z.strictObject(fieldsSchema);

/** Stream announcements as a pluggable API feature under `/api/v1/streams`. */
export function streamsApiFeature(streams: StreamsService): ApiFeature {
  return { name: "streams", register: (server, context) => registerStreamsRoutes(server, context, streams) };
}

function registerStreamsRoutes(server: FastifyInstance, context: ApiFeatureContext, streams: StreamsService): void {
  const { guard } = context;
  const id = (request: Parameters<typeof routeParam>[0]) => routeParam(request, "id");

  server.get("/api/v1/streams/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "streams.manage", { mutation: false });
    const [settings, subscriptions] = await Promise.all([safe(() => streams.settings(context.guildId)), safe(() => streams.list(context.guildId))]);
    return { data: { settings, subscriptions, platforms: streams.availability() } };
  });

  server.put("/api/v1/streams/settings", async (request) => {
    await guard(request, "streams.manage", { mutation: true });
    const body = parse(settingsSchema, request.body);
    return { data: await safe(() => streams.saveSettings({ ...body, guildId: context.guildId })) };
  });

  server.post("/api/v1/streams/resolve", async (request) => {
    await guard(request, "streams.manage", { mutation: true });
    const body = parse(lookupSchema, request.body);
    return { data: await safe(() => streams.resolve(body.platform, body.handle)) };
  });

  server.post("/api/v1/streams/subscriptions", async (request, reply) => {
    await guard(request, "streams.manage", { mutation: true });
    const body = parse(createSchema, request.body);
    reply.code(201);
    return { data: await safe(() => streams.add({ ...body, guildId: context.guildId })) };
  });

  server.put("/api/v1/streams/subscriptions/:id", async (request) => {
    await guard(request, "streams.manage", { mutation: true });
    const body = parse(patchSchema, request.body);
    return { data: await safe(() => streams.update(context.guildId, id(request), body)) };
  });

  server.delete("/api/v1/streams/subscriptions/:id", async (request) => {
    await guard(request, "streams.manage", { mutation: true });
    await safe(() => streams.remove(context.guildId, id(request)));
    return { data: { deleted: true } };
  });

  server.post("/api/v1/streams/subscriptions/:id/test", async (request) => {
    await guard(request, "streams.manage", { mutation: true });
    return { data: await safe(() => streams.test(context.guildId, id(request))) };
  });
}
