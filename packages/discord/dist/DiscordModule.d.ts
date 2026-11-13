import type { PlatformModule, PlatformModuleContext } from "@qbox/core";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { RoleMenuRepository } from "@qbox/role-menus";
import type { CommunityRepository } from "@qbox/discord-community";
import type { RoleDependencyRepository } from "@qbox/discord-roles";
import type { DiscordFeatureFactory } from "./features/DiscordFeature.js";
import type { MessageTemplates } from "@qbox/shared/messages";
import { DiscordService } from "./DiscordService.js";
import { CommandLoader } from "./loaders/CommandLoader.js";
export declare class DiscordModule implements PlatformModule {
    private readonly permissionAuthorizer;
    private readonly compatibility;
    readonly name = "discord";
    readonly version = "0.1.0";
    private readonly discordService;
    private readonly commandLoader;
    constructor(permissionAuthorizer: PermissionAuthorizer, compatibility: {
        readonly enabled: boolean;
        readonly roleCount: number;
        readonly guildId?: string;
    }, dependencies?: {
        readonly discordService?: DiscordService;
        readonly commandLoader?: CommandLoader;
        readonly roleMenuRepository?: RoleMenuRepository;
        readonly communityRepository?: CommunityRepository;
        readonly roleDependencyRepository?: RoleDependencyRepository;
        readonly features?: readonly DiscordFeatureFactory[];
        /** Custom message templates for welcome and goodbye messages. */
        readonly templates?: MessageTemplates;
    });
    start(context: PlatformModuleContext): Promise<void>;
    stop(): Promise<void>;
    private replaceCommand;
}
//# sourceMappingURL=DiscordModule.d.ts.map