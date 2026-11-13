import { Client } from "discord.js";
import { type MessageTemplates } from "@qbox/shared/messages";
import type { PermissionAuthorizer } from "@qbox/permissions";
import { RoleMenuService, type RoleMenuRepository } from "@qbox/role-menus";
import { DiscordCommunityService, type CommunityRepository } from "@qbox/discord-community";
import { RoleManagementService, type RoleDependencyRepository } from "@qbox/discord-roles";
import { CommandRegistry } from "./commands/CommandRegistry.js";
import type { DiscordCommand } from "./commands/DiscordCommand.js";
import type { DiscordFeature, DiscordFeatureFactory } from "./features/DiscordFeature.js";
export interface CommandDeploymentResult {
    readonly commandCount: number;
    readonly commandNames: readonly string[];
}
export type CommandDeploymentDefinition = Readonly<Record<string, unknown>>;
export declare class DiscordService {
    readonly client: Client<boolean>;
    readonly commands: CommandRegistry;
    readonly roleMenus: RoleMenuService | undefined;
    readonly community: DiscordCommunityService | undefined;
    readonly roles: RoleManagementService | undefined;
    /** Pluggable features (tickets, moderation, ...) composed at startup. */
    readonly features: readonly DiscordFeature[];
    private readonly interactions;
    private readonly roleMenuInteractions;
    private readonly communityEvents;
    private readonly interactionListener;
    private readonly reactionAddListener;
    private readonly reactionRemoveListener;
    constructor(permissionAuthorizer: PermissionAuthorizer, roleMenuRepository?: RoleMenuRepository, communityRepository?: CommunityRepository, roleDependencyRepository?: RoleDependencyRepository, featureFactories?: readonly DiscordFeatureFactory[], templates?: MessageTemplates);
    /** Live command instance provided by a feature for this command name. */
    featureCommand(name: string): DiscordCommand | undefined;
    registerCommands(commands: readonly DiscordCommand[]): number;
    start(): Promise<void>;
    applicationId(): string;
    desiredCommandDefinitions(): readonly CommandDeploymentDefinition[];
    fetchCommandDefinitions(guildId?: string): Promise<readonly CommandDeploymentDefinition[]>;
    applyCommandDefinitions(guildId?: string): Promise<CommandDeploymentResult>;
    /** Removes every guild-scoped command from one server; global commands stay. */
    clearCommandDefinitions(guildId: string): Promise<CommandDeploymentResult>;
    stop(): Promise<void>;
}
//# sourceMappingURL=DiscordService.d.ts.map