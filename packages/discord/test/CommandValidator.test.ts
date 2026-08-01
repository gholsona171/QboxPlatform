import { describe, expect, it } from "vitest";

import {
  CommandValidationError,
  CommandValidator
} from "../src/validation/CommandValidator.js";
import type {
  DiscoveredCommandModule
} from "../src/validation/CommandValidator.js";
import { createCommand, defaultPolicy } from "./CommandTestFactory.js";

function moduleFor(file: string, command: unknown): DiscoveredCommandModule {
  return { file, exports: { command } };
}

function validateFailure(
  modules: readonly DiscoveredCommandModule[]
): CommandValidationError {
  try {
    new CommandValidator().validate(modules);
  } catch (error) {
    expect(error).toBeInstanceOf(CommandValidationError);
    return error as CommandValidationError;
  }

  throw new Error("Expected command validation to fail.");
}

describe("CommandValidator", () => {
  it("rejects duplicate command names", () => {
    const error = validateFailure([
      moduleFor("First.command.ts", createCommand("duplicate")),
      moduleFor("Second.command.ts", createCommand("duplicate"))
    ]);

    expect(error.failures[0]?.message).toContain("already owned");
  });

  it("rejects modules without the explicit command export", () => {
    const error = validateFailure([{
      file: "Invalid.command.ts",
      exports: { default: createCommand("invalid") }
    }]);

    expect(error.failures[0]?.message).toContain("named 'command'");
  });

  it("rejects commands without execute", () => {
    const { execute: _execute, ...command } = createCommand("missing-execute");
    const error = validateFailure([
      moduleFor("Missing.command.ts", command)
    ]);

    expect(error.failures[0]?.message).toContain("implement execute");
  });

  it("rejects duplicate aliases", () => {
    const error = validateFailure([
      moduleFor("First.command.ts", createCommand("first", { aliases: ["shared"] })),
      moduleFor("Second.command.ts", createCommand("second", { aliases: ["shared"] }))
    ]);

    expect(error.failures[0]?.message).toContain("already owned");
  });

  it("rejects duplicate source and compiled file identities", () => {
    const error = validateFailure([
      moduleFor("Ping.command.ts", createCommand("ping")),
      moduleFor("Ping.command.js", createCommand("other"))
    ]);

    expect(error.failures[0]?.message).toContain("Duplicate command file identity");
  });

  it("rejects unsupported command types", () => {
    const error = validateFailure([
      moduleFor("Message.command.ts", {
        ...createCommand("message"),
        type: "message"
      })
    ]);

    expect(error.failures[0]?.message).toContain("Unsupported command type");
  });

  it("rejects unsupported permissions", () => {
    const error = validateFailure([
      moduleFor("Permission.command.ts", {
        ...createCommand("permission"),
        policy: {
          ...defaultPolicy,
          permissions: {
            required: ["platform.superuser"],
            mode: "all",
            administratorOverride: false
          }
        }
      })
    ]);

    expect(error.failures[0]?.message).toContain("unsupported");
  });

  it.each([
    ["missing policy", undefined],
    ["invalid context", { ...defaultPolicy, contexts: "channel" }],
    ["invalid response", {
      ...defaultPolicy,
      response: { acknowledgement: "later", visibility: "hidden" }
    }],
    ["invalid cooldown", {
      ...defaultPolicy,
      cooldown: { scope: "user", durationMs: 0 }
    }],
    ["invalid concurrency", { ...defaultPolicy, concurrency: "channel" }],
    ["invalid permission mode", {
      ...defaultPolicy,
      permissions: {
        required: ["platform.admin"],
        mode: "some",
        administratorOverride: false
      }
    }],
    ["invalid administrator override", {
      ...defaultPolicy,
      permissions: {
        required: ["platform.admin"],
        mode: "all",
        administratorOverride: "yes"
      }
    }],
    ["guild scope outside guild-only", {
      ...defaultPolicy,
      contexts: "both",
      concurrency: "guild"
    }],
    ["role permissions outside guild-only", {
      ...defaultPolicy,
      contexts: "dm",
      permissions: {
        required: ["platform.admin"],
        mode: "all",
        administratorOverride: false
      }
    }]
  ])("rejects %s metadata", (_label, policy) => {
    const error = validateFailure([
      moduleFor("Policy.command.ts", {
        ...createCommand("policy"),
        policy
      })
    ]);

    expect(error.failures.length).toBeGreaterThan(0);
  });

  it("validates a complete explicit policy", () => {
    const command = createCommand("valid", {
      aliases: ["valid-alias"],
      policy: {
        contexts: "guild",
        permissions: {
          required: ["moderation.warn", "moderation.kick"],
          mode: "any",
          administratorOverride: true
        },
        response: {
          acknowledgement: "deferred",
          visibility: "public"
        },
        cooldown: {
          scope: "guild",
          durationMs: 5_000
        },
        concurrency: "guild"
      }
    });
    const result = new CommandValidator().validate([
      moduleFor("Valid.command.ts", command)
    ]);

    expect(result.commands).toEqual([command]);
  });
});
