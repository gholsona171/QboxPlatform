import type { CaseCreateData, CaseFilter, CasePatch, CaseType, ModerationCase, ModerationRepository, ModerationSettings, ModerationSettingsInput, ModerationStats } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryModerationRepository implements ModerationRepository {
    private readonly now;
    readonly settingsByGuild: Map<string, ModerationSettings>;
    readonly cases: ModerationCase[];
    private readonly counters;
    constructor(now?: () => Date);
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
//# sourceMappingURL=InMemoryModerationRepository.d.ts.map