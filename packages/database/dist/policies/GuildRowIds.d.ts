import type { PrismaClient } from "@qbox/prisma";
type GuildClient = Pick<PrismaClient, "guild">;
/**
 * Resolves a Discord server ID to its `guilds` row ID, creating the row the
 * first time. Reading first costs one database round trip; Prisma's upsert,
 * used only for a server without a row, runs a transaction of several.
 * Nothing is remembered between calls, so a reset database is always seen.
 */
export declare class GuildRowIds {
    private readonly client;
    constructor(client: GuildClient);
    ensure(discordGuildId: string): Promise<{
        readonly id: string;
    }>;
}
export {};
//# sourceMappingURL=GuildRowIds.d.ts.map