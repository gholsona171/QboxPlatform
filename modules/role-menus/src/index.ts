export type RoleMenuPresentationType = "BUTTONS" | "SELECT_MENU" | "REACTIONS";
export type RoleMenuAssignmentMode = "TOGGLE" | "ADD_ONLY" | "REMOVE_ONLY" | "EXCLUSIVE";
export type RoleMenuStatus = "DRAFT" | "PUBLISHED" | "DISABLED";
export type RoleMenuInteractionSurface = "BUTTON" | "SELECT_MENU" | "REACTION";
export type RoleMenuOperationSource = "DISCORD" | "WEB" | "SYSTEM";

export interface RoleMenuConcurrencyInput {
  readonly expectedRevision?: number | undefined;
  readonly source?: RoleMenuOperationSource | undefined;
}

export interface RoleMenu {
  readonly id: string;
  readonly guildId: string;
  readonly channelId: string;
  readonly messageId?: string;
  readonly title: string;
  readonly description?: string;
  readonly presentationType: RoleMenuPresentationType;
  readonly assignmentMode: RoleMenuAssignmentMode;
  readonly status: RoleMenuStatus;
  readonly createdByDiscordUserId: string;
  readonly revision: number;
  readonly lastOperationSource: RoleMenuOperationSource;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly options: readonly RoleMenuOption[];
}

export interface RoleMenuOption {
  readonly id: string;
  readonly roleMenuId: string;
  readonly roleId: string;
  readonly label: string;
  readonly description?: string;
  readonly emoji?: string;
  readonly position: number;
  readonly revision: number;
  readonly lastOperationSource: RoleMenuOperationSource;
  readonly createdAt: Date;
}

export interface RoleMenuDraftInput {
  readonly guildId: string;
  readonly channelId: string;
  readonly title: string;
  readonly description?: string;
  readonly presentationType: RoleMenuPresentationType;
  readonly assignmentMode: RoleMenuAssignmentMode;
  readonly createdByDiscordUserId: string;
}

export interface RoleMenuOptionInput {
  readonly roleId: string;
  readonly label: string;
  readonly description?: string;
  readonly emoji?: string;
  readonly position?: number;
}

export interface RoleMenuRepository {
  create(input: RoleMenuDraftInput): Promise<RoleMenu>;
  update(id: string, input: Partial<Omit<RoleMenuDraftInput, "guildId" | "createdByDiscordUserId">> & RoleMenuConcurrencyInput): Promise<RoleMenu>;
  addOption(roleMenuId: string, input: RoleMenuOptionInput & RoleMenuConcurrencyInput): Promise<RoleMenu>;
  updateOption(roleMenuId: string, optionId: string, input: Partial<RoleMenuOptionInput> & RoleMenuConcurrencyInput): Promise<RoleMenu>;
  removeOption(roleMenuId: string, optionId: string, input?: RoleMenuConcurrencyInput): Promise<RoleMenu>;
  reorderOptions(roleMenuId: string, optionIds: readonly string[], input?: RoleMenuConcurrencyInput): Promise<RoleMenu>;
  setPublished(roleMenuId: string, messageId: string, input?: RoleMenuConcurrencyInput): Promise<RoleMenu>;
  setStatus(roleMenuId: string, status: RoleMenuStatus, input?: RoleMenuConcurrencyInput): Promise<RoleMenu>;
  delete(roleMenuId: string): Promise<void>;
  findById(roleMenuId: string): Promise<RoleMenu | undefined>;
  findByPublishedMessage(guildId: string, channelId: string, messageId: string): Promise<RoleMenu | undefined>;
  listByGuild(guildId: string): Promise<readonly RoleMenu[]>;
}

export interface RoleMenuMemberRoleGateway {
  addRole(input: RoleMenuRoleMutation): Promise<RoleMenuRoleMutationResult>;
  removeRole(input: RoleMenuRoleMutation): Promise<RoleMenuRoleMutationResult>;
  hasRole(input: RoleMenuRoleQuery): Promise<boolean>;
  validateAssignableRole(input: RoleMenuRoleQuery): Promise<RoleMenuRoleValidation>;
}

export interface RoleMenuRoleQuery {
  readonly guildId: string;
  readonly memberId: string;
  readonly roleId: string;
}

export interface RoleMenuRoleMutation extends RoleMenuRoleQuery {
  readonly reason: string;
}

export interface RoleMenuRoleValidation {
  readonly assignable: boolean;
  readonly reason?: string;
}

export interface RoleMenuRoleMutationResult {
  readonly changed: boolean;
  readonly message: string;
}

export interface RoleMenuInteractionInput {
  readonly surface: RoleMenuInteractionSurface;
  readonly direction?: "add" | "remove";
  readonly guildId: string;
  readonly channelId: string;
  readonly messageId: string;
  readonly memberId: string;
  readonly optionId?: string;
  readonly emoji?: string;
}

export interface RoleMenuInteractionResult {
  readonly changed: boolean;
  readonly message: string;
}

export class RoleMenuError extends Error {
  public constructor(
    public readonly code:
      | "INVALID_INPUT"
      | "NOT_FOUND"
      | "DISABLED"
      | "NOT_PUBLISHED"
      | "OPTION_NOT_FOUND"
      | "ROLE_NOT_ASSIGNABLE"
      | "CONFLICT",
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "RoleMenuError";
  }
}

const snowflake = /^\d{17,20}$/;
const maxOptions = 25;

export class RoleMenuService {
  public constructor(
    private readonly repository: RoleMenuRepository,
    private readonly gateway?: RoleMenuMemberRoleGateway,
  ) {}

  public createDraft(input: RoleMenuDraftInput): Promise<RoleMenu> {
    validateDraft(input);
    return this.repository.create(input);
  }

  public updateDraft(id: string, input: Partial<Omit<RoleMenuDraftInput, "guildId" | "createdByDiscordUserId">> & RoleMenuConcurrencyInput): Promise<RoleMenu> {
    if (input.channelId !== undefined && !snowflake.test(input.channelId)) throw invalid("channelId must be a Discord snowflake.");
    if (input.title !== undefined) validateText("title", input.title, 1, 100);
    if (input.description !== undefined) validateText("description", input.description, 0, 1000);
    return this.repository.update(id, input);
  }

  public addOption(roleMenuId: string, input: RoleMenuOptionInput & RoleMenuConcurrencyInput): Promise<RoleMenu> {
    validateOption(input);
    return this.repository.addOption(roleMenuId, input);
  }

  public updateOption(roleMenuId: string, optionId: string, input: Partial<RoleMenuOptionInput> & RoleMenuConcurrencyInput): Promise<RoleMenu> {
    if (input.roleId !== undefined && !snowflake.test(input.roleId)) throw invalid("roleId must be a Discord snowflake.");
    if (input.label !== undefined) validateText("label", input.label, 1, 80);
    if (input.description !== undefined) validateText("description", input.description, 0, 100);
    return this.repository.updateOption(roleMenuId, optionId, input);
  }

  public removeOption(roleMenuId: string, optionId: string, input?: RoleMenuConcurrencyInput): Promise<RoleMenu> {
    return this.repository.removeOption(roleMenuId, optionId, input);
  }

  public reorderOptions(roleMenuId: string, optionIds: readonly string[], input?: RoleMenuConcurrencyInput): Promise<RoleMenu> {
    if (new Set(optionIds).size !== optionIds.length) throw invalid("Option order contains duplicates.");
    return this.repository.reorderOptions(roleMenuId, optionIds, input);
  }

  public async publish(roleMenuId: string, messageId: string, input?: RoleMenuConcurrencyInput): Promise<RoleMenu> {
    if (!snowflake.test(messageId)) throw invalid("messageId must be a Discord snowflake.");
    const menu = await this.requireMenu(roleMenuId);
    if (menu.options.length === 0) throw invalid("A role menu requires at least one option before publishing.");
    if (menu.options.length > maxOptions) throw invalid("A role menu cannot contain more than 25 options.");
    return this.repository.setPublished(roleMenuId, messageId, input);
  }

  public disable(roleMenuId: string, input?: RoleMenuConcurrencyInput): Promise<RoleMenu> {
    return this.repository.setStatus(roleMenuId, "DISABLED", input);
  }

  public delete(roleMenuId: string): Promise<void> {
    return this.repository.delete(roleMenuId);
  }

  public getById(roleMenuId: string): Promise<RoleMenu | undefined> {
    return this.repository.findById(roleMenuId);
  }

  public listByGuild(guildId: string): Promise<readonly RoleMenu[]> {
    if (!snowflake.test(guildId)) throw invalid("guildId must be a Discord snowflake.");
    return this.repository.listByGuild(guildId);
  }

  public async resolveMemberInteraction(input: RoleMenuInteractionInput): Promise<RoleMenuInteractionResult> {
    if (!this.gateway) throw new RoleMenuError("ROLE_NOT_ASSIGNABLE", "Discord role gateway is not configured.");
    const menu = await this.repository.findByPublishedMessage(input.guildId, input.channelId, input.messageId);
    if (!menu) throw new RoleMenuError("NOT_FOUND", "Role menu was not found for this message.");
    if (menu.status !== "PUBLISHED") throw new RoleMenuError("DISABLED", "Role menu is not published.");
    const option = this.resolveOption(menu, input);
    const validation = await this.gateway.validateAssignableRole({
      guildId: input.guildId,
      memberId: input.memberId,
      roleId: option.roleId,
    });
    if (!validation.assignable) throw new RoleMenuError("ROLE_NOT_ASSIGNABLE", validation.reason ?? "Role cannot be assigned.");

    if (input.surface === "REACTION" && input.direction === "remove") {
      if (menu.assignmentMode === "ADD_ONLY") return { changed: false, message: "Reaction removal does not remove this role." };
      const hasRole = await this.gateway.hasRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId });
      if (!hasRole) return { changed: false, message: "No role change was required." };
      return this.gateway.removeRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId, reason: `Qbox role menu ${menu.id} reaction removed.` });
    }

    if (menu.assignmentMode === "EXCLUSIVE") {
      for (const other of menu.options) {
        if (other.roleId !== option.roleId && await this.gateway.hasRole({ guildId: input.guildId, memberId: input.memberId, roleId: other.roleId }))
          await this.gateway.removeRole({ guildId: input.guildId, memberId: input.memberId, roleId: other.roleId, reason: `Qbox role menu ${menu.id} exclusive selection.` });
      }
      return this.gateway.addRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId, reason: `Qbox role menu ${menu.id} selected.` });
    }

    const hasRole = await this.gateway.hasRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId });
    if (menu.assignmentMode === "ADD_ONLY" || (menu.assignmentMode === "TOGGLE" && !hasRole))
      return this.gateway.addRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId, reason: `Qbox role menu ${menu.id} selected.` });
    if (menu.assignmentMode === "REMOVE_ONLY" || (menu.assignmentMode === "TOGGLE" && hasRole))
      return this.gateway.removeRole({ guildId: input.guildId, memberId: input.memberId, roleId: option.roleId, reason: `Qbox role menu ${menu.id} removed.` });
    return { changed: false, message: "No role change was required." };
  }

  private async requireMenu(id: string): Promise<RoleMenu> {
    const menu = await this.repository.findById(id);
    if (!menu) throw new RoleMenuError("NOT_FOUND", "Role menu was not found.");
    return menu;
  }

  private resolveOption(menu: RoleMenu, input: RoleMenuInteractionInput): RoleMenuOption {
    const option = input.optionId
      ? menu.options.find((candidate) => candidate.id === input.optionId)
      : menu.options.find((candidate) => candidate.emoji === input.emoji);
    if (!option) throw new RoleMenuError("OPTION_NOT_FOUND", "Role menu option was not found.");
    return option;
  }
}

function validateDraft(input: RoleMenuDraftInput): void {
  if (!snowflake.test(input.guildId)) throw invalid("guildId must be a Discord snowflake.");
  if (!snowflake.test(input.channelId)) throw invalid("channelId must be a Discord snowflake.");
  if (!snowflake.test(input.createdByDiscordUserId)) throw invalid("createdByDiscordUserId must be a Discord snowflake.");
  validateText("title", input.title, 1, 100);
  if (input.description !== undefined) validateText("description", input.description, 0, 1000);
}

function validateOption(input: RoleMenuOptionInput): void {
  if (!snowflake.test(input.roleId)) throw invalid("roleId must be a Discord snowflake.");
  validateText("label", input.label, 1, 80);
  if (input.description !== undefined) validateText("description", input.description, 0, 100);
}

function validateText(name: string, value: string, min: number, max: number): void {
  if (value.length < min || value.length > max) throw invalid(`${name} length must be between ${min} and ${max}.`);
}

function invalid(message: string): RoleMenuError {
  return new RoleMenuError("INVALID_INPUT", message);
}
