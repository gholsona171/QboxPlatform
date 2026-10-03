import type { CommandDeploymentDefinition, CommandDeploymentResult } from "@qbox/discord";
import type { CommandDeploymentPlan, CommandDeploymentTargetIdentity, DeploymentScope } from "./commandDeploymentPlan.js";
export type { DeploymentScope } from "./commandDeploymentPlan.js";
export interface CommandDeploymentTarget extends CommandDeploymentTargetIdentity {
    readonly dryRun: boolean;
    readonly confirmGlobal: boolean;
    readonly confirmGlobalRemovals: boolean;
}
export interface CommandDeploymentConfiguration {
    readonly applicationId: string;
    readonly guildId: string;
    readonly dryRun: boolean;
    readonly confirmGlobal: boolean;
    readonly confirmGlobalRemovals: boolean;
}
export interface CommandDeploymentClient {
    applicationId(): string;
    desiredCommandDefinitions(): readonly CommandDeploymentDefinition[];
    fetchCommandDefinitions(guildId?: string): Promise<readonly CommandDeploymentDefinition[]>;
    applyCommandDefinitions(guildId?: string): Promise<CommandDeploymentResult>;
    clearCommandDefinitions(guildId: string): Promise<CommandDeploymentResult>;
}
interface DeploymentLogger {
    info(context: object, message: string): void;
    error(context: object, message: string): void;
}
export interface CommandDeploymentExecutionResult {
    readonly plan: CommandDeploymentPlan;
    readonly applied: boolean;
    readonly verified: boolean;
    readonly commandNames: readonly string[];
}
export declare function resolveCommandDeploymentTarget(scope: DeploymentScope, configuration: CommandDeploymentConfiguration): CommandDeploymentTarget;
export declare function executeCommandDeployment(target: CommandDeploymentTarget, client: CommandDeploymentClient, log: DeploymentLogger): Promise<CommandDeploymentExecutionResult>;
//# sourceMappingURL=commandDeployment.d.ts.map