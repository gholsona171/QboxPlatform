import { type Birthday, type BirthdayPatch, type BirthdayRepository, type BirthdaySettings, type BirthdaySettingsInput, type BirthdayWrite } from "@qbox/birthdays";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "birthdaySettings" | "birthday">;
/** PostgreSQL birthday settings and member birthdays. `guildId` is the Discord guild ID. */
export declare class PrismaBirthdayRepository implements BirthdayRepository {
    private readonly client;
    constructor(client: Client);
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
export {};
//# sourceMappingURL=PrismaBirthdayRepository.d.ts.map