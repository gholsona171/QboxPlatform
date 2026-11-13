import type { Schedule } from "./types.js";
export declare const WEEKDAY_NAMES: readonly ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export interface CalendarDate {
    readonly year: number;
    readonly month: number;
    readonly day: number;
}
/** `YYYY-MM-DD` to a calendar date, or undefined when it is not a real date. */
export declare function parseDate(value: string): CalendarDate | undefined;
/** `HH:MM` to hours and minutes, or undefined. */
export declare function parseTime(value: string): {
    readonly hour: number;
    readonly minute: number;
} | undefined;
/** `YYYY-MM-DDTHH:MM` to a date and time, or undefined. */
export declare function parseDateTime(value: string): (CalendarDate & {
    readonly hour: number;
    readonly minute: number;
}) | undefined;
/**
 * The first post strictly after `after`, or undefined when the schedule has
 * no more posts. `anchor` is when an INTERVAL schedule without a start date
 * began counting (usually when it was created).
 */
export declare function nextRun(schedule: Schedule, after: Date, anchor: Date): Date | undefined;
/** Plain description of a schedule, for lists. */
export declare function describeSchedule(schedule: Schedule): string;
//# sourceMappingURL=schedule.d.ts.map