import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TicketError,
  type TicketActor,
  type TicketService,
} from "@qbox/tickets";

import {
  ConflictApiError,
  DependencyUnavailableApiError,
  NotFoundApiError,
  ValidationApiError,
} from "../errors/ApiError.js";
import type { ApiFeature, ApiIdentity, ApiPermissionGuard } from "../features/ApiFeature.js";

export interface TicketRouteDependencies {
  readonly tickets: TicketService;
  readonly guildId: string;
  readonly guard: ApiPermissionGuard;
}

/** Tickets as a pluggable API feature. */
export function ticketsApiFeature(tickets: TicketService): ApiFeature {
  return {
    name: "tickets",
    register: (server, context) => registerTicketRoutes(server, { tickets, guildId: context.guildId, guard: context.guard }),
  };
}

const snowflake = z.string().regex(/^\d{17,20}$/);
const optionalSnowflake = snowflake.optional();
const snowflakes = z.array(snowflake).max(500).default([]);
const hexColor = z.string().regex(/^#?[0-9a-fA-F]{6}$/);

const settingsSchema = z.strictObject({
  enabled: z.boolean(),
  mode: z.enum(["CHANNEL", "THREAD"]),
  openCategoryChannelId: optionalSnowflake,
  closedCategoryChannelId: optionalSnowflake,
  threadParentChannelId: optionalSnowflake,
  transcriptChannelId: optionalSnowflake,
  logChannelId: optionalSnowflake,
  supportRoleIds: snowflakes,
  pingSupportOnOpen: z.boolean(),
  maxOpenPerUser: z.number().int(),
  nameTemplate: z.string(),
  openMessage: z.string(),
  embedColor: hexColor,
  allowUserClose: z.boolean(),
  requireCloseReason: z.boolean(),
  closeConfirmation: z.boolean(),
  closeAction: z.enum(["ARCHIVE", "DELETE"]),
  deleteDelaySeconds: z.number().int(),
  claimEnabled: z.boolean(),
  claimRestrictsReplies: z.boolean(),
  transcriptsEnabled: z.boolean(),
  transcriptDmUser: z.boolean(),
  feedbackEnabled: z.boolean(),
  autoCloseHours: z.number().int(),
  autoCloseWarningHours: z.number().int(),
  autoCloseExcludeClaimed: z.boolean(),
  blockedUserIds: snowflakes,
  blockedRoleIds: snowflakes,
  expectedRevision: z.number().int().min(0),
});

const questionSchema = z.strictObject({
  id: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  style: z.enum(["SHORT", "PARAGRAPH"]),
  required: z.boolean(),
  minLength: z.number().int().optional(),
  maxLength: z.number().int().optional(),
});

const categorySchema = z.strictObject({
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  buttonStyle: z.enum(["PRIMARY", "SECONDARY", "SUCCESS", "DANGER"]).default("PRIMARY"),
  enabled: z.boolean().default(true),
  position: z.number().int().min(0).max(100).optional(),
  supportRoleIds: snowflakes,
  alertUserIds: snowflakes,
  parentChannelId: optionalSnowflake,
  nameTemplate: z.string().optional(),
  openMessage: z.string().optional(),
  defaultPriority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  questions: z.array(questionSchema).max(5).default([]),
  requiredRoleIds: snowflakes,
  maxOpenPerUser: z.number().int().optional(),
});

const panelSchema = z.strictObject({
  name: z.string(),
  channelId: snowflake,
  title: z.string(),
  description: z.string(),
  color: hexColor.default("#5865F2"),
  style: z.enum(["BUTTONS", "SELECT_MENU"]).default("BUTTONS"),
  placeholder: z.string().default("Select a ticket type"),
  imageUrl: z.string().optional(),
  footer: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).max(25).default([]),
});

const listQuerySchema = z.object({
  status: z.string().optional(),
  priority: z.enum(TICKET_PRIORITIES as [string, ...string[]]).optional(),
  categoryId: z.string().uuid().optional(),
  claimedById: optionalSnowflake,
  openerId: optionalSnowflake,
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

const textSchema = z.strictObject({ content: z.string().min(1).max(4000) });
const reasonSchema = z.strictObject({ reason: z.string().max(500).optional() });
const prioritySchema = z.strictObject({ priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]) });
const tagsSchema = z.strictObject({ tags: z.array(z.string()).max(10) });
const waitingSchema = z.strictObject({ waiting: z.boolean() });
const userSchema = z.strictObject({ userId: snowflake });

/** Registers `/api/v1/tickets/*` for the portal. */
export function registerTicketRoutes(server: FastifyInstance, dependencies: TicketRouteDependencies): void {
  const { tickets, guildId, guard } = dependencies;
  const handler = (request: FastifyRequest, options = { mutation: false }) => guard(request, "tickets.handle", options);
  const manager = (request: FastifyRequest, mutation = true) => guard(request, "tickets.manage", { mutation });
  const actor = (identity: ApiIdentity): TicketActor => ({
    userId: identity.userId,
    displayName: identity.displayName,
    roleIds: [],
    elevated: true,
    source: "WEB",
  });

  server.get("/api/v1/tickets/overview", async (request, reply) => {
    noStore(reply);
    await handler(request);
    const [settings, categories, panels, stats] = await Promise.all([
      tickets.settings(guildId),
      tickets.categories(guildId),
      tickets.panels(guildId),
      tickets.stats(guildId),
    ]);
    const canManage = await manager(request, false).then(() => true, () => false);
    return { data: { settings, categories, panels, stats, canManage } };
  });

  server.put("/api/v1/tickets/settings", async (request) => {
    await manager(request);
    const body = parse(settingsSchema, request.body);
    return { data: await safe(() => tickets.saveSettings({ ...body, guildId, source: "WEB" })) };
  });

  server.post("/api/v1/tickets/categories", async (request) => {
    await manager(request);
    return { data: await safe(() => tickets.saveCategory({ ...parse(categorySchema, request.body), guildId })) };
  });

  server.put("/api/v1/tickets/categories/:id", async (request) => {
    await manager(request);
    return { data: await safe(() => tickets.saveCategory({ ...parse(categorySchema, request.body), guildId, id: param(request, "id") })) };
  });

  server.delete("/api/v1/tickets/categories/:id", async (request) => {
    await manager(request);
    await safe(() => tickets.deleteCategory(guildId, param(request, "id")));
    return { success: true };
  });

  server.post("/api/v1/tickets/panels", async (request) => {
    await manager(request);
    return { data: await safe(() => tickets.savePanel({ ...parse(panelSchema, request.body), guildId })) };
  });

  server.put("/api/v1/tickets/panels/:id", async (request) => {
    await manager(request);
    return { data: await safe(() => tickets.savePanel({ ...parse(panelSchema, request.body), guildId, id: param(request, "id") })) };
  });

  server.post("/api/v1/tickets/panels/:id/publish", async (request) => {
    await manager(request);
    return { data: await safe(() => tickets.publishPanel(guildId, param(request, "id"))) };
  });

  server.delete("/api/v1/tickets/panels/:id", async (request) => {
    await manager(request);
    await safe(() => tickets.deletePanel(guildId, param(request, "id")));
    return { success: true };
  });

  server.get("/api/v1/tickets", async (request, reply) => {
    noStore(reply);
    await handler(request);
    const query = parse(listQuerySchema, request.query ?? {});
    const statuses = query.status
      ? query.status.split(",").map((status) => status.trim().toUpperCase()).filter((status): status is (typeof TICKET_STATUSES)[number] => (TICKET_STATUSES as readonly string[]).includes(status))
      : undefined;
    const data = await safe(() =>
      tickets.list({
        guildId,
        ...(statuses && statuses.length > 0 ? { statuses } : {}),
        ...(query.priority ? { priority: query.priority as (typeof TICKET_PRIORITIES)[number] } : {}),
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.claimedById ? { claimedById: query.claimedById } : {}),
        ...(query.openerId ? { openerId: query.openerId } : {}),
        ...(query.search ? { search: query.search } : {}),
        ...(query.limit ? { limit: query.limit } : {}),
      }),
    );
    return { data };
  });

  server.get("/api/v1/tickets/:id", async (request, reply) => {
    noStore(reply);
    await handler(request);
    return { data: await safe(() => tickets.detail(guildId, param(request, "id"))) };
  });

  server.get("/api/v1/tickets/:id/transcript", async (request, reply) => {
    await handler(request);
    const file = await safe(() => tickets.transcript(guildId, param(request, "id"), true));
    return reply
      .header("content-type", "text/plain; charset=utf-8")
      .header("content-disposition", `attachment; filename="${file.fileName}"`)
      .send(file.content);
  });

  const action = <T>(path: string, run: (id: string, staff: TicketActor, body: unknown) => Promise<T>) => {
    server.post(`/api/v1/tickets/:id/${path}`, async (request) => {
      const identity = await handler(request, { mutation: true });
      return { data: await safe(() => run(param(request, "id"), actor(identity), request.body ?? {})) };
    });
  };

  action("reply", (id, staff, body) => tickets.reply(guildId, id, staff, parse(textSchema, body).content));
  action("notes", (id, staff, body) => tickets.addNote(guildId, id, staff, parse(textSchema, body).content));
  action("claim", (id, staff) => tickets.claim(guildId, id, staff));
  action("unclaim", (id, staff) => tickets.unclaim(guildId, id, staff));
  action("close", (id, staff, body) => tickets.close(guildId, id, staff, parse(reasonSchema, body).reason));
  action("reopen", (id, staff) => tickets.reopen(guildId, id, staff));
  action("priority", (id, staff, body) => tickets.setPriority(guildId, id, staff, parse(prioritySchema, body).priority));
  action("tags", (id, staff, body) => tickets.setTags(guildId, id, staff, parse(tagsSchema, body).tags));
  action("waiting", (id, staff, body) => tickets.setPending(guildId, id, staff, parse(waitingSchema, body).waiting));
  action("transfer", (id, staff, body) => tickets.transfer(guildId, id, staff, parse(userSchema, body).userId));
  action("participants", (id, staff, body) => tickets.addParticipant(guildId, id, staff, parse(userSchema, body).userId));
  action("delete-channel", (id, staff) => tickets.deleteChannel(guildId, id, staff));

  server.delete("/api/v1/tickets/:id/participants/:userId", async (request) => {
    const identity = await handler(request, { mutation: true });
    return { data: await safe(() => tickets.removeParticipant(guildId, param(request, "id"), actor(identity), param(request, "userId"))) };
  });
}

function parse<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new ValidationApiError(result.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code, message: `${issue.path.join(".") || "body"}: ${issue.message}` })));
  return withoutUndefined(result.data) as z.infer<T>;
}

/** Drops `undefined` keys so optional fields satisfy exact optional property types. */
function withoutUndefined(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).map(([key, item]) => [key, withoutUndefined(item)]));
}

function param(request: FastifyRequest, name: string): string {
  const value = request.params && typeof request.params === "object" ? Reflect.get(request.params, name) : undefined;
  if (typeof value !== "string" || value.length === 0 || value.length > 64) throw new ValidationApiError([{ path: name, code: "invalid", message: `${name} is invalid.` }]);
  return value;
}

function noStore(reply: FastifyReply): void {
  reply.header("cache-control", "no-store");
}

async function safe<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!(error instanceof TicketError)) throw error;
    if (error.code === "NOT_FOUND") throw new NotFoundApiError();
    if (error.code === "DEPENDENCY_UNAVAILABLE") throw new DependencyUnavailableApiError();
    if (error.code === "CONFLICT") throw new ConflictApiError([{ path: "tickets", code: "STALE_REVISION", message: error.message, ...(error.details ?? {}) }]);
    throw new ValidationApiError([{ path: "tickets", code: error.code, message: error.message }]);
  }
}
