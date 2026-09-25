import { describe, expect, it } from "vitest";

import { CommandLoader } from "../src/loaders/CommandLoader.js";

describe("server builder command", () => {
  it("loads and passes Discord validation", async () => {
    const result = await new CommandLoader().load();
    expect(result.diagnostics.failures).toEqual([]);
    const builder = result.commands.find((command) => command.data.name === "builder")?.data.toJSON();
    expect(builder?.options?.map((option) => option.name)).toEqual(["status"]);
  });
});
