import { InteractionType } from "discord.js";
import type {
  ChatInputCommandInteraction,
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
import { PingCommand } from "../src/commands/Ping.command.js";
import { createCommand, defaultPolicy } from "./CommandTestFactory.js";

function createLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

function createChatInputInteraction(
  commandName: string,
  guildId: string | null = "guild-1"
) {
  const state = { replied: false, deferred: false };
  const reply = vi.fn(async () => {
    if (state.replied || state.deferred) {
      throw new Error("Interaction was already acknowledged.");
    }
    state.replied = true;
  });
  const deferReply = vi.fn(async () => {
    if (state.replied || state.deferred) {
      throw new Error("Interaction was already acknowledged.");
    }
    state.deferred = true;
  });
  const editReply = vi.fn(async () => {
    state.replied = true;
  });
  const followUp = vi.fn(async () => undefined);
  const interaction = {
    id: `interaction-${commandName}`,
    type: InteractionType.ApplicationCommand,
    commandName,
    guildId,
    inGuild: () => guildId !== null,
    user: { id: "user-1" },
    member: { roles: { cache: new Map<string, unknown>() } },
    isChatInputCommand: () => true,
    get replied() { return state.replied; },
    get deferred() { return state.deferred; },
    reply,
    deferReply,
    editReply,
    followUp
  } as unknown as ChatInputCommandInteraction;

  return { interaction, state, reply, deferReply, editReply, followUp };
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
    const { interaction, reply, deferReply } = createChatInputInteraction("ping");

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
      createChatInputInteraction("deferred");

    await handler.handle(interaction);

    expect(deferReply).toHaveBeenCalledWith({ ephemeral: false });
    expect(editReply).toHaveBeenCalledWith({ content: "Finished." });
  });

  it("replies clearly for an unknown command", async () => {
    const { handler, log } = createHandler([]);
    const { interaction, reply } = createChatInputInteraction("stale");

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
    const { interaction, followUp } = createChatInputInteraction("failure");

    await handler.handle(interaction);

    expect(followUp).toHaveBeenCalledWith({
      content: "Something went wrong while running that command.",
      ephemeral: true
    });
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
    const { interaction, reply } = createChatInputInteraction("timeout");

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
    const { interaction, reply } = createChatInputInteraction("ping");

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
    const { interaction } = createChatInputInteraction("active");
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
    const { interaction } = createChatInputInteraction("active");
    const execution = handler.handle(interaction);

    await handler.shutdown(10);
    await execution;

    expect(log.warn).toHaveBeenCalledWith(
      expect.objectContaining({ shutdownTimeoutMs: 10 }),
      expect.stringContaining("deadline exceeded")
    );
  });
});
