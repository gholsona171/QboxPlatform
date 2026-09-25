import type {
  CommandDeploymentDefinition,
  CommandDeploymentResult
} from "@qbox/discord";

import {
  commandDeploymentPlanSummary,
  createCommandDeploymentPlan
} from "./commandDeploymentPlan.js";
import type {
  CommandDeploymentPlan,
  CommandDeploymentTargetIdentity,
  DeploymentScope
} from "./commandDeploymentPlan.js";

export type { DeploymentScope } from "./commandDeploymentPlan.js";

export interface CommandDeploymentTarget
  extends CommandDeploymentTargetIdentity {
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
  fetchCommandDefinitions(
    guildId?: string
  ): Promise<readonly CommandDeploymentDefinition[]>;
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

export function resolveCommandDeploymentTarget(
  scope: DeploymentScope,
  configuration: CommandDeploymentConfiguration
): CommandDeploymentTarget {
  if (!configuration.applicationId) {
    throw new Error(
      "DISCORD_APPLICATION_ID is required for command deployment."
    );
  }

  if (scope === "guild" || scope === "clear-guild") {
    if (!configuration.guildId) {
      throw new Error(
        `DISCORD_GUILD_ID is required for ${scope} command deployment.`
      );
    }

    return {
      scope,
      applicationId: configuration.applicationId,
      guildId: configuration.guildId,
      dryRun: configuration.dryRun,
      confirmGlobal: configuration.confirmGlobal,
      confirmGlobalRemovals: configuration.confirmGlobalRemovals
    };
  }

  return {
    scope,
    applicationId: configuration.applicationId,
    dryRun: configuration.dryRun,
    confirmGlobal: configuration.confirmGlobal,
    confirmGlobalRemovals: configuration.confirmGlobalRemovals
  };
}

function hasVerificationMismatch(plan: CommandDeploymentPlan): boolean {
  return (
    plan.additions.length > 0 ||
    plan.updates.length > 0 ||
    plan.removals.length > 0 ||
    plan.currentCommandCount !== plan.desiredCommandCount
  );
}

export async function executeCommandDeployment(
  target: CommandDeploymentTarget,
  client: CommandDeploymentClient,
  log: DeploymentLogger
): Promise<CommandDeploymentExecutionResult> {
  const connectedApplicationId = client.applicationId();

  if (connectedApplicationId !== target.applicationId) {
    throw new Error(
      `Discord application mismatch: expected '${target.applicationId}', connected '${connectedApplicationId}'.`
    );
  }

  try {
    const desired =
      target.scope === "clear-guild" ? [] : client.desiredCommandDefinitions();
    const current = await client.fetchCommandDefinitions(target.guildId);
    const plan = createCommandDeploymentPlan(target, current, desired);
    const summary = commandDeploymentPlanSummary(plan);

    log.info(
      {
        ...summary,
        dryRun: target.dryRun
      },
      "Discord command deployment plan created."
    );

    if (target.dryRun) {
      log.info(
        summary,
        "Discord command deployment dry-run completed without changes."
      );

      return {
        plan,
        applied: false,
        verified: false,
        commandNames: desired
          .map((definition) => definition.name)
          .filter((name): name is string => typeof name === "string")
          .sort()
      };
    }

    if (target.scope === "global" && !target.confirmGlobal) {
      throw new Error(
        "Global command replacement requires --confirm-global."
      );
    }

    if (
      target.scope === "global" &&
      plan.removals.length > 0 &&
      !target.confirmGlobalRemovals
    ) {
      throw new Error(
        "Global command removals require --confirm-global-removals."
      );
    }

    const applied =
      target.scope === "clear-guild" && target.guildId
        ? await client.clearCommandDefinitions(target.guildId)
        : await client.applyCommandDefinitions(target.guildId);
    const resulting = await client.fetchCommandDefinitions(target.guildId);
    const verification = createCommandDeploymentPlan(
      target,
      resulting,
      desired
    );

    if (hasVerificationMismatch(verification)) {
      throw new Error(
        "Discord command deployment verification failed: resulting definitions do not match the desired state."
      );
    }

    log.info(
      {
        ...summary,
        commandCount: applied.commandCount,
        commandNames: applied.commandNames,
        verifiedCommandCount: resulting.length
      },
      "Discord command deployment applied and verified."
    );

    return {
      plan,
      applied: true,
      verified: true,
      commandNames: applied.commandNames
    };
  } catch (error) {
    log.error(
      {
        applicationId: connectedApplicationId,
        deploymentScope: target.scope,
        targetGuildId: target.guildId,
        dryRun: target.dryRun,
        err: error,
        stack: error instanceof Error ? error.stack : undefined
      },
      "Discord command deployment failed."
    );

    throw error;
  }
}
