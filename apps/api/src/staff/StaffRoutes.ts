import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { STAFF_LEAVE_STATUSES, StaffError, type StaffActor, type StaffLeaveStatus, type StaffService } from "@qbox/staff";

import type { ApiFeature, ApiFeatureContext, ApiIdentity } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeParam, routeQuery, snowflakeSchema as snowflake } from "../features/routeHelpers.js";

const isStaffError = errorOf(StaffError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isStaffError);

const settingsSchema = z.strictObject({
  logChannelId: snowflake.optional(),
  rosterChannelId: snowflake.optional(),
  loaRoleId: snowflake.optional(),
  autoClockOutHours: z.number().int(),
  maxLeaveDays: z.number().int(),
  expectedRevision: z.number().int().min(0),
});

const rankSchema = z.strictObject({
  name: z.string().min(1).max(50),
  roleId: snowflake.optional(),
  color: z.string().max(7),
  description: z.string().max(200).optional(),
});

const hireSchema = z.strictObject({
  userId: snowflake,
  displayName: z.string().min(1).max(100).optional(),
  rankId: z.string().max(64).optional(),
  callsign: z.string().max(32).optional(),
  reason: z.string().max(1000).optional(),
});

const memberSchema = z.strictObject({
  callsign: z.string().max(32).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "RETIRED"]).optional(),
  joinedAt: z.iso.datetime().optional(),
});

const rankChangeSchema = z.strictObject({ rankId: z.string().max(64).optional(), reason: z.string().max(1000).optional() });
const leaveSchema = z.strictObject({ startsAt: z.iso.datetime(), endsAt: z.iso.datetime(), reason: z.string().min(1).max(500) });

/** Staff management as a pluggable API feature under `/api/v1/staff`. */
export function staffApiFeature(staff: StaffService): ApiFeature {
  return { name: "staff", register: (server, context) => registerStaffRoutes(server, context, staff) };
}

function registerStaffRoutes(server: FastifyInstance, context: ApiFeatureContext, staff: StaffService): void {
  const { guildId, guard, member } = context;
  const actor = (identity: ApiIdentity): StaffActor => ({ userId: identity.userId, displayName: identity.displayName, source: "WEB" });
  const allowed = (request: FastifyRequest, permission: "staff.view" | "staff.manage" | "staff.shifts") =>
    guard(request, permission, { mutation: false }).then(() => true, () => false);
  const userParam = (request: FastifyRequest) => parse(snowflake, routeParam(request, "userId"));

  server.get("/api/v1/staff/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "staff.view", { mutation: false });
    const [settings, roster, pending, leaderboard, manage, shifts] = await Promise.all([
      staff.settings(guildId),
      staff.roster(guildId),
      staff.leaves({ guildId, statuses: ["PENDING"] }),
      staff.leaderboard(guildId),
      allowed(request, "staff.manage"),
      allowed(request, "staff.shifts"),
    ]);
    return { data: { settings, ...roster, pendingLeaves: pending.length, leaderboard, can: { manage, shifts } } };
  });

  server.get("/api/v1/staff/me", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const identity = await member(request, { mutation: false });
    const entry = await staff.member(guildId, identity.userId);
    const [profile, settings, view, shifts] = await Promise.all([
      entry ? staff.profile(guildId, identity.userId) : undefined,
      staff.settings(guildId),
      allowed(request, "staff.view"),
      allowed(request, "staff.shifts"),
    ]);
    return { data: { profile: profile ?? null, maxLeaveDays: settings.maxLeaveDays, can: { view, shifts } } };
  });

  server.post("/api/v1/staff/me/clock", async (request) => {
    const identity = await guard(request, "staff.shifts", { mutation: true });
    const body = parse(z.strictObject({ action: z.enum(["in", "out"]) }), request.body);
    const self = { userId: identity.userId, displayName: identity.displayName };
    return { data: await safe(() => (body.action === "in" ? staff.clockIn(guildId, self) : staff.clockOut(guildId, identity.userId))) };
  });

  server.post("/api/v1/staff/me/leaves", async (request) => {
    const identity = await member(request, { mutation: true });
    const body = parse(leaveSchema, request.body);
    return {
      data: await safe(() => staff.requestLeave(guildId, { userId: identity.userId, displayName: identity.displayName }, {
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt),
        reason: body.reason,
      })),
    };
  });

  server.post("/api/v1/staff/me/leaves/:id/cancel", async (request) => {
    const identity = await member(request, { mutation: true });
    return { data: await safe(() => staff.cancelLeave(guildId, routeParam(request, "id"), identity.userId)) };
  });

  server.get("/api/v1/staff/members/:userId", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "staff.view", { mutation: false });
    return { data: await safe(() => staff.profile(guildId, userParam(request))) };
  });

  server.post("/api/v1/staff/members", async (request) => {
    const identity = await guard(request, "staff.manage", { mutation: true });
    const body = parse(hireSchema, request.body);
    return {
      data: await safe(() => staff.hire(guildId, { userId: body.userId, displayName: body.displayName ?? body.userId }, actor(identity), {
        rankId: body.rankId,
        callsign: body.callsign,
        reason: body.reason,
      })),
    };
  });

  server.patch("/api/v1/staff/members/:userId", async (request) => {
    const identity = await guard(request, "staff.manage", { mutation: true });
    const body = parse(memberSchema, request.body);
    return {
      data: await safe(() => staff.updateMember(guildId, userParam(request), actor(identity), {
        ...(body.callsign !== undefined ? { callsign: body.callsign } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.joinedAt ? { joinedAt: new Date(body.joinedAt) } : {}),
      })),
    };
  });

  for (const direction of ["promote", "demote"] as const) {
    server.post(`/api/v1/staff/members/:userId/${direction}`, async (request) => {
      const identity = await guard(request, "staff.manage", { mutation: true });
      const body = parse(rankChangeSchema, request.body ?? {});
      return { data: await safe(() => staff[direction](guildId, userParam(request), actor(identity), body.rankId, body.reason)) };
    });
  }

  server.post("/api/v1/staff/members/:userId/fire", async (request) => {
    const identity = await guard(request, "staff.manage", { mutation: true });
    const body = parse(z.strictObject({ reason: z.string().max(1000).optional() }), request.body ?? {});
    await safe(() => staff.fire(guildId, userParam(request), actor(identity), body.reason));
    return { success: true };
  });

  server.post("/api/v1/staff/members/:userId/notes", async (request) => {
    const identity = await guard(request, "staff.manage", { mutation: true });
    const body = parse(z.strictObject({ text: z.string().min(1).max(1000) }), request.body);
    await safe(() => staff.note(guildId, userParam(request), actor(identity), body.text));
    return { success: true };
  });

  server.post("/api/v1/staff/members/:userId/strikes", async (request) => {
    const identity = await guard(request, "staff.manage", { mutation: true });
    const body = parse(z.strictObject({ reason: z.string().min(1).max(1000), expiresInDays: z.number().int().optional() }), request.body);
    return { data: await safe(() => staff.strike(guildId, userParam(request), actor(identity), body.reason, body.expiresInDays)) };
  });

  server.post("/api/v1/staff/strikes/:id/revoke", async (request) => {
    const identity = await guard(request, "staff.manage", { mutation: true });
    return { data: await safe(() => staff.revokeStrike(guildId, routeParam(request, "id"), actor(identity))) };
  });

  server.get("/api/v1/staff/leaves", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "staff.view", { mutation: false });
    const query = parse(z.object({ status: z.string().max(100).optional(), userId: snowflake.optional(), limit: z.coerce.number().int().min(1).max(200).optional() }), routeQuery(request));
    const statuses = query.status?.split(",").filter((status): status is StaffLeaveStatus => (STAFF_LEAVE_STATUSES as readonly string[]).includes(status));
    return { data: await safe(() => staff.leaves({ guildId, ...(statuses?.length ? { statuses } : {}), ...(query.userId ? { userId: query.userId } : {}), ...(query.limit ? { limit: query.limit } : {}) })) };
  });

  server.post("/api/v1/staff/leaves/:id/review", async (request) => {
    const identity = await guard(request, "staff.manage", { mutation: true });
    const body = parse(z.strictObject({ approve: z.boolean(), note: z.string().max(500).optional() }), request.body);
    return { data: await safe(() => staff.reviewLeave(guildId, routeParam(request, "id"), actor(identity), body.approve, body.note)) };
  });

  server.post("/api/v1/staff/leaves/:id/end", async (request) => {
    const identity = await guard(request, "staff.manage", { mutation: true });
    return { data: await safe(() => staff.endLeave(guildId, routeParam(request, "id"), actor(identity))) };
  });

  server.get("/api/v1/staff/shifts", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "staff.view", { mutation: false });
    const query = parse(z.object({ userId: snowflake.optional(), limit: z.coerce.number().int().min(1).max(500).optional() }), routeQuery(request));
    return { data: await safe(() => staff.shifts({ guildId, ...(query.userId ? { userId: query.userId } : {}), ...(query.limit ? { limit: query.limit } : {}) })) };
  });

  server.get("/api/v1/staff/leaderboard", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await guard(request, "staff.view", { mutation: false });
    const query = parse(z.object({ weeksAgo: z.coerce.number().int().min(0).max(520).optional() }), routeQuery(request));
    return { data: await safe(() => staff.leaderboard(guildId, query.weeksAgo ?? 0)) };
  });

  server.post("/api/v1/staff/ranks", async (request) => {
    await guard(request, "staff.manage", { mutation: true });
    const body = parse(rankSchema, request.body);
    return { data: await safe(() => staff.createRank(guildId, body)) };
  });

  server.put("/api/v1/staff/ranks/order", async (request) => {
    await guard(request, "staff.manage", { mutation: true });
    const body = parse(z.strictObject({ rankIds: z.array(z.string().max(64)).max(25) }), request.body);
    return { data: await safe(() => staff.reorderRanks(guildId, body.rankIds)) };
  });

  server.put("/api/v1/staff/ranks/:id", async (request) => {
    await guard(request, "staff.manage", { mutation: true });
    const body = parse(rankSchema, request.body);
    return { data: await safe(() => staff.updateRank(guildId, routeParam(request, "id"), body)) };
  });

  server.delete("/api/v1/staff/ranks/:id", async (request) => {
    await guard(request, "staff.manage", { mutation: true });
    await safe(() => staff.deleteRank(guildId, routeParam(request, "id")));
    return { success: true };
  });

  server.put("/api/v1/staff/settings", async (request) => {
    await guard(request, "staff.manage", { mutation: true });
    const body = parse(settingsSchema, request.body);
    return { data: await safe(() => staff.saveSettings({ ...body, guildId })) };
  });

  server.post("/api/v1/staff/roster/publish", async (request) => {
    await guard(request, "staff.manage", { mutation: true });
    return { data: await safe(() => staff.publishRoster(guildId)) };
  });
}
