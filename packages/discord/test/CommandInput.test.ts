import { ApplicationCommandOptionType } from "discord.js";
import type { CommandInteractionOption } from "discord.js";
import { describe, expect, it } from "vitest";

import {
  CommandInputError,
  CommandOptionReader,
  CommandRoute
} from "../src/commands/CommandInput.js";
import type {
  SupportedOptionResolver
} from "../src/commands/CommandInput.js";

interface ResolverFixture {
  readonly resolver: SupportedOptionResolver;
}

function createResolver(
  options: Readonly<Record<string, CommandInteractionOption>> = {},
  subcommand: string | null = null,
  group: string | null = null
): ResolverFixture {
  const get = (name: string): CommandInteractionOption | null =>
    options[name] ?? null;
  const value = <T>(name: string, property: keyof CommandInteractionOption): T =>
    get(name)?.[property] as T;
  const resolver = {
    get,
    getString: (name: string) => value<string>(name, "value"),
    getInteger: (name: string) => value<number>(name, "value"),
    getNumber: (name: string) => value<number>(name, "value"),
    getBoolean: (name: string) => value<boolean>(name, "value"),
    getUser: (name: string) => value(name, "user"),
    getRole: (name: string) => value(name, "role"),
    getChannel: (name: string) => value(name, "channel"),
    getMentionable: (name: string) =>
      value(name, get(name)?.member ? "member" : get(name)?.role ? "role" : "user"),
    getAttachment: (name: string) => value(name, "attachment"),
    getSubcommand: () => subcommand,
    getSubcommandGroup: () => group
  } as unknown as SupportedOptionResolver;

  return { resolver };
}

function option(
  name: string,
  type: ApplicationCommandOptionType,
  property: keyof CommandInteractionOption,
  value: unknown
): CommandInteractionOption {
  return {
    name,
    type,
    [property]: value
  } as CommandInteractionOption;
}

describe("CommandOptionReader", () => {
  it("reads required and optional scalar options", () => {
    const reader = new CommandOptionReader(createResolver({
      reason: option("reason", ApplicationCommandOptionType.String, "value", "testing"),
      count: option("count", ApplicationCommandOptionType.Integer, "value", 2),
      ratio: option("ratio", ApplicationCommandOptionType.Number, "value", 1.5),
      enabled: option("enabled", ApplicationCommandOptionType.Boolean, "value", true)
    }).resolver);

    expect(reader.requiredString("reason")).toBe("testing");
    expect(reader.optionalInteger("count")).toBe(2);
    expect(reader.requiredNumber("ratio")).toBe(1.5);
    expect(reader.optionalBoolean("enabled")).toBe(true);
    expect(reader.optionalString("missing")).toBeUndefined();
  });

  it("returns Discord.js resolved option objects", () => {
    const values = {
      user: { id: "user-1" },
      role: { id: "role-1" },
      channel: { id: "channel-1", type: 0 },
      mentionable: { id: "member-1" },
      attachment: { id: "attachment-1" }
    };
    const reader = new CommandOptionReader(createResolver({
      user: option("user", ApplicationCommandOptionType.User, "user", values.user),
      role: option("role", ApplicationCommandOptionType.Role, "role", values.role),
      channel: option("channel", ApplicationCommandOptionType.Channel, "channel", values.channel),
      mentionable: option("mentionable", ApplicationCommandOptionType.Mentionable, "member", values.mentionable),
      attachment: option("attachment", ApplicationCommandOptionType.Attachment, "attachment", values.attachment)
    }).resolver);

    expect(reader.requiredUser("user")).toBe(values.user);
    expect(reader.optionalRole("role")).toBe(values.role);
    expect(reader.requiredChannel("channel")).toBe(values.channel);
    expect(reader.optionalMentionable("mentionable")).toBe(values.mentionable);
    expect(reader.requiredAttachment("attachment")).toBe(values.attachment);
  });

  it("throws a typed error for a missing required option", () => {
    const reader = new CommandOptionReader(createResolver().resolver);

    expect(() => reader.requiredString("reason"))
      .toThrow(new CommandInputError("Required string option 'reason' is missing."));
  });

  it("throws a typed error for an option type mismatch", () => {
    const reader = new CommandOptionReader(createResolver({
      reason: option("reason", ApplicationCommandOptionType.Integer, "value", 2)
    }).resolver);

    expect(() => reader.requiredString("reason"))
      .toThrow(new CommandInputError("Option 'reason' must be a string."));
  });
});

describe("CommandRoute", () => {
  it("represents root, subcommand, and grouped subcommand routes", () => {
    expect(new CommandRoute(createResolver().resolver).key).toBe("root");
    expect(new CommandRoute(createResolver({}, "create").resolver).key)
      .toBe("create");
    expect(new CommandRoute(createResolver({}, "add", "staff").resolver).key)
      .toBe("staff/add");
  });

  it("dispatches without requiring a switch statement", () => {
    const route = new CommandRoute(createResolver({}, "add", "staff").resolver);

    expect(route.dispatch({
      "staff/add": () => "handled"
    })).toBe("handled");
  });

  it("rejects missing and unknown subcommand routes", () => {
    expect(() => new CommandRoute(createResolver().resolver).dispatch({
      create: () => "unused"
    })).toThrow("A subcommand is required.");

    expect(() => new CommandRoute(
      createResolver({}, "remove", "staff").resolver
    ).dispatch({
      "staff/add": () => "unused"
    })).toThrow("staff/remove");
  });
});
