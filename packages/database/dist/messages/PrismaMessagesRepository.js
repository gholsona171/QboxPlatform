import { MessagesError } from "@qbox/messages";
/** PostgreSQL looks and message templates. `guildId` is the Discord guild ID. */
export class PrismaMessagesRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async getLook(guildId) {
        const row = await this.client.messagesLook.findUnique({ where: { guildId } });
        return row ? mapLook(row) : undefined;
    }
    async saveLook(input) {
        const data = {
            enabled: input.enabled,
            accentColor: input.accentColor ?? null,
            footerText: input.footerText ?? null,
            footerIconUrl: input.footerIconUrl ?? null,
            authorName: input.authorName ?? null,
            authorIconUrl: input.authorIconUrl ?? null,
            thumbnailUrl: input.thumbnailUrl ?? null,
            showTimestamp: input.showTimestamp,
            mode: input.mode === "override" ? "OVERRIDE" : "FILL",
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
        if (result.count === 0)
            throw new MessagesError("CONFLICT", "The look changed since it was loaded.", { currentRevision: existing.revision });
        return mapLook(await this.client.messagesLook.findUniqueOrThrow({ where: { guildId: input.guildId } }));
    }
    async listTemplates(guildId) {
        const rows = await this.client.messagesTemplate.findMany({ where: { guildId }, orderBy: { key: "asc" }, take: 500 });
        return rows.map(mapTemplate);
    }
    async getTemplate(guildId, key) {
        const row = await this.client.messagesTemplate.findUnique({ where: { guildId_key: { guildId, key } } });
        return row ? mapTemplate(row) : undefined;
    }
    async saveTemplate(input) {
        const data = {
            enabled: input.enabled,
            content: input.content ?? null,
            embeds: input.embeds.map((embed) => ({ ...embed })),
            updatedBy: input.updatedBy ?? null,
        };
        const row = await this.client.messagesTemplate.upsert({
            where: { guildId_key: { guildId: input.guildId, key: input.key } },
            create: { guildId: input.guildId, key: input.key, ...data },
            update: data,
        });
        return mapTemplate(row);
    }
    async deleteTemplate(guildId, key) {
        return (await this.client.messagesTemplate.deleteMany({ where: { guildId, key } })).count > 0;
    }
}
function mapLook(row) {
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
function mapTemplate(row) {
    return {
        guildId: row.guildId,
        key: row.key,
        enabled: row.enabled,
        ...(row.content === null ? {} : { content: row.content }),
        embeds: Array.isArray(row.embeds) ? row.embeds : [],
        updatedAt: row.updatedAt,
        ...(row.updatedBy ? { updatedBy: row.updatedBy } : {}),
    };
}
//# sourceMappingURL=PrismaMessagesRepository.js.map