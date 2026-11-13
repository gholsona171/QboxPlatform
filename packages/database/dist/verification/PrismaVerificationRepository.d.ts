import { type AttemptCreateData, type AttemptFilter, type PendingMember, type VerificationAttempt, type VerificationRepository, type VerificationSettings, type VerificationSettingsInput, type VerificationStats } from "@qbox/verification";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "verificationSettings" | "verificationAttempt" | "verificationPendingMember">;
/** PostgreSQL verification settings, attempts, and pending members. `guildId` is the Discord guild ID. */
export declare class PrismaVerificationRepository implements VerificationRepository {
    private readonly client;
    constructor(client: Client);
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
export {};
//# sourceMappingURL=PrismaVerificationRepository.d.ts.map