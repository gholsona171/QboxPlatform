import { randomUUID } from "node:crypto";

import { defaultBirthdaySettings } from "./BirthdayService.js";
import type { Birthday, BirthdayPatch, BirthdayRepository, BirthdaySettings, BirthdaySettingsInput, BirthdayWrite } from "./types.js";
import { BirthdayError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryBirthdayRepository implements BirthdayRepository {
  public readonly settingsByGuild = new Map<string, BirthdaySettings>();
  public readonly birthdays: Birthday[] = [];

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async getSettings(guildId: string): Promise<BirthdaySettings | undefined> {
    return this.settingsByGuild.get(guildId);
  }

  public async saveSettings(input: BirthdaySettingsInput): Promise<BirthdaySettings> {
    const current = this.settingsByGuild.get(input.guildId) ?? defaultBirthdaySettings(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new BirthdayError("CONFLICT", "Birthday settings changed since they were loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const saved = { ...rest, revision: current.revision + 1 };
    this.settingsByGuild.set(input.guildId, saved);
    return saved;
  }

  public async listEnabledSettings(): Promise<readonly BirthdaySettings[]> {
    return [...this.settingsByGuild.values()].filter((settings) => settings.enabled);
  }

  public async upsert(input: BirthdayWrite): Promise<Birthday> {
    const index = this.birthdays.findIndex((item) => item.guildId === input.guildId && item.userId === input.userId);
    const current = this.birthdays[index];
    const now = this.now();
    const sameDate = current && current.month === input.month && current.day === input.day;
    const saved: Birthday = {
      id: current?.id ?? randomUUID(),
      createdAt: current?.createdAt ?? now,
      ...input,
      ...(sameDate && current.lastAnnouncedYear !== undefined ? { lastAnnouncedYear: current.lastAnnouncedYear } : {}),
      ...(current?.grantedRoleId ? { grantedRoleId: current.grantedRoleId } : {}),
      ...(current?.roleRemoveAt ? { roleRemoveAt: current.roleRemoveAt } : {}),
      updatedAt: now,
    };
    if (current) this.birthdays[index] = saved;
    else this.birthdays.push(saved);
    return saved;
  }

  public async get(guildId: string, userId: string): Promise<Birthday | undefined> {
    return this.birthdays.find((item) => item.guildId === guildId && item.userId === userId);
  }

  public async remove(guildId: string, userId: string): Promise<Birthday | undefined> {
    const index = this.birthdays.findIndex((item) => item.guildId === guildId && item.userId === userId);
    return index < 0 ? undefined : this.birthdays.splice(index, 1)[0];
  }

  public async list(guildId: string, search?: string): Promise<readonly Birthday[]> {
    const term = search?.toLowerCase();
    return this.birthdays.filter((item) => item.guildId === guildId && (!term || item.displayName.toLowerCase().includes(term) || item.userId === term));
  }

  public async listOnDates(guildId: string, dates: readonly { readonly month: number; readonly day: number }[]): Promise<readonly Birthday[]> {
    return this.birthdays.filter((item) => item.guildId === guildId && dates.some((date) => date.month === item.month && date.day === item.day));
  }

  public async listRoleExpired(now: Date): Promise<readonly Birthday[]> {
    return this.birthdays.filter((item) => item.roleRemoveAt !== undefined && item.roleRemoveAt <= now);
  }

  public async update(id: string, patch: BirthdayPatch): Promise<Birthday> {
    const index = this.birthdays.findIndex((item) => item.id === id);
    const current = this.birthdays[index];
    if (!current) throw new BirthdayError("NOT_FOUND", "Birthday was not found.");
    const next: Record<string, unknown> = { ...current, updatedAt: this.now() };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as Birthday;
    this.birthdays[index] = updated;
    return updated;
  }
}
