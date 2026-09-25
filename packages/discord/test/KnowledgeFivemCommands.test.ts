import { describe, expect, it } from "vitest";

import { CommandLoader } from "../src/loaders/CommandLoader.js";

describe("knowledge base and FiveM commands", () => {
  it("load and pass Discord validation", async () => {
    const result = await new CommandLoader().load();
    expect(result.diagnostics.failures).toEqual([]);
    const json = (name: string) => result.commands.find((command) => command.data.name === name)?.data.toJSON();

    const faq = json("faq");
    expect(faq?.options?.map((option) => [option.name, "autocomplete" in option ? option.autocomplete === true : false])).toEqual([["query", true], ["private", false]]);
    expect(json("ask")?.options?.map((option) => option.name)).toEqual(["question", "private"]);
    expect(json("kb")?.options?.map((option) => option.name)).toEqual(["list", "post"]);
    expect(json("fivem")?.options?.map((option) => option.name)).toEqual(["status", "players", "connect"]);
  });
});
