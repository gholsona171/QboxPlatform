import type { AttemptCreateData, AttemptFilter, PendingMember, VerificationAttempt, VerificationRepository, VerificationSettings, VerificationSettingsInput, VerificationStats } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryVerificationRepository implements VerificationRepository {
    readonly settingsByGuild: Map<string, VerificationSettings>;
    readonly attemptList: VerificationAttempt[];
    readonly pending: Map<string, PendingMember>;
    getSettings(guildId: string): Promise<VerificationSettings | undefined>;
    saveSettings(input: VerificationSettingsInput): Promise<VerificationSettings>;
    setPanelMessage(guildId: string, channelId: string, messageId: string): Promise<void>;
    listKickEnabled(): Promise<readonly VerificationSettings[]>;
    recordAttempt(input: AttemptCreateData): Promise<VerificationAttempt>;
    listAttempts(filter: AttemptFilter): Promise<readonly VerificationAttempt[]>;
    failuresSince(guildId: string, userId: string, since: Date): Promise<readonly Date[]>;
    upsertPending(member: PendingMember): Promise<void>;
    getPending(guildId: string, userId: string): Promise<PendingMember | undefined>;
    deletePending(guildId: string, userId: string): Promise<void>;
    listPendingBefore(guildId: string, before: Date, limit: number): Promise<readonly PendingMember[]>;
    stats(guildId: string, since: Date): Promise<VerificationStats>;
}
//# sourceMappingURL=InMemoryVerificationRepository.d.ts.map