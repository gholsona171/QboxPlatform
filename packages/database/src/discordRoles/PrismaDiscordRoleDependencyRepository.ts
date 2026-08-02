import type {
  RoleAuditInput,
  RoleDependency,
  RoleDependencyRepository,
} from "@qbox/discord-roles";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<
  PrismaClient,
  | "guild"
  | "roleMenuOption"
  | "autoroleRule"
  | "rulesConfig"
  | "customCommand"
  | "discordRoleAuditEvent"
  | "$transaction"
>;

export class PrismaDiscordRoleDependencyRepository implements RoleDependencyRepository {
  public constructor(private readonly client: Client) {}

  public async listDependencies(guildId: string, roleId?: string): Promise<readonly RoleDependency[]> {
    const guild = await this.findGuild(guildId);
    if (!guild) return [];
    const [roleMenuOptions, autoroles, rulesConfigs, customCommands] = await Promise.all([
      this.client.roleMenuOption.findMany({
        where: { roleMenu: { guildId: guild.id }, ...(roleId ? { roleId } : {}) },
        select: { id: true, roleId: true, label: true, roleMenu: { select: { title: true } } },
      }),
      this.client.autoroleRule.findMany({
        where: { guildId: guild.id, ...(roleId ? { roleId } : {}) },
        select: { roleId: true, position: true },
      }),
      this.client.rulesConfig.findMany({
        where: roleId
          ? { guildId: guild.id, OR: [{ acceptedRoleId: roleId }, { pendingRoleId: roleId }] }
          : { guildId: guild.id },
        select: { guildId: true, acceptedRoleId: true, pendingRoleId: true },
      }),
      this.client.customCommand.findMany({
        where: roleId ? { guildId: guild.id, requiredRoles: { has: roleId } } : { guildId: guild.id },
        select: { name: true, requiredRoles: true },
      }),
    ]);

    return [
      ...roleMenuOptions.map((option) => ({
        feature: "Role Menus",
        roleId: option.roleId,
        recordId: option.id,
        label: `${option.roleMenu.title}: ${option.label}`,
        field: "roleMenuOption.roleId",
      })),
      ...autoroles.map((rule) => ({
        feature: "Autoroles",
        roleId: rule.roleId,
        recordId: rule.roleId,
        label: `Autorole position ${rule.position}`,
        field: "autoroleRule.roleId",
      })),
      ...rulesConfigs.flatMap((rules) => [
        ...(roleId === undefined || rules.acceptedRoleId === roleId
          ? [{ feature: "Rules", roleId: rules.acceptedRoleId, recordId: rules.guildId, label: "Accepted role", field: "rulesConfig.acceptedRoleId" }]
          : []),
        ...(rules.pendingRoleId && (roleId === undefined || rules.pendingRoleId === roleId)
          ? [{ feature: "Rules", roleId: rules.pendingRoleId, recordId: rules.guildId, label: "Pending role removal", field: "rulesConfig.pendingRoleId" }]
          : []),
      ]),
      ...customCommands.flatMap((command) =>
        command.requiredRoles
          .filter((requiredRoleId) => roleId === undefined || requiredRoleId === roleId)
          .map((requiredRoleId) => ({
            feature: "Custom Commands",
            roleId: requiredRoleId,
            recordId: command.name,
            label: `${command.name}: ${requiredRoleId}`,
            field: "customCommand.requiredRoles",
          })),
      ),
    ];
  }

  public async replaceDependency(guildId: string, oldRoleId: string, newRoleId: string): Promise<number> {
    const guild = await this.findGuild(guildId);
    if (!guild) return 0;
    return this.client.$transaction(async (tx) => {
      let changed = 0;
      const roleMenu = await tx.roleMenuOption.updateMany({
        where: { roleMenu: { guildId: guild.id }, roleId: oldRoleId },
        data: { roleId: newRoleId },
      });
      changed += roleMenu.count;
      const autoroles = await tx.autoroleRule.updateMany({
        where: { guildId: guild.id, roleId: oldRoleId },
        data: { roleId: newRoleId },
      });
      changed += autoroles.count;
      const rules = await tx.rulesConfig.findUnique({ where: { guildId: guild.id } });
      if (rules) {
        const data: { acceptedRoleId?: string; pendingRoleId?: string } = {};
        if (rules.acceptedRoleId === oldRoleId) data.acceptedRoleId = newRoleId;
        if (rules.pendingRoleId === oldRoleId) data.pendingRoleId = newRoleId;
        if (Object.keys(data).length > 0) {
          await tx.rulesConfig.update({ where: { guildId: guild.id }, data });
          changed += Object.keys(data).length;
        }
      }
      const commands = await tx.customCommand.findMany({
        where: { guildId: guild.id, requiredRoles: { has: oldRoleId } },
        select: { name: true, requiredRoles: true },
      });
      for (const command of commands) {
        await tx.customCommand.update({
          where: { guildId_name: { guildId: guild.id, name: command.name } },
          data: { requiredRoles: command.requiredRoles.map((roleId) => roleId === oldRoleId ? newRoleId : roleId) },
        });
        changed += 1;
      }
      return changed;
    });
  }

  public async recordAudit(input: RoleAuditInput): Promise<void> {
    const guild = await this.findGuild(input.guildId);
    if (!guild) return;
    await this.client.discordRoleAuditEvent.create({
      data: {
        guildId: guild.id,
        roleId: input.roleId ?? null,
        feature: input.feature,
        operation: input.operation,
        source: input.source,
        actorType: input.actor.type,
        actorId: input.actor.id,
        summary: input.summary,
        result: input.result,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonObject,
      },
    });
  }

  private findGuild(discordGuildId: string) {
    return this.client.guild.findUnique({ where: { discordGuildId } });
  }
}
