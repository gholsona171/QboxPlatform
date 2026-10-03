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
/** The canonical name of an IANA time zone, or undefined when it is not valid. */
export declare function normalizeTimeZone(value: string): string | undefined;
/** Wall-clock parts of an instant in `timeZone`. */
export declare function zonedParts(instant: Date, timeZone: string): ZonedDateTime;
/** Milliseconds the zone is ahead of UTC at `instant` (negative west of UTC). */
export declare function zoneOffsetMs(instant: number, timeZone: string): number;
/**
 * The instant a wall-clock time happens in `timeZone`. Month and day may
 * overflow (day 32 is the next month). When the time happens twice (clocks
 * go back) the earlier instant is used; when it is skipped (clocks go
 * forward) the time is moved forward by the gap, like most calendars do.
 */
export declare function zonedTimeToUtc(timeZone: string, year: number, month: number, day: number, hour?: number, minute?: number): Date;
/** Calendar date `days` after the given date (handles month and year ends). */
export declare function addDays(year: number, month: number, day: number, days: number): {
    readonly year: number;
    readonly month: number;
    readonly day: number;
    readonly weekday: number;
};
export declare function daysInMonth(year: number, month: number): number;
export declare function isLeapYear(year: number): boolean;
//# sourceMappingURL=timeZones.d.ts.map