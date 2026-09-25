import { describe, expect, it } from "vitest";

import { composePermissionCompatibility } from "../src/permissionCompatibility.js";

describe("bot permission compatibility composition", () => {
  it("starts without DISCORD_GUILD_ID: legacy roles are ignored, nothing throws", () => {
    const composed = composePermissionCompatibility({
      guildId: "",
      roleIds: ["admin"],
      enabled: true
    });

    expect(composed.compatibility.enabled).toBe(true);
    expect(composed.compatibility.guildId).toBeUndefined();
    expect(composed.compatibility.roleCount).toBe(0);
    expect(composed.compatibility.assignments).toEqual([]);
    expect(composed.persistence).toEqual({ enabled: true, roleIds: [] });
  });

  it("starts without DISCORD_GUILD_ID and without roles", () => {
    const composed = composePermissionCompatibility({
      guildId: "",
      roleIds: [],
      enabled: true
    });

    expect(composed.compatibility.assignments).toEqual([]);
    expect(composed.persistence).toEqual({ enabled: true, roleIds: [] });
  });

  it("keeps the single-server legacy grants when DISCORD_GUILD_ID is set", () => {
    const composed = composePermissionCompatibility({
      guildId: "guild-1",
      roleIds: ["admin"],
      enabled: true
    });

    expect(composed.compatibility.roleCount).toBe(1);
    expect(composed.compatibility.assignments[0]).toMatchObject({
      principal: { type: "discord-role", externalId: "admin", guildId: "guild-1" },
      scope: { type: "discord-guild", guildId: "guild-1" }
    });
    expect(composed.persistence).toEqual({
      enabled: true,
      guildId: "guild-1",
      roleIds: ["admin"]
    });
  });

  it("passes an explicit disable through unchanged", () => {
    const composed = composePermissionCompatibility({
      guildId: "guild-1",
      roleIds: ["admin"],
      enabled: false
    });

    expect(composed.compatibility.enabled).toBe(false);
    expect(composed.compatibility.assignments).toEqual([]);
    expect(composed.persistence.enabled).toBe(false);
  });
});
