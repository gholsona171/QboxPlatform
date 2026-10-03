import type { PlatformModule, PlatformModuleContext } from "@qbox/core";
import { DatabaseService, type PrismaPermissionPersistenceClient } from "@qbox/database";
import { type PermissionCache, type PermissionDefinitionRepository } from "@qbox/permissions";
/** Starts persistence, synchronizes the compiled catalog, and owns shutdown. */
export declare class PermissionPersistenceModule implements PlatformModule {
    private readonly database;
    private readonly persistence;
    private readonly definitions;
    private readonly cache;
    private readonly compatibility;
    readonly name = "permission-persistence";
    readonly version = "0.1.0";
    constructor(database: DatabaseService, persistence: PrismaPermissionPersistenceClient, definitions: PermissionDefinitionRepository, cache: PermissionCache, compatibility: {
        readonly enabled: boolean;
        readonly guildId?: string;
        readonly roleIds: readonly string[];
    });
    start(context: PlatformModuleContext): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=PermissionPersistenceModule.d.ts.map