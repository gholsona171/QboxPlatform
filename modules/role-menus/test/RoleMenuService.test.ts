import { describe, expect, it } from "vitest";

import {
  RoleMenuError,
  RoleMenuService,
  type RoleMenu,
  type RoleMenuMemberRoleGateway,
  type RoleMenuOption,
  type RoleMenuRepository,
  type RoleMenuRoleMutation,
  type RoleMenuRoleQuery,
  type RoleMenuRoleValidation,
  type RoleMenuStatus,
} from "../src/index.js";

const guildId = "1257928923048837201";
const channelId = "1262656532902842423";
const messageId = "1432100000000000000";
const memberId = "804859666655739996";
const createdByDiscordUserId = memberId;

describe("RoleMenuService", () => {
  it("validates role-menu invariants", async () => {
    const service = new RoleMenuService(new InMemoryRoleMenuRepository());
    expect(() =>
      service.createDraft({
        guildId: "not-a-snowflake",
        channelId,
        title: "Roles",
        presentationType: "BUTTONS",
        assignmentMode: "TOGGLE",
        createdByDiscordUserId,
      }),
    ).toThrowError(RoleMenuError);
  });

  it("creates drafts and manages deterministic option ordering", async () => {
    const service = new RoleMenuService(new InMemoryRoleMenuRepository());
    const menu = await createMenu(service);
    const withFirst = await service.addOption(menu.id, { roleId: "1262656532902842424", label: "Events" });
    const withSecond = await service.addOption(menu.id, { roleId: "1262656532902842425", label: "Announcements" });
    expect(withSecond.options.map((option) => option.label)).toEqual(["Events", "Announcements"]);
    const reordered = await service.reorderOptions(withFirst.id, [withSecond.options[1].id, withSecond.options[0].id]);
    expect(reordered.options.map((option) => option.label)).toEqual(["Announcements", "Events"]);
  });

  it("requires at least one option before publishing", async () => {
    const service = new RoleMenuService(new InMemoryRoleMenuRepository());
    const menu = await createMenu(service);
    await expect(service.publish(menu.id, messageId)).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });

  it("rejects disabled menus during member interaction", async () => {
    const repository = new InMemoryRoleMenuRepository();
    const service = new RoleMenuService(repository, new FakeRoleGateway());
    const menu = await createPublishedMenu(service);
    await service.disable(menu.id);
    await expect(service.resolveMemberInteraction(interaction(menu.options[0].id))).rejects.toMatchObject({ code: "DISABLED" });
  });

  it("adds, removes, and toggles button-selected roles", async () => {
    const gateway = new FakeRoleGateway();
    const service = new RoleMenuService(new InMemoryRoleMenuRepository(), gateway);
    const menu = await createPublishedMenu(service);
    const optionId = menu.options[0].id;
    await expect(service.resolveMemberInteraction(interaction(optionId))).resolves.toMatchObject({ changed: true });
    expect(gateway.has(memberId, menu.options[0].roleId)).toBe(true);
    await expect(service.resolveMemberInteraction(interaction(optionId))).resolves.toMatchObject({ changed: true });
    expect(gateway.has(memberId, menu.options[0].roleId)).toBe(false);
  });

  it("reconciles exclusive selections", async () => {
    const gateway = new FakeRoleGateway();
    const service = new RoleMenuService(new InMemoryRoleMenuRepository(), gateway);
    const menu = await createPublishedMenu(service, "EXCLUSIVE");
    gateway.seed(memberId, menu.options[0].roleId);
    await service.resolveMemberInteraction(interaction(menu.options[1].id));
    expect(gateway.has(memberId, menu.options[0].roleId)).toBe(false);
    expect(gateway.has(memberId, menu.options[1].roleId)).toBe(true);
  });

  it("resolves reaction options by emoji", async () => {
    const gateway = new FakeRoleGateway();
    const service = new RoleMenuService(new InMemoryRoleMenuRepository(), gateway);
    const menu = await createPublishedMenu(service, "ADD_ONLY", "REACTIONS");
    await service.resolveMemberInteraction({
      surface: "REACTION",
      guildId,
      channelId,
      messageId,
      memberId,
      emoji: menu.options[0].emoji,
    });
    expect(gateway.has(memberId, menu.options[0].roleId)).toBe(true);
  });

  it("removes roles from reaction removal events when the mode permits it", async () => {
    const gateway = new FakeRoleGateway();
    const service = new RoleMenuService(new InMemoryRoleMenuRepository(), gateway);
    const menu = await createPublishedMenu(service, "TOGGLE", "REACTIONS");
    gateway.seed(memberId, menu.options[0].roleId);
    await service.resolveMemberInteraction({
      surface: "REACTION",
      direction: "remove",
      guildId,
      channelId,
      messageId,
      memberId,
      emoji: menu.options[0].emoji,
    });
    expect(gateway.has(memberId, menu.options[0].roleId)).toBe(false);
  });

  it("rejects wrong guild or message interactions", async () => {
    const service = new RoleMenuService(new InMemoryRoleMenuRepository(), new FakeRoleGateway());
    await createPublishedMenu(service);
    await expect(service.resolveMemberInteraction({ ...interaction("missing"), guildId: "1257928923048837202" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("surfaces Discord role assignability failures", async () => {
    const gateway = new FakeRoleGateway({ assignable: false, reason: "Bot role is lower than the target role." });
    const service = new RoleMenuService(new InMemoryRoleMenuRepository(), gateway);
    const menu = await createPublishedMenu(service);
    await expect(service.resolveMemberInteraction(interaction(menu.options[0].id))).rejects.toMatchObject({ code: "ROLE_NOT_ASSIGNABLE" });
  });
});

async function createMenu(service: RoleMenuService) {
  return service.createDraft({
    guildId,
    channelId,
    title: "Community Roles",
    presentationType: "BUTTONS",
    assignmentMode: "TOGGLE",
    createdByDiscordUserId,
  });
}

async function createPublishedMenu(
  service: RoleMenuService,
  assignmentMode: "TOGGLE" | "ADD_ONLY" | "REMOVE_ONLY" | "EXCLUSIVE" = "TOGGLE",
  presentationType: "BUTTONS" | "SELECT_MENU" | "REACTIONS" = "BUTTONS",
) {
  const menu = await service.createDraft({
    guildId,
    channelId,
    title: "Community Roles",
    presentationType,
    assignmentMode,
    createdByDiscordUserId,
  });
  await service.addOption(menu.id, { roleId: "1262656532902842424", label: "Events", emoji: "Bell" });
  const withOptions = await service.addOption(menu.id, { roleId: "1262656532902842425", label: "Announcements", emoji: "News" });
  return service.publish(withOptions.id, messageId);
}

function interaction(optionId: string) {
  return {
    surface: "BUTTON" as const,
    guildId,
    channelId,
    messageId,
    memberId,
    optionId,
  };
}

class InMemoryRoleMenuRepository implements RoleMenuRepository {
  private readonly menus = new Map<string, RoleMenu>();
  private nextMenu = 1;
  private nextOption = 1;

  public async create(input: Parameters<RoleMenuRepository["create"]>[0]): Promise<RoleMenu> {
    const now = new Date("2026-08-02T12:00:00.000Z");
    const menu: RoleMenu = Object.freeze({
      id: `menu-${this.nextMenu++}`,
      guildId: input.guildId,
      channelId: input.channelId,
      title: input.title,
      ...(input.description === undefined ? {} : { description: input.description }),
      presentationType: input.presentationType,
      assignmentMode: input.assignmentMode,
      status: "DRAFT",
      createdByDiscordUserId: input.createdByDiscordUserId,
      createdAt: now,
      updatedAt: now,
      options: [],
    });
    this.menus.set(menu.id, menu);
    return menu;
  }

  public async update(id: string, input: Parameters<RoleMenuRepository["update"]>[1]): Promise<RoleMenu> {
    const menu = this.require(id);
    return this.replace({ ...menu, ...input, status: "DRAFT", updatedAt: new Date("2026-08-02T12:01:00.000Z") });
  }

  public async addOption(roleMenuId: string, input: Parameters<RoleMenuRepository["addOption"]>[1]): Promise<RoleMenu> {
    const menu = this.require(roleMenuId);
    const option: RoleMenuOption = Object.freeze({
      id: `option-${this.nextOption++}`,
      roleMenuId,
      roleId: input.roleId,
      label: input.label,
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.emoji === undefined ? {} : { emoji: input.emoji }),
      position: input.position ?? menu.options.length,
      createdAt: new Date("2026-08-02T12:02:00.000Z"),
    });
    return this.replace({ ...menu, status: "DRAFT", options: [...menu.options, option].sort(byPosition) });
  }

  public async updateOption(roleMenuId: string, optionId: string, input: Parameters<RoleMenuRepository["updateOption"]>[2]): Promise<RoleMenu> {
    const menu = this.require(roleMenuId);
    return this.replace({
      ...menu,
      status: "DRAFT",
      options: menu.options.map((option) => option.id === optionId ? { ...option, ...input } : option).sort(byPosition),
    });
  }

  public async removeOption(roleMenuId: string, optionId: string): Promise<RoleMenu> {
    const menu = this.require(roleMenuId);
    return this.replace({ ...menu, status: "DRAFT", options: menu.options.filter((option) => option.id !== optionId).map((option, position) => ({ ...option, position })) });
  }

  public async reorderOptions(roleMenuId: string, optionIds: readonly string[]): Promise<RoleMenu> {
    const menu = this.require(roleMenuId);
    const byId = new Map(menu.options.map((option) => [option.id, option]));
    return this.replace({ ...menu, status: "DRAFT", options: optionIds.map((id, position) => ({ ...byId.get(id)!, position })) });
  }

  public async setPublished(roleMenuId: string, messageIdValue: string): Promise<RoleMenu> {
    return this.replace({ ...this.require(roleMenuId), messageId: messageIdValue, status: "PUBLISHED" });
  }

  public async setStatus(roleMenuId: string, status: RoleMenuStatus): Promise<RoleMenu> {
    return this.replace({ ...this.require(roleMenuId), status });
  }

  public async delete(roleMenuId: string): Promise<void> {
    this.menus.delete(roleMenuId);
  }

  public async findById(roleMenuId: string): Promise<RoleMenu | undefined> {
    return this.menus.get(roleMenuId);
  }

  public async findByPublishedMessage(guildIdValue: string, channelIdValue: string, messageIdValue: string): Promise<RoleMenu | undefined> {
    return [...this.menus.values()].find((menu) => menu.guildId === guildIdValue && menu.channelId === channelIdValue && menu.messageId === messageIdValue);
  }

  public async listByGuild(guildIdValue: string): Promise<readonly RoleMenu[]> {
    return [...this.menus.values()].filter((menu) => menu.guildId === guildIdValue);
  }

  private require(id: string): RoleMenu {
    const menu = this.menus.get(id);
    if (!menu) throw new RoleMenuError("NOT_FOUND", "Role menu was not found.");
    return menu;
  }

  private replace(menu: RoleMenu): RoleMenu {
    const next = Object.freeze({ ...menu, options: Object.freeze([...menu.options].sort(byPosition)) });
    this.menus.set(next.id, next);
    return next;
  }
}

class FakeRoleGateway implements RoleMenuMemberRoleGateway {
  private readonly roles = new Map<string, Set<string>>();

  public constructor(private readonly validation: RoleMenuRoleValidation = { assignable: true }) {}

  public async addRole(input: RoleMenuRoleMutation) {
    this.roleSet(input.memberId).add(input.roleId);
    return { changed: true, message: "Role added." };
  }

  public async removeRole(input: RoleMenuRoleMutation) {
    this.roleSet(input.memberId).delete(input.roleId);
    return { changed: true, message: "Role removed." };
  }

  public async hasRole(input: RoleMenuRoleQuery): Promise<boolean> {
    return this.has(input.memberId, input.roleId);
  }

  public async validateAssignableRole(): Promise<RoleMenuRoleValidation> {
    return this.validation;
  }

  public seed(member: string, role: string): void {
    this.roleSet(member).add(role);
  }

  public has(member: string, role: string): boolean {
    return this.roleSet(member).has(role);
  }

  private roleSet(member: string): Set<string> {
    const existing = this.roles.get(member);
    if (existing) return existing;
    const created = new Set<string>();
    this.roles.set(member, created);
    return created;
  }
}

function byPosition(left: RoleMenuOption, right: RoleMenuOption): number {
  return left.position - right.position;
}
