import { InteractionType } from "discord.js";
import type {
  Interaction
} from "discord.js";
import { describe, expect, it, vi } from "vitest";

import { PermissionService } from "@qbox/permissions";

import type {
  CommandExecutionContext,
  DiscordCommand
} from "../src/commands/DiscordCommand.js";
import { CommandRegistry } from "../src/commands/CommandRegistry.js";
import { DiscordInteractionHandler } from "../src/interactions/DiscordInteractionHandler.js";
import { CommandInputError } from "../src/commands/CommandInput.js";
import { PingCommand } from "../src/commands/Ping.command.js";
import { createCommand, defaultPolicy } from "./CommandTestFactory.js";
import { createMockInteraction as createChatInputInteraction } from "./DiscordCommandTestKit.js";

function createLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

function createHandler(
  commands: readonly DiscordCommand[],
  executionTimeoutMs = 100,
  acknowledgementTimeoutMs = 50
) {
  const registry = new CommandRegistry(new PermissionService());
  registry.registerAll(commands);
  const log = createLogger();
  const handler = new DiscordInteractionHandler(registry, {
    executionTimeoutMs,
    acknowledgementTimeoutMs,
    log
  });

  return { handler, log };
}

describe("DiscordInteractionHandler responses", () => {
  it("dispatches ping with an immediate ephemeral reply", async () => {
    const { handler } = createHandler([new PingCommand()]);
    const { interaction, reply, deferReply } = createChatInputInteraction({ commandName: "ping" });

    await handler.handle(interaction);

    expect(reply).toHaveBeenCalledWith({ content: "Pong.", ephemeral: true });
    expect(deferReply).not.toHaveBeenCalled();
  });

  it("defers publicly and edits the deferred response", async () => {
    const command = createCommand("deferred", {
      policy: {
        ...defaultPolicy,
        response: { acknowledgement: "deferred", visibility: "public" }
      },
      execute: async (context) => {
        await context.reply({ content: "Finished." });
      }
    });
    const { handler } = createHandler([command]);
    const { interaction, deferReply, editReply } =
      createChatInputInteraction({ commandName: "deferred" });

    await handler.handle(interaction);

    expect(deferReply).toHaveBeenCalledWith({ ephemeral: false });
    expect(editReply).toHaveBeenCalledWith({ content: "Finished." });
  });

  it("replies clearly for an unknown command", async () => {
    const { handler, log } = createHandler([]);
    const { interaction, reply } = createChatInputInteraction({ commandName: "stale" });

    await handler.handle(interaction);

    expect(reply).toHaveBeenCalledWith({
      content: "That command is no longer available.",
      ephemeral: true
    });
    expect(log.warn).toHaveBeenCalledOnce();
  });

  it("uses a follow-up when a deferred handler fails", async () => {
    const command = createCommand("failure", {
      policy: {
        ...defaultPolicy,
        response: { acknowledgement: "deferred", visibility: "ephemeral" }
      },
      execute: async () => { throw new Error("handler failed"); }
    });
    const { handler } = createHandler([command]);
    const { interaction, followUp } = createChatInputInteraction({ commandName: "failure" });

    await handler.handle(interaction);

    expect(followUp).toHaveBeenCalledWith({
      content: "Something went wrong while running that command.",
      ephemeral: true
    });
  });

  it("returns an expected input error without logging an internal failure", async () => {
    const command = createCommand("input", {
      execute: async () => {
        throw new CommandInputError("Choose a valid target.");
      }
    });
    const { handler, log } = createHandler([command]);
    const { interaction, reply } = createChatInputInteraction({ commandName: "input" });

    await handler.handle(interaction);

    expect(reply).toHaveBeenCalledWith({
      content: "Choose a valid target.",
      ephemeral: true
    });
    expect(log.warn).toHaveBeenCalledOnce();
    expect(log.error).not.toHaveBeenCalled();
  });

  it("returns an expected input error after a deferred response", async () => {
    const command = createCommand("deferred-input", {
      policy: {
        ...defaultPolicy,
        response: {
          acknowledgement: "deferred",
          visibility: "public"
        }
      },
      execute: async () => {
        throw new CommandInputError("Provide the required value.");
      }
    });
    const { handler, log } = createHandler([command]);
    const { interaction, deferReply, followUp } =
      createChatInputInteraction({ commandName: "deferred-input" });

    await handler.handle(interaction);

    expect(deferReply).toHaveBeenCalledWith({ ephemeral: false });
    expect(followUp).toHaveBeenCalledWith({
      content: "Provide the required value.",
      ephemeral: true
    });
    expect(log.error).not.toHaveBeenCalled();
  });

  it("ignores unsupported interaction types", async () => {
    const { handler, log } = createHandler([]);
    const interaction = {
      id: "interaction-component",
      type: InteractionType.MessageComponent,
      isChatInputCommand: () => false
    } as unknown as Interaction;

    await handler.handle(interaction);

    expect(log.debug).toHaveBeenCalledOnce();
  });
});

describe("DiscordInteractionHandler lifecycle", () => {
  it("aborts and responds when command execution times out", async () => {
    const command = createCommand("timeout", {
      execute: async (context: CommandExecutionContext) =>
        await new Promise<void>((resolve) => {
          context.signal.addEventListener("abort", () => resolve());
        })
    });
    const { handler, log } = createHandler([command], 10, 100);
    const { interaction, reply } = createChatInputInteraction({ commandName: "timeout" });

    await handler.handle(interaction);

    expect(reply).toHaveBeenCalledWith({
      content: "Something went wrong while running that command.",
      ephemeral: true
    });
    expect(log.error).toHaveBeenCalledOnce();
  });

  it("rejects new command executions after shutdown begins", async () => {
    const { handler } = createHandler([new PingCommand()]);
    await handler.shutdown(100);
    const { interaction, reply } = createChatInputInteraction({ commandName: "ping" });

    await handler.handle(interaction);

    expect(reply).toHaveBeenCalledWith({
      content: "The bot is shutting down. Please try again shortly.",
      ephemeral: true
    });
  });

  it("waits for an active command to complete during shutdown", async () => {
    let release: (() => void) | undefined;
    const command = createCommand("active", {
      execute: async (context) => {
        await new Promise<void>((resolve) => { release = resolve; });
        await context.reply({ content: "Done." });
      }
    });
    const { handler } = createHandler([command], 1_000, 1_000);
    const { interaction } = createChatInputInteraction({ commandName: "active" });
    const execution = handler.handle(interaction);
    let shutdownFinished = false;
    const shutdown = handler.shutdown(1_000).then(() => {
      shutdownFinished = true;
    });

    await Promise.resolve();
    expect(shutdownFinished).toBe(false);
    release?.();
    await Promise.all([execution, shutdown]);
    expect(shutdownFinished).toBe(true);
  });

  it("aborts active commands when the shutdown deadline expires", async () => {
    const command = createCommand("active", {
      execute: async (context) => await new Promise<void>((resolve) => {
        context.signal.addEventListener("abort", () => resolve());
      })
    });
    const { handler, log } = createHandler([command], 1_000, 1_000);
    const { interaction } = createChatInputInteraction({ commandName: "active" });
    const execution = handler.handle(interaction);

    await handler.shutdown(10);
    await execution;

    expect(log.warn).toHaveBeenCalledWith(
      expect.objectContaining({ shutdownTimeoutMs: 10 }),
      expect.stringContaining("deadline exceeded")
    );
  });
});
