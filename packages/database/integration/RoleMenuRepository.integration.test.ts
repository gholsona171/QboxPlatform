import { PrismaClientFactory } from "@qbox/prisma";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaGuildRepository, PrismaRoleMenuRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error("DATABASE_URL is required for role-menu repository integration tests.");
const databaseName = new URL(databaseUrl).pathname.slice(1);
if (!databaseName.toLowerCase().includes("test"))
  throw new Error(`Refusing role-menu cleanup for non-test database '${databaseName}'.`);

const configuration = DatabaseConfiguration.from({
  databaseUrl,
  environment: "test",
});
const client = new PrismaClientFactory().create(configuration);
const guilds = new PrismaGuildRepository(client);
const roleMenus = new PrismaRoleMenuRepository(client);

const guildId = "1257928923048837201";
const channelId = "1262656532902842423";
const messageId = "1432100000000000000";
const createdByDiscordUserId = "804859666655739996";

beforeAll(async () => client.$connect());
beforeEach(async () => {
  await client.$executeRawUnsafe(
    'TRUNCATE TABLE "role_menu_options", "role_menus", "guilds" CASCADE',
  );
});
afterAll(async () => client.$disconnect());

describe("PrismaRoleMenuRepository", () => {
  it("persists drafts, options, publication state, and restart lookup", async () => {
    await guilds.create(guildId, { name: "Qbox Test Guild" });
    const draft = await roleMenus.create({
      guildId,
      channelId,
      title: "Community Roles",
      presentationType: "BUTTONS",
      assignmentMode: "TOGGLE",
      createdByDiscordUserId,
    });
    const withOptions = await roleMenus.addOption(draft.id, {
      roleId: "1262656532902842424",
      label: "Events",
      emoji: "Bell",
    });
    expect(withOptions.options.map((option) => option.label)).toEqual(["Events"]);
    const published = await roleMenus.setPublished(draft.id, messageId);
    expect(published.status).toBe("PUBLISHED");

    const restartedClient = new PrismaClientFactory().create(configuration);
    await restartedClient.$connect();
    try {
      const restartedRepository = new PrismaRoleMenuRepository(restartedClient);
      const loaded = await restartedRepository.findByPublishedMessage(guildId, channelId, messageId);
      expect(loaded?.id).toBe(draft.id);
      expect(loaded?.options[0]?.roleId).toBe("1262656532902842424");
    } finally {
      await restartedClient.$disconnect();
    }
  });

  it("enforces duplicate role and option position constraints", async () => {
    await guilds.create(guildId, { name: "Qbox Test Guild" });
    const draft = await roleMenus.create({
      guildId,
      channelId,
      title: "Community Roles",
      presentationType: "BUTTONS",
      assignmentMode: "TOGGLE",
      createdByDiscordUserId,
    });
    await roleMenus.addOption(draft.id, {
      roleId: "1262656532902842424",
      label: "Events",
      position: 0,
    });
    await expect(roleMenus.addOption(draft.id, {
      roleId: "1262656532902842424",
      label: "Events Again",
    })).rejects.toThrow();
    await expect(roleMenus.addOption(draft.id, {
      roleId: "1262656532902842425",
      label: "Announcements",
      position: 0,
    })).rejects.toThrow();
  });
});
