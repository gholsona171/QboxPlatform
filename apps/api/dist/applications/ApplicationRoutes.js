import { z } from "zod";
import { APPLICATION_STATUSES, ApplicationError, BUTTON_STYLES, MAX_QUESTIONS, QUESTION_TYPES, } from "@qbox/applications";
import { AuthorizationDeniedApiError } from "../errors/ApiError.js";
import { errorOf, featureCall, parseInput as parse, routeParam as param, snowflakeSchema as snowflake } from "../features/routeHelpers.js";
const isApplicationError = errorOf(ApplicationError);
const safe = (operation) => featureCall(operation, isApplicationError);
const snowflakes = (max) => z.array(snowflake).max(max);
const questionSchema = z.strictObject({
    id: z.string().min(1).max(40),
    label: z.string().max(45),
    description: z.string().max(100).optional(),
    type: z.enum(QUESTION_TYPES),
    required: z.boolean(),
    minLength: z.number().int().optional(),
    maxLength: z.number().int().optional(),
    choices: z.array(z.string().max(100)).max(25),
});
const formSchema = z.strictObject({
    name: z.string().max(80),
    description: z.string().max(1000).optional(),
    enabled: z.boolean(),
    questions: z.array(questionSchema).max(MAX_QUESTIONS),
    cooldownDays: z.number().int(),
    onePending: z.boolean(),
    requiredRoleIds: snowflakes(25),
    blockedRoleIds: snowflakes(25),
    minAccountAgeDays: z.number().int().optional(),
    reviewChannelId: snowflake.optional(),
    reviewerRoleIds: snowflakes(25),
    pingMemberIds: snowflakes(10),
    acceptRoleIds: snowflakes(10),
    removeRoleIds: snowflakes(10),
    acceptMessage: z.string().max(2000).optional(),
    denyMessage: z.string().max(2000).optional(),
    discussionChannelId: snowflake.optional(),
    buttonLabel: z.string().max(80).optional(),
    buttonEmoji: z.string().max(64).optional(),
    buttonStyle: z.enum(BUTTON_STYLES),
    position: z.number().int(),
    expectedRevision: z.number().int().min(0).optional(),
});
const panelSchema = z.strictObject({
    channelId: snowflake,
    title: z.string().max(256),
    description: z.string().max(4000),
    color: z.string().max(7),
    formIds: z.array(z.string().max(64)).max(25),
});
const listSchema = z.object({
    status: z.string().optional(),
    formId: z.string().max(64).optional(),
    userId: snowflake.optional(),
    search: z.string().max(100).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
});
/** Applications as a pluggable API feature under `/api/v1/applications`. */
export function applicationsApiFeature(applications) {
    return { name: "applications", register: (server, context) => registerApplicationRoutes(server, context, applications) };
}
function registerApplicationRoutes(server, context, applications) {
    const { guard, member } = context;
    const applicant = (identity) => ({ userId: identity.userId, displayName: identity.displayName, roleIds: identity.roleIds, source: "WEB" });
    const holds = (request, permission) => guard(request, permission, { mutation: false }).then(() => true, () => false);
    /** Signed-in member with their review rights; staff without any review rights get 403. */
    const reviewer = async (request, mutation) => {
        const identity = await member(request, { mutation });
        const elevated = await holds(request, ["applications.review", "applications.manage"]);
        const result = { userId: identity.userId, displayName: identity.displayName, roleIds: identity.roleIds, elevated, source: "WEB" };
        if (!(await applications.isReviewer(context.guildId, result)))
            throw new AuthorizationDeniedApiError();
        return result;
    };
    /* ---------- Members ---------- */
    server.get("/api/v1/applications/me", async (request, reply) => {
        reply.header("cache-control", "no-store");
        const identity = await member(request, { mutation: false });
        const self = applicant(identity);
        const elevated = await holds(request, ["applications.review", "applications.manage"]);
        const [available, mine, review, manage] = await Promise.all([
            applications.availability(context.guildId, self),
            applications.mine(context.guildId, identity.userId),
            applications.isReviewer(context.guildId, { ...self, elevated }),
            holds(request, "applications.manage"),
        ]);
        return { data: { userId: identity.userId, forms: available.map(({ form, canApply, reason }) => ({ ...publicForm(form), canApply, ...(reason ? { reason } : {}) })), applications: mine, can: { review, manage } } };
    });
    server.post("/api/v1/applications/forms/:formId/submit", async (request) => {
        const identity = await member(request, { mutation: true });
        const body = parse(z.strictObject({ answers: z.record(z.string().max(64), z.string().max(4000)) }), request.body);
        const application = await safe(() => applications.submit({ guildId: context.guildId, formId: param(request, "formId"), applicant: applicant(identity), answers: body.answers }));
        return { data: { ...application, votes: [], notes: [] } };
    });
    server.post("/api/v1/applications/:id/withdraw", async (request) => {
        const identity = await member(request, { mutation: true });
        const application = await safe(() => applications.withdraw(context.guildId, param(request, "id"), applicant(identity)));
        return { data: { ...application, votes: [], notes: [] } };
    });
    /* ---------- Review ---------- */
    server.get("/api/v1/applications/overview", async (request, reply) => {
        reply.header("cache-control", "no-store");
        const staff = await reviewer(request, false);
        const [forms, stats, manage] = await Promise.all([applications.reviewableForms(context.guildId, staff), applications.stats(context.guildId, staff), holds(request, "applications.manage")]);
        return { data: { forms, stats, can: { review: true, manage } } };
    });
    server.get("/api/v1/applications", async (request, reply) => {
        reply.header("cache-control", "no-store");
        const staff = await reviewer(request, false);
        const query = parse(listSchema, request.query ?? {});
        const statuses = query.status?.split(",").filter((status) => APPLICATION_STATUSES.includes(status));
        return {
            data: await safe(() => applications.list({
                guildId: context.guildId,
                ...(statuses?.length ? { statuses } : {}),
                ...(query.formId ? { formIds: [query.formId] } : {}),
                ...(query.userId ? { applicantId: query.userId } : {}),
                ...(query.search ? { search: query.search } : {}),
                ...(query.limit ? { limit: query.limit } : {}),
            }, staff)),
        };
    });
    server.get("/api/v1/applications/:id", async (request, reply) => {
        reply.header("cache-control", "no-store");
        const staff = await reviewer(request, false);
        return { data: await safe(() => applications.review(context.guildId, param(request, "id"), staff)) };
    });
    server.post("/api/v1/applications/:id/vote", async (request) => {
        const staff = await reviewer(request, true);
        const body = parse(z.strictObject({ vote: z.enum(["UP", "DOWN", "NONE"]) }), request.body);
        return { data: await safe(() => applications.vote(context.guildId, param(request, "id"), staff, body.vote === "NONE" ? undefined : body.vote)) };
    });
    server.post("/api/v1/applications/:id/notes", async (request) => {
        const staff = await reviewer(request, true);
        const body = parse(z.strictObject({ body: z.string().max(1000) }), request.body);
        return { data: await safe(() => applications.addNote(context.guildId, param(request, "id"), staff, body.body)) };
    });
    server.post("/api/v1/applications/:id/decision", async (request) => {
        const staff = await reviewer(request, true);
        const body = parse(z.strictObject({ status: z.enum(["ACCEPTED", "DENIED"]), reason: z.string().max(1000).optional() }), request.body);
        return { data: await safe(() => applications.decide(context.guildId, param(request, "id"), staff, body.status, body.reason)) };
    });
    /* ---------- Setup ---------- */
    server.get("/api/v1/applications/forms", async (request, reply) => {
        reply.header("cache-control", "no-store");
        await guard(request, "applications.manage", { mutation: false });
        const [forms, panels] = await Promise.all([applications.forms(context.guildId), applications.panels(context.guildId)]);
        return { data: { forms, panels } };
    });
    server.post("/api/v1/applications/forms", async (request) => {
        await guard(request, "applications.manage", { mutation: true });
        const body = parse(formSchema, request.body);
        return { data: await safe(() => applications.saveForm({ ...body, guildId: context.guildId })) };
    });
    server.put("/api/v1/applications/forms/:formId", async (request) => {
        await guard(request, "applications.manage", { mutation: true });
        const body = parse(formSchema, request.body);
        return { data: await safe(() => applications.saveForm({ ...body, guildId: context.guildId }, param(request, "formId"))) };
    });
    server.delete("/api/v1/applications/forms/:formId", async (request) => {
        await guard(request, "applications.manage", { mutation: true });
        await safe(() => applications.deleteForm(context.guildId, param(request, "formId")));
        return { success: true };
    });
    server.post("/api/v1/applications/panels", async (request) => {
        await guard(request, "applications.manage", { mutation: true });
        const body = parse(panelSchema, request.body);
        return { data: await safe(() => applications.savePanel({ ...body, guildId: context.guildId })) };
    });
    server.put("/api/v1/applications/panels/:panelId", async (request) => {
        await guard(request, "applications.manage", { mutation: true });
        const body = parse(panelSchema, request.body);
        return { data: await safe(() => applications.savePanel({ ...body, guildId: context.guildId }, param(request, "panelId"))) };
    });
    server.post("/api/v1/applications/panels/:panelId/publish", async (request) => {
        await guard(request, "applications.manage", { mutation: true });
        return { data: await safe(() => applications.publishPanel(context.guildId, param(request, "panelId"))) };
    });
    server.delete("/api/v1/applications/panels/:panelId", async (request) => {
        await guard(request, "applications.manage", { mutation: true });
        await safe(() => applications.deletePanel(context.guildId, param(request, "panelId")));
        return { success: true };
    });
}
/** What members see of a form: no staff channels, roles, or templates. */
function publicForm(form) {
    return { id: form.id, name: form.name, ...(form.description ? { description: form.description } : {}), questions: form.questions };
}
//# sourceMappingURL=ApplicationRoutes.js.map