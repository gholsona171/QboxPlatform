import { defaultLevelSettings } from "./LevelService.js";
import type { LevelActivity, LevelMember, LevelRepository, LevelSettings, LevelSettingsInput } from "./types.js";
import { LevelError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryLevelRepository implements LevelRepository {
  public readonly settingsByGuild = new Map<string, LevelSettings>();
  public readonly members = new Map<string, LevelMember>();

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async getSettings(guildId: string): Promise<LevelSettings | undefined> {
    return this.settingsByGuild.get(guildId);
  }

  public async saveSettings(input: LevelSettingsInput): Promise<LevelSettings> {
    const current = this.settingsByGuild.get(input.guildId) ?? defaultLevelSettings(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new LevelError("CONFLICT", "Level settings changed since they were loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, levelUpChannelId, ...rest } = input;
    const saved: LevelSettings = { ...rest, ...(levelUpChannelId ? { levelUpChannelId } : {}), revision: current.revision + 1 };
    this.settingsByGuild.set(input.guildId, saved);
    return saved;
  }

  public async getMember(guildId: string, userId: string): Promise<LevelMember | undefined> {
    return this.members.get(`${guildId}:${userId}`);
  }

  public async addActivity(guildId: string, userId: string, activity: LevelActivity): Promise<LevelMember> {
    const current = this.members.get(`${guildId}:${userId}`) ?? this.blank(guildId, userId);
    return this.store({
      ...current,
      xp: Math.max(0, current.xp + activity.xp),
      messages: current.messages + (activity.messages ?? 0),
      voiceMinutes: current.voiceMinutes + (activity.voiceMinutes ?? 0),
      ...(activity.lastMessageAt ? { lastMessageAt: activity.lastMessageAt } : {}),
      ...(activity.displayName ? { displayName: activity.displayName } : {}),
    });
  }

  public async setXp(guildId: string, userId: string, xp: number, displayName?: string): Promise<LevelMember> {
    const current = this.members.get(`${guildId}:${userId}`) ?? this.blank(guildId, userId);
    return this.store({ ...current, xp, ...(displayName ? { displayName } : {}) });
  }

  public async setLevel(guildId: string, userId: string, level: number): Promise<LevelMember> {
    const current = this.members.get(`${guildId}:${userId}`);
    if (!current) throw new LevelError("NOT_FOUND", "That member has no XP yet.");
    return this.store({ ...current, level });
  }

  public async deleteMember(guildId: string, userId: string): Promise<void> {
    this.members.delete(`${guildId}:${userId}`);
  }

  public async resetAll(guildId: string): Promise<readonly string[]> {
    const leveled: string[] = [];
    for (const [key, member] of this.members) {
      if (member.guildId !== guildId) continue;
      if (member.level > 0) leveled.push(member.userId);
      this.members.delete(key);
    }
    return leveled;
  }

  public async leaderboard(guildId: string, offset: number, limit: number): Promise<{ readonly members: readonly LevelMember[]; readonly total: number }> {
    const ranked = this.ranked(guildId);
    return { members: ranked.slice(offset, offset + limit), total: ranked.length };
  }

  public async rank(guildId: string, userId: string): Promise<number | undefined> {
    const index = this.ranked(guildId).findIndex((member) => member.userId === userId);
    return index < 0 ? undefined : index + 1;
  }

  public async search(guildId: string, query: string, limit: number): Promise<readonly LevelMember[]> {
    const text = query.toLowerCase();
    return this.ranked(guildId).filter((member) => member.userId === query || member.displayName.toLowerCase().includes(text)).slice(0, limit);
  }

  private ranked(guildId: string): LevelMember[] {
    return [...this.members.values()]
      .filter((member) => member.guildId === guildId)
      .sort((left, right) => right.xp - left.xp || left.userId.localeCompare(right.userId));
  }

  private blank(guildId: string, userId: string): LevelMember {
    return { guildId, userId, displayName: "", xp: 0, level: 0, messages: 0, voiceMinutes: 0, updatedAt: this.now() };
  }

  private store(member: LevelMember): LevelMember {
    const updated = { ...member, updatedAt: this.now() };
    this.members.set(`${member.guildId}:${member.userId}`, updated);
    return updated;
  }
}
