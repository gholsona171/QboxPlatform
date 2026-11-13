import type { OutgoingMessage } from "@qbox/shared/messages";
export interface BirthdaySettings {
    readonly guildId: string;
    readonly enabled: boolean;
    /** Where birthday messages are posted. */
    readonly channelId?: string | undefined;
    /** Message template with `{user}`, `{age}`, and `{server}`. */
    readonly message: string;
    readonly embedColor: string;
    /** Role given for the member's birthday and removed when their day ends. */
    readonly roleId?: string | undefined;
    /** Hour (0-23) in the member's own time zone when the message is posted. */
    readonly announceHour: number;
    /** Role pinged with each birthday message. */
    readonly pingRoleId?: string | undefined;
    /** Members may save their birth year. */
    readonly allowYear: boolean;
    /** Members must confirm their date before it is saved. */
    readonly requireConfirmation: boolean;
    readonly revision: number;
}
export interface BirthdaySettingsInput extends Omit<BirthdaySettings, "revision"> {
    readonly expectedRevision?: number | undefined;
}
export interface Birthday {
    readonly id: string;
    readonly guildId: string;
    readonly userId: string;
    readonly displayName: string;
    readonly month: number;
    readonly day: number;
    readonly year?: number | undefined;
    readonly showAge: boolean;
    readonly timeZone: string;
    /** Local year of the last birthday message, so each birthday posts once. */
    readonly lastAnnouncedYear?: number | undefined;
    /** Role given for the current birthday, removed at `roleRemoveAt`. */
    readonly grantedRoleId?: string | undefined;
    readonly roleRemoveAt?: Date | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface BirthdayWrite {
    readonly guildId: string;
    readonly userId: string;
    readonly displayName: string;
    readonly month: number;
    readonly day: number;
    readonly year?: number | undefined;
    readonly showAge: boolean;
    readonly timeZone: string;
}
export interface BirthdayPatch {
    readonly lastAnnouncedYear?: number;
    readonly grantedRoleId?: string | null;
    readonly roleRemoveAt?: Date | null;
}
export interface BirthdayRepository {
    getSettings(guildId: string): Promise<BirthdaySettings | undefined>;
    saveSettings(input: BirthdaySettingsInput): Promise<BirthdaySettings>;
    /** Guilds with birthdays turned on. */
    listEnabledSettings(): Promise<readonly BirthdaySettings[]>;
    /** Creates or replaces a member's birthday. Changing the date resets `lastAnnouncedYear`. */
    upsert(input: BirthdayWrite): Promise<Birthday>;
    get(guildId: string, userId: string): Promise<Birthday | undefined>;
    remove(guildId: string, userId: string): Promise<Birthday | undefined>;
    /** Every birthday in the guild, optionally filtered by name or ID. */
    list(guildId: string, search?: string): Promise<readonly Birthday[]>;
    /** Birthdays on any of the given month/day pairs. */
    listOnDates(guildId: string, dates: readonly {
        readonly month: number;
        readonly day: number;
    }[]): Promise<readonly Birthday[]>;
    /** Birthdays whose role should be removed by `now`, across all guilds. */
    listRoleExpired(now: Date): Promise<readonly Birthday[]>;
    update(id: string, patch: BirthdayPatch): Promise<Birthday>;
}
/** The rendered `birthdays.announcement` message plus who it may ping. */
export interface BirthdayAnnouncement extends OutgoingMessage {
    readonly mentionUserIds: readonly string[];
    readonly mentionRoleIds: readonly string[];
}
/** Discord operations birthdays need. */
export interface BirthdayGateway {
    guildName(guildId: string): Promise<string>;
    post(channelId: string, announcement: BirthdayAnnouncement): Promise<{
        readonly messageId: string;
    }>;
    addRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
    removeRole(guildId: string, userId: string, roleId: string, reason: string): Promise<void>;
}
/** Who is changing a birthday. `manager` holds birthdays.manage. */
export interface BirthdayActor {
    readonly userId: string;
    readonly displayName: string;
    readonly manager: boolean;
}
export interface BirthdayInput {
    readonly guildId: string;
    readonly userId: string;
    readonly displayName: string;
    readonly month: number;
    readonly day: number;
    readonly year?: number | undefined;
    readonly showAge?: boolean | undefined;
    readonly timeZone?: string | undefined;
    /** The member confirmed the date (needed when the server requires confirmation). */
    readonly confirmed?: boolean | undefined;
}
/** A birthday with its next date, for lists and calendars. */
export interface UpcomingBirthday {
    readonly birthday: Birthday;
    /** Next birthday date as `YYYY-MM-DD` (today counts). */
    readonly date: string;
    readonly daysUntil: number;
    /** Age they turn on that date, when the year is known and shown. */
    readonly turning?: number | undefined;
}
//# sourceMappingURL=types.d.ts.map