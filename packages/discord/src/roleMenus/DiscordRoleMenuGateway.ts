import type { Client, Guild, GuildMember } from "discord.js";
import { PermissionsBitField } from "discord.js";
import type {
  RoleMenuMemberRoleGateway,
  RoleMenuRoleMutation,
  RoleMenuRoleMutationResult,
  RoleMenuRoleQuery,
  RoleMenuRoleValidation,
} from "@qbox/role-menus";

export class DiscordRoleMenuGateway implements RoleMenuMemberRoleGateway {
  public constructor(private readonly client: Client) {}

  public async addRole(input: RoleMenuRoleMutation): Promise<RoleMenuRoleMutationResult> {
    const { member } = await this.resolve(input);
    await member.roles.add(input.roleId, input.reason);
    return { changed: true, message: "Role added." };
  }

  public async removeRole(input: RoleMenuRoleMutation): Promise<RoleMenuRoleMutationResult> {
    const { member } = await this.resolve(input);
    await member.roles.remove(input.roleId, input.reason);
    return { changed: true, message: "Role removed." };
  }

  public async hasRole(input: RoleMenuRoleQuery): Promise<boolean> {
    const { member } = await this.resolve(input);
    return member.roles.cache.has(input.roleId);
  }

  public async validateAssignableRole(input: RoleMenuRoleQuery): Promise<RoleMenuRoleValidation> {
    const { guild, me } = await this.resolve(input);
    const role = await guild.roles.fetch(input.roleId);
    if (!role) return { assignable: false, reason: "Configured role no longer exists." };
    if (role.id === guild.id) return { assignable: false, reason: "@everyone cannot be assigned." };
    if (role.managed) return { assignable: false, reason: "Managed roles cannot be assigned by the bot." };
    if (!me.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return { assignable: false, reason: "Bot is missing Manage Roles." };
    if (role.position >= me.roles.highest.position)
      return { assignable: false, reason: "Bot role is not higher than the target role." };
    return { assignable: true };
  }

  private async resolve(input: RoleMenuRoleQuery): Promise<{
    readonly guild: Guild;
    readonly member: GuildMember;
    readonly me: GuildMember;
  }> {
    const guild = await this.client.guilds.fetch(input.guildId);
    const member = await guild.members.fetch(input.memberId);
    const me = await guild.members.fetchMe();
    if (member.user.id === this.client.user?.id) throw new Error("Bot member cannot self-assign role menus.");
    return { guild, member, me };
  }
}
