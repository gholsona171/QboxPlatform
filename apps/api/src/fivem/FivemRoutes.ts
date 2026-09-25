import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { FivemError, type FivemService } from "@qbox/fivem";

import type { ApiFeature, ApiFeatureContext } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, snowflakeSchema as snowflake } from "../features/routeHelpers.js";

const isFivemError = errorOf(FivemError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isFivemError);

const settingsSchema = z.strictObject({
  serverAddress: z.string().max(260).optional(),
  connectUrl: z.string().max(100).optional(),
  statusChannelId: snowflake.optional(),
  updateIntervalSeconds: z.number().int(),
  alertChannelId: snowflake.optional(),
  alertRoleId: snowflake.optional(),
  restartTimes: z.array(z.string().max(5)).max(24),
  timeZone: z.string().min(1).max(64),
  restartWarningMinutes: z.array(z.number().int()).max(6),
  expectedRevision: z.number().int().min(0),
});

/** FiveM server status as a pluggable API feature under `/api/v1/fivem`. */
export function fivemApiFeature(fivem: FivemService): ApiFeature {
  return { name: "fivem-server", register: (server, context) => registerFivemRoutes(server, context, fivem) };
}

function registerFivemRoutes(server: FastifyInstance, context: ApiFeatureContext, fivem: FivemService): void {
  const { guildId, guard, member } = context;

  server.get("/api/v1/fivem/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await member(request, { mutation: false });
    const manage = await guard(request, "fivem.manage", { mutation: false }).then(() => true, () => false);
    const { settings, state } = await fivem.config(guildId);
    return {
      data: {
        configured: settings.serverAddress !== undefined,
        connectUrl: settings.connectUrl,
        restartTimes: settings.restartTimes,
        timeZone: settings.timeZone,
        onlineSince: state.lastOnline ? state.onlineSince : undefined,
        lastPolledAt: state.lastPolledAt,
        ...(manage ? { settings } : {}),
        can: { manage },
      },
    };
  });

  server.get("/api/v1/fivem/status", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await member(request, { mutation: false });
    return { data: await safe(() => fivem.status(guildId)) };
  });

  server.get("/api/v1/fivem/history", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await member(request, { mutation: false });
    const query = parse(z.object({ range: z.enum(["24h", "7d"]).optional() }), request.query ?? {});
    return { data: await safe(() => fivem.history(guildId, query.range ?? "24h")) };
  });

  server.put("/api/v1/fivem/settings", async (request) => {
    await guard(request, "fivem.manage", { mutation: true });
    const body = parse(settingsSchema, request.body);
    return { data: await safe(() => fivem.saveSettings({ ...body, guildId })) };
  });

  server.post("/api/v1/fivem/test", async (request) => {
    await guard(request, "fivem.manage", { mutation: true });
    const body = parse(z.strictObject({ serverAddress: z.string().min(1).max(260) }), request.body);
    return { data: await safe(() => fivem.test(body.serverAddress)) };
  });
}
