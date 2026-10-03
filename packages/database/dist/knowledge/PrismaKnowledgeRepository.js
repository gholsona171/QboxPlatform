import { KnowledgeError, } from "@qbox/knowledge-base";
/** PostgreSQL knowledge base settings, categories, and articles. `guildId` is the Discord guild ID. */
export class PrismaKnowledgeRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async getSettings(guildId) {
        const row = await this.client.knowledgeSettings.findUnique({ where: { guildId } });
        return row ? mapSettings(row) : undefined;
    }
    async saveSettings(input) {
        const data = {
            autoAnswerEnabled: input.autoAnswerEnabled,
            autoAnswerChannelIds: [...input.autoAnswerChannelIds],
            autoAnswerThreshold: input.autoAnswerThreshold,
            autoAnswerCooldownSeconds: input.autoAnswerCooldownSeconds,
        };
        const existing = await this.client.knowledgeSettings.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
        if (!existing) {
            if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
                throw new KnowledgeError("CONFLICT", "Knowledge base settings changed since they were loaded.", { currentRevision: 0 });
            return mapSettings(await this.client.knowledgeSettings.create({ data: { guildId: input.guildId, ...data } }));
        }
        const result = await this.client.knowledgeSettings.updateMany({
            where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
            data: { ...data, revision: { increment: 1 } },
        });
        if (result.count === 0)
            throw new KnowledgeError("CONFLICT", "Knowledge base settings changed since they were loaded.", { currentRevision: existing.revision });
        return mapSettings(await this.client.knowledgeSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
    }
    async listCategories(guildId) {
        const rows = await this.client.knowledgeCategory.findMany({ where: { guildId }, orderBy: [{ order: "asc" }, { name: "asc" }] });
        return rows.map(mapCategory);
    }
    async getCategory(guildId, id) {
        const row = await this.client.knowledgeCategory.findFirst({ where: { guildId, id } });
        return row ? mapCategory(row) : undefined;
    }
    async createCategory(guildId, input) {
        return mapCategory(await this.client.knowledgeCategory.create({ data: { guildId, name: input.name, emoji: input.emoji ?? null, order: input.order } }));
    }
    async updateCategory(id, input) {
        return mapCategory(await this.client.knowledgeCategory.update({ where: { id }, data: { name: input.name, emoji: input.emoji ?? null, order: input.order } }));
    }
    async deleteCategory(id) {
        await this.client.knowledgeCategory.deleteMany({ where: { id } });
    }
    async listArticles(filter) {
        const terms = filter.terms?.filter(Boolean) ?? [];
        const rows = await this.client.knowledgeArticle.findMany({
            where: {
                guildId: filter.guildId,
                ...(filter.published === undefined ? {} : { published: filter.published }),
                ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
                ...(terms.length
                    ? {
                        OR: [
                            ...terms.flatMap((term) => [{ title: { contains: term, mode: "insensitive" } }, { body: { contains: term, mode: "insensitive" } }]),
                            { tags: { hasSome: terms.map((term) => term.toLowerCase()) } },
                        ],
                    }
                    : {}),
            },
            orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
            take: filter.limit ?? 200,
        });
        return rows.map(mapArticle);
    }
    async getArticle(guildId, id) {
        const row = await this.client.knowledgeArticle.findFirst({ where: { guildId, id } });
        return row ? mapArticle(row) : undefined;
    }
    async getArticleBySlug(guildId, slug) {
        const row = await this.client.knowledgeArticle.findUnique({ where: { guildId_slug: { guildId, slug } } });
        return row ? mapArticle(row) : undefined;
    }
    async createArticle(input) {
        return mapArticle(await this.client.knowledgeArticle.create({
            data: {
                guildId: input.guildId,
                categoryId: input.categoryId ?? null,
                title: input.title,
                slug: input.slug,
                body: input.body,
                tags: [...input.tags],
                published: input.published,
                pinned: input.pinned,
                authorId: input.authorId,
                authorName: input.authorName,
            },
        }));
    }
    async updateArticle(id, patch) {
        const data = { updatedAt: new Date() };
        if (patch.categoryId !== undefined)
            data.categoryId = patch.categoryId;
        if (patch.title !== undefined)
            data.title = patch.title;
        if (patch.slug !== undefined)
            data.slug = patch.slug;
        if (patch.body !== undefined)
            data.body = patch.body;
        if (patch.tags !== undefined)
            data.tags = [...patch.tags];
        if (patch.published !== undefined)
            data.published = patch.published;
        if (patch.pinned !== undefined)
            data.pinned = patch.pinned;
        if (patch.updatedById !== undefined)
            data.updatedById = patch.updatedById;
        if (patch.updatedByName !== undefined)
            data.updatedByName = patch.updatedByName;
        return mapArticle(await this.client.knowledgeArticle.update({ where: { id }, data }));
    }
    async deleteArticle(id) {
        await this.client.knowledgeArticle.deleteMany({ where: { id } });
    }
    async incrementViews(id) {
        // `updatedAt` is set explicitly on edits, so counting a view does not change it.
        await this.client.knowledgeArticle.updateMany({ where: { id }, data: { views: { increment: 1 } } });
    }
}
function mapSettings(row) {
    return {
        guildId: row.guildId,
        autoAnswerEnabled: row.autoAnswerEnabled,
        autoAnswerChannelIds: row.autoAnswerChannelIds,
        autoAnswerThreshold: row.autoAnswerThreshold,
        autoAnswerCooldownSeconds: row.autoAnswerCooldownSeconds,
        revision: row.revision,
    };
}
function mapCategory(row) {
    return {
        id: row.id,
        guildId: row.guildId,
        name: row.name,
        ...(row.emoji ? { emoji: row.emoji } : {}),
        order: row.order,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
function mapArticle(row) {
    return {
        id: row.id,
        guildId: row.guildId,
        ...(row.categoryId ? { categoryId: row.categoryId } : {}),
        title: row.title,
        slug: row.slug,
        body: row.body,
        tags: row.tags,
        published: row.published,
        pinned: row.pinned,
        views: row.views,
        authorId: row.authorId,
        authorName: row.authorName,
        ...(row.updatedById ? { updatedById: row.updatedById } : {}),
        ...(row.updatedByName ? { updatedByName: row.updatedByName } : {}),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
//# sourceMappingURL=PrismaKnowledgeRepository.js.map