import { describe, expect, it, vi } from "vitest";

import {
  executeCommandDeployment,
  resolveCommandDeploymentTarget
} from "../src/commandDeployment.js";

function createLogger() {
  return {
    info: vi.fn(),
    error: vi.fn()
  };
}

describe("command deployment target", () => {
  it("selects the configured development guild", () => {
    expect(resolveCommandDeploymentTarget("guild", {
      applicationId: "application-1",
      guildId: "guild-1",
      confirmGlobal: false
    })).toEqual({
      scope: "guild",
      applicationId: "application-1",
      guildId: "guild-1"
    });
  });

  it("rejects guild deployment without DISCORD_GUILD_ID", () => {
    expect(() => resolveCommandDeploymentTarget("guild", {
      applicationId: "application-1",
      guildId: "",
      confirmGlobal: false
    })).toThrow(
      "DISCORD_GUILD_ID is required for guild command deployment."
    );
  });

  it("requires explicit confirmation for global replacement", () => {
    expect(() => resolveCommandDeploymentTarget("global", {
      applicationId: "application-1",
      guildId: "",
      confirmGlobal: false
    })).toThrow(
      "Global command replacement requires --confirm-global."
    );
  });
});

describe("executeCommandDeployment", () => {
  it("passes the guild target and reports deployed commands", async () => {
    const deployCommands = vi.fn(async () => ({
      commandCount: 2,
      commandNames: ["ping", "adminping"]
    }));
    const log = createLogger();

    const result = await executeCommandDeployment(
      {
        scope: "guild",
        applicationId: "application-1",
        guildId: "guild-1"
      },
      {
        applicationId: () => "application-1",
        deployCommands
      },
      log
    );

    expect(deployCommands).toHaveBeenCalledWith("guild-1");
    expect(result.commandNames).toEqual(["ping", "adminping"]);
    expect(log.info).toHaveBeenCalledTimes(2);
  });

  it("logs and rethrows deployment failures", async () => {
    const failure = new Error("Discord API unavailable");
    const log = createLogger();

    await expect(executeCommandDeployment(
      {
        scope: "guild",
        applicationId: "application-1",
        guildId: "guild-1"
      },
      {
        applicationId: () => "application-1",
        deployCommands: async () => {
          throw failure;
        }
      },
      log
    )).rejects.toBe(failure);

    expect(log.error).toHaveBeenCalledOnce();
  });
});
