import type { CommandDefinition } from "../src/commandDeploymentPlan.js";

export function deploymentDefinition(
  name: string,
  description = `Runs ${name}.`,
  options: readonly unknown[] = [],
): CommandDefinition {
  return { type: 1, name, description, options };
}
