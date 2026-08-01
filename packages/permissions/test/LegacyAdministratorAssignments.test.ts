import { describe, expect, it } from "vitest";

import {
  InMemoryPermissionRepository,
  PersistentPermissionService,
  createLegacyAdministratorCompatibility,
} from "../src/index.js";

describe("legacy administrator compatibility", () => {
  it("binds unique roles to one guild as bootstrap administrator assignments", () => {
    const compatibility = createLegacyAdministratorCompatibility("guild-1", [
      "admin",
      "admin",
      " staff ",
    ]);
    expect(compatibility).toMatchObject({
      enabled: true,
      guildId: "guild-1",
      roleCount: 2,
    });
    expect(compatibility.assignments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "legacy-bootstrap:guild-1:admin",
          scope: { type: "discord-guild", guildId: "guild-1" },
          selector: { type: "permission", permission: "platform.admin" },
        }),
      ]),
    );
  });

  it("fails clearly when roles are configured without a bootstrap guild", () => {
    expect(() => createLegacyAdministratorCompatibility("", ["admin"])).toThrow(
      "DISCORD_GUILD_ID",
    );
  });

  it("allows persistent deny to override a legacy administrator grant", async () => {
    const compatibility = createLegacyAdministratorCompatibility("guild-1", [
      "admin",
    ]);
    const repository = new InMemoryPermissionRepository([
      {
        id: "deny-admin",
        principal: {
          type: "discord-role",
          externalId: "admin",
          guildId: "guild-1",
        },
        selector: { type: "permission", permission: "platform.admin" },
        scope: { type: "discord-guild", guildId: "guild-1" },
        effect: "deny",
        enabled: true,
      },
    ]);
    const service = new PersistentPermissionService(repository, undefined, {
      legacyAssignments: compatibility.assignments,
    });
    const decision = await service.authorize({
      principals: [
        { type: "discord-role", externalId: "admin", guildId: "guild-1" },
      ],
      scope: { type: "discord-guild", guildId: "guild-1" },
      required: ["moderation.warn"],
      mode: "all",
      administratorOverride: true,
    });
    expect(decision.allowed).toBe(false);
  });
});
