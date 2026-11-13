import { type MessageTemplates } from "@qbox/shared/messages";
import { type ZonedDateTime } from "@qbox/shared/time-zones";
import type { Birthday, BirthdayActor, BirthdayAnnouncement, BirthdayGateway, BirthdayInput, BirthdayRepository, BirthdaySettings, BirthdaySettingsInput, BirthdayWrite, UpcomingBirthday } from "./types.js";
export declare const DEFAULT_BIRTHDAY_MESSAGE = "Happy birthday, {user}! \uD83C\uDF82";
export declare function defaultBirthdaySettings(guildId: string): BirthdaySettings;
/** Fills `{user}`, `{age}`, and `{server}` in a birthday message. */
export declare function renderBirthdayMessage(template: string, userId: string, age: number | undefined, server: string): string;
/** True when `local` is the member's birthday. February 29 birthdays are on February 28 in other years. */
export declare function isBirthdayOn(birthday: Pick<Birthday, "month" | "day">, local: Pick<ZonedDateTime, "year" | "month" | "day">): boolean;
/** Next birthday on or after `today` (a calendar date). */
export declare function nextBirthday(birthday: Birthday, today: {
    readonly year: number;
    readonly month: number;
    readonly day: number;
}): UpcomingBirthday;
/**
 * Birthday rules shared by the bot and the API: saving dates, lists, and the
 * timer that posts birthday messages and gives the birthday role for the
 * member's day in their own time zone.
 */
export declare class BirthdayService {
    private readonly repository;
    private readonly gateway?;
    private readonly now;
    private readonly templates;
    constructor(repository: BirthdayRepository, gateway?: BirthdayGateway | undefined, now?: () => Date, templates?: MessageTemplates);
    settings(guildId: string): Promise<BirthdaySettings>;
    saveSettings(input: BirthdaySettingsInput): Promise<BirthdaySettings>;
    /**
     * Checks a birthday without saving it. `needsConfirmation` is true when the
     * member must confirm their own date first.
     */
    check(input: BirthdayInput, actor: BirthdayActor): Promise<{
        readonly write: BirthdayWrite;
        readonly needsConfirmation: boolean;
    }>;
    /** Saves a birthday. Members change their own; managers can change anyone's. */
    set(input: BirthdayInput, actor: BirthdayActor): Promise<Birthday>;
    remove(guildId: string, userId: string, actor: BirthdayActor): Promise<Birthday>;
    get(guildId: string, userId: string): Promise<Birthday | undefined>;
    /** Every birthday with its next date, soonest first. */
    list(guildId: string, search?: string): Promise<readonly UpcomingBirthday[]>;
    /** Birthdays in the next `days` days (today included). */
    upcoming(guildId: string, days?: number): Promise<readonly UpcomingBirthday[]>;
    /** The soonest birthday date and everyone on it. */
    next(guildId: string): Promise<readonly UpcomingBirthday[]>;
    /** Posts a sample birthday message for `userId` in the announcement channel. */
    sendTest(guildId: string, userId: string): Promise<{
        readonly messageId: string;
    }>;
    /** Posts due birthday messages, gives birthday roles, and removes expired ones. */
    tick(): Promise<{
        readonly announced: number;
        readonly rolesRemoved: number;
    }>;
    private celebrate;
    /** The `birthdays.announcement` message: the server's custom version or the built-in one. */
    private announcement;
}
/** Message sent for a birthday, also used for the portal test message. */
export declare function announcement(settings: BirthdaySettings, userId: string, age: number | undefined, server: string): BirthdayAnnouncement;
//# sourceMappingURL=BirthdayService.d.ts.map