import type { Birthday, BirthdayPatch, BirthdayRepository, BirthdaySettings, BirthdaySettingsInput, BirthdayWrite } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryBirthdayRepository implements BirthdayRepository {
    private readonly now;
    readonly settingsByGuild: Map<string, BirthdaySettings>;
    readonly birthdays: Birthday[];
    constructor(now?: () => Date);
    getSettings(guildId: string): Promise<BirthdaySettings | undefined>;
    saveSettings(input: BirthdaySettingsInput): Promise<BirthdaySettings>;
    listEnabledSettings(): Promise<readonly BirthdaySettings[]>;
    upsert(input: BirthdayWrite): Promise<Birthday>;
    get(guildId: string, userId: string): Promise<Birthday | undefined>;
    remove(guildId: string, userId: string): Promise<Birthday | undefined>;
    list(guildId: string, search?: string): Promise<readonly Birthday[]>;
    listOnDates(guildId: string, dates: readonly {
        readonly month: number;
        readonly day: number;
    }[]): Promise<readonly Birthday[]>;
    listRoleExpired(now: Date): Promise<readonly Birthday[]>;
    update(id: string, patch: BirthdayPatch): Promise<Birthday>;
}
//# sourceMappingURL=InMemoryBirthdayRepository.d.ts.map