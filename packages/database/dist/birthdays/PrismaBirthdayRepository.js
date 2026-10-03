import { BirthdayError, } from "@qbox/birthdays";
/** PostgreSQL birthday settings and member birthdays. `guildId` is the Discord guild ID. */
export class PrismaBirthdayRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async getSettings(guildId) {
        const row = await this.client.birthdaySettings.findUnique({ where: { guildId } });
        return row ? mapSettings(row) : undefined;
    }
    async saveSettings(input) {
        const data = {
            enabled: input.enabled,
            channelId: input.channelId ?? null,
            message: input.message,
            embedColor: input.embedColor,
            roleId: input.roleId ?? null,
            announceHour: input.announceHour,
            pingRoleId: input.pingRoleId ?? null,
            allowYear: input.allowYear,
            requireConfirmation: input.requireConfirmation,
        };
        const existing = await this.client.birthdaySettings.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
        if (!existing) {
            if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
                throw new BirthdayError("CONFLICT", "Birthday settings changed since they were loaded.", { currentRevision: 0 });
            return mapSettings(await this.client.birthdaySettings.create({ data: { guildId: input.guildId, ...data } }));
        }
        const result = await this.client.birthdaySettings.updateMany({
            where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
            data: { ...data, revision: { increment: 1 } },
        });
        if (result.count === 0)
            throw new BirthdayError("CONFLICT", "Birthday settings changed since they were loaded.", { currentRevision: existing.revision });
        return mapSettings(await this.client.birthdaySettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
    }
    async listEnabledSettings() {
        return (await this.client.birthdaySettings.findMany({ where: { enabled: true } })).map(mapSettings);
    }
    async upsert(input) {
        const data = {
            displayName: input.displayName,
            month: input.month,
            day: input.day,
            year: input.year ?? null,
            showAge: input.showAge,
            timeZone: input.timeZone,
        };
        const existing = await this.client.birthday.findUnique({ where: { guildId_userId: { guildId: input.guildId, userId: input.userId } }, select: { month: true, day: true } });
        const moved = existing !== null && (existing.month !== input.month || existing.day !== input.day);
        return mapBirthday(await this.client.birthday.upsert({
            where: { guildId_userId: { guildId: input.guildId, userId: input.userId } },
            create: { guildId: input.guildId, userId: input.userId, ...data },
            update: { ...data, ...(moved ? { lastAnnouncedYear: null } : {}) },
        }));
    }
    async get(guildId, userId) {
        const row = await this.client.birthday.findUnique({ where: { guildId_userId: { guildId, userId } } });
        return row ? mapBirthday(row) : undefined;
    }
    async remove(guildId, userId) {
        const row = await this.client.birthday.findUnique({ where: { guildId_userId: { guildId, userId } } });
        if (!row)
            return undefined;
        await this.client.birthday.deleteMany({ where: { id: row.id } });
        return mapBirthday(row);
    }
    async list(guildId, search) {
        const rows = await this.client.birthday.findMany({
            where: {
                guildId,
                ...(search ? { OR: [{ displayName: { contains: search, mode: "insensitive" } }, { userId: search }] } : {}),
            },
            orderBy: [{ month: "asc" }, { day: "asc" }],
            take: 5000,
        });
        return rows.map(mapBirthday);
    }
    async listOnDates(guildId, dates) {
        if (dates.length === 0)
            return [];
        const rows = await this.client.birthday.findMany({ where: { guildId, OR: dates.map((date) => ({ month: date.month, day: date.day })) } });
        return rows.map(mapBirthday);
    }
    async listRoleExpired(now) {
        const rows = await this.client.birthday.findMany({ where: { roleRemoveAt: { lte: now } }, orderBy: { roleRemoveAt: "asc" }, take: 200 });
        return rows.map(mapBirthday);
    }
    async update(id, patch) {
        const data = {};
        if (patch.lastAnnouncedYear !== undefined)
            data.lastAnnouncedYear = patch.lastAnnouncedYear;
        if (patch.grantedRoleId !== undefined)
            data.grantedRoleId = patch.grantedRoleId;
        if (patch.roleRemoveAt !== undefined)
            data.roleRemoveAt = patch.roleRemoveAt;
        return mapBirthday(await this.client.birthday.update({ where: { id }, data }));
    }
}
function mapSettings(row) {
    return {
        guildId: row.guildId,
        enabled: row.enabled,
        ...(row.channelId ? { channelId: row.channelId } : {}),
        message: row.message,
        embedColor: row.embedColor,
        ...(row.roleId ? { roleId: row.roleId } : {}),
        announceHour: row.announceHour,
        ...(row.pingRoleId ? { pingRoleId: row.pingRoleId } : {}),
        allowYear: row.allowYear,
        requireConfirmation: row.requireConfirmation,
        revision: row.revision,
    };
}
function mapBirthday(row) {
    return {
        id: row.id,
        guildId: row.guildId,
        userId: row.userId,
        displayName: row.displayName,
        month: row.month,
        day: row.day,
        ...(row.year === null ? {} : { year: row.year }),
        showAge: row.showAge,
        timeZone: row.timeZone,
        ...(row.lastAnnouncedYear === null ? {} : { lastAnnouncedYear: row.lastAnnouncedYear }),
        ...(row.grantedRoleId === null ? {} : { grantedRoleId: row.grantedRoleId }),
        ...(row.roleRemoveAt === null ? {} : { roleRemoveAt: row.roleRemoveAt }),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
//# sourceMappingURL=PrismaBirthdayRepository.js.map