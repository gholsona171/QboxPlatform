import { describe, expect, it } from "vitest";

import { CommandLoader } from "../src/loaders/CommandLoader.js";

describe("game server command", () => {
  it("loads /server and passes Discord validation", async () => {
    const result = await new CommandLoader().load();
    expect(result.diagnostics.failures).toEqual([]);
    const server = result.commands.find((command) => command.data.name === "server")?.data.toJSON();
    expect(server?.options?.map((option) => option.name)).toEqual(["status", "players", "list"]);
  });
});
