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
export declare class RoleMenuError extends Error {
    readonly code: "INVALID_INPUT" | "NOT_FOUND" | "DISABLED" | "NOT_PUBLISHED" | "OPTION_NOT_FOUND" | "ROLE_NOT_ASSIGNABLE" | "CONFLICT";
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: "INVALID_INPUT" | "NOT_FOUND" | "DISABLED" | "NOT_PUBLISHED" | "OPTION_NOT_FOUND" | "ROLE_NOT_ASSIGNABLE" | "CONFLICT", message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare class RoleMenuService {
    private readonly repository;
    private readonly gateway?;
    constructor(repository: RoleMenuRepository, gateway?: RoleMenuMemberRoleGateway | undefined);
    createDraft(input: RoleMenuDraftInput): Promise<RoleMenu>;
    updateDraft(id: string, input: Partial<Omit<RoleMenuDraftInput, "guildId" | "createdByDiscordUserId">> & RoleMenuConcurrencyInput): Promise<RoleMenu>;
    addOption(roleMenuId: string, input: RoleMenuOptionInput & RoleMenuConcurrencyInput): Promise<RoleMenu>;
    updateOption(roleMenuId: string, optionId: string, input: Partial<RoleMenuOptionInput> & RoleMenuConcurrencyInput): Promise<RoleMenu>;
    removeOption(roleMenuId: string, optionId: string, input?: RoleMenuConcurrencyInput): Promise<RoleMenu>;
    reorderOptions(roleMenuId: string, optionIds: readonly string[], input?: RoleMenuConcurrencyInput): Promise<RoleMenu>;
    publish(roleMenuId: string, messageId: string, input?: RoleMenuConcurrencyInput): Promise<RoleMenu>;
    disable(roleMenuId: string, input?: RoleMenuConcurrencyInput): Promise<RoleMenu>;
    delete(roleMenuId: string): Promise<void>;
    getById(roleMenuId: string): Promise<RoleMenu | undefined>;
    listByGuild(guildId: string): Promise<readonly RoleMenu[]>;
    resolveMemberInteraction(input: RoleMenuInteractionInput): Promise<RoleMenuInteractionResult>;
    private requireMenu;
    private resolveOption;
}
//# sourceMappingURL=index.d.ts.map