import { describe, expect, it } from "vitest";

import {
  createCommandDeploymentPlan
} from "../src/commandDeploymentPlan.js";
import type {
  CommandDefinition
} from "../src/commandDeploymentPlan.js";

const target = {
  scope: "guild" as const,
  applicationId: "application-1",
  guildId: "guild-1"
};

function command(
  name: string,
  description = `Runs ${name}.`,
  options: readonly unknown[] = []
): CommandDefinition {
  return {
    type: 1,
    name,
    description,
    options
  };
}

describe("createCommandDeploymentPlan", () => {
  it("reports commands with no changes", () => {
    const plan = createCommandDeploymentPlan(
      target,
      [command("ping")],
      [command("ping")]
    );

    expect(plan.unchanged.map((change) => change.name)).toEqual(["ping"]);
    expect(plan.additions).toEqual([]);
    expect(plan.updates).toEqual([]);
    expect(plan.removals).toEqual([]);
  });

  it("reports additions and removals", () => {
    const plan = createCommandDeploymentPlan(
      target,
      [command("old")],
      [command("new")]
    );

    expect(plan.additions.map((change) => change.name)).toEqual(["new"]);
    expect(plan.removals.map((change) => change.name)).toEqual(["old"]);
    expect(plan.currentCommandCount).toBe(1);
    expect(plan.desiredCommandCount).toBe(1);
  });

  it("reports description and option changes", () => {
    const descriptionPlan = createCommandDeploymentPlan(
      target,
      [command("ping", "Old description.")],
      [command("ping", "New description.")]
    );
    const optionPlan = createCommandDeploymentPlan(
      target,
      [command("configure")],
      [command("configure", "Runs configure.", [{
        type: 3,
        name: "value",
        description: "Configuration value."
      }])]
    );

    expect(descriptionPlan.updates[0]?.name).toBe("ping");
    expect(optionPlan.updates[0]?.name).toBe("configure");
  });

  it("ignores policy-only changes outside Discord deployment metadata", () => {
    const plan = createCommandDeploymentPlan(
      target,
      [{ ...command("secure"), policy: { contexts: "guild" } }],
      [{ ...command("secure"), policy: { contexts: "dm" } }]
    );

    expect(plan.unchanged).toHaveLength(1);
    expect(plan.updates).toEqual([]);
  });

  it("reports subcommand definition changes", () => {
    const subcommand = (name: string) => ({
      type: 1,
      name,
      description: `Runs ${name}.`
    });
    const plan = createCommandDeploymentPlan(
      target,
      [command("staff", "Runs staff.", [subcommand("add")])],
      [command("staff", "Runs staff.", [subcommand("remove")])]
    );

    expect(plan.updates[0]?.name).toBe("staff");
  });

  it("ignores command ordering and unordered channel type differences", () => {
    const current = command("channel", "Runs channel.", [{
      type: 7,
      name: "target",
      description: "Target channel.",
      channelTypes: [2, 0]
    }]);
    const desired = command("channel", "Runs channel.", [{
      type: 7,
      name: "target",
      description: "Target channel.",
      channel_types: [0, 2]
    }]);
    const plan = createCommandDeploymentPlan(
      target,
      [command("ping"), current],
      [desired, command("ping")]
    );

    expect(plan.unchanged).toHaveLength(2);
    expect(plan.updates).toEqual([]);
  });
});
