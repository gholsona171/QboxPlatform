import { describe, expect, it } from "vitest";
import {
  RoleManagementError,
  RoleManagementService,
  type DiscordChannelResource,
  type DiscordRoleResource,
  type RoleDependencyRepository,
  type RoleManagementGateway,
} from "../src/index.js";

const guildId = "1257928923048837201";
const roleId = "1262656532902842423";

function role(overrides: Partial<DiscordRoleResource> = {}): DiscordRoleResource {
  return {
    id: roleId,
    guildId,
    name: "Admin",
    color: "#5865f2",
    position: 4,
    hoisted: false,
    mentionable: false,
    managed: false,
    permissions: [],
    assignable: true,
    editable: true,
    deletable: true,
    dependencyCount: 0,
    ...overrides,
  };
}

function repository(dependencies = []) {
  const audits = [];
  const repo: RoleDependencyRepository & { audits: unknown[] } = {
    audits,
    listDependencies: async (_guildId, requestedRoleId) =>
      requestedRoleId ? dependencies.filter((item) => item.roleId === requestedRoleId) : dependencies,
    replaceDependency: async () => dependencies.length,
    recordAudit: async (input) => { audits.push(input); },
  };
  return repo;
}

function gateway(current = role()): RoleManagementGateway {
  return {
    listRoles: async () => [current],
    listChannels: async () => [channel()],
    getRole: async (_guildId, requestedRoleId) => requestedRoleId === current.id ? current : undefined,
    createRole: async (input) => role({ id: "1262656532902842424", name: input.name }),
    editRole: async (input) => role({ ...current, name: input.name ?? current.name }),
    deleteRole: async () => undefined,
    moveRole: async (input) => role({ ...current, position: input.position }),
    capabilities: async () => ({ guildId, connected: true, botHighestRolePosition: 10, canManageRoles: true }),
  };
}

function channel(overrides: Partial<DiscordChannelResource> = {}): DiscordChannelResource {
  return {
    id: "1262656532902842425",
    guildId,
    name: "role-menus",
    type: "TEXT",
    position: 1,
    nsfw: false,
    canView: true,
    canSendMessages: true,
    canEmbedLinks: true,
    canManage: false,
    ...overrides,
  };
}

describe("RoleManagementService", () => {
  it("rejects editing managed roles", async () => {
    const service = new RoleManagementService(repository(), gateway(role({ managed: true })));
    await expect(service.editRole({ guildId, roleId, name: "New", actor: { type: "discord-user", id: "804859666655739996" }, source: "DISCORD" }))
      .rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("requires explicit administrator permission for administrator roles", async () => {
    const service = new RoleManagementService(repository(), gateway(role({ permissions: ["Administrator"] })));
    await expect(service.editRole({ guildId, roleId, name: "Owners", actor: { type: "platform-user", id: "user-1" }, source: "WEB" }))
      .rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks deletion with unresolved dependencies", async () => {
    const service = new RoleManagementService(repository([{ roleId, feature: "Autoroles", recordId: "ar-1", label: roleId, field: "roleId" }]), gateway());
    await expect(service.deleteRole({ guildId, roleId, confirmation: "Admin", actor: { type: "discord-user", id: "804859666655739996" }, source: "DISCORD" }))
      .rejects.toBeInstanceOf(RoleManagementError);
  });

  it("audits successful role creation", async () => {
    const repo = repository();
    const service = new RoleManagementService(repo, gateway());
    await service.createRole({ guildId, name: "Member", actor: { type: "platform-user", id: "user-1" }, source: "WEB" });
    expect(repo.audits).toHaveLength(1);
  });

  it("returns Discord channel resources from the live gateway", async () => {
    const service = new RoleManagementService(repository(), gateway());
    await expect(service.listChannels(guildId)).resolves.toMatchObject([
      { id: "1262656532902842425", name: "role-menus", canSendMessages: true },
    ]);
  });

  it("does not fake an empty channel list when Discord is unavailable", async () => {
    const service = new RoleManagementService(repository());
    await expect(service.listChannels(guildId)).rejects.toMatchObject({ code: "DISCORD_UNAVAILABLE" });
  });
});
