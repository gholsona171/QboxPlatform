/**
 * Resolves a Discord server ID to its `guilds` row ID, creating the row the
 * first time. Reading first costs one database round trip; Prisma's upsert,
 * used only for a server without a row, runs a transaction of several.
 * Nothing is remembered between calls, so a reset database is always seen.
 */
export class GuildRowIds {
    client;
    constructor(client) {
        this.client = client;
    }
    async ensure(discordGuildId) {
        const row = (await this.client.guild.findUnique({ where: { discordGuildId }, select: { id: true } })) ??
            (await this.client.guild.upsert({ where: { discordGuildId }, create: { discordGuildId }, update: {}, select: { id: true } }));
        return { id: row.id };
    }
}
//# sourceMappingURL=GuildRowIds.js.map