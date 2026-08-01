import { describe, expect, it, vi } from "vitest";

import {
  executeCommandDeployment,
  resolveCommandDeploymentTarget
} from "../src/commandDeployment.js";
import type {
  CommandDeploymentConfiguration,
  CommandDeploymentTarget
} from "../src/commandDeployment.js";

function definition(name: string, description = `Runs ${name}.`) {
  return { type: 1, name, description };
}

function configuration(
  overrides: Partial<CommandDeploymentConfiguration> = {}
): CommandDeploymentConfiguration {
  return {
    applicationId: "application-1",
    guildId: "guild-1",
    dryRun: false,
    confirmGlobal: false,
    confirmGlobalRemovals: false,
    ...overrides
  };
}

function target(
  overrides: Partial<CommandDeploymentTarget> = {}
): CommandDeploymentTarget {
  return {
    scope: "guild",
    applicationId: "application-1",
    guildId: "guild-1",
    dryRun: false,
    confirmGlobal: false,
    confirmGlobalRemovals: false,
    ...overrides
  };
}

function createLogger() {
  return {
    info: vi.fn(),
    error: vi.fn()
  };
}

function createClient(options: {
  current?: readonly ReturnType<typeof definition>[];
  desired?: readonly ReturnType<typeof definition>[];
  resulting?: readonly ReturnType<typeof definition>[];
} = {}) {
  const current = options.current ?? [];
  const desired = options.desired ?? [definition("ping")];
  const resulting = options.resulting ?? desired;
  const fetchCommandDefinitions = vi.fn()
    .mockResolvedValueOnce(current)
    .mockResolvedValueOnce(resulting);
  const applyCommandDefinitions = vi.fn(async () => ({
    commandCount: desired.length,
    commandNames: desired.map((command) => command.name)
  }));

  return {
    client: {
      applicationId: () => "application-1",
      desiredCommandDefinitions: () => desired,
      fetchCommandDefinitions,
      applyCommandDefinitions
    },
    fetchCommandDefinitions,
    applyCommandDefinitions
  };
}

describe("command deployment target", () => {
  it("selects a guild target", () => {
    expect(resolveCommandDeploymentTarget(
      "guild",
      configuration({ dryRun: true })
    )).toEqual({
      scope: "guild",
      applicationId: "application-1",
      guildId: "guild-1",
      dryRun: true,
      confirmGlobal: false,
      confirmGlobalRemovals: false
    });
  });

  it("selects a global dry-run target without deployment confirmation", () => {
    expect(resolveCommandDeploymentTarget(
      "global",
      configuration({ guildId: "", dryRun: true })
    )).toEqual({
      scope: "global",
      applicationId: "application-1",
      dryRun: true,
      confirmGlobal: false,
      confirmGlobalRemovals: false
    });
  });

  it("rejects guild deployment without DISCORD_GUILD_ID", () => {
    expect(() => resolveCommandDeploymentTarget(
      "guild",
      configuration({ guildId: "" })
    )).toThrow("DISCORD_GUILD_ID is required");
  });
});

describe("executeCommandDeployment", () => {
  it.each(["guild", "global"] as const)(
    "performs a %s dry-run without applying changes",
    async (scope) => {
      const { client, applyCommandDefinitions } = createClient();
      const result = await executeCommandDeployment(
        target({
          scope,
          guildId: scope === "guild" ? "guild-1" : undefined,
          dryRun: true
        }),
        client,
        createLogger()
      );

      expect(result.applied).toBe(false);
      expect(result.plan.additions[0]?.name).toBe("ping");
      expect(applyCommandDefinitions).not.toHaveBeenCalled();
    }
  );

  it("requires explicit global confirmation after displaying the plan", async () => {
    const { client, applyCommandDefinitions } = createClient();
    const log = createLogger();

    await expect(executeCommandDeployment(
      target({ scope: "global", guildId: undefined }),
      client,
      log
    )).rejects.toThrow("--confirm-global");

    expect(log.info).toHaveBeenCalledWith(
      expect.objectContaining({ additions: ["ping"] }),
      "Discord command deployment plan created."
    );
    expect(applyCommandDefinitions).not.toHaveBeenCalled();
  });

  it("requires stronger confirmation for global removals", async () => {
    const { client, applyCommandDefinitions } = createClient({
      current: [definition("old")],
      desired: []
    });

    await expect(executeCommandDeployment(
      target({
        scope: "global",
        guildId: undefined,
        confirmGlobal: true
      }),
      client,
      createLogger()
    )).rejects.toThrow("--confirm-global-removals");

    expect(applyCommandDefinitions).not.toHaveBeenCalled();
  });

  it("applies guild commands and verifies the resulting state", async () => {
    const { client, fetchCommandDefinitions, applyCommandDefinitions } =
      createClient();
    const result = await executeCommandDeployment(
      target(),
      client,
      createLogger()
    );

    expect(fetchCommandDefinitions).toHaveBeenNthCalledWith(1, "guild-1");
    expect(applyCommandDefinitions).toHaveBeenCalledWith("guild-1");
    expect(fetchCommandDefinitions).toHaveBeenNthCalledWith(2, "guild-1");
    expect(result.verified).toBe(true);
    expect(result.commandNames).toEqual(["ping"]);
  });

  it("logs and rethrows a Discord fetch failure", async () => {
    const failure = new Error("Discord fetch unavailable");
    const { client } = createClient();
    client.fetchCommandDefinitions.mockReset();
    client.fetchCommandDefinitions.mockRejectedValue(failure);
    const log = createLogger();

    await expect(executeCommandDeployment(
      target({ dryRun: true }),
      client,
      log
    )).rejects.toBe(failure);

    expect(log.error).toHaveBeenCalledOnce();
  });

  it("logs and rethrows a Discord apply failure", async () => {
    const failure = new Error("Discord apply unavailable");
    const { client } = createClient();
    client.applyCommandDefinitions.mockRejectedValue(failure);
    const log = createLogger();

    await expect(executeCommandDeployment(
      target(),
      client,
      log
    )).rejects.toBe(failure);

    expect(log.error).toHaveBeenCalledOnce();
  });

  it("fails when post-deployment verification does not match", async () => {
    const { client } = createClient({
      resulting: [definition("unexpected")]
    });

    await expect(executeCommandDeployment(
      target(),
      client,
      createLogger()
    )).rejects.toThrow("verification failed");
  });
});
