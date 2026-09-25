/**
 * IANA time zone helpers built only on `Intl`. This entry point
 * (`@qbox/shared/time-zones`) has no side effects.
 */

/** Wall-clock date and time in a time zone. `weekday` is 0 (Sunday) to 6. */
export interface ZonedDateTime {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly weekday: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_MS = 86_400_000;

/** The canonical name of an IANA time zone, or undefined when it is not valid. */
export function normalizeTimeZone(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 64) return undefined;
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: trimmed }).resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

/** Wall-clock parts of an instant in `timeZone`. */
export function zonedParts(instant: Date, timeZone: string): ZonedDateTime {
  const parts = formatter(timeZone).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes): string => parts.find((part) => part.type === type)?.value ?? "0";
  return {
    year: Number(read("year")),
    month: Number(read("month")),
    day: Number(read("day")),
    hour: Number(read("hour")) % 24,
    minute: Number(read("minute")),
    second: Number(read("second")),
    weekday: WEEKDAYS.indexOf(read("weekday")),
  };
}

/** Milliseconds the zone is ahead of UTC at `instant` (negative west of UTC). */
export function zoneOffsetMs(instant: number, timeZone: string): number {
  const local = zonedParts(new Date(instant), timeZone);
  const wall = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
  return wall - Math.floor(instant / 1000) * 1000;
}

/**
 * The instant a wall-clock time happens in `timeZone`. Month and day may
 * overflow (day 32 is the next month). When the time happens twice (clocks
 * go back) the earlier instant is used; when it is skipped (clocks go
 * forward) the time is moved forward by the gap, like most calendars do.
 */
export function zonedTimeToUtc(timeZone: string, year: number, month: number, day: number, hour = 0, minute = 0): Date {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const before = zoneOffsetMs(wall - DAY_MS, timeZone);
  const after = zoneOffsetMs(wall + DAY_MS, timeZone);
  const valid = [wall - before, wall - after].filter((instant) => instant + zoneOffsetMs(instant, timeZone) === wall);
  if (valid.length > 0) return new Date(Math.min(...valid));
  return new Date(wall - before);
}

/** Calendar date `days` after the given date (handles month and year ends). */
export function addDays(year: number, month: number, day: number, days: number): { readonly year: number; readonly month: number; readonly day: number; readonly weekday: number } {
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate(), weekday: date.getUTCDay() };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isLeapYear(year: number): boolean {
  return daysInMonth(year, 2) === 29;
}

function formatter(timeZone: string): Intl.DateTimeFormat {
  let cached = formatters.get(timeZone);
  if (!cached) {
    cached = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      weekday: "short",
    });
    formatters.set(timeZone, cached);
  }
  return cached;
}
