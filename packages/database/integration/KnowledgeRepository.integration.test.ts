import { PrismaClientFactory } from "@qbox/prisma";
import { KnowledgeService, defaultKnowledgeSettings } from "@qbox/knowledge-base";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaKnowledgeRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for knowledge repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing knowledge cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaKnowledgeRepository(client);
const service = new KnowledgeService(repository);
const guildId = "1257928923048837201";
const editor = { userId: "804859666655739997", displayName: "Editor" };

beforeAll(async () => client.$connect());
beforeEach(async () => {
  await client.$executeRawUnsafe('TRUNCATE TABLE "knowledge_articles", "knowledge_categories", "knowledge_settings"');
});
afterAll(async () => client.$disconnect());

describe("PrismaKnowledgeRepository", () => {
  it("round-trips settings with revisions", async () => {
    const { revision: _revision, ...defaults } = defaultKnowledgeSettings(guildId);
    const saved = await service.saveSettings({ ...defaults, autoAnswerEnabled: true, autoAnswerChannelIds: ["1262656532902842425"], expectedRevision: 0 });
    expect(saved).toMatchObject({ revision: 1, autoAnswerEnabled: true, autoAnswerChannelIds: ["1262656532902842425"] });
    await expect(service.saveSettings({ ...defaults, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("stores articles, prefilters with ILIKE and tags, and ranks results", async () => {
    const category = await service.createCategory(guildId, { name: "Rules", emoji: "📜", order: 1 });
    const join = await service.createArticle(guildId, { title: "How to join", body: "Press F8 and CONNECT to the server.", tags: ["Start"], categoryId: category.id, published: true, pinned: false }, editor);
    await service.createArticle(guildId, { title: "Vehicle rules", body: "No ramming. Restarts happen daily.", tags: ["cars"], published: true, pinned: true }, editor);
    await service.createArticle(guildId, { title: "Draft join notes", body: "Hidden", tags: [], published: false, pinned: false }, editor);
    expect((await service.search(guildId, "connect")).map((result) => result.article.id)).toEqual([join.id]);
    expect((await service.search(guildId, "start"))[0]?.article.id).toBe(join.id);
    expect((await service.search(guildId, "restart")).map((result) => result.article.title)).toEqual(["Vehicle rules"]);
    expect((await service.search(guildId, "join")).map((result) => result.article.title)).toEqual(["How to join"]);
    expect((await service.list(guildId)).map((item) => item.title)).toEqual(["Vehicle rules", "How to join"]);
    expect(await service.list(guildId, { includeDrafts: true })).toHaveLength(3);
    const copy = await service.createArticle(guildId, { title: "How to join", body: "Again", tags: [], published: true, pinned: false }, editor);
    expect(copy.slug).toBe("how-to-join-2");
  });

  it("counts views without changing the update time, and uncategorizes on delete", async () => {
    const category = await service.createCategory(guildId, { name: "Help", order: 0 });
    const created = await service.createArticle(guildId, { title: "Getting help", body: "Open a ticket.", tags: [], categoryId: category.id, published: true, pinned: false }, editor);
    const viewed = await service.view(guildId, created.slug);
    expect(viewed.views).toBe(1);
    const loaded = await service.article(guildId, created.id);
    expect(loaded.views).toBe(1);
    expect(loaded.updatedAt.getTime()).toBe(created.updatedAt.getTime());
    const updated = await service.updateArticle(guildId, created.id, { title: "Getting help fast", body: "Open a ticket.", tags: ["help"], categoryId: category.id, published: true, pinned: true }, editor);
    expect(updated).toMatchObject({ updatedByName: "Editor", pinned: true, tags: ["help"] });
    await service.deleteCategory(guildId, category.id);
    expect((await service.article(guildId, created.id)).categoryId).toBeUndefined();
    await service.deleteArticle(guildId, created.id);
    await expect(service.article(guildId, created.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
