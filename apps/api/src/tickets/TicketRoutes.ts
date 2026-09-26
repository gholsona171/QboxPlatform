import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TicketError,
  type TicketActor,
  type TicketService,
} from "@qbox/tickets";

import type { ApiFeature, ApiIdentity, ApiPermissionGuard } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeParam as param } from "../features/routeHelpers.js";

const isTicketError = errorOf(TicketError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isTicketError);

export interface TicketRouteDependencies {
  readonly tickets: TicketService;
  /** Current server for the request being handled. Read inside handlers only. */
  readonly currentGuildId: () => string;
  readonly guard: ApiPermissionGuard;
}

/** Tickets as a pluggable API feature. */
export function ticketsApiFeature(tickets: TicketService): ApiFeature {
  return {
    name: "tickets",
    register: (server, context) => registerTicketRoutes(server, { tickets, currentGuildId: () => context.guildId, guard: context.guard }),
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
  /** Button rows (reason IDs per row); null or absent arranges them automatically. */
  rows: z.array(z.array(z.string().uuid()).max(25)).max(25).nullable().default(null),
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
  const { tickets, currentGuildId, guard } = dependencies;
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
      tickets.settings(currentGuildId()),
      tickets.categories(currentGuildId()),
      tickets.panels(currentGuildId()),
      tickets.stats(currentGuildId()),
    ]);
    const canManage = await manager(request, false).then(() => true, () => false);
    return { data: { settings, categories, panels, stats, canManage } };
  });

  server.put("/api/v1/tickets/settings", async (request) => {
    await manager(request);
    const body = parse(settingsSchema, request.body);
    return { data: await safe(() => tickets.saveSettings({ ...body, guildId: currentGuildId(), source: "WEB" })) };
  });

  server.post("/api/v1/tickets/categories", async (request) => {
    await manager(request);
    return { data: await safe(() => tickets.saveCategory({ ...parse(categorySchema, request.body), guildId: currentGuildId() })) };
  });

  server.put("/api/v1/tickets/categories/:id", async (request) => {
    await manager(request);
    return { data: await safe(() => tickets.saveCategory({ ...parse(categorySchema, request.body), guildId: currentGuildId(), id: param(request, "id") })) };
  });

  server.delete("/api/v1/tickets/categories/:id", async (request) => {
    await manager(request);
    await safe(() => tickets.deleteCategory(currentGuildId(), param(request, "id")));
    return { success: true };
  });

  server.post("/api/v1/tickets/panels", async (request) => {
    await manager(request);
    return { data: await safe(() => tickets.savePanel({ ...parse(panelSchema, request.body), guildId: currentGuildId() })) };
  });

  server.put("/api/v1/tickets/panels/:id", async (request) => {
    await manager(request);
    return { data: await safe(() => tickets.savePanel({ ...parse(panelSchema, request.body), guildId: currentGuildId(), id: param(request, "id") })) };
  });

  server.post("/api/v1/tickets/panels/:id/publish", async (request) => {
    await manager(request);
    return { data: await safe(() => tickets.publishPanel(currentGuildId(), param(request, "id"))) };
  });

  server.delete("/api/v1/tickets/panels/:id", async (request) => {
    await manager(request);
    await safe(() => tickets.deletePanel(currentGuildId(), param(request, "id")));
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
        guildId: currentGuildId(),
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
    return { data: await safe(() => tickets.detail(currentGuildId(), param(request, "id"))) };
  });

  server.get("/api/v1/tickets/:id/transcript", async (request, reply) => {
    await handler(request);
    const file = await safe(() => tickets.transcript(currentGuildId(), param(request, "id"), true));
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

  action("reply", (id, staff, body) => tickets.reply(currentGuildId(), id, staff, parse(textSchema, body).content));
  action("notes", (id, staff, body) => tickets.addNote(currentGuildId(), id, staff, parse(textSchema, body).content));
  action("claim", (id, staff) => tickets.claim(currentGuildId(), id, staff));
  action("unclaim", (id, staff) => tickets.unclaim(currentGuildId(), id, staff));
  action("close", (id, staff, body) => tickets.close(currentGuildId(), id, staff, parse(reasonSchema, body).reason));
  action("reopen", (id, staff) => tickets.reopen(currentGuildId(), id, staff));
  action("priority", (id, staff, body) => tickets.setPriority(currentGuildId(), id, staff, parse(prioritySchema, body).priority));
  action("tags", (id, staff, body) => tickets.setTags(currentGuildId(), id, staff, parse(tagsSchema, body).tags));
  action("waiting", (id, staff, body) => tickets.setPending(currentGuildId(), id, staff, parse(waitingSchema, body).waiting));
  action("transfer", (id, staff, body) => tickets.transfer(currentGuildId(), id, staff, parse(userSchema, body).userId));
  action("participants", (id, staff, body) => tickets.addParticipant(currentGuildId(), id, staff, parse(userSchema, body).userId));
  action("delete-channel", (id, staff) => tickets.deleteChannel(currentGuildId(), id, staff));

  server.delete("/api/v1/tickets/:id/participants/:userId", async (request) => {
    const identity = await handler(request, { mutation: true });
    return { data: await safe(() => tickets.removeParticipant(currentGuildId(), param(request, "id"), actor(identity), param(request, "userId"))) };
  });
}

function noStore(reply: FastifyReply): void {
  reply.header("cache-control", "no-store");
}
