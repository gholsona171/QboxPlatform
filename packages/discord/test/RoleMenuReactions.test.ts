import type { MessageReaction, User } from "discord.js";
import { describe, expect, it } from "vitest";
import { RoleMenuError, type RoleMenuService } from "@qbox/role-menus";

import { DiscordRoleMenuInteractionHandler } from "../src/roleMenus/DiscordRoleMenuInteractionHandler.js";

/** A reaction on a message, recording whether the bot took the member's reaction back. */
function reaction(removed: string[]) {
  return {
    partial: false,
    emoji: { id: null, name: "👍" },
    message: { partial: false, guildId: "100000000000000001", channelId: "200000000000000001", id: "300000000000000001" },
    users: { remove: async (id: string) => { removed.push(id); } },
  } as unknown as MessageReaction;
}

const member = { id: "400000000000000001", bot: false } as unknown as User;

function handlerThatThrows(error: unknown) {
  const roleMenus = { resolveMemberInteraction: async () => { throw error; } } as unknown as RoleMenuService;
  return new DiscordRoleMenuInteractionHandler(roleMenus);
}

describe("role-menu reactions", () => {
  it("leaves reactions alone on messages that are not role menus", async () => {
    const removed: string[] = [];
    await handlerThatThrows(new RoleMenuError("NOT_FOUND", "Role menu was not found for this message.")).handleReaction(reaction(removed), member, "add");
    expect(removed).toEqual([]);
  });

  it("leaves reactions alone when the failure is not about the role menu", async () => {
    const removed: string[] = [];
    await handlerThatThrows(new Error("database unavailable")).handleReaction(reaction(removed), member, "add");
    expect(removed).toEqual([]);
  });

  it("takes back a reaction that is not one of the menu's options", async () => {
    const removed: string[] = [];
    await handlerThatThrows(new RoleMenuError("OPTION_NOT_FOUND", "Role menu option was not found.")).handleReaction(reaction(removed), member, "add");
    expect(removed).toEqual([member.id]);
  });

  it("takes back a reaction when the role could not be given", async () => {
    const removed: string[] = [];
    await handlerThatThrows(new RoleMenuError("ROLE_NOT_ASSIGNABLE", "Role cannot be assigned.")).handleReaction(reaction(removed), member, "add");
    expect(removed).toEqual([member.id]);
  });

  it("never touches reactions from bots", async () => {
    const removed: string[] = [];
    await handlerThatThrows(new RoleMenuError("OPTION_NOT_FOUND", "x")).handleReaction(reaction(removed), { id: "1", bot: true } as unknown as User, "add");
    expect(removed).toEqual([]);
  });
});
