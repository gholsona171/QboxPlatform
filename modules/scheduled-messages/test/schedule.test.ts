import { describe, expect, it } from "vitest";
import { normalizeTimeZone, zonedTimeToUtc } from "@qbox/shared/time-zones";

import { describeSchedule, nextRun, type Schedule } from "../src/index.js";

const ANCHOR = new Date("2026-09-25T00:00:00.000Z");
const at = (iso: string) => new Date(iso);
const next = (schedule: Schedule, after: string) => nextRun(schedule, at(after), ANCHOR)?.toISOString();

describe("time zone helpers", () => {
  it("normalizes IANA names and rejects unknown ones", () => {
    expect(normalizeTimeZone("america/new_york")).toBe("America/New_York");
    expect(normalizeTimeZone("Mars/Base")).toBeUndefined();
    expect(normalizeTimeZone("")).toBeUndefined();
  });

  it("converts wall-clock times across daylight saving changes", () => {
    expect(zonedTimeToUtc("America/New_York", 2026, 1, 15, 9, 0).toISOString()).toBe("2026-01-15T14:00:00.000Z");
    expect(zonedTimeToUtc("America/New_York", 2026, 7, 15, 9, 0).toISOString()).toBe("2026-07-15T13:00:00.000Z");
    // 02:30 does not exist on 8 March 2026 in New York; it moves to 03:30 EDT.
    expect(zonedTimeToUtc("America/New_York", 2026, 3, 8, 2, 30).toISOString()).toBe("2026-03-08T07:30:00.000Z");
    // 01:30 happens twice on 1 November 2026; the first (EDT) one is used.
    expect(zonedTimeToUtc("America/New_York", 2026, 11, 1, 1, 30).toISOString()).toBe("2026-11-01T05:30:00.000Z");
    expect(zonedTimeToUtc("Asia/Kolkata", 2026, 9, 28, 18, 0).toISOString()).toBe("2026-09-28T12:30:00.000Z");
  });
});

describe("nextRun", () => {
  it("posts ONCE schedules at the local time and never again", () => {
    const once: Schedule = { type: "ONCE", timeZone: "America/New_York", runAt: "2026-12-24T18:00" };
    expect(next(once, "2026-09-25T12:00:00.000Z")).toBe("2026-12-24T23:00:00.000Z");
    expect(next(once, "2026-12-24T23:00:00.000Z")).toBeUndefined();
  });

  it("counts INTERVAL schedules from the anchor or the start date and time", () => {
    const every = { type: "INTERVAL", timeZone: "UTC", intervalMinutes: 90 } as const;
    expect(next(every, "2026-09-25T04:00:00.000Z")).toBe("2026-09-25T04:30:00.000Z");
    expect(next(every, "2026-09-25T04:30:00.000Z")).toBe("2026-09-25T06:00:00.000Z");
    expect(nextRun(every, at("2026-09-24T00:00:00.000Z"), ANCHOR)?.toISOString()).toBe(ANCHOR.toISOString());
    const fromStart: Schedule = { type: "INTERVAL", timeZone: "Europe/Berlin", intervalMinutes: 60, startDate: "2026-10-01", time: "08:00" };
    expect(next(fromStart, "2026-09-25T12:00:00.000Z")).toBe("2026-10-01T06:00:00.000Z");
    expect(next(fromStart, "2026-10-01T06:00:00.000Z")).toBe("2026-10-01T07:00:00.000Z");
  });

  it("keeps DAILY posts at the same local time across daylight saving changes", () => {
    const nine: Schedule = { type: "DAILY", timeZone: "America/New_York", time: "09:00" };
    expect(next(nine, "2026-03-07T13:00:00.000Z")).toBe("2026-03-07T14:00:00.000Z");
    expect(next(nine, "2026-03-07T15:00:00.000Z")).toBe("2026-03-08T13:00:00.000Z");
    expect(next({ type: "DAILY", timeZone: "Europe/London", time: "09:00" }, "2026-03-28T10:00:00.000Z")).toBe("2026-03-29T08:00:00.000Z");
  });

  it("handles skipped and repeated local times without double posts", () => {
    expect(next({ type: "DAILY", timeZone: "America/New_York", time: "02:30" }, "2026-03-08T05:00:00.000Z")).toBe("2026-03-08T07:30:00.000Z");
    const early: Schedule = { type: "DAILY", timeZone: "America/New_York", time: "01:30" };
    expect(next(early, "2026-11-01T04:00:00.000Z")).toBe("2026-11-01T05:30:00.000Z");
    expect(next(early, "2026-11-01T05:30:00.000Z")).toBe("2026-11-02T06:30:00.000Z");
  });

  it("uses the local date in zones far from UTC", () => {
    expect(next({ type: "DAILY", timeZone: "Pacific/Kiritimati", time: "08:00" }, "2026-09-25T12:00:00.000Z")).toBe("2026-09-25T18:00:00.000Z");
    expect(next({ type: "DAILY", timeZone: "Pacific/Pago_Pago", time: "08:00" }, "2026-09-25T12:00:00.000Z")).toBe("2026-09-25T19:00:00.000Z");
  });

  it("picks the next chosen weekday", () => {
    const weekly: Schedule = { type: "WEEKLY", timeZone: "Asia/Kolkata", time: "18:00", weekdays: [1, 4] };
    expect(next(weekly, "2026-09-25T12:00:00.000Z")).toBe("2026-09-28T12:30:00.000Z");
    expect(next(weekly, "2026-09-28T12:30:00.000Z")).toBe("2026-10-01T12:30:00.000Z");
    expect(next({ type: "WEEKLY", timeZone: "Europe/London", time: "09:00", weekdays: [0] }, "2026-10-24T00:00:00.000Z")).toBe("2026-10-25T09:00:00.000Z");
    expect(next({ type: "WEEKLY", timeZone: "UTC", time: "09:00", weekdays: [5] }, "2026-09-25T09:00:00.000Z")).toBe("2026-10-02T09:00:00.000Z");
  });

  it("uses the last day of shorter months for MONTHLY", () => {
    const monthly: Schedule = { type: "MONTHLY", timeZone: "Asia/Tokyo", time: "10:00", dayOfMonth: 31 };
    expect(next(monthly, "2026-01-31T02:00:00.000Z")).toBe("2026-02-28T01:00:00.000Z");
    expect(next(monthly, "2026-02-28T01:00:00.000Z")).toBe("2026-03-31T01:00:00.000Z");
    expect(next({ type: "MONTHLY", timeZone: "UTC", time: "00:00", dayOfMonth: 1 }, "2026-12-15T00:00:00.000Z")).toBe("2027-01-01T00:00:00.000Z");
  });

  it("respects start and end dates", () => {
    const daily: Schedule = { type: "DAILY", timeZone: "UTC", time: "09:00", startDate: "2026-10-01", endDate: "2026-10-02" };
    expect(next(daily, "2026-09-25T12:00:00.000Z")).toBe("2026-10-01T09:00:00.000Z");
    expect(next(daily, "2026-10-02T08:00:00.000Z")).toBe("2026-10-02T09:00:00.000Z");
    expect(next(daily, "2026-10-02T09:00:00.000Z")).toBeUndefined();
    const local: Schedule = { type: "DAILY", timeZone: "America/Los_Angeles", time: "23:30", endDate: "2026-09-25" };
    expect(next(local, "2026-09-25T12:00:00.000Z")).toBe("2026-09-26T06:30:00.000Z");
  });

  it("describes schedules in plain words", () => {
    expect(describeSchedule({ type: "WEEKLY", timeZone: "UTC", time: "09:00", weekdays: [4, 1] })).toBe("Every Monday, Thursday at 09:00 (UTC)");
    expect(describeSchedule({ type: "INTERVAL", timeZone: "UTC", intervalMinutes: 120 })).toBe("Every 2 hours (UTC)");
  });
});
