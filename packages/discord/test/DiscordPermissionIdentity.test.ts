import type { ChatInputCommandInteraction } from "discord.js";
import { describe, expect, it } from "vitest";

import { discordPermissionIdentity } from "../src/permissions/DiscordPermissionIdentity.js";

function interaction(options: {
  guildId?: string | null;
  userId?: string;
  roles?: readonly string[] | Map<string, unknown>;
}) {
  const guildId = options.guildId === undefined ? "guild-1" : options.guildId;
  return {
    guildId,
    user: { id: options.userId ?? "user-1" },
    member: {
      roles: Array.isArray(options.roles)
        ? options.roles
        : { cache: options.roles ?? new Map() },
    },
    inGuild: () => guildId !== null,
  } as unknown as ChatInputCommandInteraction;
}

describe("discordPermissionIdentity", () => {
  it("translates cached GuildMember roles", () => {
    const identity = discordPermissionIdentity(
      interaction({ roles: new Map([["role-1", {}]]) }),
    );
    expect(identity).toMatchObject({ type: "guild", guildId: "guild-1" });
    if (identity.type === "guild") expect(identity.principals).toHaveLength(2);
  });

  it("translates API interaction member role arrays", () => {
    const identity = discordPermissionIdentity(
      interaction({ roles: ["role-1", "role-2"] }),
    );
    if (identity.type === "guild") {
      expect(
        identity.principals.map((principal) => principal.externalId),
      ).toEqual(["user-1", "role-1", "role-2"]);
    }
  });

  it("returns DM user identity without roles or guild scope", () => {
    expect(
      discordPermissionIdentity(
        interaction({ guildId: null, roles: ["ignored"] }),
      ),
    ).toEqual({ type: "dm", userId: "user-1" });
  });

  it("rejects malformed user, guild, and role identity", () => {
    expect(() =>
      discordPermissionIdentity(interaction({ userId: "" })),
    ).toThrow("user identity");
    expect(() =>
      discordPermissionIdentity(interaction({ guildId: "" })),
    ).toThrow("guild identity");
    expect(() =>
      discordPermissionIdentity(interaction({ roles: [""] })),
    ).toThrow("malformed role");
  });
});
