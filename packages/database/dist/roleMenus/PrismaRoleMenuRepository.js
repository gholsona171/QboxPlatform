import { RoleMenuError } from "@qbox/role-menus";
const roleMenuInclude = {
    guild: true,
    options: { orderBy: { position: "asc" } },
};
export class PrismaRoleMenuRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async create(input) {
        const guild = await this.client.guild.findUnique({
            where: { discordGuildId: input.guildId },
        });
        if (!guild)
            throw new RoleMenuError("INVALID_INPUT", "Guild is not registered.");
        const row = await this.client.roleMenu.create({
            data: {
                guildId: guild.id,
                channelId: input.channelId,
                title: input.title,
                ...(input.description === undefined ? {} : { description: input.description }),
                presentationType: input.presentationType,
                assignmentMode: input.assignmentMode,
                createdByDiscordUserId: input.createdByDiscordUserId,
            },
            include: roleMenuInclude,
        });
        return mapMenu(row);
    }
    async update(id, input) {
        await updateMenuRevision(this.client, id, input, {
            ...(input.channelId === undefined ? {} : { channelId: input.channelId }),
            ...(input.title === undefined ? {} : { title: input.title }),
            ...(input.description === undefined ? {} : { description: input.description }),
            ...(input.presentationType === undefined ? {} : { presentationType: input.presentationType }),
            ...(input.assignmentMode === undefined ? {} : { assignmentMode: input.assignmentMode }),
            status: "DRAFT",
        });
        return mapMenu(await requireMenu(this.client, id));
    }
    async addOption(roleMenuId, input) {
        return this.client.$transaction(async (tx) => {
            const count = await tx.roleMenuOption.count({ where: { roleMenuId } });
            const position = input.position ?? count;
            if (count >= 25)
                throw new RoleMenuError("INVALID_INPUT", "Role menu option limit reached.");
            await tx.roleMenuOption.create({
                data: {
                    roleMenuId,
                    roleId: input.roleId,
                    label: input.label,
                    ...(input.description === undefined ? {} : { description: input.description }),
                    ...(input.emoji === undefined ? {} : { emoji: input.emoji }),
                    position,
                    lastOperationSource: source(input.source),
                },
            });
            await updateMenuRevision(tx, roleMenuId, input, { status: "DRAFT" });
            return mapMenu(await requireMenu(tx, roleMenuId));
        });
    }
    async updateOption(roleMenuId, optionId, input) {
        await this.client.roleMenuOption.update({
            where: { id: optionId, roleMenuId },
            data: {
                ...(input.roleId === undefined ? {} : { roleId: input.roleId }),
                ...(input.label === undefined ? {} : { label: input.label }),
                ...(input.description === undefined ? {} : { description: input.description }),
                ...(input.emoji === undefined ? {} : { emoji: input.emoji }),
                ...(input.position === undefined ? {} : { position: input.position }),
                lastOperationSource: source(input.source),
            },
        });
        await updateMenuRevision(this.client, roleMenuId, input, { status: "DRAFT" });
        return mapMenu(await requireMenu(this.client, roleMenuId));
    }
    async removeOption(roleMenuId, optionId, input = {}) {
        return this.client.$transaction(async (tx) => {
            await tx.roleMenuOption.delete({ where: { id: optionId, roleMenuId } });
            const options = await tx.roleMenuOption.findMany({ where: { roleMenuId }, orderBy: { position: "asc" } });
            for (const [position, option] of options.entries())
                await tx.roleMenuOption.update({ where: { id: option.id }, data: { position } });
            await updateMenuRevision(tx, roleMenuId, input, { status: "DRAFT" });
            return mapMenu(await requireMenu(tx, roleMenuId));
        });
    }
    async reorderOptions(roleMenuId, optionIds, input = {}) {
        return this.client.$transaction(async (tx) => {
            for (const [position, id] of optionIds.entries())
                await tx.roleMenuOption.update({ where: { id, roleMenuId }, data: { position, lastOperationSource: source(input.source) } });
            await updateMenuRevision(tx, roleMenuId, input, { status: "DRAFT" });
            return mapMenu(await requireMenu(tx, roleMenuId));
        });
    }
    async setPublished(roleMenuId, messageId, input = {}) {
        await updateMenuRevision(this.client, roleMenuId, input, { messageId, status: "PUBLISHED" });
        return mapMenu(await requireMenu(this.client, roleMenuId));
    }
    async setStatus(roleMenuId, status, input = {}) {
        await updateMenuRevision(this.client, roleMenuId, input, { status });
        return mapMenu(await requireMenu(this.client, roleMenuId));
    }
    async delete(roleMenuId) {
        await this.client.$transaction(async (tx) => {
            await tx.roleMenuOption.deleteMany({ where: { roleMenuId } });
            await tx.roleMenu.delete({ where: { id: roleMenuId } });
        });
    }
    async findById(roleMenuId) {
        const row = await this.client.roleMenu.findUnique({
            where: { id: roleMenuId },
            include: roleMenuInclude,
        });
        return row ? mapMenu(row) : undefined;
    }
    async findByPublishedMessage(guildId, channelId, messageId) {
        const row = await this.client.roleMenu.findFirst({
            where: { guild: { discordGuildId: guildId }, channelId, messageId },
            include: roleMenuInclude,
        });
        return row ? mapMenu(row) : undefined;
    }
    async listByGuild(guildId) {
        const rows = await this.client.roleMenu.findMany({
            where: { guild: { discordGuildId: guildId } },
            orderBy: { createdAt: "desc" },
            include: roleMenuInclude,
        });
        return rows.map(mapMenu);
    }
}
async function requireMenu(client, roleMenuId) {
    const row = await client.roleMenu.findUnique({
        where: { id: roleMenuId },
        include: roleMenuInclude,
    });
    if (!row)
        throw new RoleMenuError("NOT_FOUND", "Role menu was not found.");
    return row;
}
function mapMenu(row) {
    return Object.freeze({
        id: row.id,
        guildId: row.guild.discordGuildId,
        channelId: row.channelId,
        ...(row.messageId ? { messageId: row.messageId } : {}),
        title: row.title,
        ...(row.description ? { description: row.description } : {}),
        presentationType: row.presentationType,
        assignmentMode: row.assignmentMode,
        status: row.status,
        createdByDiscordUserId: row.createdByDiscordUserId,
        revision: row.revision,
        lastOperationSource: source(row.lastOperationSource),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        options: row.options.map(mapOption),
    });
}
function mapOption(row) {
    return Object.freeze({
        id: row.id,
        roleMenuId: row.roleMenuId,
        roleId: row.roleId,
        label: row.label,
        ...(row.description ? { description: row.description } : {}),
        ...(row.emoji ? { emoji: row.emoji } : {}),
        position: row.position,
        revision: row.revision,
        lastOperationSource: source(row.lastOperationSource),
        createdAt: row.createdAt,
    });
}
async function updateMenuRevision(client, roleMenuId, input, data) {
    const result = await client.roleMenu.updateMany({
        where: {
            id: roleMenuId,
            ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }),
        },
        data: {
            ...data,
            revision: { increment: 1 },
            lastOperationSource: source(input.source),
        },
    });
    if (result.count === 0) {
        const existing = await client.roleMenu.findUnique({ where: { id: roleMenuId }, select: { id: true, revision: true, updatedAt: true } });
        throw existing
            ? new RoleMenuError("CONFLICT", "Role menu was changed by another operation.", {
                currentRevision: existing.revision,
                currentUpdatedAt: existing.updatedAt.toISOString(),
            })
            : new RoleMenuError("NOT_FOUND", "Role menu was not found.");
    }
}
function source(value) {
    return value === "DISCORD" || value === "WEB" || value === "SYSTEM" ? value : "SYSTEM";
}
//# sourceMappingURL=PrismaRoleMenuRepository.js.map