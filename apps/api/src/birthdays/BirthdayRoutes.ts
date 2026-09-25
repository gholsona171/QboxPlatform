import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { BirthdayError, type Birthday, type BirthdayService, type UpcomingBirthday } from "@qbox/birthdays";

import type { ApiFeature, ApiFeatureContext, ApiIdentity } from "../features/ApiFeature.js";
import { errorOf, featureCall, parseInput as parse, routeQuery, snowflakeSchema as snowflake } from "../features/routeHelpers.js";

const isBirthdayError = errorOf(BirthdayError);
const safe = <T>(operation: () => Promise<T>) => featureCall(operation, isBirthdayError);

const dateSchema = z.strictObject({
  month: z.number().int(),
  day: z.number().int(),
  year: z.number().int().optional(),
  showAge: z.boolean().optional(),
  timeZone: z.string().max(64).optional(),
});

const settingsSchema = z.strictObject({
  enabled: z.boolean(),
  channelId: snowflake.optional(),
  message: z.string().max(2000),
  embedColor: z.string().max(7),
  roleId: snowflake.optional(),
  announceHour: z.number().int(),
  pingRoleId: snowflake.optional(),
  allowYear: z.boolean(),
  requireConfirmation: z.boolean(),
  expectedRevision: z.number().int().min(0),
});

/** Birthdays as a pluggable API feature under `/api/v1/birthdays`. */
export function birthdaysApiFeature(birthdays: BirthdayService): ApiFeature {
  return { name: "birthdays", register: (server, context) => registerBirthdayRoutes(server, context, birthdays) };
}

function registerBirthdayRoutes(server: FastifyInstance, context: ApiFeatureContext, birthdays: BirthdayService): void {
  const { guildId, guard, member } = context;
  const canManage = (request: FastifyRequest) => guard(request, "birthdays.manage", { mutation: false }).then(() => true, () => false);
  const actor = (identity: ApiIdentity, manager: boolean) => ({ userId: identity.userId, displayName: identity.displayName, manager });

  server.get("/api/v1/birthdays/overview", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const identity = await member(request, { mutation: false });
    const [manage, settings, me, upcoming] = await Promise.all([
      canManage(request),
      birthdays.settings(guildId),
      birthdays.get(guildId, identity.userId),
      birthdays.upcoming(guildId, 30),
    ]);
    const { guildId: _guildId, ...visibleSettings } = settings;
    return {
      data: {
        settings: manage ? visibleSettings : { enabled: settings.enabled, allowYear: settings.allowYear, requireConfirmation: settings.requireConfirmation, announceHour: settings.announceHour },
        me: me ? birthdayView(me, true) : null,
        upcoming: upcoming.map((item) => upcomingView(item, manage || item.birthday.userId === identity.userId)),
        can: { manage },
        userId: identity.userId,
      },
    };
  });

  server.get("/api/v1/birthdays", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const identity = await member(request, { mutation: false });
    const query = parse(z.object({ search: z.string().max(100).optional() }), routeQuery(request));
    const manage = await canManage(request);
    const list = await safe(() => birthdays.list(guildId, query.search));
    return { data: list.map((item) => upcomingView(item, manage || item.birthday.userId === identity.userId)) };
  });

  server.put("/api/v1/birthdays/me", async (request) => {
    const identity = await member(request, { mutation: true });
    const body = parse(dateSchema.extend({ confirmed: z.boolean().optional() }), request.body);
    const saved = await safe(() => birthdays.set({ guildId, userId: identity.userId, displayName: identity.displayName, ...body }, actor(identity, false)));
    return { data: birthdayView(saved, true) };
  });

  server.delete("/api/v1/birthdays/me", async (request) => {
    const identity = await member(request, { mutation: true });
    await safe(() => birthdays.remove(guildId, identity.userId, actor(identity, false)));
    return { success: true };
  });

  server.put("/api/v1/birthdays/members/:userId", async (request) => {
    const identity = await guard(request, "birthdays.manage", { mutation: true });
    const userId = parse(snowflake, Reflect.get(request.params as object, "userId"));
    const body = parse(dateSchema.extend({ displayName: z.string().min(1).max(100).optional() }), request.body);
    const { displayName, ...date } = body;
    const saved = await safe(() => birthdays.set({ guildId, userId, displayName: displayName ?? userId, ...date }, actor(identity, true)));
    return { data: birthdayView(saved, true) };
  });

  server.delete("/api/v1/birthdays/members/:userId", async (request) => {
    const identity = await guard(request, "birthdays.manage", { mutation: true });
    const userId = parse(snowflake, Reflect.get(request.params as object, "userId"));
    await safe(() => birthdays.remove(guildId, userId, actor(identity, true)));
    return { success: true };
  });

  server.put("/api/v1/birthdays/settings", async (request) => {
    await guard(request, "birthdays.manage", { mutation: true });
    const body = parse(settingsSchema, request.body);
    const { guildId: _guildId, ...saved } = await safe(() => birthdays.saveSettings({ ...body, guildId }));
    return { data: saved };
  });

  server.post("/api/v1/birthdays/test", async (request) => {
    const identity = await guard(request, "birthdays.manage", { mutation: true });
    return { data: await safe(() => birthdays.sendTest(guildId, identity.userId)) };
  });
}

/** Public fields of a birthday. The year is only shown to the member, staff, or when they chose to show their age. */
function birthdayView(birthday: Birthday, full: boolean) {
  return {
    userId: birthday.userId,
    displayName: birthday.displayName,
    month: birthday.month,
    day: birthday.day,
    ...(birthday.year !== undefined && (full || birthday.showAge) ? { year: birthday.year } : {}),
    showAge: birthday.showAge,
    timeZone: birthday.timeZone,
  };
}

function upcomingView(item: UpcomingBirthday, full: boolean) {
  return {
    ...birthdayView(item.birthday, full),
    date: item.date,
    daysUntil: item.daysUntil,
    ...(item.turning === undefined ? {} : { turning: item.turning }),
  };
}
