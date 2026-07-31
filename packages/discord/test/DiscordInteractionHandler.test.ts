import {
  InteractionType,
  SlashCommandBuilder
} from "discord.js";
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
import {
  DiscordInteractionHandler
} from "../src/interactions/DiscordInteractionHandler.js";
import { PingCommand } from "../src/commands/Ping.command.js";

function createLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

function createChatInputInteraction(commandName: string) {
  const state = {
    replied: false,
    deferred: false
  };
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
  const followUp = vi.fn(async () => undefined);
  const interaction = {
    id: "interaction-1",
    type: InteractionType.ApplicationCommand,
    commandName,
    guildId: "guild-1",
    user: { id: "user-1" },
    member: {
      roles: { cache: new Map<string, unknown>() }
    },
    isChatInputCommand: () => true,
    get replied() {
      return state.replied;
    },
    get deferred() {
      return state.deferred;
    },
    reply,
    deferReply,
    followUp
  } as unknown as ChatInputCommandInteraction;

  return {
    interaction,
    state,
    reply,
    deferReply,
    followUp
  };
}

function createCommand(
  name: string,
  execute: DiscordCommand["execute"],
  deferReply = false
): DiscordCommand {
  return {
    type: "chat-input",
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(`Runs the ${name} command.`),
    deferReply,
    execute
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

describe("DiscordInteractionHandler", () => {
  it("dispatches an incoming ping interaction and replies immediately", async () => {
    const { handler } = createHandler([new PingCommand()]);
    const { interaction, reply, deferReply } =
      createChatInputInteraction("ping");

    await handler.handle(interaction);

    expect(reply).toHaveBeenCalledOnce();
    expect(reply).toHaveBeenCalledWith({
      content: "Pong.",
      ephemeral: true
    });
    expect(deferReply).not.toHaveBeenCalled();
  });

  it("replies clearly for an unknown command", async () => {
    const { handler, log } = createHandler([]);
    const { interaction, reply } =
      createChatInputInteraction("stale");

    await handler.handle(interaction);

    expect(reply).toHaveBeenCalledWith({
      content: "That command is no longer available.",
      ephemeral: true
    });
    expect(log.warn).toHaveBeenCalledOnce();
  });

  it("reports a handler exception before acknowledgement", async () => {
    const command = createCommand(
      "failure",
      async () => {
        throw new Error("handler failed");
      }
    );
    const { handler, log } = createHandler([command]);
    const { interaction, reply, followUp } =
      createChatInputInteraction("failure");

    await handler.handle(interaction);

    expect(reply).toHaveBeenCalledWith({
      content: "Something went wrong while running that command.",
      ephemeral: true
    });
    expect(followUp).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledOnce();
  });

  it("follows up when a deferred handler fails", async () => {
    const command = createCommand(
      "deferred-failure",
      async () => {
        throw new Error("deferred handler failed");
      },
      true
    );
    const { handler } = createHandler([command]);
    const { interaction, deferReply, reply, followUp } =
      createChatInputInteraction("deferred-failure");

    await handler.handle(interaction);

    expect(deferReply).toHaveBeenCalledWith({ ephemeral: true });
    expect(reply).not.toHaveBeenCalled();
    expect(followUp).toHaveBeenCalledWith({
      content: "Something went wrong while running that command.",
      ephemeral: true
    });
  });

  it("does not issue a second initial reply after a replied handler fails", async () => {
    const command = createCommand(
      "reply-failure",
      async (interaction) => {
        await interaction.reply({ content: "Initial response." });
        throw new Error("failed after reply");
      }
    );
    const { handler } = createHandler([command]);
    const { interaction, reply, followUp } =
      createChatInputInteraction("reply-failure");

    await handler.handle(interaction);

    expect(reply).toHaveBeenCalledOnce();
    expect(followUp).toHaveBeenCalledWith({
      content: "Something went wrong while running that command.",
      ephemeral: true
    });
  });

  it("ignores unsupported interaction types", async () => {
    const { handler, log } = createHandler([]);
    const interaction = {
      id: "interaction-2",
      type: InteractionType.MessageComponent,
      isChatInputCommand: () => false
    } as unknown as Interaction;

    await handler.handle(interaction);

    expect(log.debug).toHaveBeenCalledOnce();
    expect(log.warn).not.toHaveBeenCalled();
    expect(log.error).not.toHaveBeenCalled();
  });

  it("aborts and responds when command execution times out", async () => {
    const command = createCommand(
      "timeout",
      async (
        _interaction: ChatInputCommandInteraction,
        context: CommandExecutionContext
      ) => await new Promise<void>((resolve) => {
        context.signal.addEventListener("abort", () => resolve());
      })
    );
    const { handler, log } = createHandler([command], 10, 100);
    const { interaction, reply } =
      createChatInputInteraction("timeout");

    await handler.handle(interaction);

    expect(reply).toHaveBeenCalledWith({
      content: "Something went wrong while running that command.",
      ephemeral: true
    });
    expect(log.error).toHaveBeenCalledOnce();
  });
});
