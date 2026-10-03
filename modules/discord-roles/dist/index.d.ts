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
export type DiscordChannelResourceType = "TEXT" | "ANNOUNCEMENT" | "FORUM" | "MEDIA" | "VOICE" | "CATEGORY" | "OTHER";
export interface DiscordChannelResource {
    readonly id: string;
    readonly guildId: string;
    readonly name: string;
    readonly type: DiscordChannelResourceType;
    readonly parentId?: string | undefined;
    readonly position: number;
    readonly nsfw: boolean;
    readonly canView: boolean;
    readonly canSendMessages: boolean;
    readonly canEmbedLinks: boolean;
    readonly canManage: boolean;
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
    listChannels(guildId: string): Promise<readonly DiscordChannelResource[]>;
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
export declare class RoleManagementError extends Error {
    readonly code: "INVALID_INPUT" | "NOT_FOUND" | "DEPENDENCY_CONFLICT" | "DISCORD_UNAVAILABLE" | "FORBIDDEN";
    constructor(code: "INVALID_INPUT" | "NOT_FOUND" | "DEPENDENCY_CONFLICT" | "DISCORD_UNAVAILABLE" | "FORBIDDEN", message: string);
}
export declare class RoleManagementService {
    private readonly dependencies;
    private readonly gateway?;
    constructor(dependencies: RoleDependencyRepository, gateway?: RoleManagementGateway | undefined);
    listRoles(guildId: string): Promise<readonly DiscordRoleResource[]>;
    listChannels(guildId: string): Promise<readonly DiscordChannelResource[]>;
    inspectRole(guildId: string, roleId: string): Promise<DiscordRoleResource>;
    capabilities(guildId: string): Promise<RoleCapabilities>;
    createRole(input: RoleCreateInput): Promise<DiscordRoleResource>;
    editRole(input: RoleEditInput): Promise<DiscordRoleResource>;
    deleteRole(input: RoleDeleteInput): Promise<void>;
    moveRole(input: RoleMoveInput): Promise<DiscordRoleResource>;
    listDependencies(guildId: string, roleId?: string): Promise<readonly RoleDependency[]>;
    replaceDependency(input: {
        readonly guildId: string;
        readonly oldRoleId: string;
        readonly newRoleId: string;
        readonly actor: RoleActor;
        readonly source: RoleOperationSource;
    }): Promise<number>;
    private requireGateway;
    private audit;
}
//# sourceMappingURL=index.d.ts.map