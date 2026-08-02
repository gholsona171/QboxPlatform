import { REST, Routes, PermissionsBitField } from "discord.js";
import type {
  DiscordChannelResource,
  DiscordRoleResource,
  RoleCapabilities,
  RoleCreateInput,
  RoleEditInput,
  RoleManagementGateway,
  RoleMoveInput,
} from "@qbox/discord-roles";

interface DiscordApiRole {
  readonly id: string;
  readonly name: string;
  readonly color: number;
  readonly hoist: boolean;
  readonly position: number;
  readonly permissions: string;
  readonly managed: boolean;
  readonly mentionable: boolean;
}

interface DiscordApiUser {
  readonly id: string;
}

interface DiscordApiMember {
  readonly roles: readonly string[];
}

interface DiscordApiChannel {
  readonly id: string;
  readonly name?: string;
  readonly type: number;
  readonly parent_id?: string | null;
  readonly position?: number;
  readonly nsfw?: boolean;
  readonly permission_overwrites?: readonly DiscordApiPermissionOverwrite[];
}

interface DiscordApiPermissionOverwrite {
  readonly id: string;
  readonly type: number;
  readonly allow: string;
  readonly deny: string;
}

export class DiscordRestRoleGateway implements RoleManagementGateway {
  private readonly rest: REST;

  public constructor(
    token: string,
    private readonly applicationId?: string | undefined,
  ) {
    this.rest = new REST({ version: "10" }).setToken(token);
  }

  public async listRoles(guildId: string): Promise<readonly DiscordRoleResource[]> {
    const [roles, botPosition] = await Promise.all([this.roles(guildId), this.botHighestPosition(guildId)]);
    return roles.sort((left, right) => right.position - left.position).map((role) => mapRole(guildId, role, botPosition));
  }

  public async listChannels(guildId: string): Promise<readonly DiscordChannelResource[]> {
    const [channels, roles, botUserId] = await Promise.all([
      this.rest.get(Routes.guildChannels(guildId)) as Promise<DiscordApiChannel[]>,
      this.roles(guildId),
      this.botUserId(),
    ]);
    const member = await this.rest.get(Routes.guildMember(guildId, botUserId)) as DiscordApiMember;
    return channels
      .sort((left, right) => (left.position ?? 0) - (right.position ?? 0))
      .map((channel) => mapChannel(guildId, channel, permissionsForChannel(guildId, channel, roles, member, botUserId)));
  }


  public async getRole(guildId: string, roleId: string): Promise<DiscordRoleResource | undefined> {
    const roles = await this.listRoles(guildId);
    return roles.find((role) => role.id === roleId);
  }

  public async createRole(input: RoleCreateInput): Promise<DiscordRoleResource> {
    const created = await this.rest.post(Routes.guildRoles(input.guildId), {
      body: {
        name: input.name,
        ...(input.color === undefined ? {} : { color: normalizeColor(input.color) }),
        hoist: input.hoist ?? false,
        mentionable: input.mentionable ?? false,
      },
      reason: `Qbox role management by ${input.actor.type}:${input.actor.id}`,
    }) as DiscordApiRole;
    if (input.position !== undefined) {
      await this.rest.patch(guildRolePositionsRoute(input.guildId), {
        body: [{ id: created.id, position: input.position }],
        reason: `Qbox role management by ${input.actor.type}:${input.actor.id}`,
      });
    }
    const current = await this.getRole(input.guildId, created.id);
    if (!current) throw new Error("Created role could not be read back from Discord.");
    return current;
  }

  public async editRole(input: RoleEditInput): Promise<DiscordRoleResource> {
    await this.rest.patch(Routes.guildRole(input.guildId, input.roleId), {
      body: {
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.color === undefined ? {} : { color: normalizeColor(input.color) }),
        ...(input.hoist === undefined ? {} : { hoist: input.hoist }),
        ...(input.mentionable === undefined ? {} : { mentionable: input.mentionable }),
      },
      reason: `Qbox role management by ${input.actor.type}:${input.actor.id}`,
    });
    if (input.position !== undefined) {
      await this.rest.patch(guildRolePositionsRoute(input.guildId), {
        body: [{ id: input.roleId, position: input.position }],
        reason: `Qbox role management by ${input.actor.type}:${input.actor.id}`,
      });
    }
    const current = await this.getRole(input.guildId, input.roleId);
    if (!current) throw new Error("Edited role could not be read back from Discord.");
    return current;
  }

  public async deleteRole(input: { readonly guildId: string; readonly roleId: string; readonly actor: { readonly type: string; readonly id: string } }): Promise<void> {
    await this.rest.delete(Routes.guildRole(input.guildId, input.roleId), {
      reason: `Qbox role management by ${input.actor.type}:${input.actor.id}`,
    });
  }

  public async moveRole(input: RoleMoveInput): Promise<DiscordRoleResource> {
    await this.rest.patch(guildRolePositionsRoute(input.guildId), {
      body: [{ id: input.roleId, position: input.position }],
      reason: `Qbox role management by ${input.actor.type}:${input.actor.id}`,
    });
    const current = await this.getRole(input.guildId, input.roleId);
    if (!current) throw new Error("Moved role could not be read back from Discord.");
    return current;
  }

  public async capabilities(guildId: string): Promise<RoleCapabilities> {
    const botHighestRolePosition = await this.botHighestPosition(guildId);
    return { guildId, connected: true, botHighestRolePosition, canManageRoles: true };
  }

  private async roles(guildId: string): Promise<DiscordApiRole[]> {
    return await this.rest.get(Routes.guildRoles(guildId)) as DiscordApiRole[];
  }

  private async botUserId(): Promise<string> {
    return this.applicationId ?? (await this.rest.get(Routes.user()) as DiscordApiUser).id;
  }

  private async botHighestPosition(guildId: string): Promise<number> {
    const userId = await this.botUserId();
    const [roles, member] = await Promise.all([
      this.roles(guildId),
      this.rest.get(Routes.guildMember(guildId, userId)) as Promise<DiscordApiMember>,
    ]);
    return roles
      .filter((role) => member.roles.includes(role.id))
      .reduce((highest, role) => Math.max(highest, role.position), 0);
  }
}

function mapRole(guildId: string, role: DiscordApiRole, botHighestPosition: number): DiscordRoleResource {
  const everyone = role.id === guildId;
  const hierarchyBlocked = role.position >= botHighestPosition && !everyone;
  const permissions = new PermissionsBitField(BigInt(role.permissions)).toArray();
  const unavailableReason = everyone
    ? "@everyone cannot be managed as an ordinary role."
    : role.managed
      ? "Role is managed by an integration."
      : hierarchyBlocked
        ? "Role is at or above the bot's highest role."
        : undefined;
  return {
    id: role.id,
    guildId,
    name: role.name,
    color: `#${role.color.toString(16).padStart(6, "0")}`,
    position: role.position,
    hoisted: role.hoist,
    mentionable: role.mentionable,
    managed: role.managed,
    permissions,
    assignable: !everyone && !role.managed && !hierarchyBlocked,
    editable: !everyone && !role.managed && !hierarchyBlocked,
    deletable: !everyone && !role.managed && !hierarchyBlocked,
    ...(unavailableReason === undefined ? {} : { unavailableReason }),
    dependencyCount: 0,
  };
}

function mapChannel(
  guildId: string,
  channel: DiscordApiChannel,
  permissions: PermissionsBitField,
): DiscordChannelResource {
  const canView = permissions.has(PermissionsBitField.Flags.ViewChannel);
  return {
    id: channel.id,
    guildId,
    name: channel.name ?? channel.id,
    type: mapChannelType(channel.type),
    ...(channel.parent_id ? { parentId: channel.parent_id } : {}),
    position: channel.position ?? 0,
    nsfw: channel.nsfw === true,
    canView,
    canSendMessages: canView && permissions.has(PermissionsBitField.Flags.SendMessages),
    canEmbedLinks: canView && permissions.has(PermissionsBitField.Flags.EmbedLinks),
    canManage: canView && permissions.has(PermissionsBitField.Flags.ManageChannels),
  };
}

function permissionsForChannel(
  guildId: string,
  channel: DiscordApiChannel,
  roles: readonly DiscordApiRole[],
  member: DiscordApiMember,
  botUserId: string,
): PermissionsBitField {
  const byId = new Map(roles.map((role) => [role.id, role]));
  let bits = BigInt(byId.get(guildId)?.permissions ?? "0");
  for (const roleId of member.roles) bits |= BigInt(byId.get(roleId)?.permissions ?? "0");

  let permissions = new PermissionsBitField(bits);
  if (permissions.has(PermissionsBitField.Flags.Administrator)) return permissions;

  const overwrites = channel.permission_overwrites ?? [];
  permissions = applyOverwrite(permissions, overwrites.find((overwrite) => overwrite.id === guildId));

  let roleAllow = 0n;
  let roleDeny = 0n;
  for (const overwrite of overwrites) {
    if (overwrite.type === 0 && member.roles.includes(overwrite.id)) {
      roleAllow |= BigInt(overwrite.allow);
      roleDeny |= BigInt(overwrite.deny);
    }
  }
  permissions = new PermissionsBitField((permissions.bitfield & ~roleDeny) | roleAllow);

  return applyOverwrite(
    permissions,
    overwrites.find((overwrite) => overwrite.type === 1 && overwrite.id === botUserId),
  );
}

function applyOverwrite(
  permissions: PermissionsBitField,
  overwrite: DiscordApiPermissionOverwrite | undefined,
): PermissionsBitField {
  if (!overwrite) return permissions;
  return new PermissionsBitField((permissions.bitfield & ~BigInt(overwrite.deny)) | BigInt(overwrite.allow));
}

function mapChannelType(type: number): DiscordChannelResource["type"] {
  switch (type) {
    case 0:
      return "TEXT";
    case 5:
      return "ANNOUNCEMENT";
    case 15:
      return "FORUM";
    case 16:
      return "MEDIA";
    case 2:
      return "VOICE";
    case 4:
      return "CATEGORY";
    default:
      return "OTHER";
  }
}

function normalizeColor(color: string): number {
  return Number.parseInt(color.startsWith("#") ? color.slice(1) : color, 16);
}

function guildRolePositionsRoute(guildId: string): `/${string}` {
  return `/guilds/${guildId}/roles`;
}
