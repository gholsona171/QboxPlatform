export type RoleOperationSource = "DISCORD" | "WEB" | "SYSTEM";
export type RoleActorType = "discord-user" | "platform-user" | "system";

export interface RoleActor {
  readonly type: RoleActorType;
  readonly id: string;
}

export interface DiscordRoleResource {
  readonly id: string;
  readonly guildId: string;
  readonly name: string;
  readonly color: string;
  readonly position: number;
  readonly hoisted: boolean;
  readonly mentionable: boolean;
  readonly managed: boolean;
  readonly permissions: readonly string[];
  readonly memberCount?: number | undefined;
  readonly assignable: boolean;
  readonly editable: boolean;
  readonly deletable: boolean;
  readonly unavailableReason?: string | undefined;
  readonly dependencyCount: number;
}

export interface RoleCapabilities {
  readonly guildId: string;
  readonly connected: boolean;
  readonly botHighestRolePosition: number;
  readonly canManageRoles: boolean;
  readonly reason?: string | undefined;
}

export interface RoleCreateInput {
  readonly guildId: string;
  readonly name: string;
  readonly color?: string | undefined;
  readonly hoist?: boolean | undefined;
  readonly mentionable?: boolean | undefined;
  readonly permissions?: readonly string[] | undefined;
  readonly position?: number | undefined;
  readonly allowAdministrator?: boolean | undefined;
  readonly actor: RoleActor;
  readonly source: RoleOperationSource;
}

export interface RoleEditInput {
  readonly guildId: string;
  readonly roleId: string;
  readonly name?: string | undefined;
  readonly color?: string | undefined;
  readonly hoist?: boolean | undefined;
  readonly mentionable?: boolean | undefined;
  readonly position?: number | undefined;
  readonly permissions?: readonly string[] | undefined;
  readonly allowAdministrator?: boolean | undefined;
  readonly actor: RoleActor;
  readonly source: RoleOperationSource;
}

export interface RoleDeleteInput {
  readonly guildId: string;
  readonly roleId: string;
  readonly confirmation: string;
  readonly actor: RoleActor;
  readonly source: RoleOperationSource;
}

export interface RoleMoveInput {
  readonly guildId: string;
  readonly roleId: string;
  readonly position: number;
  readonly actor: RoleActor;
  readonly source: RoleOperationSource;
}

export interface RoleDependency {
  readonly roleId: string;
  readonly feature: string;
  readonly recordId: string;
  readonly label: string;
  readonly field: string;
}

export interface RoleAuditInput {
  readonly guildId: string;
  readonly roleId?: string | undefined;
  readonly feature: string;
  readonly operation: string;
  readonly source: RoleOperationSource;
  readonly actor: RoleActor;
  readonly summary: string;
  readonly result: "SUCCESS" | "DENIED" | "FAILED";
  readonly metadata?: Readonly<Record<string, string | number | boolean>> | undefined;
}

export interface RoleManagementGateway {
  listRoles(guildId: string): Promise<readonly DiscordRoleResource[]>;
  getRole(guildId: string, roleId: string): Promise<DiscordRoleResource | undefined>;
  createRole(input: RoleCreateInput): Promise<DiscordRoleResource>;
  editRole(input: RoleEditInput): Promise<DiscordRoleResource>;
  deleteRole(input: RoleDeleteInput): Promise<void>;
  moveRole(input: RoleMoveInput): Promise<DiscordRoleResource>;
  capabilities(guildId: string): Promise<RoleCapabilities>;
}

export interface RoleDependencyRepository {
  listDependencies(guildId: string, roleId?: string | undefined): Promise<readonly RoleDependency[]>;
  replaceDependency(guildId: string, oldRoleId: string, newRoleId: string): Promise<number>;
  recordAudit(input: RoleAuditInput): Promise<void>;
}

export class RoleManagementError extends Error {
  public constructor(
    public readonly code:
      | "INVALID_INPUT"
      | "NOT_FOUND"
      | "DEPENDENCY_CONFLICT"
      | "DISCORD_UNAVAILABLE"
      | "FORBIDDEN",
    message: string,
  ) {
    super(message);
    this.name = "RoleManagementError";
  }
}

const snowflake = /^\d{17,20}$/;
const hexColor = /^#?[0-9a-fA-F]{6}$/;

export class RoleManagementService {
  public constructor(
    private readonly dependencies: RoleDependencyRepository,
    private readonly gateway?: RoleManagementGateway,
  ) {}

  public async listRoles(guildId: string): Promise<readonly DiscordRoleResource[]> {
    requireSnowflake("guildId", guildId);
    const roles = await this.requireGateway().listRoles(guildId);
    const dependencies = await this.dependencies.listDependencies(guildId);
    return roles.map((role) => ({
      ...role,
      dependencyCount: dependencies.filter((dependency) => dependency.roleId === role.id).length,
    }));
  }

  public async inspectRole(guildId: string, roleId: string): Promise<DiscordRoleResource> {
    requireSnowflake("guildId", guildId);
    requireSnowflake("roleId", roleId);
    const role = await this.requireGateway().getRole(guildId, roleId);
    if (!role) throw new RoleManagementError("NOT_FOUND", "Role was not found.");
    const dependencies = await this.dependencies.listDependencies(guildId, roleId);
    return { ...role, dependencyCount: dependencies.length };
  }

  public capabilities(guildId: string): Promise<RoleCapabilities> {
    requireSnowflake("guildId", guildId);
    return this.requireGateway().capabilities(guildId);
  }

  public async createRole(input: RoleCreateInput): Promise<DiscordRoleResource> {
    validateCreate(input);
    if (hasAdministrator(input.permissions) && !input.allowAdministrator)
      throw new RoleManagementError("FORBIDDEN", "Creating Administrator roles requires explicit Administrator-role permission.");
    const created = await this.requireGateway().createRole(input);
    await this.audit({ guildId: input.guildId, roleId: created.id, operation: "create", source: input.source, actor: input.actor, summary: `Created role ${created.name}.`, result: "SUCCESS" });
    return created;
  }

  public async editRole(input: RoleEditInput): Promise<DiscordRoleResource> {
    validateEdit(input);
    const existing = await this.inspectRole(input.guildId, input.roleId);
    validateMutable(existing);
    if ((hasAdministrator(existing.permissions) || hasAdministrator(input.permissions)) && !input.allowAdministrator)
      throw new RoleManagementError("FORBIDDEN", "Editing Administrator roles requires explicit Administrator-role permission.");
    const edited = await this.requireGateway().editRole(input);
    await this.audit({ guildId: input.guildId, roleId: input.roleId, operation: "edit", source: input.source, actor: input.actor, summary: `Edited role ${edited.name}.`, result: "SUCCESS" });
    return edited;
  }

  public async deleteRole(input: RoleDeleteInput): Promise<void> {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("roleId", input.roleId);
    const existing = await this.inspectRole(input.guildId, input.roleId);
    validateMutable(existing);
    if (input.confirmation !== existing.name && input.confirmation !== `delete ${existing.name}`)
      throw new RoleManagementError("INVALID_INPUT", "Role deletion requires a matching confirmation.");
    const dependencies = await this.dependencies.listDependencies(input.guildId, input.roleId);
    if (dependencies.length > 0)
      throw new RoleManagementError("DEPENDENCY_CONFLICT", "Role has Qbox feature dependencies. Replace or remove dependencies before deleting it.");
    await this.requireGateway().deleteRole(input);
    await this.audit({ guildId: input.guildId, roleId: input.roleId, operation: "delete", source: input.source, actor: input.actor, summary: `Deleted role ${existing.name}.`, result: "SUCCESS" });
  }

  public async moveRole(input: RoleMoveInput): Promise<DiscordRoleResource> {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("roleId", input.roleId);
    if (!Number.isInteger(input.position) || input.position < 0)
      throw new RoleManagementError("INVALID_INPUT", "Role position must be a non-negative integer.");
    const existing = await this.inspectRole(input.guildId, input.roleId);
    validateMutable(existing);
    const moved = await this.requireGateway().moveRole(input);
    await this.audit({ guildId: input.guildId, roleId: input.roleId, operation: "move", source: input.source, actor: input.actor, summary: `Moved role ${moved.name}.`, result: "SUCCESS" });
    return moved;
  }

  public listDependencies(guildId: string, roleId?: string): Promise<readonly RoleDependency[]> {
    requireSnowflake("guildId", guildId);
    if (roleId !== undefined) requireSnowflake("roleId", roleId);
    return this.dependencies.listDependencies(guildId, roleId);
  }

  public async replaceDependency(input: {
    readonly guildId: string;
    readonly oldRoleId: string;
    readonly newRoleId: string;
    readonly actor: RoleActor;
    readonly source: RoleOperationSource;
  }): Promise<number> {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("oldRoleId", input.oldRoleId);
    requireSnowflake("newRoleId", input.newRoleId);
    if (input.oldRoleId === input.newRoleId)
      throw new RoleManagementError("INVALID_INPUT", "Replacement role must differ from the existing role.");
    await this.inspectRole(input.guildId, input.newRoleId);
    const changed = await this.dependencies.replaceDependency(input.guildId, input.oldRoleId, input.newRoleId);
    await this.audit({ guildId: input.guildId, roleId: input.oldRoleId, operation: "replace-dependency", source: input.source, actor: input.actor, summary: `Replaced ${changed} role dependency record(s).`, result: "SUCCESS", metadata: { newRoleId: input.newRoleId, changed } });
    return changed;
  }

  private requireGateway(): RoleManagementGateway {
    if (!this.gateway) throw new RoleManagementError("DISCORD_UNAVAILABLE", "Discord role management is unavailable.");
    return this.gateway;
  }

  private audit(input: Omit<RoleAuditInput, "feature">): Promise<void> {
    return this.dependencies.recordAudit({ ...input, feature: "roles" });
  }
}

function validateCreate(input: RoleCreateInput): void {
  requireSnowflake("guildId", input.guildId);
  validateName(input.name);
  if (input.color !== undefined && !hexColor.test(input.color))
    throw new RoleManagementError("INVALID_INPUT", "Role color must be a hexadecimal color.");
}

function validateEdit(input: RoleEditInput): void {
  requireSnowflake("guildId", input.guildId);
  requireSnowflake("roleId", input.roleId);
  if (input.name !== undefined) validateName(input.name);
  if (input.color !== undefined && !hexColor.test(input.color))
    throw new RoleManagementError("INVALID_INPUT", "Role color must be a hexadecimal color.");
}

function validateName(name: string): void {
  if (name.trim().length < 1 || name.length > 100)
    throw new RoleManagementError("INVALID_INPUT", "Role name length must be between 1 and 100 characters.");
}

function validateMutable(role: DiscordRoleResource): void {
  if (role.id === role.guildId)
    throw new RoleManagementError("FORBIDDEN", "@everyone cannot be edited or deleted.");
  if (role.managed)
    throw new RoleManagementError("FORBIDDEN", "Integration-managed roles cannot be edited or deleted.");
  if (!role.editable)
    throw new RoleManagementError("FORBIDDEN", role.unavailableReason ?? "Role cannot be edited by the bot.");
}

function requireSnowflake(name: string, value: string): void {
  if (!snowflake.test(value))
    throw new RoleManagementError("INVALID_INPUT", `${name} must be a Discord snowflake.`);
}

function hasAdministrator(permissions: readonly string[] | undefined): boolean {
  return permissions?.some((permission) => permission.toLowerCase() === "administrator") ?? false;
}
