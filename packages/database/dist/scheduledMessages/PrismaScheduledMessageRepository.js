import { Prisma } from "@qbox/prisma";
/** PostgreSQL scheduled messages and their run history. `guildId` is the Discord guild ID. */
export class PrismaScheduledMessageRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async create(input) {
        return mapMessage(await this.client.scheduledMessage.create({
            data: {
                guildId: input.guildId,
                name: input.name,
                channelId: input.channelId,
                content: input.content ?? null,
                ...(input.embed ? { embed: embedJson(input.embed) } : {}),
                pingRoleIds: [...input.pingRoleIds],
                ...scheduleColumns(input.schedule),
                enabled: input.enabled,
                deletePrevious: input.deletePrevious,
                pin: input.pin,
                maxRuns: input.maxRuns ?? null,
                nextRunAt: input.nextRunAt ?? null,
                createdById: input.createdById,
            },
        }));
    }
    async get(guildId, id) {
        if (!isUuid(id))
            return undefined;
        const row = await this.client.scheduledMessage.findFirst({ where: { guildId, id } });
        return row ? mapMessage(row) : undefined;
    }
    async findByName(guildId, name) {
        const row = await this.client.scheduledMessage.findFirst({ where: { guildId, name: { equals: name, mode: "insensitive" } } });
        return row ? mapMessage(row) : undefined;
    }
    async list(guildId) {
        return (await this.client.scheduledMessage.findMany({ where: { guildId }, orderBy: { name: "asc" } })).map(mapMessage);
    }
    count(guildId) {
        return this.client.scheduledMessage.count({ where: { guildId } });
    }
    async update(id, patch) {
        const data = {};
        if (patch.name !== undefined)
            data.name = patch.name;
        if (patch.channelId !== undefined)
            data.channelId = patch.channelId;
        if (patch.content !== undefined)
            data.content = patch.content;
        if (patch.embed !== undefined)
            data.embed = patch.embed === null ? Prisma.DbNull : embedJson(patch.embed);
        if (patch.pingRoleIds !== undefined)
            data.pingRoleIds = [...patch.pingRoleIds];
        if (patch.schedule !== undefined)
            Object.assign(data, scheduleColumns(patch.schedule));
        if (patch.enabled !== undefined)
            data.enabled = patch.enabled;
        if (patch.deletePrevious !== undefined)
            data.deletePrevious = patch.deletePrevious;
        if (patch.pin !== undefined)
            data.pin = patch.pin;
        if (patch.maxRuns !== undefined)
            data.maxRuns = patch.maxRuns;
        if (patch.runCount !== undefined)
            data.runCount = patch.runCount;
        if (patch.lastRunAt !== undefined)
            data.lastRunAt = patch.lastRunAt;
        if (patch.lastMessageId !== undefined)
            data.lastMessageId = patch.lastMessageId;
        if (patch.nextRunAt !== undefined)
            data.nextRunAt = patch.nextRunAt;
        return mapMessage(await this.client.scheduledMessage.update({ where: { id }, data }));
    }
    async delete(id) {
        await this.client.scheduledMessage.deleteMany({ where: { id } });
    }
    async listDue(now, limit) {
        const rows = await this.client.scheduledMessage.findMany({ where: { enabled: true, nextRunAt: { lte: now } }, orderBy: { nextRunAt: "asc" }, take: limit });
        return rows.map(mapMessage);
    }
    async claim(id, expected, next, runCount) {
        const result = await this.client.scheduledMessage.updateMany({ where: { id, nextRunAt: expected }, data: { nextRunAt: next ?? null, runCount } });
        return result.count === 1;
    }
    async addRun(input) {
        return mapRun(await this.client.scheduledMessageRun.create({
            data: {
                messageId: input.messageId,
                guildId: input.guildId,
                success: input.success,
                discordMessageId: input.discordMessageId ?? null,
                error: input.error ?? null,
                manual: input.manual,
                ranAt: input.ranAt,
            },
        }));
    }
    async listRuns(guildId, messageId, limit = 50) {
        if (messageId !== undefined && !isUuid(messageId))
            return [];
        const rows = await this.client.scheduledMessageRun.findMany({
            where: { guildId, ...(messageId ? { messageId } : {}) },
            orderBy: { ranAt: "desc" },
            take: limit,
        });
        return rows.map(mapRun);
    }
}
function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
function embedJson(embed) {
    return JSON.parse(JSON.stringify(embed));
}
function scheduleColumns(schedule) {
    return {
        scheduleType: schedule.type,
        timeZone: schedule.timeZone,
        runAt: schedule.runAt ?? null,
        intervalMinutes: schedule.intervalMinutes ?? null,
        time: schedule.time ?? null,
        weekdays: [...(schedule.weekdays ?? [])],
        dayOfMonth: schedule.dayOfMonth ?? null,
        startDate: schedule.startDate ?? null,
        endDate: schedule.endDate ?? null,
    };
}
function mapSchedule(row) {
    return {
        type: row.scheduleType,
        timeZone: row.timeZone,
        ...(row.runAt === null ? {} : { runAt: row.runAt }),
        ...(row.intervalMinutes === null ? {} : { intervalMinutes: row.intervalMinutes }),
        ...(row.time === null ? {} : { time: row.time }),
        ...(row.scheduleType === "WEEKLY" ? { weekdays: row.weekdays } : {}),
        ...(row.dayOfMonth === null ? {} : { dayOfMonth: row.dayOfMonth }),
        ...(row.startDate === null ? {} : { startDate: row.startDate }),
        ...(row.endDate === null ? {} : { endDate: row.endDate }),
    };
}
function parseEmbed(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return undefined;
    const stored = value;
    const text = (key) => (typeof stored[key] === "string" ? { [key]: stored[key] } : {});
    const fields = Array.isArray(stored.fields)
        ? stored.fields.flatMap((field) => {
            if (!field || typeof field !== "object" || Array.isArray(field))
                return [];
            const { name, value: fieldValue, inline } = field;
            return typeof name === "string" && typeof fieldValue === "string" ? [{ name, value: fieldValue, inline: inline === true }] : [];
        })
        : [];
    return { ...text("title"), ...text("description"), ...text("color"), ...text("imageUrl"), ...text("footer"), fields };
}
function mapMessage(row) {
    const embed = parseEmbed(row.embed);
    return {
        id: row.id,
        guildId: row.guildId,
        name: row.name,
        channelId: row.channelId,
        ...(row.content === null ? {} : { content: row.content }),
        ...(embed ? { embed } : {}),
        pingRoleIds: row.pingRoleIds,
        schedule: mapSchedule(row),
        enabled: row.enabled,
        deletePrevious: row.deletePrevious,
        pin: row.pin,
        ...(row.maxRuns === null ? {} : { maxRuns: row.maxRuns }),
        runCount: row.runCount,
        ...(row.lastRunAt === null ? {} : { lastRunAt: row.lastRunAt }),
        ...(row.lastMessageId === null ? {} : { lastMessageId: row.lastMessageId }),
        ...(row.nextRunAt === null ? {} : { nextRunAt: row.nextRunAt }),
        createdById: row.createdById,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
function mapRun(row) {
    return {
        id: row.id,
        messageId: row.messageId,
        guildId: row.guildId,
        success: row.success,
        ...(row.discordMessageId === null ? {} : { discordMessageId: row.discordMessageId }),
        ...(row.error === null ? {} : { error: row.error }),
        manual: row.manual,
        ranAt: row.ranAt,
    };
}
//# sourceMappingURL=PrismaScheduledMessageRepository.js.map