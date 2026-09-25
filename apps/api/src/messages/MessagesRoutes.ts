import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { BRAND } from "@qbox/shared/brand";
import { MessagesError, type MessageTemplateService } from "@qbox/messages";

import type { ApiFeature, ApiFeatureContext } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeParam, snowflakeSchema as snowflake } from "../features/routeHelpers.js";

const isMessagesError = errorOf(MessagesError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isMessagesError);

const lookSchema = z.strictObject({
  enabled: z.boolean(),
  accentColor: z.string().max(16).optional(),
  footerText: z.string().max(2048).optional(),
  footerIconUrl: z.string().max(2048).optional(),
  authorName: z.string().max(256).optional(),
  authorIconUrl: z.string().max(2048).optional(),
  thumbnailUrl: z.string().max(2048).optional(),
  showTimestamp: z.boolean(),
  mode: z.enum(["fill", "override"]),
  expectedRevision: z.number().int().min(0),
});

/** Discord message JSON as the editor and embed builders export it; the service validates the details. */
const draftSchema = z.object({
  content: z.string().max(4000).nullable().optional(),
  embeds: z.array(z.unknown()).max(25).optional(),
});

const templateSchema = draftSchema.extend({ enabled: z.boolean().optional() });

/** Look & Messages as a pluggable API feature under `/api/v1/messages`. */
export function messagesApiFeature(messages: MessageTemplateService): ApiFeature {
  return { name: "messages", register: (server, context) => registerMessagesRoutes(server, context, messages) };
}

function registerMessagesRoutes(server: FastifyInstance, context: ApiFeatureContext, messages: MessageTemplateService): void {
  const { guard } = context;
  const key = (request: Parameters<typeof routeParam>[0]) => routeParam(request, "key");
  const draftOf = (body: z.infer<typeof draftSchema>) => ({ ...(body.content === null ? {} : { content: body.content }), embeds: body.embeds });

  server.get("/api/v1/messages/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "messages.manage", { mutation: false });
    const [look, templates] = await Promise.all([safe(() => messages.getLook(context.guildId)), safe(() => messages.list(context.guildId))]);
    return { data: { look, templates, brand: BRAND.name, can: { manage: true } } };
  });

  server.put("/api/v1/messages/look", async (request) => {
    await guard(request, "messages.manage", { mutation: true });
    const body = parse(lookSchema, request.body);
    return { data: await safe(() => messages.saveLook({ ...body, guildId: context.guildId })) };
  });

  server.get("/api/v1/messages/templates", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "messages.manage", { mutation: false });
    return { data: await safe(() => messages.list(context.guildId)) };
  });

  server.put("/api/v1/messages/templates/:key", async (request) => {
    const actor = await guard(request, "messages.manage", { mutation: true });
    const body = parse(templateSchema, request.body);
    return { data: await safe(() => messages.save(context.guildId, key(request), { enabled: body.enabled, ...draftOf(body) }, actor.userId)) };
  });

  server.delete("/api/v1/messages/templates/:key", async (request) => {
    await guard(request, "messages.manage", { mutation: true });
    return { data: await safe(() => messages.reset(context.guildId, key(request))) };
  });

  server.post("/api/v1/messages/templates/:key/preview", async (request) => {
    await guard(request, "messages.manage", { mutation: true });
    const body = parse(draftSchema, request.body);
    return { data: await safe(() => messages.preview(context.guildId, key(request), draftOf(body))) };
  });

  server.post("/api/v1/messages/templates/:key/test", async (request) => {
    await guard(request, "messages.manage", { mutation: true });
    const body = parse(draftSchema.extend({ channelId: snowflake }), request.body);
    const { channelId, ...draft } = body;
    const hasDraft = draft.content !== undefined || draft.embeds !== undefined;
    return { data: await safe(() => messages.sendTest(context.guildId, key(request), channelId, hasDraft ? draftOf(draft) : undefined)) };
  });
}
