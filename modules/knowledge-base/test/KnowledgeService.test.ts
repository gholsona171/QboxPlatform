import { describe, expect, it } from "vitest";

import {
  InMemoryKnowledgeRepository,
  KnowledgeService,
  OpenAiKnowledgeAnswerer,
  articleEmbed,
  defaultKnowledgeSettings,
  rankArticles,
  searchTerms,
  slugify,
  type ArticleInput,
  type KnowledgeAnswerer,
  type KnowledgeArticle,
  type KnowledgeEmbed,
  type KnowledgeGateway,
} from "../src/index.js";

const GUILD = "100000000000000001";
const CHANNEL = "500000000000000001";
const EDITOR = { userId: "300000000000000001", displayName: "Jay" };

class FakeGateway implements KnowledgeGateway {
  public readonly posts: { channelId: string; embed: KnowledgeEmbed }[] = [];
  public readonly replies: { messageId: string; embed: KnowledgeEmbed }[] = [];
  public async postEmbed(channelId: string, embed: KnowledgeEmbed) { this.posts.push({ channelId, embed }); return { messageId: "700000000000000001" }; }
  public async replyEmbed(_channelId: string, messageId: string, _content: string, embed: KnowledgeEmbed) { this.replies.push({ messageId, embed }); }
}

function article(overrides: Partial<ArticleInput> = {}): ArticleInput {
  return { title: "How to join the server", body: "Open FiveM and press F8, then type connect.", tags: ["join", "connect"], published: true, pinned: false, ...overrides };
}

async function setup(answerer?: KnowledgeAnswerer) {
  let clock = new Date("2026-09-25T12:00:00.000Z");
  const now = () => clock;
  const repository = new InMemoryKnowledgeRepository(now);
  const gateway = new FakeGateway();
  const service = new KnowledgeService(repository, gateway, answerer, now);
  const join = await service.createArticle(GUILD, article(), EDITOR);
  const whitelist = await service.createArticle(GUILD, article({ title: "Whitelist applications", body: "Apply on the website. Staff review applications to join within 48 hours.", tags: ["whitelist", "apply"] }), EDITOR);
  const restarts = await service.createArticle(GUILD, article({ title: "Server restart times", body: "The server restarts at 06:00 and 18:00.", tags: ["restart"] }), EDITOR);
  const draft = await service.createArticle(GUILD, article({ title: "Secret join tricks draft", body: "Not ready.", tags: [], published: false }), EDITOR);
  return { service, repository, gateway, join, whitelist, restarts, draft, advance: (seconds: number) => { clock = new Date(clock.getTime() + seconds * 1000); } };
}

describe("search ranking", () => {
  const make = (title: string, body: string, tags: string[] = []): KnowledgeArticle => ({
    id: title, guildId: GUILD, title, slug: slugify(title), body, tags, published: true, pinned: false, views: 0, authorId: EDITOR.userId, authorName: "Jay", createdAt: new Date(), updatedAt: new Date(),
  });

  it("drops stop words and duplicates", () => {
    expect(searchTerms("How do I join the the server?")).toEqual(["join", "server"]);
    expect(searchTerms("hi")).toEqual([]);
  });

  it("ranks title over tags over body", () => {
    const results = rankArticles([
      make("Rules", "You may not use mods.", []),
      make("General", "Nothing here", ["mods"]),
      make("Using mods", "Allowed menus"),
    ], "mods");
    expect(results.map((result) => result.article.title)).toEqual(["Using mods", "General", "Rules"]);
    expect(results.map((result) => result.match)).toEqual([100, 60, 30]);
  });

  it("matches word forms and gives no result without a match", () => {
    expect(rankArticles([make("Server restart", "")], "restarts")[0]?.match).toBe(100);
    expect(rankArticles([make("Server restart", "")], "banana")).toEqual([]);
  });

  it("boosts full phrase matches in the title", () => {
    const results = rankArticles([make("Car dealer prices", "car"), make("Dealer car prices", "")], "car dealer");
    expect(results[0]?.article.title).toBe("Car dealer prices");
  });
});

describe("KnowledgeService", () => {
  it("creates articles with unique slugs and clean tags", async () => {
    const { service } = await setup();
    const copy = await service.createArticle(GUILD, article({ tags: [" Join ", "join", "FAQ"] }), EDITOR);
    expect(copy).toMatchObject({ slug: "how-to-join-the-server-2", tags: ["join", "faq"], authorName: "Jay", views: 0 });
    await expect(service.createArticle(GUILD, article({ title: "x" }), EDITOR)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(service.createArticle(GUILD, article({ slug: "Bad Slug" }), EDITOR)).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });

  it("searches published articles only unless drafts are included", async () => {
    const { service, join, draft } = await setup();
    expect((await service.search(GUILD, "how do I join?")).map((result) => result.article.id)[0]).toBe(join.id);
    expect((await service.search(GUILD, "secret tricks")).length).toBe(0);
    expect((await service.search(GUILD, "secret tricks", { includeDrafts: true }))[0]?.article.id).toBe(draft.id);
    await expect(service.article(GUILD, draft.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect((await service.article(GUILD, draft.slug, true)).id).toBe(draft.id);
  });

  it("finds by slug or best match and counts views", async () => {
    const { service, restarts } = await setup();
    expect((await service.find(GUILD, "server-restart-times")).id).toBe(restarts.id);
    expect((await service.find(GUILD, "when does it restart")).id).toBe(restarts.id);
    await expect(service.find(GUILD, "pineapple")).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect((await service.view(GUILD, restarts.id)).views).toBe(1);
  });

  it("manages categories and uncategorizes articles when one is deleted", async () => {
    const { service, join, repository } = await setup();
    const category = await service.createCategory(GUILD, { name: " Getting started ", emoji: "🚀", order: 1 });
    expect(category.name).toBe("Getting started");
    const updated = await service.updateArticle(GUILD, join.id, { ...article(), categoryId: category.id }, EDITOR);
    expect(updated).toMatchObject({ categoryId: category.id, updatedByName: "Jay" });
    expect(articleEmbed(updated, category).footer).toContain("🚀 Getting started");
    await service.deleteCategory(GUILD, category.id);
    expect((await repository.getArticle(GUILD, join.id))?.categoryId).toBeUndefined();
    await expect(service.updateArticle(GUILD, join.id, { ...article(), categoryId: category.id }, EDITOR)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("posts an article to a channel", async () => {
    const { service, gateway, whitelist } = await setup();
    await service.post(GUILD, whitelist.slug, CHANNEL);
    expect(gateway.posts[0]).toMatchObject({ channelId: CHANNEL, embed: { title: "Whitelist applications" } });
  });

  it("validates and saves settings with revisions", async () => {
    const { service } = await setup();
    const { revision: _revision, ...defaults } = defaultKnowledgeSettings(GUILD);
    const saved = await service.saveSettings({ ...defaults, autoAnswerEnabled: true, autoAnswerChannelIds: [CHANNEL, CHANNEL], expectedRevision: 0 });
    expect(saved).toMatchObject({ revision: 1, autoAnswerChannelIds: [CHANNEL] });
    await expect(service.saveSettings({ ...defaults, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(service.saveSettings({ ...defaults, autoAnswerThreshold: 0 })).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });
});

describe("auto-answers", () => {
  async function enabled(threshold = 70) {
    const context = await setup();
    const { revision: _revision, ...defaults } = defaultKnowledgeSettings(GUILD);
    await context.service.saveSettings({ ...defaults, autoAnswerEnabled: true, autoAnswerChannelIds: [CHANNEL], autoAnswerThreshold: threshold, autoAnswerCooldownSeconds: 60 });
    return context;
  }
  const message = (content: string, messageId = "800000000000000001") => ({ guildId: GUILD, channelId: CHANNEL, messageId, content });

  it("replies when a message closely matches, then waits for the cooldown", async () => {
    const { service, gateway, restarts, advance } = await enabled();
    expect((await service.handleMessage(message("what are the server restart times?")))?.article.id).toBe(restarts.id);
    expect(gateway.replies).toHaveLength(1);
    expect(await service.handleMessage(message("server restart times again"))).toBeUndefined();
    advance(61);
    expect(await service.handleMessage(message("server restart times again"))).toBeDefined();
  });

  it("ignores weak matches, short messages, and other channels", async () => {
    const { service, gateway } = await enabled();
    expect(await service.handleMessage(message("I like the server a lot today friends"))).toBeUndefined();
    expect(await service.handleMessage(message("restart"))).toBeUndefined();
    expect(await service.handleMessage({ ...message("server restart times please"), channelId: "500000000000000002" })).toBeUndefined();
    expect(gateway.replies).toHaveLength(0);
  });
});

describe("ask", () => {
  it("falls back to the best article without AI", async () => {
    const { service, restarts } = await setup();
    const answer = await service.ask(GUILD, "When are restarts?");
    expect(answer).toMatchObject({ ai: false, sources: [{ id: restarts.id }] });
    expect((await service.ask(GUILD, "pineapple pizza")).sources).toEqual([]);
  });

  it("sends the top 3 articles to the answerer and falls back when it fails", async () => {
    const seen: string[][] = [];
    const answerer: KnowledgeAnswerer = { answer: async (_question, articles) => { seen.push(articles.map((item) => item.title)); return "Press F8 and connect."; } };
    const { service } = await setup(answerer);
    expect(await service.ask(GUILD, "how to join the server")).toMatchObject({ ai: true, text: "Press F8 and connect." });
    expect(seen[0]?.length).toBeLessThanOrEqual(3);
    const failing = await setup({ answer: async () => { throw new Error("down"); } });
    expect(await failing.service.ask(GUILD, "how to join the server")).toMatchObject({ ai: false });
  });

  it("calls the OpenAI chat completions API", async () => {
    const requests: { url: string; body: { model: string; messages: { content: string }[] }; auth: string }[] = [];
    const fakeFetch = (async (url: string, init: RequestInit) => {
      requests.push({ url, body: JSON.parse(String(init.body)), auth: new Headers(init.headers).get("authorization") ?? "" });
      return new Response(JSON.stringify({ choices: [{ message: { content: " Hello " } }] }), { status: 200 });
    }) as typeof fetch;
    const { join } = await setup();
    const answerer = new OpenAiKnowledgeAnswerer("sk-test", "gpt-test", fakeFetch);
    expect(await answerer.answer("How to join?", [join])).toBe("Hello");
    expect(requests[0]).toMatchObject({ url: "https://api.openai.com/v1/chat/completions", auth: "Bearer sk-test", body: { model: "gpt-test" } });
    expect(requests[0]?.body.messages[1]?.content).toContain("How to join the server");
    const failing = new OpenAiKnowledgeAnswerer("sk-test", "gpt-test", (async () => new Response("{}", { status: 500 })) as typeof fetch);
    await expect(failing.answer("q", [join])).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE" });
  });
});
