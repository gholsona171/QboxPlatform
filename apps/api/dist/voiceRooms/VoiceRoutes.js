import { z } from "zod";
import { MAX_HUBS, VoiceError } from "@qbox/voice-rooms";
import { errorOf, featureCall, parseInput as parse, routeParam, snowflakeSchema as snowflake } from "../features/routeHelpers.js";
import { BRAND } from "@qbox/shared/brand";
const isVoiceError = errorOf(VoiceError);
const safe = (operation) => featureCall(operation, isVoiceError);
const hubSchema = z.strictObject({
    name: z.string().max(60),
    enabled: z.boolean(),
    channelId: snowflake,
    categoryId: snowflake.optional(),
    nameTemplate: z.string().max(100),
    userLimit: z.number().int(),
    bitrateKbps: z.number().int(),
    privateByDefault: z.boolean(),
    deleteDelaySeconds: z.number().int(),
    allowedRoleIds: z.array(snowflake).max(25),
});
const settingsSchema = z.strictObject({
    enabled: z.boolean(),
    controlPanel: z.boolean(),
    allowClaim: z.boolean(),
    expectedRevision: z.number().int().min(0),
});
/** Voice rooms as a pluggable API feature under `/api/v1/voice`. */
export function voiceRoomsApiFeature(voice) {
    return { name: "voice-rooms", register: (server, context) => registerVoiceRoutes(server, context, voice) };
}
function registerVoiceRoutes(server, context, voice) {
    const { guard } = context;
    server.get("/api/v1/voice/overview", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await guard(request, "voice.manage", { mutation: false });
        const [settings, hubs, rooms] = await Promise.all([voice.settings(context.guildId), voice.hubs(context.guildId), voice.rooms(context.guildId)]);
        return { data: { settings, hubs, rooms, maxHubs: MAX_HUBS } };
    });
    server.put("/api/v1/voice/settings", async (request) => {
        await guard(request, "voice.manage", { mutation: true });
        const body = parse(settingsSchema, request.body);
        return { data: await safe(() => voice.saveSettings({ ...body, guildId: context.guildId })) };
    });
    server.post("/api/v1/voice/hubs", async (request) => {
        await guard(request, "voice.manage", { mutation: true });
        const body = parse(hubSchema, request.body);
        return { data: await safe(() => voice.createHub(context.guildId, body)) };
    });
    server.put("/api/v1/voice/hubs/:hubId", async (request) => {
        await guard(request, "voice.manage", { mutation: true });
        const body = parse(hubSchema, request.body);
        return { data: await safe(() => voice.updateHub(context.guildId, routeParam(request, "hubId"), body)) };
    });
    server.delete("/api/v1/voice/hubs/:hubId", async (request) => {
        await guard(request, "voice.manage", { mutation: true });
        await safe(() => voice.deleteHub(context.guildId, routeParam(request, "hubId")));
        return { success: true };
    });
    server.delete("/api/v1/voice/rooms/:roomId", async (request) => {
        const identity = await guard(request, "voice.manage", { mutation: true });
        await safe(() => voice.deleteRoom(context.guildId, routeParam(request, "roomId"), `Deleted by ${identity.displayName} via ${BRAND.name} portal`));
        return { success: true };
    });
}
//# sourceMappingURL=VoiceRoutes.js.map