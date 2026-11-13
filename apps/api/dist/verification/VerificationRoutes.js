import { z } from "zod";
import { VERIFICATION_AGE_ACTIONS, VERIFICATION_MODES, VERIFICATION_RESULTS, VerificationError, } from "@qbox/verification";
import { errorOf, featureCall, parseInput as parse, snowflakeSchema as snowflake } from "../features/routeHelpers.js";
const isVerificationError = errorOf(VerificationError);
const safe = (operation) => featureCall(operation, isVerificationError);
const settingsSchema = z.strictObject({
    enabled: z.boolean(),
    mode: z.enum(VERIFICATION_MODES),
    verifiedRoleIds: z.array(snowflake).max(10),
    unverifiedRoleId: snowflake.optional(),
    channelId: snowflake.optional(),
    panel: z.strictObject({ title: z.string().max(256), description: z.string().max(4000), color: z.string().max(7), buttonLabel: z.string().max(80) }),
    questions: z.array(z.strictObject({ id: z.string().max(40), prompt: z.string().max(100), answers: z.array(z.string().max(100)).max(20) })).max(5),
    logChannelId: snowflake.optional(),
    minAccountAgeDays: z.number().int(),
    ageAction: z.enum(VERIFICATION_AGE_ACTIONS),
    kickUnverifiedMinutes: z.number().int(),
    maxAttempts: z.number().int(),
    cooldownMinutes: z.number().int(),
    dmOnSuccess: z.boolean(),
    successMessage: z.string().max(1000).optional(),
    welcomeChannelId: snowflake.optional(),
    welcomeMessage: z.string().max(2000).optional(),
    expectedRevision: z.number().int().min(0),
});
const attemptsSchema = z.object({
    result: z.string().optional(),
    userId: snowflake.optional(),
    search: z.string().max(100).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
});
const reasonSchema = z.strictObject({ reason: z.string().max(500).optional() });
/** Verification as a pluggable API feature under `/api/v1/verification`. */
export function verificationApiFeature(verification) {
    return { name: "verification", register: (server, context) => registerVerificationRoutes(server, context, verification) };
}
function registerVerificationRoutes(server, context, verification) {
    const { guard } = context;
    const staff = (identity) => ({ userId: identity.userId, displayName: identity.displayName, source: "WEB" });
    const userIdOf = (params) => parse(snowflake, Reflect.get(params, "userId"));
    const allowed = (request, permission) => guard(request, permission, { mutation: false }).then(() => true, () => false);
    server.get("/api/v1/verification/overview", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await guard(request, ["verification.manage", "verification.members"], { mutation: false });
        const [settings, stats, manage, members] = await Promise.all([
            verification.settings(context.guildId),
            verification.stats(context.guildId),
            allowed(request, "verification.manage"),
            allowed(request, "verification.members"),
        ]);
        return { data: { settings, stats, can: { manage, members } } };
    });
    server.get("/api/v1/verification/attempts", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await guard(request, ["verification.manage", "verification.members"], { mutation: false });
        const query = parse(attemptsSchema, request.query ?? {});
        const results = query.result?.split(",").filter((result) => VERIFICATION_RESULTS.includes(result));
        return {
            data: await safe(() => verification.attempts({
                guildId: context.guildId,
                ...(results?.length ? { results } : {}),
                ...(query.userId ? { userId: query.userId } : {}),
                ...(query.search ? { search: query.search } : {}),
                ...(query.limit ? { limit: query.limit } : {}),
            })),
        };
    });
    server.get("/api/v1/verification/members/:userId", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await guard(request, "verification.members", { mutation: false });
        const userId = userIdOf(request.params);
        return { data: await safe(() => verification.status(context.guildId, userId)) };
    });
    server.post("/api/v1/verification/members/:userId/verify", async (request) => {
        const identity = await guard(request, "verification.members", { mutation: true });
        const userId = userIdOf(request.params);
        const body = parse(reasonSchema, request.body ?? {});
        return { data: await safe(() => verification.manualVerify(context.guildId, userId, staff(identity), body.reason)) };
    });
    server.post("/api/v1/verification/members/:userId/unverify", async (request) => {
        const identity = await guard(request, "verification.members", { mutation: true });
        const userId = userIdOf(request.params);
        const body = parse(reasonSchema, request.body ?? {});
        return { data: await safe(() => verification.unverify(context.guildId, userId, staff(identity), body.reason)) };
    });
    server.put("/api/v1/verification/settings", async (request) => {
        await guard(request, "verification.manage", { mutation: true });
        const body = parse(settingsSchema, request.body);
        return { data: await safe(() => verification.saveSettings({ ...body, guildId: context.guildId })) };
    });
    server.post("/api/v1/verification/panel", async (request) => {
        await guard(request, "verification.manage", { mutation: true });
        return { data: await safe(() => verification.publishPanel(context.guildId)) };
    });
}
//# sourceMappingURL=VerificationRoutes.js.map