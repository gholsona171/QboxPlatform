import { describe, expect, it, vi } from "vitest";

import {
  executeCommandDeployment,
  resolveCommandDeploymentTarget
} from "../src/commandDeployment.js";
import type {
  CommandDeploymentConfiguration,
  CommandDeploymentTarget
} from "../src/commandDeployment.js";
import { deploymentDefinition as definition } from "./DeploymentTestFactory.js";

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
  const clearCommandDefinitions = vi.fn(async () => ({
    commandCount: 0,
    commandNames: []
  }));

  return {
    client: {
      applicationId: () => "application-1",
      desiredCommandDefinitions: () => desired,
      fetchCommandDefinitions,
      applyCommandDefinitions,
      clearCommandDefinitions
    },
    fetchCommandDefinitions,
    applyCommandDefinitions,
    clearCommandDefinitions
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

  it.each(["guild", "clear-guild"] as const)(
    "rejects %s deployment without DISCORD_GUILD_ID",
    (scope) => {
      expect(() => resolveCommandDeploymentTarget(
        scope,
        configuration({ guildId: "" })
      )).toThrow("DISCORD_GUILD_ID is required");
    }
  );

  it("selects a clear-guild target bound to DISCORD_GUILD_ID", () => {
    expect(resolveCommandDeploymentTarget(
      "clear-guild",
      configuration()
    )).toEqual({
      scope: "clear-guild",
      applicationId: "application-1",
      guildId: "guild-1",
      dryRun: false,
      confirmGlobal: false,
      confirmGlobalRemovals: false
    });
  });
});

describe("clear-guild deployment", () => {
  it("removes every guild command and verifies the server is empty", async () => {
    const {
      client,
      fetchCommandDefinitions,
      applyCommandDefinitions,
      clearCommandDefinitions
    } = createClient({
      current: [definition("ping"), definition("old")],
      desired: [definition("ping")],
      resulting: []
    });
    const result = await executeCommandDeployment(
      target({ scope: "clear-guild" }),
      client,
      createLogger()
    );

    expect(result.plan.removals.map((change) => change.name)).toEqual([
      "old",
      "ping"
    ]);
    expect(result.plan.additions).toEqual([]);
    expect(fetchCommandDefinitions).toHaveBeenNthCalledWith(1, "guild-1");
    expect(clearCommandDefinitions).toHaveBeenCalledWith("guild-1");
    expect(applyCommandDefinitions).not.toHaveBeenCalled();
    expect(fetchCommandDefinitions).toHaveBeenNthCalledWith(2, "guild-1");
    expect(result.verified).toBe(true);
    expect(result.commandNames).toEqual([]);
  });

  it("previews removals in dry-run without touching Discord", async () => {
    const { client, clearCommandDefinitions } = createClient({
      current: [definition("ping")]
    });
    const result = await executeCommandDeployment(
      target({ scope: "clear-guild", dryRun: true }),
      client,
      createLogger()
    );

    expect(result.applied).toBe(false);
    expect(result.plan.removals[0]?.name).toBe("ping");
    expect(result.commandNames).toEqual([]);
    expect(clearCommandDefinitions).not.toHaveBeenCalled();
  });

  it("needs no global confirmation flags", async () => {
    const { client, clearCommandDefinitions } = createClient({
      current: [definition("ping")],
      resulting: []
    });

    await expect(executeCommandDeployment(
      target({ scope: "clear-guild" }),
      client,
      createLogger()
    )).resolves.toMatchObject({ applied: true, verified: true });
    expect(clearCommandDefinitions).toHaveBeenCalledOnce();
  });

  it("fails when guild commands remain after clearing", async () => {
    const { client } = createClient({
      current: [definition("ping")],
      resulting: [definition("ping")]
    });

    await expect(executeCommandDeployment(
      target({ scope: "clear-guild" }),
      client,
      createLogger()
    )).rejects.toThrow("verification failed");
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
