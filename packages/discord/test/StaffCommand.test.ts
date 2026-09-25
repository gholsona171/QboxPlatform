import { describe, expect, it } from "vitest";

import { StaffCommand } from "../src/commands/Staff.command.js";
import { CommandLoader } from "../src/loaders/CommandLoader.js";
import { CommandValidator } from "../src/validation/CommandValidator.js";

describe("StaffCommand", () => {
  it("passes Discord command validation with every subcommand", () => {
    const command = new StaffCommand();
    const validation = new CommandValidator().validate([{ file: "Staff.command.ts", exports: { command } }]);
    expect(validation.failures).toEqual([]);
    const json = command.data.toJSON();
    expect(json.name).toBe("staff");
    expect(json.options?.map((option) => option.name)).toEqual([
      "roster", "profile", "hire", "promote", "demote", "fire", "strike", "note", "loa", "clockin", "clockout", "shifts",
    ]);
  });

  it("is discovered by the command loader", async () => {
    const result = await new CommandLoader().load();
    expect(result.commands.filter((command) => command.data.name === "staff")).toHaveLength(1);
  });
});
