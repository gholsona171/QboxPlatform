/**
 * "global" registers the command set for every server the bot is in,
 * "guild" registers it in one server only, and "clear-guild" removes every
 * guild-scoped command from one server (so members do not see each command
 * twice once the global set exists).
 */
export type DeploymentScope = "global" | "guild" | "clear-guild";
export type CommandDefinition = Readonly<Record<string, unknown>>;
export interface CommandDeploymentTargetIdentity {
    readonly scope: DeploymentScope;
    readonly applicationId: string;
    readonly guildId?: string;
}
export interface CommandDeploymentChange {
    readonly key: string;
    readonly name: string;
    readonly current?: CommandDefinition;
    readonly desired?: CommandDefinition;
}
export interface CommandDeploymentPlan {
    readonly scope: DeploymentScope;
    readonly applicationId: string;
    readonly guildId?: string;
    readonly desiredCommandCount: number;
    readonly currentCommandCount: number;
    readonly additions: readonly CommandDeploymentChange[];
    readonly updates: readonly CommandDeploymentChange[];
    readonly removals: readonly CommandDeploymentChange[];
    readonly unchanged: readonly CommandDeploymentChange[];
}
export declare function normalizeCommandDefinition(definition: CommandDefinition): CommandDefinition;
export declare function createCommandDeploymentPlan(target: CommandDeploymentTargetIdentity, currentDefinitions: readonly CommandDefinition[], desiredDefinitions: readonly CommandDefinition[]): CommandDeploymentPlan;
export declare function commandDeploymentPlanSummary(plan: CommandDeploymentPlan): {
    deploymentScope: DeploymentScope;
    applicationId: string;
    targetGuildId: string | undefined;
    currentCommandCount: number;
    desiredCommandCount: number;
    additions: string[];
    updates: string[];
    removals: string[];
    unchanged: string[];
};
//# sourceMappingURL=commandDeploymentPlan.d.ts.map