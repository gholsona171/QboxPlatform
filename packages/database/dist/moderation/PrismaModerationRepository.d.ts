import { type CaseCreateData, type CaseFilter, type CasePatch, type CaseType, type ModerationCase, type ModerationRepository, type ModerationSettings, type ModerationSettingsInput, type ModerationStats } from "@qbox/moderation";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "moderationSettings" | "moderationCase">;
/** PostgreSQL moderation settings and cases. `guildId` is the Discord guild ID. */
export declare class PrismaModerationRepository implements ModerationRepository {
    private readonly client;
    constructor(client: Client);
    getSettings(guildId: string): Promise<ModerationSettings | undefined>;
    saveSettings(input: ModerationSettingsInput): Promise<ModerationSettings>;
    allocateCaseNumber(guildId: string): Promise<number>;
    createCase(input: CaseCreateData): Promise<ModerationCase>;
    getCase(guildId: string, number: number): Promise<ModerationCase | undefined>;
    listCases(filter: CaseFilter): Promise<readonly ModerationCase[]>;
    updateCase(id: string, patch: CasePatch): Promise<ModerationCase>;
    listExpired(types: readonly CaseType[], now: Date): Promise<readonly ModerationCase[]>;
    countActiveWarnings(guildId: string, targetId: string, since?: Date): Promise<number>;
    stats(guildId: string, now: Date): Promise<ModerationStats>;
}
export {};
//# sourceMappingURL=PrismaModerationRepository.d.ts.map