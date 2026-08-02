import type { ChatInputCommandInteraction } from "discord.js";
import { describe, expect, it, vi } from "vitest";

import type { Permission, PermissionAssignment } from "@qbox/permissions";

import type {
  CommandExecutionContext,
  CommandExecutionPolicy,
  DiscordCommand,
} from "../src/commands/DiscordCommand.js";
import { CommandRegistry } from "../src/commands/CommandRegistry.js";
import {
  createCommand,
  createTestAuthorizer,
  defaultPolicy,
} from "./CommandTestFactory.js";

function grant(
  roleId: string,
  permissions: readonly Permission[],
  guildId = "guild-1",
): PermissionAssignment[] {
  return permissions.map((permission) => ({
    id: `${roleId}:${permission}`,
    principal: { type: "discord-role", externalId: roleId, guildId },
    selector: { type: "permission", permission },
    scope: { type: "discord-guild", guildId },
    effect: "allow",
    enabled: true,
  }));
}

function createContext(
  options: {
    commandName?: string;
    userId?: string;
    guildId?: string | null;
    roleIds?: readonly string[];
  } = {},
) {
  const guildId = options.guildId === undefined ? "guild-1" : options.guildId;
  const reply = vi.fn(async () => undefined);
  const interaction = {
    commandName: options.commandName ?? "secure",
    guildId,
    inGuild: () => guildId !== null,
    member: {
      roles: {
        cache: new Map((options.roleIds ?? []).map((id) => [id, {}])),
      },
    },
    user: { id: options.userId ?? "user-1" },
  } as unknown as ChatInputCommandInteraction;
  const context = {
    interaction,
    signal: new AbortController().signal,
    reply,
    editReply: vi.fn(async () => undefined),
  } as unknown as CommandExecutionContext;

  return { context, reply };
}

function protectedPolicy(
  overrides: Partial<CommandExecutionPolicy> = {},
): CommandExecutionPolicy {
  return {
    ...defaultPolicy,
    contexts: "guild",
    permissions: {
      required: ["moderation.warn", "moderation.kick"],
      mode: "all",
      administratorOverride: false,
    },
    ...overrides,
  };
}

describe("CommandRegistry authorization policy", () => {
  it.each([
    ["guild", "guild-1", true],
    ["guild", null, false],
    ["dm", "guild-1", false],
    ["dm", null, true],
    ["both", "guild-1", true],
    ["both", null, true],
  ] as const)(
    "enforces %s context policy",
    async (contexts, guildId, expectedExecution) => {
      const execute = vi.fn(async () => undefined);
      const command = createCommand("secure", {
        policy: { ...defaultPolicy, contexts },
        execute,
      });
      const registry = new CommandRegistry(createTestAuthorizer());
      const { context, reply } = createContext({ guildId });
      registry.register(command);

      await registry.execute(context);

      expect(execute).toHaveBeenCalledTimes(expectedExecution ? 1 : 0);
      expect(reply).toHaveBeenCalledTimes(expectedExecution ? 0 : 1);
    },
  );

  it("supports all and any permission evaluation", async () => {
    const registry = new CommandRegistry(
      createTestAuthorizer(grant("moderator", ["moderation.warn"])),
    );
    const allExecute = vi.fn(async () => undefined);
    const anyExecute = vi.fn(async () => undefined);
    registry.registerAll([
      createCommand("all", { policy: protectedPolicy(), execute: allExecute }),
      createCommand("any", {
        policy: protectedPolicy({
          permissions: {
            required: ["moderation.warn", "moderation.kick"],
            mode: "any",
            administratorOverride: false,
          },
        }),
        execute: anyExecute,
      }),
    ]);

    await registry.execute(
      createContext({ commandName: "all", roleIds: ["moderator"] }).context,
    );
    await registry.execute(
      createContext({ commandName: "any", roleIds: ["moderator"] }).context,
    );

    expect(allExecute).not.toHaveBeenCalled();
    expect(anyExecute).toHaveBeenCalledOnce();
  });

  it("allows command-defined public subcommands to bypass permission checks", async () => {
    const execute = vi.fn(async () => undefined);
    const command = createCommand("secure", {
      policy: protectedPolicy(),
      execute,
    }) as DiscordCommand;
    const publicCommand: DiscordCommand = {
      ...command,
      bypassAuthorization: () => true,
    };
    const registry = new CommandRegistry(createTestAuthorizer());
    const { context, reply } = createContext();
    registry.register(publicCommand);

    await registry.execute(context);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(reply).not.toHaveBeenCalled();
  });

  it("allows an administrator override only when enabled", async () => {
    const registry = new CommandRegistry(
      createTestAuthorizer(grant("admin", ["platform.admin"])),
    );
    const denied = vi.fn(async () => undefined);
    const allowed = vi.fn(async () => undefined);
    registry.registerAll([
      createCommand("denied", { policy: protectedPolicy(), execute: denied }),
      createCommand("allowed", {
        policy: protectedPolicy({
          permissions: {
            required: ["moderation.warn"],
            mode: "all",
            administratorOverride: true,
          },
        }),
        execute: allowed,
      }),
    ]);

    await registry.execute(
      createContext({ commandName: "denied", roleIds: ["admin"] }).context,
    );
    await registry.execute(
      createContext({ commandName: "allowed", roleIds: ["admin"] }).context,
    );

    expect(denied).not.toHaveBeenCalled();
    expect(allowed).toHaveBeenCalledOnce();
  });
});

describe("CommandRegistry cooldown policy", () => {
  it.each(["user", "guild"] as const)(
    "enforces a per-%s cooldown and allows execution after expiry",
    async (scope) => {
      const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
      const execute = vi.fn(async () => undefined);
      const command = createCommand("secure", {
        policy: {
          ...defaultPolicy,
          contexts: scope === "guild" ? "guild" : "both",
          cooldown: { scope, durationMs: 5_000 },
        },
        execute,
      });
      const registry = new CommandRegistry(createTestAuthorizer());
      registry.register(command);

      await registry.execute(createContext().context);
      const rejected = createContext();
      await registry.execute(rejected.context);
      now.mockReturnValue(6_000);
      await registry.execute(createContext().context);

      expect(execute).toHaveBeenCalledTimes(2);
      expect(rejected.reply).toHaveBeenCalledWith({
        content: "Please wait 5 second(s) before using this command again.",
      });
      now.mockRestore();
    },
  );

  it.each([
    ["user", { userId: "user-2" }],
    ["guild", { guildId: "guild-2" }],
  ] as const)(
    "isolates %s cooldowns by scope",
    async (scope, secondSubject) => {
      const execute = vi.fn(async () => undefined);
      const registry = new CommandRegistry(createTestAuthorizer());
      registry.register(
        createCommand("secure", {
          policy: {
            ...defaultPolicy,
            contexts: scope === "guild" ? "guild" : "both",
            cooldown: { scope, durationMs: 5_000 },
          },
          execute,
        }),
      );

      await registry.execute(createContext().context);
      await registry.execute(createContext(secondSubject).context);

      expect(execute).toHaveBeenCalledTimes(2);
    },
  );
});

describe("CommandRegistry concurrency policy", () => {
  it.each(["single", "user", "guild"] as const)(
    "rejects overlapping %s executions",
    async (concurrency) => {
      let release: (() => void) | undefined;
      const execute = vi.fn(
        async () =>
          await new Promise<void>((resolve) => {
            release = resolve;
          }),
      );
      const command = createCommand("secure", {
        policy: {
          ...defaultPolicy,
          contexts: concurrency === "guild" ? "guild" : "both",
          concurrency,
        },
        execute,
      });
      const registry = new CommandRegistry(createTestAuthorizer());
      registry.register(command);
      const first = registry.execute(createContext().context);
      const rejected = createContext();

      await registry.execute(rejected.context);
      release?.();
      await first;

      expect(execute).toHaveBeenCalledOnce();
      expect(rejected.reply).toHaveBeenCalledWith({
        content: "This command is already running for the selected scope.",
      });
    },
  );

  it("allows overlapping executions when concurrency is unlimited", async () => {
    const execute = vi.fn(async () => undefined);
    const registry = new CommandRegistry(createTestAuthorizer());
    registry.register(createCommand("secure", { execute }));

    await Promise.all([
      registry.execute(createContext().context),
      registry.execute(createContext().context),
    ]);

    expect(execute).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["user", { userId: "user-2" }],
    ["guild", { guildId: "guild-2" }],
  ] as const)(
    "allows different %s scopes concurrently",
    async (concurrency, secondSubject) => {
      let release: (() => void) | undefined;
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      const execute = vi.fn(async () => await pending);
      const registry = new CommandRegistry(createTestAuthorizer());
      registry.register(
        createCommand("secure", {
          policy: {
            ...defaultPolicy,
            contexts: concurrency === "guild" ? "guild" : "both",
            concurrency,
          },
          execute,
        }),
      );

      const first = registry.execute(createContext().context);
      const second = registry.execute(createContext(secondSubject).context);
      await Promise.resolve();
      expect(execute).toHaveBeenCalledTimes(2);
      release?.();
      await Promise.all([first, second]);
    },
  );
});

describe("CommandRegistry registration", () => {
  it("registers commands and aliases atomically", () => {
    const registry = new CommandRegistry(createTestAuthorizer());
    const command = createCommand("secure", { aliases: ["secure-alias"] });

    expect(registry.registerAll([command])).toBe(1);
    expect(registry.get("secure-alias")).toBe(command);

    const duplicate: DiscordCommand = createCommand("other", {
      aliases: ["secure"],
    });
    expect(() => registry.registerAll([duplicate])).toThrow(
      "already registered",
    );
    expect(registry.get("other")).toBeUndefined();
  });
});
