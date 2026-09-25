import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  SCHEDULE_TYPES,
  ScheduledMessageError,
  describeSchedule,
  type ScheduleType,
  type ScheduledMessage,
  type ScheduledMessageService,
} from "@qbox/scheduled-messages";

import type { ApiFeature, ApiFeatureContext } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeParam, routeQuery, snowflakeSchema as snowflake } from "../features/routeHelpers.js";

const isScheduledMessageError = errorOf(ScheduledMessageError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isScheduledMessageError);

const messageSchema = z.strictObject({
  name: z.string().max(100),
  channelId: snowflake,
  content: z.string().max(2000).optional(),
  embed: z.strictObject({
    title: z.string().max(256).optional(),
    description: z.string().max(4096).optional(),
    color: z.string().max(7).optional(),
    imageUrl: z.string().max(2000).optional(),
    footer: z.string().max(2048).optional(),
    fields: z.array(z.strictObject({ name: z.string().max(256), value: z.string().max(1024), inline: z.boolean() })).max(25),
  }).optional(),
  pingRoleIds: z.array(snowflake).max(10),
  schedule: z.strictObject({
    type: z.enum(SCHEDULE_TYPES as [ScheduleType, ...ScheduleType[]]),
    timeZone: z.string().max(64),
    runAt: z.string().max(16).optional(),
    intervalMinutes: z.number().int().optional(),
    time: z.string().max(5).optional(),
    weekdays: z.array(z.number().int()).max(7).optional(),
    dayOfMonth: z.number().int().optional(),
    startDate: z.string().max(10).optional(),
    endDate: z.string().max(10).optional(),
  }),
  enabled: z.boolean(),
  deletePrevious: z.boolean(),
  pin: z.boolean(),
  maxRuns: z.number().int().optional(),
});

/** Scheduled messages as a pluggable API feature under `/api/v1/scheduled-messages`. */
export function scheduledMessagesApiFeature(scheduled: ScheduledMessageService): ApiFeature {
  return { name: "scheduled-messages", register: (server, context) => registerScheduledMessageRoutes(server, context, scheduled) };
}

function registerScheduledMessageRoutes(server: FastifyInstance, context: ApiFeatureContext, scheduled: ScheduledMessageService): void {
  const { guard } = context;

  server.get("/api/v1/scheduled-messages", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "scheduled.manage", { mutation: false });
    return { data: (await safe(() => scheduled.list(context.guildId))).map(view) };
  });

  server.get("/api/v1/scheduled-messages/runs", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "scheduled.manage", { mutation: false });
    const query = parse(z.object({ messageId: z.string().max(64).optional(), limit: z.coerce.number().int().min(1).max(200).optional() }), routeQuery(request));
    return { data: await safe(() => scheduled.runs(context.guildId, query.messageId, query.limit)) };
  });

  server.post("/api/v1/scheduled-messages", async (request) => {
    const identity = await guard(request, "scheduled.manage", { mutation: true });
    const body = parse(messageSchema, request.body);
    return { data: view(await safe(() => scheduled.create({ ...body, guildId: context.guildId }, identity.userId))) };
  });

  server.put("/api/v1/scheduled-messages/:id", async (request) => {
    await guard(request, "scheduled.manage", { mutation: true });
    const body = parse(messageSchema, request.body);
    return { data: view(await safe(() => scheduled.update(context.guildId, routeParam(request, "id"), { ...body, guildId: context.guildId }))) };
  });

  server.delete("/api/v1/scheduled-messages/:id", async (request) => {
    await guard(request, "scheduled.manage", { mutation: true });
    await safe(() => scheduled.delete(context.guildId, routeParam(request, "id")));
    return { success: true };
  });

  server.post("/api/v1/scheduled-messages/:id/send", async (request) => {
    await guard(request, "scheduled.manage", { mutation: true });
    return { data: await safe(() => scheduled.sendNow(context.guildId, routeParam(request, "id"))) };
  });

  for (const [action, enabled] of [["pause", false], ["resume", true]] as const) {
    server.post(`/api/v1/scheduled-messages/:id/${action}`, async (request) => {
      await guard(request, "scheduled.manage", { mutation: true });
      return { data: view(await safe(() => scheduled.setEnabled(context.guildId, routeParam(request, "id"), enabled))) };
    });
  }
}

function view(message: ScheduledMessage) {
  return { ...message, summary: describeSchedule(message.schedule) };
}
