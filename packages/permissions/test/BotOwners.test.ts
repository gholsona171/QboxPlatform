import { describe, expect, it, vi } from "vitest";

import {
  BotOwnerConfigurationError,
  InMemoryPermissionRepository,
  NO_BOT_OWNERS,
  PersistentPermissionService,
  botOwnersFromSetting,
  createBotOwners,
  parseBotOwnerIds,
} from "../src/index.js";
import type {
  PermissionAuthorizationRequest,
  PermissionRepository,
} from "../src/index.js";

const OWNER = "100000000000000001";
const SECOND_OWNER = "100000000000000002";
const MEMBER = "200000000000000001";
const GUILD = "300000000000000001";
const OTHER_GUILD = "300000000000000002";

const request = (
  userId: string,
  overrides: Partial<PermissionAuthorizationRequest> = {},
  guildId = GUILD,
): PermissionAuthorizationRequest => ({
  principals: [{ type: "discord-user", externalId: userId, guildId }],
  scope: { type: "discord-guild", guildId },
  required: ["moderation.ban", "platform.admin"],
  mode: "all",
  administratorOverride: false,
  now: new Date("2026-01-01T00:00:00Z"),
  ...overrides,
});

describe("BOT_OWNER_IDS parsing", () => {
  it("reads comma-separated Discord IDs, ignoring blanks, spaces and repeats", () => {
    expect(parseBotOwnerIds(` ${OWNER}, ,${SECOND_OWNER},${OWNER} `)).toEqual([OWNER, SECOND_OWNER]);
    expect(parseBotOwnerIds(undefined)).toEqual([]);
    expect(parseBotOwnerIds("")).toEqual([]);
  });

  it("refuses anything that is not a Discord user ID instead of silently dropping it", () => {
    expect(() => parseBotOwnerIds("antonio")).toThrow(BotOwnerConfigurationError);
    expect(() => parseBotOwnerIds(`${OWNER},12345`)).toThrow(BotOwnerConfigurationError);
    expect(() => createBotOwners(["not-an-id"])).toThrow(BotOwnerConfigurationError);
  });

  it("answers only for the listed accounts", () => {
    const owners = botOwnersFromSetting(`${OWNER},${SECOND_OWNER}`);
    expect(owners.size).toBe(2);
    expect(owners.isBotOwner(OWNER)).toBe(true);
    expect(owners.isBotOwner(SECOND_OWNER)).toBe(true);
    expect(owners.isBotOwner(MEMBER)).toBe(false);
    expect(NO_BOT_OWNERS.isBotOwner(OWNER)).toBe(false);
  });
});

describe("PersistentPermissionService bot owner override", () => {
  const owners = createBotOwners([OWNER]);

  it("allows a bot owner every permission in any server with no role or stored grant", async () => {
    const service = new PersistentPermissionService(new InMemoryPermissionRepository(), undefined, { botOwners: owners });
    for (const guildId of [GUILD, OTHER_GUILD]) {
      const decision = await service.authorize(request(OWNER, {}, guildId));
      expect(decision).toMatchObject({
        allowed: true,
        reason: "bot-owner-override",
        effectivePermissions: ["moderation.ban", "platform.admin"],
      });
    }
  });

  it("allows a bot owner platform-wide checks such as platform.owner", async () => {
    const service = new PersistentPermissionService(new InMemoryPermissionRepository(), undefined, { botOwners: owners });
    const decision = await service.authorize(
      request(OWNER, { scope: { type: "platform" }, required: ["platform.owner"] }),
    );
    expect(decision).toMatchObject({ allowed: true, reason: "bot-owner-override" });
  });

  it("is not blocked by an explicit deny or by the database being down", async () => {
    const deny = new PersistentPermissionService(
      new InMemoryPermissionRepository([
        {
          id: "deny-owner",
          principal: { type: "discord-user", externalId: OWNER, guildId: GUILD },
          selector: { type: "permission", permission: "moderation.ban" },
          scope: { type: "discord-guild", guildId: GUILD },
          effect: "deny",
          enabled: true,
        },
      ]),
      undefined,
      { botOwners: owners },
    );
    expect((await deny.authorize(request(OWNER))).allowed).toBe(true);

    const findAssignments = vi.fn().mockRejectedValue(new Error("database"));
    const down = new PersistentPermissionService(
      { ...new InMemoryPermissionRepository(), findAssignments } as unknown as PermissionRepository,
      undefined,
      { botOwners: owners },
    );
    expect((await down.authorize(request(OWNER))).allowed).toBe(true);
    expect(findAssignments).not.toHaveBeenCalled();
  });

  it("keeps a normal member limited to what they were granted", async () => {
    const service = new PersistentPermissionService(new InMemoryPermissionRepository(), undefined, { botOwners: owners });
    expect(await service.authorize(request(MEMBER))).toMatchObject({ allowed: false, reason: "permission-denied" });
    expect(
      await service.authorize(request(MEMBER, { scope: { type: "platform" }, required: ["platform.owner"] })),
    ).toMatchObject({ allowed: false });
  });

  it("does not treat a role whose ID matches an owner ID as the owner", async () => {
    const service = new PersistentPermissionService(new InMemoryPermissionRepository(), undefined, { botOwners: owners });
    const decision = await service.authorize(
      request(MEMBER, {
        principals: [
          { type: "discord-user", externalId: MEMBER, guildId: GUILD },
          { type: "discord-role", externalId: OWNER, guildId: GUILD },
        ],
      }),
    );
    expect(decision.allowed).toBe(false);
  });

  it("changes nothing when no bot owners are configured", async () => {
    const service = new PersistentPermissionService(new InMemoryPermissionRepository());
    expect((await service.authorize(request(OWNER))).allowed).toBe(false);
  });
});
