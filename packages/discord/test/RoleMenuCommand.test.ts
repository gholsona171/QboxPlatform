import { describe, expect, it } from "vitest";

import { RoleMenuCommand } from "../src/commands/RoleMenu.command.js";
import { CommandValidator } from "../src/validation/CommandValidator.js";

describe("RoleMenuCommand", () => {
  it("declares the role-menu management permission and validates through the command pipeline", () => {
    const command = new RoleMenuCommand();
    const validation = new CommandValidator().validate([
      { file: "RoleMenu.command.ts", exports: { command } },
    ]);

    expect(validation.failures).toEqual([]);
    expect(validation.commands).toHaveLength(1);
    expect(command.data.name).toBe("role-menu");
    expect(command.policy.permissions.required).toEqual(["discord.role-menus.manage"]);
    expect(command.policy.permissions.administratorOverride).toBe(true);
  });

  it("exposes the supported role-menu subcommands", () => {
    const commandJson = new RoleMenuCommand().data.toJSON();
    expect(commandJson.options?.map((option) => option.name)).toEqual([
      "list",
      "create",
      "option-add",
      "option-edit",
      "option-remove",
      "publish",
      "disable",
      "delete",
      "inspect",
    ]);
  });
});
