import { randomUUID } from "node:crypto";

import { defaultModerationSettings } from "./ModerationService.js";
import type {
  CaseCreateData,
  CaseFilter,
  CasePatch,
  CaseType,
  ModerationCase,
  ModerationRepository,
  ModerationSettings,
  ModerationSettingsInput,
  ModerationStats,
} from "./types.js";
import { ModerationError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryModerationRepository implements ModerationRepository {
  public readonly settingsByGuild = new Map<string, ModerationSettings>();
  public readonly cases: ModerationCase[] = [];
  private readonly counters = new Map<string, number>();

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async getSettings(guildId: string): Promise<ModerationSettings | undefined> {
    return this.settingsByGuild.get(guildId);
  }

  public async saveSettings(input: ModerationSettingsInput): Promise<ModerationSettings> {
    const current = this.settingsByGuild.get(input.guildId) ?? defaultModerationSettings(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new ModerationError("CONFLICT", "Moderation settings changed since they were loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const saved = { ...rest, revision: current.revision + 1 };
    this.settingsByGuild.set(input.guildId, saved);
    return saved;
  }

  public async allocateCaseNumber(guildId: string): Promise<number> {
    const next = (this.counters.get(guildId) ?? 0) + 1;
    this.counters.set(guildId, next);
    return next;
  }

  public async createCase(input: CaseCreateData): Promise<ModerationCase> {
    const now = this.now();
    const created: ModerationCase = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    this.cases.push(created);
    return created;
  }

  public async getCase(guildId: string, number: number): Promise<ModerationCase | undefined> {
    return this.cases.find((item) => item.guildId === guildId && item.number === number);
  }

  public async listCases(filter: CaseFilter): Promise<readonly ModerationCase[]> {
    const search = filter.search?.toLowerCase();
    return this.cases
      .filter((item) => item.guildId === filter.guildId)
      .filter((item) => !filter.types || filter.types.includes(item.type))
      .filter((item) => !filter.targetId || item.targetId === filter.targetId)
      .filter((item) => !filter.moderatorId || item.moderatorId === filter.moderatorId)
      .filter((item) => filter.active === undefined || item.active === filter.active)
      .filter((item) => !filter.source || item.source === filter.source)
      .filter((item) => !search || `${item.targetName} ${item.reason ?? ""} ${item.number}`.toLowerCase().includes(search))
      .sort((left, right) => right.number - left.number)
      .slice(0, filter.limit ?? 50);
  }

  public async updateCase(id: string, patch: CasePatch): Promise<ModerationCase> {
    const index = this.cases.findIndex((item) => item.id === id);
    const current = this.cases[index];
    if (!current) throw new ModerationError("NOT_FOUND", "Case was not found.");
    const next: Record<string, unknown> = { ...current, updatedAt: this.now() };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as ModerationCase;
    this.cases[index] = updated;
    return updated;
  }

  public async listExpired(types: readonly CaseType[], now: Date): Promise<readonly ModerationCase[]> {
    return this.cases.filter((item) => types.includes(item.type) && item.active && item.expiresAt !== undefined && item.expiresAt <= now);
  }

  public async countActiveWarnings(guildId: string, targetId: string, since?: Date): Promise<number> {
    return this.cases.filter((item) => item.guildId === guildId && item.targetId === targetId && item.type === "WARN" && item.active && !item.revokedAt && (!since || item.createdAt >= since)).length;
  }

  public async stats(guildId: string, now: Date): Promise<ModerationStats> {
    const cases = this.cases.filter((item) => item.guildId === guildId);
    const byType: Partial<Record<CaseType, number>> = {};
    for (const item of cases) byType[item.type] = (byType[item.type] ?? 0) + 1;
    return {
      total: cases.length,
      last7Days: cases.filter((item) => now.getTime() - item.createdAt.getTime() < 7 * 86_400_000).length,
      byType,
      activeBans: cases.filter((item) => item.type === "BAN" && item.active).length,
      activeTimeouts: cases.filter((item) => item.type === "TIMEOUT" && item.active).length,
      topModerators: [],
      automodActions: cases.filter((item) => item.source === "AUTOMOD").length,
    };
  }
}
