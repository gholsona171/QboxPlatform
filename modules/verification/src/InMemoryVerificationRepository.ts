import { randomUUID } from "node:crypto";

import { defaultVerificationSettings } from "./VerificationService.js";
import type {
  AttemptCreateData,
  AttemptFilter,
  PendingMember,
  VerificationAttempt,
  VerificationRepository,
  VerificationSettings,
  VerificationSettingsInput,
  VerificationStats,
} from "./types.js";
import { VerificationError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryVerificationRepository implements VerificationRepository {
  public readonly settingsByGuild = new Map<string, VerificationSettings>();
  public readonly attemptList: VerificationAttempt[] = [];
  public readonly pending = new Map<string, PendingMember>();

  public async getSettings(guildId: string): Promise<VerificationSettings | undefined> {
    return this.settingsByGuild.get(guildId);
  }

  public async saveSettings(input: VerificationSettingsInput): Promise<VerificationSettings> {
    const current = this.settingsByGuild.get(input.guildId) ?? defaultVerificationSettings(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new VerificationError("CONFLICT", "Verification settings changed since they were loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const saved: VerificationSettings = {
      ...rest,
      ...(current.panelChannelId ? { panelChannelId: current.panelChannelId } : {}),
      ...(current.panelMessageId ? { panelMessageId: current.panelMessageId } : {}),
      revision: current.revision + 1,
    };
    this.settingsByGuild.set(input.guildId, saved);
    return saved;
  }

  public async setPanelMessage(guildId: string, channelId: string, messageId: string): Promise<void> {
    const current = this.settingsByGuild.get(guildId);
    if (current) this.settingsByGuild.set(guildId, { ...current, panelChannelId: channelId, panelMessageId: messageId });
  }

  public async listKickEnabled(): Promise<readonly VerificationSettings[]> {
    return [...this.settingsByGuild.values()].filter((item) => item.enabled && item.kickUnverifiedMinutes > 0);
  }

  public async recordAttempt(input: AttemptCreateData): Promise<VerificationAttempt> {
    const created: VerificationAttempt = { ...input, id: randomUUID() };
    this.attemptList.push(created);
    return created;
  }

  public async listAttempts(filter: AttemptFilter): Promise<readonly VerificationAttempt[]> {
    const search = filter.search?.toLowerCase();
    return this.attemptList
      .filter((item) => item.guildId === filter.guildId)
      .filter((item) => !filter.results || filter.results.includes(item.result))
      .filter((item) => !filter.userId || item.userId === filter.userId)
      .filter((item) => !search || `${item.userName} ${item.userId} ${item.reason ?? ""}`.toLowerCase().includes(search))
      .reverse()
      .slice(0, filter.limit ?? 50);
  }

  public async failuresSince(guildId: string, userId: string, since: Date): Promise<readonly Date[]> {
    return this.attemptList
      .filter((item) => item.guildId === guildId && item.userId === userId && item.result === "FAILED" && item.createdAt >= since)
      .map((item) => item.createdAt);
  }

  public async upsertPending(member: PendingMember): Promise<void> {
    this.pending.set(`${member.guildId}:${member.userId}`, member);
  }

  public async getPending(guildId: string, userId: string): Promise<PendingMember | undefined> {
    return this.pending.get(`${guildId}:${userId}`);
  }

  public async deletePending(guildId: string, userId: string): Promise<void> {
    this.pending.delete(`${guildId}:${userId}`);
  }

  public async listPendingBefore(guildId: string, before: Date, limit: number): Promise<readonly PendingMember[]> {
    return [...this.pending.values()]
      .filter((item) => item.guildId === guildId && item.joinedAt <= before)
      .sort((left, right) => left.joinedAt.getTime() - right.joinedAt.getTime())
      .slice(0, limit);
  }

  public async stats(guildId: string, since: Date): Promise<VerificationStats> {
    const attempts = this.attemptList.filter((item) => item.guildId === guildId);
    const recent = attempts.filter((item) => item.createdAt >= since);
    const count = (list: readonly VerificationAttempt[], ...results: VerificationAttempt["result"][]) => list.filter((item) => results.includes(item.result)).length;
    return {
      verified24h: count(recent, "PASSED", "MANUAL"),
      failed24h: count(recent, "FAILED"),
      deniedAge24h: count(recent, "DENIED_AGE"),
      kicked24h: count(recent, "KICKED"),
      verifiedTotal: count(attempts, "PASSED", "MANUAL"),
      pending: [...this.pending.values()].filter((item) => item.guildId === guildId).length,
    };
  }
}
