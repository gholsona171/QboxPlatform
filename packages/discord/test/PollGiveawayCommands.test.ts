import { describe, expect, it, vi } from "vitest";

import { GiveawayCommand } from "../src/commands/Giveaway.command.js";
import { PollCommand } from "../src/commands/Poll.command.js";
import { CommandLoader } from "../src/loaders/CommandLoader.js";

describe("poll and giveaway commands", () => {
  it("load and pass Discord command validation", async () => {
    const result = await new CommandLoader().load();
    const poll = result.commands.find((command) => command.data.name === "poll");
    const giveaway = result.commands.find((command) => command.data.name === "giveaway");
    expect(poll?.data.toJSON().options?.map((option) => option.name)).toEqual(["create", "close", "results", "list"]);
    expect(giveaway?.data.toJSON().options?.map((option) => option.name)).toEqual(["start", "end", "reroll", "cancel", "list"]);
  });

  it("checks poll permissions per subcommand and gates /giveaway behind giveaways.manage", () => {
    const poll = new PollCommand();
    expect(poll.policy.permissions).toBeUndefined();
    expect(poll.bypassAuthorization()).toBe(true);
    expect(new GiveawayCommand().policy.permissions?.required).toEqual(["giveaways.manage"]);
  });

  it("explains when polls or giveaways are unavailable", async () => {
    const editReply = vi.fn(async () => undefined);
    const context = { editReply, interaction: { guildId: null }, route: { requiredSubcommand: () => "list" } };
    await new PollCommand().execute(context as never);
    await new GiveawayCommand().execute(context as never);
    expect(editReply.mock.calls).toEqual([[{ content: "Polls are not available right now." }], [{ content: "Giveaways are not available right now." }]]);
  });
});
