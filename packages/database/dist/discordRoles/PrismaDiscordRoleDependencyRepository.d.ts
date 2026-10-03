import type { RoleAuditInput, RoleDependency, RoleDependencyRepository } from "@qbox/discord-roles";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "guild" | "roleMenuOption" | "autoroleRule" | "rulesConfig" | "customCommand" | "discordRoleAuditEvent" | "$transaction">;
export declare class PrismaDiscordRoleDependencyRepository implements RoleDependencyRepository {
    private readonly client;
    constructor(client: Client);
    listDependencies(guildId: string, roleId?: string): Promise<readonly RoleDependency[]>;
    replaceDependency(guildId: string, oldRoleId: string, newRoleId: string): Promise<number>;
    recordAudit(input: RoleAuditInput): Promise<void>;
    private findGuild;
}
export {};
//# sourceMappingURL=PrismaDiscordRoleDependencyRepository.d.ts.map