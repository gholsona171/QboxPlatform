import { describe, expect, it } from "vitest";

import { CommandLoader } from "../src/loaders/CommandLoader.js";

describe("community command discovery", () => {
  it("discovers each Discord community command exactly once", async () => {
    const result = await new CommandLoader().load();
    const names = result.commands.map((command) => command.data.name);

    expect(names.filter((name) => name === "role-menu")).toHaveLength(1);
    expect(names).toEqual(expect.arrayContaining([
      "ping",
      "adminping",
      "role-menu",
      "welcome",
      "goodbye",
      "autorole",
      "rules",
      "counter",
      "logs",
      "embed",
      "announce",
      "custom",
      "suggest",
      "starboard",
    ]));
    expect(new Set(names).size).toBe(names.length);
  });
});
