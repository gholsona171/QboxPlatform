import { PrismaClientFactory } from "@qbox/prisma";
import { MessageTemplateService } from "@qbox/messages";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaMessagesRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for messages repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing messages cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaMessagesRepository(client);
const service = new MessageTemplateService(repository);
const guildId = "1257928923048837201";

beforeAll(async () => client.$connect());
beforeEach(async () => {
  await client.$executeRawUnsafe('TRUNCATE TABLE "messages_templates", "messages_looks"');
});
afterAll(async () => client.$disconnect());

describe("PrismaMessagesRepository", () => {
  it("round-trips the look with revisions", async () => {
    expect(await repository.getLook(guildId)).toBeUndefined();
    const saved = await service.saveLook({ guildId, enabled: true, accentColor: "#5865f2", footerText: "{server} · {brand}", authorIconUrl: "https://x.example/a.png", showTimestamp: true, mode: "override", expectedRevision: 0 });
    expect(saved).toEqual({ guildId, enabled: true, accentColor: "#5865F2", footerText: "{server} · {brand}", authorIconUrl: "https://x.example/a.png", showTimestamp: true, mode: "override", revision: 1 });
    const again = await service.saveLook({ guildId, enabled: false, showTimestamp: false, mode: "fill", expectedRevision: 1 });
    expect(again).toEqual({ guildId, enabled: false, showTimestamp: false, mode: "fill", revision: 2 });
    await expect(service.saveLook({ guildId, enabled: true, showTimestamp: false, mode: "fill", expectedRevision: 1 })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("stores templates as JSON, lists them, and deletes them", async () => {
    const embeds = [{ title: "Ticket #{number}", description: "{subject}", color: 0x5865f2, fields: [{ name: "Reason", value: "{reason}", inline: true }] }];
    const saved = await repository.saveTemplate({ guildId, key: "tickets.opened", enabled: true, content: "Hi {user}", embeds, updatedBy: "300000000000000001" });
    expect(saved).toMatchObject({ guildId, key: "tickets.opened", enabled: true, content: "Hi {user}", embeds, updatedBy: "300000000000000001" });
    await repository.saveTemplate({ guildId, key: "tickets.opened", enabled: false, embeds: [] });
    await repository.saveTemplate({ guildId, key: "levels.level-up", enabled: true, content: "GG", embeds: [] });
    await repository.saveTemplate({ guildId: "1257928923048837202", key: "levels.level-up", enabled: true, content: "Other server", embeds: [] });
    const list = await repository.listTemplates(guildId);
    expect(list.map((template) => [template.key, template.enabled, template.content])).toEqual([["levels.level-up", true, "GG"], ["tickets.opened", false, undefined]]);
    expect((await repository.getTemplate(guildId, "tickets.opened"))?.updatedBy).toBeUndefined();
    expect(await repository.deleteTemplate(guildId, "tickets.opened")).toBe(true);
    expect(await repository.deleteTemplate(guildId, "tickets.opened")).toBe(false);
    expect(await repository.getTemplate(guildId, "tickets.opened")).toBeUndefined();
  });

  it("serves templates through the MessageTemplates port", async () => {
    const fallback = { content: "default" };
    expect(await service.apply(guildId, "levels.level-up", { user: "<@1>" }, fallback)).toBe(fallback);
    await service.save(guildId, "levels.level-up", { content: "{user} reached level {level}", embeds: [{ title: "Level {level}", color: "#00FF00" }] });
    expect(await service.apply(guildId, "levels.level-up", { user: "<@1>", level: 3 }, fallback)).toEqual({ content: "<@1> reached level 3", embeds: [{ title: "Level 3", color: 0x00ff00 }] });
  });
});
