import { z } from "zod";
import { GiveawayError, MAX_GIVEAWAY_MINUTES, MAX_GIVEAWAY_WINNERS } from "@qbox/giveaways";
import { errorOf, featureCall, parseInput as parse, routeParam, snowflakeSchema as snowflake } from "../features/routeHelpers.js";
const safe = (operation) => featureCall(operation, errorOf(GiveawayError));
const startSchema = z.strictObject({
    prize: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    winnerCount: z.number().int().min(1).max(MAX_GIVEAWAY_WINNERS).optional(),
    channelId: snowflake,
    hostId: snowflake.optional(),
    requiredRoleIds: z.array(snowflake).max(20).optional(),
    blockedRoleIds: z.array(snowflake).max(20).optional(),
    minAccountAgeDays: z.number().int().min(0).max(3650).optional(),
    minServerDays: z.number().int().min(0).max(3650).optional(),
    bonusEntries: z.array(z.strictObject({ roleId: snowflake, entries: z.number().int().min(1).max(100) })).max(20).optional(),
    pingRoleId: snowflake.optional(),
    dmWinners: z.boolean().optional(),
    endsAt: z.string().datetime({ offset: true }).optional(),
    durationMinutes: z.number().int().min(1).max(MAX_GIVEAWAY_MINUTES).optional(),
});
const listSchema = z.object({
    state: z.enum(["active", "ended"]).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
});
/** Giveaways as a pluggable API feature under `/api/v1/giveaways`. */
export function giveawaysApiFeature(giveaways) {
    return { name: "giveaways", register: (server, context) => registerGiveawayRoutes(server, context, giveaways) };
}
function registerGiveawayRoutes(server, context, giveaways) {
    const { guard } = context;
    const actor = (identity) => ({ userId: identity.userId, displayName: identity.displayName });
    server.get("/api/v1/giveaways/overview", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await guard(request, "giveaways.manage", { mutation: false });
        const [active, ended] = await Promise.all([giveaways.list(context.guildId, "active", 100), giveaways.list(context.guildId, "ended", 100)]);
        return { data: { active, ended, maxWinners: MAX_GIVEAWAY_WINNERS } };
    });
    server.get("/api/v1/giveaways", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await guard(request, "giveaways.manage", { mutation: false });
        const query = parse(listSchema, request.query ?? {});
        return { data: await safe(() => giveaways.list(context.guildId, query.state, query.limit)) };
    });
    server.get("/api/v1/giveaways/:id", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await guard(request, "giveaways.manage", { mutation: false });
        return { data: await safe(() => giveaways.detail(context.guildId, routeParam(request, "id"))) };
    });
    server.post("/api/v1/giveaways", async (request) => {
        const identity = await guard(request, "giveaways.manage", { mutation: true });
        const { endsAt, ...rest } = parse(startSchema, request.body);
        return { data: await safe(() => giveaways.start({ ...rest, guildId: context.guildId, ...(endsAt ? { endsAt: new Date(endsAt) } : {}) }, actor(identity))) };
    });
    server.post("/api/v1/giveaways/:id/end", async (request) => {
        const identity = await guard(request, "giveaways.manage", { mutation: true });
        return { data: await safe(() => giveaways.end(context.guildId, routeParam(request, "id"), actor(identity))) };
    });
    server.post("/api/v1/giveaways/:id/reroll", async (request) => {
        await guard(request, "giveaways.manage", { mutation: true });
        const body = parse(z.strictObject({ winners: z.number().int().min(1).max(MAX_GIVEAWAY_WINNERS).optional() }), request.body ?? {});
        return { data: await safe(() => giveaways.reroll(context.guildId, routeParam(request, "id"), body.winners)) };
    });
    server.post("/api/v1/giveaways/:id/cancel", async (request) => {
        const identity = await guard(request, "giveaways.manage", { mutation: true });
        return { data: await safe(() => giveaways.cancel(context.guildId, routeParam(request, "id"), actor(identity))) };
    });
    server.post("/api/v1/giveaways/:id/pause", async (request) => {
        await guard(request, "giveaways.manage", { mutation: true });
        return { data: await safe(() => giveaways.pause(context.guildId, routeParam(request, "id"))) };
    });
    server.post("/api/v1/giveaways/:id/resume", async (request) => {
        await guard(request, "giveaways.manage", { mutation: true });
        return { data: await safe(() => giveaways.resume(context.guildId, routeParam(request, "id"))) };
    });
}
//# sourceMappingURL=GiveawayRoutes.js.map