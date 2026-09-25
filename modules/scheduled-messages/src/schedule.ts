import { addDays, daysInMonth, zonedParts, zonedTimeToUtc } from "@qbox/shared/time-zones";

import type { Schedule } from "./types.js";

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/;
const MINUTE_MS = 60_000;
export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** `YYYY-MM-DD` to a calendar date, or undefined when it is not a real date. */
export function parseDate(value: string): CalendarDate | undefined {
  const match = DATE.exec(value);
  if (!match) return undefined;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (year < 2000 || year > 2200 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return undefined;
  return { year, month, day };
}

/** `HH:MM` to hours and minutes, or undefined. */
export function parseTime(value: string): { readonly hour: number; readonly minute: number } | undefined {
  const match = TIME.exec(value);
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : undefined;
}

/** `YYYY-MM-DDTHH:MM` to a date and time, or undefined. */
export function parseDateTime(value: string): (CalendarDate & { readonly hour: number; readonly minute: number }) | undefined {
  const match = DATE_TIME.exec(value);
  const date = match ? parseDate(match[1] as string) : undefined;
  const time = match ? parseTime(match[2] as string) : undefined;
  return date && time ? { ...date, ...time } : undefined;
}

/**
 * The first post strictly after `after`, or undefined when the schedule has
 * no more posts. `anchor` is when an INTERVAL schedule without a start date
 * began counting (usually when it was created).
 */
export function nextRun(schedule: Schedule, after: Date, anchor: Date): Date | undefined {
  const zone = schedule.timeZone;
  if (schedule.type === "ONCE") {
    const at = schedule.runAt ? parseDateTime(schedule.runAt) : undefined;
    if (!at) return undefined;
    const instant = zonedTimeToUtc(zone, at.year, at.month, at.day, at.hour, at.minute);
    return instant.getTime() > after.getTime() ? instant : undefined;
  }
  const start = schedule.startDate ? parseDate(schedule.startDate) : undefined;
  const end = schedule.endDate ? parseDate(schedule.endDate) : undefined;
  const startAt = start ? zonedTimeToUtc(zone, start.year, start.month, start.day) : undefined;
  const floor = startAt && startAt.getTime() > after.getTime() ? new Date(startAt.getTime() - 1) : after;
  const next = following(schedule, floor, start, anchor);
  if (!next) return undefined;
  if (end && next.getTime() >= zonedTimeToUtc(zone, end.year, end.month, end.day + 1).getTime()) return undefined;
  return next;
}

function following(schedule: Schedule, floor: Date, start: CalendarDate | undefined, anchor: Date): Date | undefined {
  const zone = schedule.timeZone;
  const time = schedule.time ? parseTime(schedule.time) : undefined;
  if (schedule.type === "INTERVAL") {
    const every = (schedule.intervalMinutes ?? 0) * MINUTE_MS;
    if (every <= 0) return undefined;
    const origin = start ? zonedTimeToUtc(zone, start.year, start.month, start.day, time?.hour ?? 0, time?.minute ?? 0).getTime() : anchor.getTime();
    if (floor.getTime() < origin) return new Date(origin);
    return new Date(origin + (Math.floor((floor.getTime() - origin) / every) + 1) * every);
  }
  if (!time) return undefined;
  const local = zonedParts(floor, zone);
  if (schedule.type === "MONTHLY") {
    const wanted = schedule.dayOfMonth ?? 1;
    for (let offset = 0; offset <= 12; offset += 1) {
      const year = local.year + Math.floor((local.month - 1 + offset) / 12);
      const month = ((local.month - 1 + offset) % 12) + 1;
      const candidate = zonedTimeToUtc(zone, year, month, Math.min(wanted, daysInMonth(year, month)), time.hour, time.minute);
      if (candidate.getTime() > floor.getTime()) return candidate;
    }
    return undefined;
  }
  const weekdays = schedule.type === "WEEKLY" ? (schedule.weekdays ?? []) : [0, 1, 2, 3, 4, 5, 6];
  for (let offset = 0; offset <= 8; offset += 1) {
    const day = addDays(local.year, local.month, local.day, offset);
    if (!weekdays.includes(day.weekday)) continue;
    const candidate = zonedTimeToUtc(zone, day.year, day.month, day.day, time.hour, time.minute);
    if (candidate.getTime() > floor.getTime()) return candidate;
  }
  return undefined;
}

/** Plain description of a schedule, for lists. */
export function describeSchedule(schedule: Schedule): string {
  const zone = ` (${schedule.timeZone})`;
  switch (schedule.type) {
    case "ONCE":
      return `Once on ${(schedule.runAt ?? "").replace("T", " at ")}${zone}`;
    case "INTERVAL": {
      const minutes = schedule.intervalMinutes ?? 0;
      const every = minutes % 1440 === 0 ? plural(minutes / 1440, "day") : minutes % 60 === 0 ? plural(minutes / 60, "hour") : plural(minutes, "minute");
      return `Every ${every}${schedule.startDate ? ` from ${schedule.startDate}${schedule.time ? ` ${schedule.time}` : ""}` : ""}${zone}`;
    }
    case "DAILY":
      return `Every day at ${schedule.time ?? ""}${zone}`;
    case "WEEKLY":
      return `Every ${[...(schedule.weekdays ?? [])].sort((left, right) => left - right).map((day) => WEEKDAY_NAMES[day]).join(", ")} at ${schedule.time ?? ""}${zone}`;
    default:
      return `Monthly on day ${schedule.dayOfMonth ?? 1} at ${schedule.time ?? ""}${zone}`;
  }
}

function plural(value: number, unit: string): string {
  return value === 1 ? unit : `${value} ${unit}s`;
}
