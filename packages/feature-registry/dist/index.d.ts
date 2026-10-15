export type FeatureStatus = "LIVE" | "PARTIAL" | "DISABLED" | "PLANNED";
export interface FeatureRegistryRecord {
    readonly id: string;
    readonly displayName: string;
    readonly status: FeatureStatus;
    readonly discordCommands: readonly string[];
    readonly discordInteractions: readonly string[];
    readonly automaticHandlers: readonly string[];
    readonly apiRoutes: readonly string[];
    readonly portalRoute: string;
    readonly requiredPermissions: readonly string[];
    readonly persistence: readonly string[];
    readonly discordFallbackAvailable: boolean;
    readonly portalAvailable: boolean;
}
export declare const featureRegistry: readonly [FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord, FeatureRegistryRecord];
//# sourceMappingURL=index.d.ts.map