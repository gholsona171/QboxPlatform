import type {
  Schedule,
  ScheduledEmbed,
  ScheduledMessage,
  ScheduledMessageCreate,
  ScheduledMessagePatch,
  ScheduledMessageRepository,
  ScheduledMessageRun,
  ScheduledMessageRunCreate,
} from "@qbox/scheduled-messages";
import { Prisma, type PrismaClient } from "@qbox/prisma";

type Client = Pick<PrismaClient, "scheduledMessage" | "scheduledMessageRun">;
type MessageRow = Prisma.ScheduledMessageGetPayload<object>;
type RunRow = Prisma.ScheduledMessageRunGetPayload<object>;

/** PostgreSQL scheduled messages and their run history. `guildId` is the Discord guild ID. */
export class PrismaScheduledMessageRepository implements ScheduledMessageRepository {
  public constructor(private readonly client: Client) {}

  public async create(input: ScheduledMessageCreate): Promise<ScheduledMessage> {
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

  public async get(guildId: string, id: string): Promise<ScheduledMessage | undefined> {
    if (!isUuid(id)) return undefined;
    const row = await this.client.scheduledMessage.findFirst({ where: { guildId, id } });
    return row ? mapMessage(row) : undefined;
  }

  public async findByName(guildId: string, name: string): Promise<ScheduledMessage | undefined> {
    const row = await this.client.scheduledMessage.findFirst({ where: { guildId, name: { equals: name, mode: "insensitive" } } });
    return row ? mapMessage(row) : undefined;
  }

  public async list(guildId: string): Promise<readonly ScheduledMessage[]> {
    return (await this.client.scheduledMessage.findMany({ where: { guildId }, orderBy: { name: "asc" } })).map(mapMessage);
  }

  public count(guildId: string): Promise<number> {
    return this.client.scheduledMessage.count({ where: { guildId } });
  }

  public async update(id: string, patch: ScheduledMessagePatch): Promise<ScheduledMessage> {
    const data: Prisma.ScheduledMessageUpdateInput = {};
    if (patch.name !== undefined) data.name = patch.name;
    if (patch.channelId !== undefined) data.channelId = patch.channelId;
    if (patch.content !== undefined) data.content = patch.content;
    if (patch.embed !== undefined) data.embed = patch.embed === null ? Prisma.DbNull : embedJson(patch.embed);
    if (patch.pingRoleIds !== undefined) data.pingRoleIds = [...patch.pingRoleIds];
    if (patch.schedule !== undefined) Object.assign(data, scheduleColumns(patch.schedule));
    if (patch.enabled !== undefined) data.enabled = patch.enabled;
    if (patch.deletePrevious !== undefined) data.deletePrevious = patch.deletePrevious;
    if (patch.pin !== undefined) data.pin = patch.pin;
    if (patch.maxRuns !== undefined) data.maxRuns = patch.maxRuns;
    if (patch.runCount !== undefined) data.runCount = patch.runCount;
    if (patch.lastRunAt !== undefined) data.lastRunAt = patch.lastRunAt;
    if (patch.lastMessageId !== undefined) data.lastMessageId = patch.lastMessageId;
    if (patch.nextRunAt !== undefined) data.nextRunAt = patch.nextRunAt;
    return mapMessage(await this.client.scheduledMessage.update({ where: { id }, data }));
  }

  public async delete(id: string): Promise<void> {
    await this.client.scheduledMessage.deleteMany({ where: { id } });
  }

  public async listDue(now: Date, limit: number): Promise<readonly ScheduledMessage[]> {
    const rows = await this.client.scheduledMessage.findMany({ where: { enabled: true, nextRunAt: { lte: now } }, orderBy: { nextRunAt: "asc" }, take: limit });
    return rows.map(mapMessage);
  }

  public async claim(id: string, expected: Date, next: Date | undefined, runCount: number): Promise<boolean> {
    const result = await this.client.scheduledMessage.updateMany({ where: { id, nextRunAt: expected }, data: { nextRunAt: next ?? null, runCount } });
    return result.count === 1;
  }

  public async addRun(input: ScheduledMessageRunCreate): Promise<ScheduledMessageRun> {
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

  public async listRuns(guildId: string, messageId?: string, limit = 50): Promise<readonly ScheduledMessageRun[]> {
    if (messageId !== undefined && !isUuid(messageId)) return [];
    const rows = await this.client.scheduledMessageRun.findMany({
      where: { guildId, ...(messageId ? { messageId } : {}) },
      orderBy: { ranAt: "desc" },
      take: limit,
    });
    return rows.map(mapRun);
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function embedJson(embed: ScheduledEmbed): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(embed)) as Prisma.InputJsonValue;
}

function scheduleColumns(schedule: Schedule) {
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

function mapSchedule(row: MessageRow): Schedule {
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

function parseEmbed(value: Prisma.JsonValue | null): ScheduledEmbed | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const stored = value as Record<string, unknown>;
  const text = (key: string) => (typeof stored[key] === "string" ? { [key]: stored[key] as string } : {});
  const fields = Array.isArray(stored.fields)
    ? stored.fields.flatMap((field) => {
        if (!field || typeof field !== "object" || Array.isArray(field)) return [];
        const { name, value: fieldValue, inline } = field as Record<string, unknown>;
        return typeof name === "string" && typeof fieldValue === "string" ? [{ name, value: fieldValue, inline: inline === true }] : [];
      })
    : [];
  return { ...text("title"), ...text("description"), ...text("color"), ...text("imageUrl"), ...text("footer"), fields };
}

function mapMessage(row: MessageRow): ScheduledMessage {
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

function mapRun(row: RunRow): ScheduledMessageRun {
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
