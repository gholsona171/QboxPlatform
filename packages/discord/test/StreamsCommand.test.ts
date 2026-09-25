import { describe, expect, it } from "vitest";

import { CommandLoader } from "../src/loaders/CommandLoader.js";

describe("streams command", () => {
  it("loads and passes Discord validation", async () => {
    const result = await new CommandLoader().load();
    expect(result.diagnostics.failures).toEqual([]);
    const streams = result.commands.find((command) => command.data.name === "streams")?.data.toJSON();
    expect(streams?.options?.map((option) => option.name)).toEqual(["add", "remove", "list", "test"]);
    const add = streams?.options?.find((option) => option.name === "add");
    expect(add && "options" in add ? add.options?.map((option) => option.name) : []).toEqual(["platform", "creator", "channel", "ping", "videos"]);
  });
});
