import type {
  CommandDeploymentResult
} from "@qbox/discord";

export type DeploymentScope = "global" | "guild";

export interface CommandDeploymentTarget {
  readonly scope: DeploymentScope;
  readonly applicationId: string;
  readonly guildId?: string;
}

export interface CommandDeploymentConfiguration {
  readonly applicationId: string;
  readonly guildId: string;
  readonly confirmGlobal: boolean;
}

export interface CommandDeploymentClient {
  applicationId(): string;
  deployCommands(guildId?: string): Promise<CommandDeploymentResult>;
}

interface DeploymentLogger {
  info(context: object, message: string): void;
  error(context: object, message: string): void;
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

  if (scope === "guild") {
    if (!configuration.guildId) {
      throw new Error(
        "DISCORD_GUILD_ID is required for guild command deployment."
      );
    }

    return {
      scope,
      applicationId: configuration.applicationId,
      guildId: configuration.guildId
    };
  }

  if (!configuration.confirmGlobal) {
    throw new Error(
      "Global command replacement requires --confirm-global."
    );
  }

  return {
    scope,
    applicationId: configuration.applicationId
  };
}

export async function executeCommandDeployment(
  target: CommandDeploymentTarget,
  client: CommandDeploymentClient,
  log: DeploymentLogger
): Promise<CommandDeploymentResult> {
  const connectedApplicationId = client.applicationId();

  if (connectedApplicationId !== target.applicationId) {
    throw new Error(
      `Discord application mismatch: expected '${target.applicationId}', connected '${connectedApplicationId}'.`
    );
  }

  log.info(
    {
      applicationId: connectedApplicationId,
      deploymentScope: target.scope,
      targetGuildId: target.guildId
    },
    "Discord command deployment started."
  );

  try {
    const result = await client.deployCommands(target.guildId);

    log.info(
      {
        applicationId: connectedApplicationId,
        deploymentScope: target.scope,
        targetGuildId: target.guildId,
        commandCount: result.commandCount,
        commandNames: result.commandNames
      },
      "Discord command deployment completed."
    );

    return result;
  } catch (error) {
    log.error(
      {
        applicationId: connectedApplicationId,
        deploymentScope: target.scope,
        targetGuildId: target.guildId,
        err: error,
        stack: error instanceof Error ? error.stack : undefined
      },
      "Discord command deployment failed."
    );

    throw error;
  }
}
