import { addDays, isLeapYear, zonedParts, zonedTimeToUtc, type ZonedDateTime } from "@qbox/shared/time-zones";

import type {
  Birthday,
  BirthdayActor,
  BirthdayAnnouncement,
  BirthdayGateway,
  BirthdayInput,
  BirthdayRepository,
  BirthdaySettings,
  BirthdaySettingsInput,
  BirthdayWrite,
  UpcomingBirthday,
} from "./types.js";
import { BirthdayError, invalid, requireDate, requireSnowflake, requireTimeZone, validateSettings } from "./validation.js";
import { BRAND } from "@qbox/shared/brand";

const DAY_MS = 86_400_000;
export const DEFAULT_BIRTHDAY_MESSAGE = "Happy birthday, {user}! 🎂";

export function defaultBirthdaySettings(guildId: string): BirthdaySettings {
  return {
    guildId,
    enabled: false,
    message: DEFAULT_BIRTHDAY_MESSAGE,
    embedColor: "#F47FFF",
    announceHour: 9,
    allowYear: true,
    requireConfirmation: false,
    revision: 0,
  };
}

/** Fills `{user}`, `{age}`, and `{server}` in a birthday message. */
export function renderBirthdayMessage(template: string, userId: string, age: number | undefined, server: string): string {
  return template
    .replaceAll("{user}", `<@${userId}>`)
    .replaceAll("{age}", age === undefined ? "" : String(age))
    .replaceAll("{server}", server)
    .replace(/ {2,}/g, " ")
    .replace(/ ([,.!?])/g, "$1")
    .trim();
}

/** True when `local` is the member's birthday. February 29 birthdays are on February 28 in other years. */
export function isBirthdayOn(birthday: Pick<Birthday, "month" | "day">, local: Pick<ZonedDateTime, "year" | "month" | "day">): boolean {
  if (birthday.month === local.month && birthday.day === local.day) return true;
  return birthday.month === 2 && birthday.day === 29 && !isLeapYear(local.year) && local.month === 2 && local.day === 28;
}

/** Next birthday on or after `today` (a calendar date). */
export function nextBirthday(birthday: Birthday, today: { readonly year: number; readonly month: number; readonly day: number }): UpcomingBirthday {
  const start = Date.UTC(today.year, today.month - 1, today.day);
  for (const year of [today.year, today.year + 1]) {
    const day = birthday.month === 2 && birthday.day === 29 && !isLeapYear(year) ? 28 : birthday.day;
    const at = Date.UTC(year, birthday.month - 1, day);
    if (at < start) continue;
    return {
      birthday,
      date: `${year}-${String(birthday.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      daysUntil: Math.round((at - start) / DAY_MS),
      ...(birthday.year !== undefined && birthday.showAge ? { turning: year - birthday.year } : {}),
    };
  }
  throw new BirthdayError("INVALID_STATE", "Could not work out the next birthday.");
}

/**
 * Birthday rules shared by the bot and the API: saving dates, lists, and the
 * timer that posts birthday messages and gives the birthday role for the
 * member's day in their own time zone.
 */
export class BirthdayService {
  public constructor(
    private readonly repository: BirthdayRepository,
    private readonly gateway?: BirthdayGateway,
    private readonly now: () => Date = () => new Date(),
  ) {}

  public async settings(guildId: string): Promise<BirthdaySettings> {
    requireSnowflake("guildId", guildId);
    return (await this.repository.getSettings(guildId)) ?? defaultBirthdaySettings(guildId);
  }

  public async saveSettings(input: BirthdaySettingsInput): Promise<BirthdaySettings> {
    validateSettings(input);
    return this.repository.saveSettings({ ...input, message: input.message.trim() });
  }

  /**
   * Checks a birthday without saving it. `needsConfirmation` is true when the
   * member must confirm their own date first.
   */
  public async check(input: BirthdayInput, actor: BirthdayActor): Promise<{ readonly write: BirthdayWrite; readonly needsConfirmation: boolean }> {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("Member", input.userId);
    const self = input.userId === actor.userId;
    if (!self && !actor.manager) throw new BirthdayError("FORBIDDEN", "You can only change your own birthday.");
    const settings = await this.settings(input.guildId);
    if (input.year !== undefined && !settings.allowYear) invalid("This server does not save birth years. Leave the year empty.");
    requireDate(input.month, input.day, input.year, this.now().getUTCFullYear());
    const timeZone = requireTimeZone(input.timeZone ?? "UTC");
    return {
      write: {
        guildId: input.guildId,
        userId: input.userId,
        displayName: input.displayName.trim().slice(0, 100) || input.userId,
        month: input.month,
        day: input.day,
        ...(input.year === undefined ? {} : { year: input.year }),
        showAge: input.year !== undefined && input.showAge === true,
        timeZone,
      },
      needsConfirmation: self && settings.requireConfirmation && input.confirmed !== true,
    };
  }

  /** Saves a birthday. Members change their own; managers can change anyone's. */
  public async set(input: BirthdayInput, actor: BirthdayActor): Promise<Birthday> {
    const { write, needsConfirmation } = await this.check(input, actor);
    if (needsConfirmation) throw new BirthdayError("INVALID_STATE", "Please confirm your birthday before it is saved.");
    return this.repository.upsert(write);
  }

  public async remove(guildId: string, userId: string, actor: BirthdayActor): Promise<Birthday> {
    requireSnowflake("Member", userId);
    if (userId !== actor.userId && !actor.manager) throw new BirthdayError("FORBIDDEN", "You can only remove your own birthday.");
    const removed = await this.repository.remove(guildId, userId);
    if (!removed) throw new BirthdayError("NOT_FOUND", userId === actor.userId ? "You have not saved a birthday." : "No birthday is saved for that member.");
    if (removed.grantedRoleId && this.gateway)
      await this.gateway.removeRole(guildId, userId, removed.grantedRoleId, "Birthday removed").catch(() => undefined);
    return removed;
  }

  public async get(guildId: string, userId: string): Promise<Birthday | undefined> {
    requireSnowflake("guildId", guildId);
    requireSnowflake("Member", userId);
    return this.repository.get(guildId, userId);
  }

  /** Every birthday with its next date, soonest first. */
  public async list(guildId: string, search?: string): Promise<readonly UpcomingBirthday[]> {
    requireSnowflake("guildId", guildId);
    const term = search?.trim().slice(0, 100) || undefined;
    const birthdays = await this.repository.list(guildId, term);
    return birthdays.map((birthday) => nextBirthday(birthday, zonedParts(this.now(), birthday.timeZone))).sort((left, right) => left.daysUntil - right.daysUntil || left.birthday.displayName.localeCompare(right.birthday.displayName));
  }

  /** Birthdays in the next `days` days (today included). */
  public async upcoming(guildId: string, days = 30): Promise<readonly UpcomingBirthday[]> {
    return (await this.list(guildId)).filter((item) => item.daysUntil <= days);
  }

  /** The soonest birthday date and everyone on it. */
  public async next(guildId: string): Promise<readonly UpcomingBirthday[]> {
    const all = await this.list(guildId);
    const first = all[0];
    return first ? all.filter((item) => item.date === first.date) : [];
  }

  /** Posts a sample birthday message for `userId` in the announcement channel. */
  public async sendTest(guildId: string, userId: string): Promise<{ readonly messageId: string }> {
    const settings = await this.settings(guildId);
    if (!settings.channelId) throw new BirthdayError("INVALID_STATE", "Choose an announcement channel first.");
    if (!this.gateway) throw new BirthdayError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
    const server = await this.gateway.guildName(guildId).catch(() => "the server");
    try {
      return await this.gateway.post(settings.channelId, announcement(settings, userId, 21, server));
    } catch {
      throw new BirthdayError("DEPENDENCY_UNAVAILABLE", `${BRAND.name} could not post in the announcement channel. Check its permissions there.`);
    }
  }

  /** Posts due birthday messages, gives birthday roles, and removes expired ones. */
  public async tick(): Promise<{ readonly announced: number; readonly rolesRemoved: number }> {
    const now = this.now();
    let rolesRemoved = 0;
    for (const expired of await this.repository.listRoleExpired(now)) {
      if (expired.grantedRoleId && this.gateway)
        await this.gateway.removeRole(expired.guildId, expired.userId, expired.grantedRoleId, "Birthday is over").catch(() => undefined);
      await this.repository.update(expired.id, { grantedRoleId: null, roleRemoveAt: null });
      rolesRemoved += 1;
    }
    let announced = 0;
    for (const settings of await this.repository.listEnabledSettings()) {
      for (const birthday of await this.repository.listOnDates(settings.guildId, candidateDates(now))) {
        const local = zonedParts(now, birthday.timeZone);
        if (!isBirthdayOn(birthday, local) || local.hour < settings.announceHour || birthday.lastAnnouncedYear === local.year) continue;
        await this.celebrate(settings, birthday, local);
        announced += 1;
      }
    }
    return { announced, rolesRemoved };
  }

  private async celebrate(settings: BirthdaySettings, birthday: Birthday, local: ZonedDateTime): Promise<void> {
    await this.repository.update(birthday.id, { lastAnnouncedYear: local.year });
    const gateway = this.gateway;
    if (!gateway) return;
    if (settings.roleId) {
      const next = addDays(local.year, local.month, local.day, 1);
      const removeAt = zonedTimeToUtc(birthday.timeZone, next.year, next.month, next.day);
      const given = await gateway.addRole(settings.guildId, birthday.userId, settings.roleId, "Birthday").then(() => true, () => false);
      if (given) await this.repository.update(birthday.id, { grantedRoleId: settings.roleId, roleRemoveAt: removeAt });
    }
    if (!settings.channelId) return;
    const age = birthday.year !== undefined && birthday.showAge ? local.year - birthday.year : undefined;
    const server = await gateway.guildName(settings.guildId).catch(() => "the server");
    await gateway.post(settings.channelId, announcement(settings, birthday.userId, age, server)).catch(() => undefined);
  }
}

/** Message sent for a birthday, also used for the portal test message. */
export function announcement(settings: BirthdaySettings, userId: string, age: number | undefined, server: string): BirthdayAnnouncement {
  return {
    content: `<@${userId}>${settings.pingRoleId ? ` <@&${settings.pingRoleId}>` : ""}`,
    description: renderBirthdayMessage(settings.message, userId, age, server),
    color: settings.embedColor,
    mentionUserIds: [userId],
    mentionRoleIds: settings.pingRoleId ? [settings.pingRoleId] : [],
  };
}

/** UTC yesterday, today, and tomorrow cover every time zone's current date. */
function candidateDates(now: Date): readonly { readonly month: number; readonly day: number }[] {
  const today = { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate() };
  const dates = [-1, 0, 1].map((offset) => addDays(today.year, today.month, today.day, offset));
  const leapDay = dates.some((date) => date.month === 2 && date.day === 28) ? [{ month: 2, day: 29 }] : [];
  return [...dates.map((date) => ({ month: date.month, day: date.day })), ...leapDay];
}
