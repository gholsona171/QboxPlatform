import { ApplicationCommandOptionType, InteractionType } from "discord.js";
import type {
  ChatInputCommandInteraction,
  CommandInteractionOption,
} from "discord.js";
import { vi } from "vitest";

import {
  CommandOptionReader,
  CommandRoute,
} from "../src/commands/CommandInput.js";
import type { SupportedOptionResolver } from "../src/commands/CommandInput.js";
import type { CommandExecutionContext } from "../src/commands/DiscordCommand.js";

export interface MockOption {
  readonly name: string;
  readonly type: ApplicationCommandOptionType;
  readonly value?: unknown;
}

export function mockOption(
  name: string,
  type: ApplicationCommandOptionType,
  value?: unknown,
): MockOption {
  return { name, type, value };
}

export function createMockOptionResolver(
  values: readonly MockOption[] = [],
  route: { subcommand?: string; group?: string } = {},
): SupportedOptionResolver {
  const options = new Map(values.map((option) => [option.name, option]));
  const get = (name: string) =>
    options.get(name) as CommandInteractionOption | undefined;
  const read = <T>(name: string, required?: boolean): T | null => {
    const option = options.get(name);
    if (!option && required) throw new Error(`Missing option ${name}.`);
    return (option?.value as T | undefined) ?? null;
  };

  return {
    get,
    getString: (name, required) => read<string>(name, required),
    getInteger: (name, required) => read<number>(name, required),
    getNumber: (name, required) => read<number>(name, required),
    getBoolean: (name, required) => read<boolean>(name, required),
    getUser: (name, required) => read(name, required),
    getRole: (name, required) => read(name, required),
    getChannel: (name, required) => read(name, required),
    getMentionable: (name, required) => read(name, required),
    getAttachment: (name, required) => read(name, required),
    getSubcommand: () => route.subcommand ?? null,
    getSubcommandGroup: () => route.group ?? null,
  } as SupportedOptionResolver;
}

export function createMockInteraction(
  options: {
    commandName?: string;
    guildId?: string | null;
    userId?: string;
    roleIds?: readonly string[];
    optionResolver?: SupportedOptionResolver;
    deferred?: boolean;
  } = {},
) {
  const guildId = options.guildId === undefined ? "guild-1" : options.guildId;
  const state = { replied: false, deferred: options.deferred ?? false };
  const acknowledge = async (kind: "reply" | "defer") => {
    if (state.replied || state.deferred)
      throw new Error("Interaction was already acknowledged.");
    state[kind === "reply" ? "replied" : "deferred"] = true;
  };
  const reply = vi.fn(async () => acknowledge("reply"));
  const deferReply = vi.fn(async () => acknowledge("defer"));
  const editReply = vi.fn(async () => {
    state.replied = true;
  });
  const followUp = vi.fn(async () => undefined);
  const resolver = options.optionResolver ?? createMockOptionResolver();
  const interaction = {
    id: `interaction-${options.commandName ?? "command"}`,
    type: InteractionType.ApplicationCommand,
    commandName: options.commandName ?? "command",
    guildId,
    inGuild: () => guildId !== null,
    user: { id: options.userId ?? "user-1" },
    member: {
      roles: { cache: new Map((options.roleIds ?? []).map((id) => [id, {}])) },
    },
    options: resolver,
    isChatInputCommand: () => true,
    get replied() {
      return state.replied;
    },
    get deferred() {
      return state.deferred;
    },
    reply,
    deferReply,
    editReply,
    followUp,
  } as unknown as ChatInputCommandInteraction;

  return { interaction, state, reply, deferReply, editReply, followUp };
}

export const createMockGuildInteraction = createMockInteraction;

export function createMockDmInteraction(
  options: Omit<Parameters<typeof createMockInteraction>[0], "guildId"> = {},
) {
  return createMockInteraction({ ...options, guildId: null });
}

export function createMockDeferredInteraction(
  options: Parameters<typeof createMockInteraction>[0] = {},
) {
  return createMockInteraction({ ...options, deferred: true });
}

export function createCommandExecutionContext(
  options: Parameters<typeof createMockInteraction>[0] = {},
) {
  const mock = createMockInteraction(options);
  const context: CommandExecutionContext = {
    interaction: mock.interaction,
    signal: new AbortController().signal,
    options: new CommandOptionReader(mock.interaction.options),
    route: new CommandRoute(mock.interaction.options),
    reply: async (replyOptions) => {
      await mock.reply(replyOptions);
    },
    editReply: async (replyOptions) => {
      await mock.editReply(replyOptions);
    },
  };
  return { ...mock, context };
}

export function createExecutionGate() {
  let release!: () => void;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { wait, release };
}

export function createCooldownClock(initialMs = 0) {
  const now = vi.spyOn(Date, "now").mockReturnValue(initialMs);
  return {
    set: (value: number) => now.mockReturnValue(value),
    restore: () => now.mockRestore(),
  };
}

export async function waitForAbort(signal: AbortSignal): Promise<void> {
  if (signal.aborted) return;
  await new Promise<void>((resolve) =>
    signal.addEventListener("abort", () => resolve(), { once: true }),
  );
}

export function createAbortAfter(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}
