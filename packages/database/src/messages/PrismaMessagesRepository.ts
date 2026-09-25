import { MessagesError, type MessagesLook, type MessagesLookInput, type MessagesRepository, type MessagesTemplate, type MessagesTemplateInput, type OutgoingEmbed } from "@qbox/messages";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<PrismaClient, "messagesLook" | "messagesTemplate">;
type LookRow = Prisma.MessagesLookGetPayload<object>;
type TemplateRow = Prisma.MessagesTemplateGetPayload<object>;

/** PostgreSQL looks and message templates. `guildId` is the Discord guild ID. */
export class PrismaMessagesRepository implements MessagesRepository {
  public constructor(private readonly client: Client) {}

  public async getLook(guildId: string): Promise<MessagesLook | undefined> {
    const row = await this.client.messagesLook.findUnique({ where: { guildId } });
    return row ? mapLook(row) : undefined;
  }

  public async saveLook(input: MessagesLookInput): Promise<MessagesLook> {
    const data = {
      enabled: input.enabled,
      accentColor: input.accentColor ?? null,
      footerText: input.footerText ?? null,
      footerIconUrl: input.footerIconUrl ?? null,
      authorName: input.authorName ?? null,
      authorIconUrl: input.authorIconUrl ?? null,
      thumbnailUrl: input.thumbnailUrl ?? null,
      showTimestamp: input.showTimestamp,
      mode: input.mode === "override" ? ("OVERRIDE" as const) : ("FILL" as const),
    };
    const existing = await this.client.messagesLook.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
    if (!existing) {
      if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
        throw new MessagesError("CONFLICT", "The look changed since it was loaded.", { currentRevision: 0 });
      return mapLook(await this.client.messagesLook.create({ data: { guildId: input.guildId, ...data } }));
    }
    const result = await this.client.messagesLook.updateMany({
      where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
      data: { ...data, revision: { increment: 1 } },
    });
    if (result.count === 0) throw new MessagesError("CONFLICT", "The look changed since it was loaded.", { currentRevision: existing.revision });
    return mapLook(await this.client.messagesLook.findUniqueOrThrow({ where: { guildId: input.guildId } }));
  }

  public async listTemplates(guildId: string): Promise<readonly MessagesTemplate[]> {
    const rows = await this.client.messagesTemplate.findMany({ where: { guildId }, orderBy: { key: "asc" }, take: 500 });
    return rows.map(mapTemplate);
  }

  public async getTemplate(guildId: string, key: string): Promise<MessagesTemplate | undefined> {
    const row = await this.client.messagesTemplate.findUnique({ where: { guildId_key: { guildId, key } } });
    return row ? mapTemplate(row) : undefined;
  }

  public async saveTemplate(input: MessagesTemplateInput): Promise<MessagesTemplate> {
    const data = {
      enabled: input.enabled,
      content: input.content ?? null,
      embeds: input.embeds.map((embed) => ({ ...embed })) as Prisma.InputJsonValue,
      updatedBy: input.updatedBy ?? null,
    };
    const row = await this.client.messagesTemplate.upsert({
      where: { guildId_key: { guildId: input.guildId, key: input.key } },
      create: { guildId: input.guildId, key: input.key, ...data },
      update: data,
    });
    return mapTemplate(row);
  }

  public async deleteTemplate(guildId: string, key: string): Promise<boolean> {
    return (await this.client.messagesTemplate.deleteMany({ where: { guildId, key } })).count > 0;
  }
}

function mapLook(row: LookRow): MessagesLook {
  return {
    guildId: row.guildId,
    enabled: row.enabled,
    ...(row.accentColor ? { accentColor: row.accentColor } : {}),
    ...(row.footerText ? { footerText: row.footerText } : {}),
    ...(row.footerIconUrl ? { footerIconUrl: row.footerIconUrl } : {}),
    ...(row.authorName ? { authorName: row.authorName } : {}),
    ...(row.authorIconUrl ? { authorIconUrl: row.authorIconUrl } : {}),
    ...(row.thumbnailUrl ? { thumbnailUrl: row.thumbnailUrl } : {}),
    showTimestamp: row.showTimestamp,
    mode: row.mode === "OVERRIDE" ? "override" : "fill",
    revision: row.revision,
  };
}

function mapTemplate(row: TemplateRow): MessagesTemplate {
  return {
    guildId: row.guildId,
    key: row.key,
    enabled: row.enabled,
    ...(row.content === null ? {} : { content: row.content }),
    embeds: Array.isArray(row.embeds) ? (row.embeds as unknown as readonly OutgoingEmbed[]) : [],
    updatedAt: row.updatedAt,
    ...(row.updatedBy ? { updatedBy: row.updatedBy } : {}),
  };
}
