import { describe, expect, it } from "vitest";

import {
  BuilderService,
  DiscordRestBuilderGateway,
  InMemoryBuilderRepository,
  NO_DESIGNER,
  NO_DESIGN_ANSWER,
  UNEXPECTED_DESIGN,
  PRESETS,
  generateBlueprint,
  templateFor,
  type BlueprintDesigner,
  type BotStatus,
  type BuilderAnswers,
  type BuilderBlueprint,
  type BuilderGateway,
  type BuilderLink,
  type BuilderLinkPort,
  type BuilderResolvedIds,
  type ChannelCreateInput,
  type DesignedBlueprint,
  type ExistingChannel,
  type ExistingRole,
  type ForumPostInput,
  type RoleCreateInput,
  type WipeExpression,
  type WipeLayout,
  type WipeLayoutChannel,
  type WipeLayoutRole,
} from "../src/index.js";

const GUILD = "100000000000000001";
const BOT_ID = "900000000000000001";
const starter = { userId: "300000000000000001", displayName: "Jay" };

class MemoryGateway implements BuilderGateway {
  public roles: ExistingRole[] = [{ id: GUILD, name: "@everyone", position: 0, managed: false }, { id: "800000000000000001", name: "Qbox", position: 1, managed: true }];
  public channels: (ExistingChannel & { input?: ChannelCreateInput })[] = [];
  public status: BotStatus = { userId: BOT_ID, permissions: 8n, topRolePosition: 1, highestRolePosition: 1, community: true };
  public failRole = new Set<string>();
  public rejectTypes = new Set<number>();
  public deleted: string[] = [];
  public positions: { id: string; position: number }[] = [];
  public posts: { channelId: string; threadId: string; input: ForumPostInput }[] = [];
  public pinned: string[] = [];
  public failPosts = false;
  public failPins = false;
  /** Wipe: full layout returned by readLayout, plus expressions. */
  public layout: WipeLayout = { name: "Test City", community: false, roles: [], channels: [] };
  public emojis: WipeExpression[] = [];
  public stickers: WipeExpression[] = [];
  public deleteChannelError = new Map<string, unknown>();
  public deleteRoleError = new Map<string, unknown>();
  private next = 1000;

  public async listRoles() { return [...this.roles]; }
  public async listChannels() { return this.channels.map(({ input: _input, ...channel }) => channel); }
  public async botStatus() { return this.status; }
  public async readLayout() { return this.layout; }
  public async listEmojis() { return [...this.emojis]; }
  public async listStickers() { return [...this.stickers]; }
  public async deleteEmoji(_guild: string, emojiId: string) { this.deleted.push(emojiId); }
  public async deleteSticker(_guild: string, stickerId: string) { this.deleted.push(stickerId); }
  public async createRole(_guild: string, input: RoleCreateInput) {
    if (this.failRole.has(input.name)) throw new Error("Missing Permissions");
    const id = this.id();
    this.roles.push({ id, name: input.name, position: 1, managed: false });
    return id;
  }
  public async setRolePositions(_guild: string, positions: readonly { id: string; position: number }[]) { this.positions = [...positions]; }
  public async createChannel(_guild: string, input: ChannelCreateInput) {
    if (this.rejectTypes.has(input.type)) throw new Error("Cannot use this channel type here");
    const id = this.id();
    this.channels.push({ id, name: input.name, type: input.type, ...(input.parentId ? { parentId: input.parentId } : {}), input });
    return id;
  }
  public async createForumPost(channelId: string, input: ForumPostInput) {
    if (this.failPosts) throw new Error("Missing Access");
    const threadId = this.id();
    this.posts.push({ channelId, threadId, input });
    return { threadId };
  }
  public async pinForumPost(threadId: string) {
    if (this.failPins) throw new Error("Cannot pin");
    this.pinned.push(threadId);
  }
  public async deleteChannel(channelId: string) {
    const error = this.deleteChannelError.get(channelId);
    if (error) throw error;
    this.deleted.push(channelId);
    this.channels = this.channels.filter((channel) => channel.id !== channelId);
  }
  public async deleteRole(_guild: string, roleId: string) {
    const error = this.deleteRoleError.get(roleId);
    if (error) throw error;
    this.deleted.push(roleId);
    this.roles = this.roles.filter((role) => role.id !== roleId);
  }
  private id() { return String(700000000000000000n + BigInt(this.next++)); }
}

class FakeLinks implements BuilderLinkPort {
  public applied: { link: BuilderLink; ids: BuilderResolvedIds }[] = [];
  public failing = new Set<BuilderLink>();
  public async apply(link: BuilderLink, ids: BuilderResolvedIds) {
    if (this.failing.has(link)) throw new Error(`${link} broke`);
    this.applied.push({ link, ids });
    return `${link} linked`;
  }
}

const small: BuilderBlueprint = {
  roles: [
    { key: "staff-admin", name: "Admin", color: "#E74C3C", hoist: true, mentionable: false, permissions: ["KickMembers"], purpose: "staff" },
    { key: "staff-mod", name: "Moderator", color: "#2ECC71", hoist: true, mentionable: false, permissions: [], purpose: "staff" },
  ],
  categories: [
    {
      key: "cat-info",
      name: "INFO",
      overwrites: [],
      channels: [
        { key: "news", name: "news", type: "ANNOUNCEMENT", slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: PRESETS.READ_ONLY(["staff-admin"]), purpose: "announcements" },
        { key: "general", name: "general", type: "TEXT", topic: "Chat", slowmodeSeconds: 5, nsfw: false, userLimit: 0, overwrites: [] },
        {
          key: "help", name: "help", type: "FORUM", slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: [],
          forum: { guidelines: "One post per problem.", tags: [{ name: "Question", emoji: "❓" }, { name: "Solved" }], defaultReactionEmoji: "👍", firstPost: { title: "Read me first", content: "How to post.", pin: true } },
        },
        { key: "stage", name: "Stage", type: "STAGE", slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: [] },
      ],
    },
    {
      key: "cat-logs",
      name: "LOGS",
      overwrites: PRESETS.HIDDEN_LOG(["staff-admin", "staff-mod"]),
      channels: [{ key: "mod-log", name: "mod-log", type: "TEXT", slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: [], purpose: "mod-log" }],
    },
  ],
};

async function setup(blueprint: BuilderBlueprint = small) {
  const repository = new InMemoryBuilderRepository();
  const gateway = new MemoryGateway();
  const links = new FakeLinks();
  const tasks: Promise<void>[] = [];
  const service = new BuilderService(repository, gateway, links, { schedule: (task) => void tasks.push(task()) });
  await service.saveDraft({ guildId: GUILD, answers: templateFor("COMMUNITY").answers, blueprint, expectedRevision: 0 });
  const settle = async () => {
    await Promise.all(tasks.splice(0));
  };
  return { repository, gateway, links, service, settle };
}

describe("BuilderService builds", () => {
  it("creates roles, categories, and channels with overwrites, then applies links", async () => {
    const { service, gateway, links, settle } = await setup();
    gateway.status = { ...gateway.status, topRolePosition: 10 };
    const run = await service.startRun(GUILD, { mode: "ADD", links: ["moderation", "tickets"] }, starter);
    expect(run).toMatchObject({ status: "QUEUED", planned: 2 + 2 + 5 + 1, links: ["moderation"] });
    await settle();
    const detail = await service.run(GUILD, run.id);
    expect(detail.run).toMatchObject({ status: "SUCCEEDED", done: 10, skipped: 0, failed: 0 });
    const help = gateway.channels.find((channel) => channel.name === "help");
    expect(help?.input).toMatchObject({ type: 15, topic: "One post per problem.", tags: [{ name: "Question", emoji: "❓" }, { name: "Solved" }], defaultReactionEmoji: "👍" });
    expect(gateway.posts).toEqual([{ channelId: help?.id, threadId: expect.any(String), input: { title: "Read me first", content: "How to post." } }]);
    expect(gateway.pinned).toEqual([gateway.posts[0]?.threadId]);
    expect(detail.items.find((item) => item.name === "help")).toMatchObject({ status: "CREATED", note: "First post pinned." });
    expect(gateway.positions.map((item) => item.position)).toEqual([9, 8]);
    const modLog = gateway.channels.find((channel) => channel.name === "mod-log");
    const logs = gateway.channels.find((channel) => channel.name === "LOGS");
    expect(modLog?.parentId).toBe(logs?.id);
    expect(modLog?.input?.overwrites.find((overwrite) => overwrite.id === GUILD)?.deny).toBe(String((1n << 10n) | (1n << 11n) | (1n << 38n) | (1n << 35n) | (1n << 36n)));
    expect(modLog?.input?.overwrites.find((overwrite) => overwrite.id === BOT_ID)).toMatchObject({ type: 1 });
    expect(gateway.channels.find((channel) => channel.name === "general")?.input).toMatchObject({ topic: "Chat", slowmodeSeconds: 5 });
    const ids = links.applied[0]?.ids;
    expect(ids?.channels["mod-log"]).toBe(modLog?.id);
    expect(ids?.staffRoles.map((role) => role.name)).toEqual(["Admin", "Moderator"]);
    expect(detail.items.find((item) => item.kind === "LINK")).toMatchObject({ status: "CREATED", note: "moderation linked" });
  });

  it("skips items that already exist by name and type when adding to a server", async () => {
    const { service, gateway, settle } = await setup();
    gateway.roles.push({ id: "600000000000000001", name: "admin", position: 1, managed: false });
    gateway.channels.push({ id: "600000000000000002", name: "general", type: 0 }, { id: "600000000000000003", name: "mod-log", type: 2 });
    const run = await service.startRun(GUILD, { mode: "ADD", links: [] }, starter);
    await settle();
    const detail = await service.run(GUILD, run.id);
    expect(detail.run).toMatchObject({ status: "SUCCEEDED", skipped: 2 });
    expect(detail.items.filter((item) => item.status === "SKIPPED").map((item) => item.name)).toEqual(["Admin", "general"]);
    expect(gateway.channels.filter((channel) => channel.name === "mod-log")).toHaveLength(2);
  });

  it("matches existing channels without their emoji when adding to a server", async () => {
    const emoji: BuilderBlueprint = {
      ...small,
      categories: [{
        ...small.categories[0] as BuilderBlueprint["categories"][number],
        channels: [
          { key: "welcome", name: "👋┃welcome", type: "TEXT", slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: [] },
          { key: "general", name: "general", type: "TEXT", slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: [] },
          { key: "lounge-1", name: "🔊 Lounge 1", type: "VOICE", slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: [] },
          { key: "rules", name: "📜┃rules", type: "TEXT", slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: [] },
        ],
      }],
    };
    const { service, gateway, settle } = await setup(emoji);
    gateway.channels.push(
      { id: "600000000000000002", name: "welcome", type: 0 },
      { id: "600000000000000003", name: "💬-general", type: 0 },
      { id: "600000000000000004", name: "🔊┃Lounge 1", type: 2 },
      { id: "600000000000000005", name: "📜┃rules", type: 0 },
      { id: "600000000000000006", name: "rules", type: 0 },
    );
    const run = await service.startRun(GUILD, { mode: "ADD", links: [] }, starter);
    await settle();
    const detail = await service.run(GUILD, run.id);
    const skipped = detail.items.filter((item) => item.status === "SKIPPED" && item.kind === "CHANNEL");
    expect(skipped.map((item) => [item.name, item.discordId])).toEqual([
      ["👋┃welcome", "600000000000000002"],
      ["general", "600000000000000003"],
      ["🔊 Lounge 1", "600000000000000004"],
      ["📜┃rules", "600000000000000005"],
    ]);
    expect(gateway.channels.filter((channel) => channel.name.endsWith("welcome"))).toHaveLength(1);
  });

  it("creates everything again in fresh mode without deleting anything", async () => {
    const { service, gateway, settle } = await setup();
    gateway.channels.push({ id: "600000000000000002", name: "general", type: 0 });
    await service.startRun(GUILD, { mode: "FRESH", links: [] }, starter);
    await settle();
    expect(gateway.channels.filter((channel) => channel.name === "general")).toHaveLength(2);
    expect(gateway.deleted).toEqual([]);
  });

  it("falls back to text and voice channels without Community", async () => {
    const { service, gateway, settle } = await setup();
    gateway.status = { ...gateway.status, community: false };
    gateway.rejectTypes.add(15);
    const run = await service.startRun(GUILD, { mode: "ADD", links: [] }, starter);
    await settle();
    const types = Object.fromEntries(gateway.channels.map((channel) => [channel.name, channel.type]));
    expect(types).toMatchObject({ news: 0, help: 0, Stage: 2 });
    const notes = (await service.run(GUILD, run.id)).items.filter((item) => item.note?.startsWith("Made as")).map((item) => item.name);
    expect(notes).toEqual(["news", "help", "Stage"]);
    expect(gateway.posts).toEqual([]);
    expect(gateway.channels.find((channel) => channel.name === "help")?.input?.tags).toBeUndefined();
  });

  it("notes a first post that could not be created or pinned without failing the channel", async () => {
    const failing = await setup();
    failing.gateway.failPosts = true;
    const run = await failing.service.startRun(GUILD, { mode: "ADD", links: [] }, starter);
    await failing.settle();
    const detail = await failing.service.run(GUILD, run.id);
    expect(detail.run).toMatchObject({ status: "SUCCEEDED", failed: 0 });
    expect(detail.items.find((item) => item.name === "help")).toMatchObject({ status: "CREATED", note: "First post could not be created: Missing Access" });
    const unpinned = await setup();
    unpinned.gateway.failPins = true;
    const second = await unpinned.service.startRun(GUILD, { mode: "ADD", links: [] }, starter);
    await unpinned.settle();
    expect((await unpinned.service.run(GUILD, second.id)).items.find((item) => item.name === "help")?.note).toBe("First post created but could not be pinned: Cannot pin");
    expect(unpinned.gateway.posts).toHaveLength(1);
  });

  it("gives an existing forum no first post when adding to a server", async () => {
    const { service, gateway, settle } = await setup();
    gateway.channels.push({ id: "600000000000000009", name: "help", type: 15 });
    await service.startRun(GUILD, { mode: "ADD", links: [] }, starter);
    await settle();
    expect(gateway.posts).toEqual([]);
  });

  it("keeps going on failures and marks the run PARTIAL", async () => {
    const { service, gateway, links, settle } = await setup();
    gateway.failRole.add("Admin");
    links.failing.add("moderation");
    const run = await service.startRun(GUILD, { mode: "ADD", links: ["moderation"] }, starter);
    await settle();
    const detail = await service.run(GUILD, run.id);
    expect(detail.run).toMatchObject({ status: "PARTIAL", failed: 2 });
    expect(detail.items.find((item) => item.name === "Admin")).toMatchObject({ status: "FAILED", error: "Missing Permissions" });
    expect(detail.items.find((item) => item.kind === "LINK")).toMatchObject({ status: "FAILED", error: "moderation broke" });
    const news = gateway.channels.find((channel) => channel.name === "news");
    expect(news?.input?.overwrites.some((overwrite) => overwrite.allow === String(1n << 11n))).toBe(false);
  });

  it("undoes only what the run created", async () => {
    const { service, gateway, settle } = await setup();
    gateway.channels.push({ id: "600000000000000002", name: "general", type: 0 });
    const run = await service.startRun(GUILD, { mode: "ADD", links: [] }, starter);
    await settle();
    const created = (await service.run(GUILD, run.id)).items.filter((item) => item.status === "CREATED").map((item) => item.discordId);
    const undoing = await service.undo(GUILD, run.id);
    expect(undoing.status).toBe("RUNNING");
    await settle();
    expect(new Set(gateway.deleted)).toEqual(new Set(created));
    expect(gateway.deleted).not.toContain("600000000000000002");
    expect(gateway.channels.map((channel) => channel.id)).toEqual(["600000000000000002"]);
    expect(gateway.deleted.indexOf(created[2] as string)).toBeGreaterThan(gateway.deleted.indexOf(created[4] as string));
    expect(gateway.deleted.slice(-2)).toEqual(created.slice(0, 2));
    const detail = await service.run(GUILD, run.id);
    expect(detail.run.status).toBe("UNDONE");
    expect(detail.items.filter((item) => item.status === "DELETED")).toHaveLength(created.length);
    await expect(service.undo(GUILD, run.id)).rejects.toMatchObject({ code: "INVALID_STATE" });
  });

  it("allows one run at a time and recovers interrupted runs", async () => {
    const { service, repository } = await setup();
    const repositoryOnly = new BuilderService(repository, new MemoryGateway(), undefined, { schedule: () => undefined });
    await repositoryOnly.startRun(GUILD, { mode: "ADD", links: [] }, starter);
    await expect(service.startRun(GUILD, { mode: "ADD", links: [] }, starter)).rejects.toMatchObject({ code: "CONFLICT" });
    expect(await service.recoverInterrupted()).toBe(1);
    expect((await service.runs(GUILD))[0]).toMatchObject({ status: "FAILED", error: expect.stringContaining("restarted") });
  });

  it("checks bot permissions before building", async () => {
    const { service, gateway } = await setup();
    gateway.status = { ...gateway.status, permissions: 1n << 4n, topRolePosition: 3, highestRolePosition: 9, community: false };
    const preflight = await service.preflight(GUILD);
    expect(preflight).toMatchObject({ ready: false, canManageRoles: false, canManageChannels: true, community: false });
    expect(preflight.messages.join(" ")).toContain("Manage Roles");
    expect(preflight.messages.join(" ")).toContain("top of the role list");
    await expect(service.startRun(GUILD, { mode: "ADD", links: [] }, starter)).rejects.toMatchObject({ code: "INVALID_STATE" });
  });

  it("saves drafts with revisions and generates without saving", async () => {
    const { service } = await setup();
    const plan = await service.generate(templateFor("FIVEM_RP").answers);
    expect(plan.summary.channels).toBeGreaterThan(80);
    expect(plan.access.rules).toEqual({ see: "everyone", post: "staff" });
    const draft = await service.draft(GUILD);
    expect(draft?.revision).toBe(1);
    await expect(service.saveDraft({ guildId: GUILD, answers: templateFor("FIVEM_RP").answers, blueprint: plan.blueprint, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
    const saved = await service.saveDraft({ guildId: GUILD, answers: templateFor("FIVEM_RP").answers, blueprint: generateBlueprint(templateFor("FIVEM_RP").answers), expectedRevision: 1 });
    expect(saved.links.every((option) => option.available)).toBe(true);
    expect((await service.overview(GUILD)).preflight.ready).toBe(true);
  });
});

describe("BuilderService designs from a description", () => {
  const good: DesignedBlueprint = {
    serverType: "GAMING",
    serverName: "Rust Haven",
    staffRanks: ["Owner", "Admin", "Helper"],
    departments: [],
    include: { fivemStatus: false, birthdays: false, tickets: true },
    voiceLounges: 2,
    channelEmojis: "KEY",
    removeChannels: ["memes"],
    extraRoles: [{ name: "Clan Leader", color: "#ff8800", purpose: "ping" }],
    extraCategories: [{ name: "Trading", emoji: "💰", access: "everyone", channels: [{ name: "Market", type: "TEXT", topic: "Buy and sell." }] }],
    summary: "A Rust community with a trading market.",
  };

  it("needs a designer", async () => {
    const { service } = await setup();
    expect((await service.overview(GUILD)).aiAvailable).toBe(false);
    await expect(service.designFromPrompt(GUILD, "A Rust server", 1)).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: NO_DESIGNER });
  });

  it("turns a design into a saved draft with the answers, extras, and description", async () => {
    const seen: { prompt: string; base: BuilderAnswers }[] = [];
    const designer: BlueprintDesigner = { design: async (prompt, base) => { seen.push({ prompt, base }); return good; } };
    const repository = new InMemoryBuilderRepository();
    const service = new BuilderService(repository, new MemoryGateway(), new FakeLinks(), { designer });
    expect((await service.overview(GUILD)).aiAvailable).toBe(true);
    const result = await service.designFromPrompt(GUILD, "  A Rust community with a trading market  ", 0, starter.userId);
    expect(result.summary).toBe("A Rust community with a trading market.");
    expect(seen[0]).toMatchObject({ prompt: "A Rust community with a trading market", base: { serverType: "COMMUNITY" } });
    expect(result.draft.revision).toBe(1);
    expect(result.draft.answers).toMatchObject({ serverType: "GAMING", serverName: "Rust Haven", staffRanks: ["Owner", "Admin", "Helper"], voiceLounges: 2, channelEmojis: "KEY", description: "A Rust community with a trading market" });
    expect(result.draft.answers.include).toMatchObject({ fivemStatus: false, birthdays: false, tickets: true, levels: true });
    const names = result.draft.blueprint.categories.flatMap((category) => category.channels.map((channel) => channel.name));
    expect(names).not.toContain("memes");
    expect(names).toContain("market");
    expect(result.draft.blueprint.categories.map((category) => category.name)).toContain("💰 TRADING");
    expect(result.draft.blueprint.roles.find((role) => role.name === "Clan Leader")).toMatchObject({ purpose: "ping", mentionable: true, color: "#FF8800" });
    expect((await service.draft(GUILD))?.answers.description).toBe("A Rust community with a trading market");
    /* The next design starts from the saved answers and needs the current revision. */
    await service.designFromPrompt(GUILD, "Again", 1);
    expect(seen[1]?.base.serverName).toBe("Rust Haven");
    await expect(service.designFromPrompt(GUILD, "Again", 1)).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("explains a designer that does not answer or answers with junk", async () => {
    const failing = new BuilderService(new InMemoryBuilderRepository(), undefined, undefined, { designer: { design: async () => { throw new Error("socket hang up"); } } });
    await expect(failing.designFromPrompt(GUILD, "A server", 0)).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: NO_DESIGN_ANSWER });
    const junk = new BuilderService(new InMemoryBuilderRepository(), undefined, undefined, { designer: { design: async () => ({ hello: "world" }) as unknown as DesignedBlueprint } });
    await expect(junk.designFromPrompt(GUILD, "A server", 0)).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: UNEXPECTED_DESIGN });
    await expect(junk.designFromPrompt(GUILD, "   ", 0)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(junk.designFromPrompt(GUILD, "x".repeat(2001), 0)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect(await junk.draft(GUILD)).toBeUndefined();
  });
});

/* ---------- Wipe ---------- */

const ROLE_EVERYONE: WipeLayoutRole = { id: GUILD, name: "@everyone", color: 0, hoist: false, mentionable: false, permissions: "0", position: 0, managed: false };
const ROLE_BOT: WipeLayoutRole = { id: "600000000000000101", name: "Qbox", color: 0, hoist: false, mentionable: false, permissions: "8", position: 5, managed: true };
const ROLE_MEMBER: WipeLayoutRole = { id: "600000000000000102", name: "Member", color: 3447003, hoist: false, mentionable: false, permissions: "1024", position: 2, managed: false };
const ROLE_ABOVE: WipeLayoutRole = { id: "600000000000000103", name: "Above", color: 0, hoist: false, mentionable: false, permissions: "0", position: 8, managed: false };
const CHANNELS: WipeLayoutChannel[] = [
  { id: "600000000000000200", name: "Info", type: 4, nsfw: false, slowmodeSeconds: 0, userLimit: 0, position: 0, overwrites: [] },
  { id: "600000000000000201", name: "rules", type: 0, nsfw: false, slowmodeSeconds: 0, userLimit: 0, position: 0, parentId: "600000000000000200", overwrites: [] },
  { id: "600000000000000202", name: "general", type: 0, nsfw: false, slowmodeSeconds: 0, userLimit: 0, position: 1, parentId: "600000000000000200", overwrites: [{ id: GUILD, type: 0, allow: "0", deny: "1024" }, { id: "600000000000000999", type: 1, allow: "2048", deny: "0" }] },
  { id: "600000000000000203", name: "Lounge", type: 2, nsfw: false, slowmodeSeconds: 0, userLimit: 0, position: 0, overwrites: [] },
];

function wipeLayout(): WipeLayout {
  return { name: "Test City", community: true, rulesChannelId: "600000000000000201", roles: [ROLE_EVERYONE, ROLE_BOT, ROLE_MEMBER, ROLE_ABOVE], channels: structuredClone(CHANNELS) };
}

async function wipeSetup(options: { ownerId?: string; layout?: WipeLayout } = {}) {
  const repository = new InMemoryBuilderRepository();
  const gateway = new MemoryGateway();
  gateway.status = { ...gateway.status, ownerId: options.ownerId ?? starter.userId, topRolePosition: 5, highestRolePosition: 8 };
  gateway.layout = options.layout ?? wipeLayout();
  gateway.roles = gateway.layout.roles.map((role) => ({ id: role.id, name: role.name, position: role.position, managed: role.managed, permissions: role.permissions }));
  gateway.emojis = [{ id: "600000000000000300", name: "pepe" }];
  gateway.stickers = [{ id: "600000000000000301", name: "wave" }];
  const tasks: Promise<void>[] = [];
  const service = new BuilderService(repository, gateway, new FakeLinks(), { schedule: (task) => void tasks.push(task()) });
  const settle = async () => { await Promise.all(tasks.splice(0)); };
  return { repository, gateway, service, settle };
}

const WIPE_ALL = { confirmName: "Test City", include: { channels: true, roles: true, emojis: false } };

describe("BuilderService wipes", () => {
  it("deletes channels first, then categories, then roles lowest-first, keeping managed, @everyone, above-bot roles, and Community channels", async () => {
    const { service, gateway, settle } = await wipeSetup();
    const run = await service.startWipe(GUILD, WIPE_ALL, starter);
    expect(run).toMatchObject({ mode: "WIPE", planned: 6 });
    await settle();
    const detail = await service.run(GUILD, run.id);
    expect(detail.run).toMatchObject({ status: "SUCCEEDED", done: 4, skipped: 2, failed: 0 });
    expect(gateway.deleted).toEqual(["600000000000000202", "600000000000000203", "600000000000000200", "600000000000000102"]);
    const byKey = (key: string) => detail.items.find((item) => item.key === key);
    expect(byKey("600000000000000201")).toMatchObject({ status: "KEPT", note: expect.stringContaining("Community") });
    expect(byKey("600000000000000103")).toMatchObject({ status: "KEPT", note: expect.stringContaining("role") });
    expect(detail.items.some((item) => item.key === ROLE_BOT.id || item.key === GUILD)).toBe(false);
    expect(detail.run.snapshot).toBeUndefined();
  });

  it("keeps a Community channel Discord refuses to delete (50074) and continues", async () => {
    const layout = wipeLayout();
    const { service, gateway, settle } = await wipeSetup({ layout: { ...layout, rulesChannelId: undefined } });
    gateway.deleteChannelError.set("600000000000000201", { code: 50074, message: "Cannot delete a channel required for Community" });
    const run = await service.startWipe(GUILD, WIPE_ALL, starter);
    await settle();
    const detail = await service.run(GUILD, run.id);
    expect(detail.run.status).toBe("SUCCEEDED");
    expect(detail.items.find((item) => item.key === "600000000000000201")).toMatchObject({ status: "KEPT", note: expect.stringContaining("Community") });
    expect(gateway.deleted).not.toContain("600000000000000201");
  });

  it("records a per-item failure and marks the run PARTIAL", async () => {
    const { service, gateway, settle } = await wipeSetup();
    gateway.deleteRoleError.set("600000000000000102", new Error("Missing Permissions"));
    const run = await service.startWipe(GUILD, WIPE_ALL, starter);
    await settle();
    const detail = await service.run(GUILD, run.id);
    expect(detail.run).toMatchObject({ status: "PARTIAL", failed: 1 });
    expect(detail.items.find((item) => item.key === "600000000000000102")).toMatchObject({ status: "FAILED", error: "Missing Permissions" });
  });

  it("deletes emojis and stickers when asked", async () => {
    const { service, gateway, settle } = await wipeSetup();
    const run = await service.startWipe(GUILD, { confirmName: "Test City", include: { channels: false, roles: false, emojis: true } }, starter);
    await settle();
    const detail = await service.run(GUILD, run.id);
    expect(gateway.deleted).toEqual(["600000000000000300", "600000000000000301"]);
    expect(detail.items.map((item) => [item.kind, item.status])).toEqual([["EMOJI", "DELETED"], ["STICKER", "DELETED"]]);
  });

  it("allows the owner, an administrator, or a platform owner, but not builder.manage or Manage Server alone", async () => {
    const other = { userId: "300000000000000099", displayName: "Not owner", roleIds: ["600000000000000102"] };
    const { service } = await wipeSetup({ ownerId: "300000000000000001" });
    /* Owner (matches ownerId) is allowed. */
    await expect(service.startWipe(GUILD, WIPE_ALL, { userId: "300000000000000001", displayName: "Owner" })).resolves.toMatchObject({ mode: "WIPE" });
    /* A non-owner without an admin role is refused. */
    const denied = await wipeSetup({ ownerId: "300000000000000001" });
    await expect(denied.service.startWipe(GUILD, WIPE_ALL, other)).rejects.toMatchObject({ code: "FORBIDDEN", message: "Only the server owner or an administrator can wipe the server." });
    /* Manage Server only is not enough. */
    const manageServer = await wipeSetup({ ownerId: "300000000000000001" });
    manageServer.gateway.roles = manageServer.gateway.roles.map((role) => (role.id === "600000000000000102" ? { ...role, permissions: String(1n << 5n) } : role));
    await expect(manageServer.service.startWipe(GUILD, WIPE_ALL, other)).rejects.toMatchObject({ code: "FORBIDDEN" });
    /* An Administrator role is allowed. */
    const admin = await wipeSetup({ ownerId: "300000000000000001" });
    admin.gateway.roles = admin.gateway.roles.map((role) => (role.id === "600000000000000102" ? { ...role, permissions: "8" } : role));
    await expect(admin.service.startWipe(GUILD, WIPE_ALL, other)).resolves.toMatchObject({ mode: "WIPE" });
    /* A platform owner is allowed even without an owner or admin match. */
    const platform = await wipeSetup({ ownerId: "300000000000000001" });
    await expect(platform.service.startWipe(GUILD, WIPE_ALL, other, { platformOwner: true })).resolves.toMatchObject({ mode: "WIPE" });
  });

  it("requires the typed server name and rate-limits wipes", async () => {
    const { service, settle } = await wipeSetup();
    await expect(service.startWipe(GUILD, { ...WIPE_ALL, confirmName: "test city" }, starter)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await service.startWipe(GUILD, WIPE_ALL, starter);
    await settle();
    await expect(service.startWipe(GUILD, WIPE_ALL, starter)).rejects.toMatchObject({ code: "LIMIT_REACHED" });
  });

  it("previews counts and the kept list", async () => {
    const { service } = await wipeSetup();
    const preview = await service.wipePreview(GUILD);
    expect(preview).toMatchObject({ serverName: "Test City", channels: 2, categories: 1, roles: 1, emojis: 1, stickers: 1, community: true });
    expect(preview.kept.some((line) => line.includes("Above"))).toBe(true);
    expect(preview.kept.some((line) => line.includes("Community"))).toBe(true);
  });

  it("turns the snapshot back into a blueprint draft, mapping overwrites and dropping member and unknown bits", async () => {
    const { service, settle } = await wipeSetup();
    const run = await service.startWipe(GUILD, WIPE_ALL, starter);
    await settle();
    const result = await service.loadBlueprintFromRun(GUILD, run.id, starter);
    const roleNames = result.draft.blueprint.roles.map((role) => role.name);
    expect(roleNames).toEqual(["Above", "Member"]);
    expect(roleNames).not.toContain("@everyone");
    expect(roleNames).not.toContain("Qbox");
    const general = result.draft.blueprint.categories.flatMap((category) => category.channels).find((channel) => channel.name === "general");
    expect(general?.overwrites).toEqual([{ target: "@everyone", allow: [], deny: ["ViewChannel"] }]);
    expect(result.notes.some((note) => note.includes("specific members"))).toBe(true);
    expect((await service.draft(GUILD))?.blueprint.categories.length).toBeGreaterThan(0);
  });

  it("wipes then builds in one run", async () => {
    const { service, gateway, settle } = await wipeSetup();
    await service.saveDraft({ guildId: GUILD, answers: templateFor("COMMUNITY").answers, blueprint: small, expectedRevision: 0 });
    const run = await service.startRun(GUILD, { mode: "WIPE_AND_BUILD", links: ["moderation"], confirmName: "Test City", include: { channels: true, roles: true, emojis: false } }, starter);
    expect(run.mode).toBe("WIPE_AND_BUILD");
    await settle();
    const detail = await service.run(GUILD, run.id);
    expect(detail.items.some((item) => item.status === "DELETED")).toBe(true);
    expect(detail.items.some((item) => item.status === "CREATED" && item.kind === "CHANNEL")).toBe(true);
    expect(detail.items.some((item) => item.kind === "LINK" && item.status === "CREATED")).toBe(true);
    expect(gateway.channels.some((channel) => channel.name === "general")).toBe(true);
  });
});

describe("DiscordRestBuilderGateway", () => {
  it("reads bot permissions and treats already-deleted items as deleted", async () => {
    const calls: string[] = [];
    const rest = {
      get: async (route: string) => {
        calls.push(`GET ${route}`);
        if (route === "/users/@me") return { id: BOT_ID };
        if (route === `/guilds/${GUILD}`) return { features: ["COMMUNITY"] };
        if (route.endsWith("/roles")) return [{ id: GUILD, name: "@everyone", position: 0, permissions: "1024" }, { id: "5", name: "Qbox", position: 4, permissions: "268435472", managed: true }, { id: "6", name: "Top", position: 7, permissions: "0" }];
        return { roles: ["5"] };
      },
      post: async () => ({ id: "42" }),
      patch: async () => undefined,
      put: async () => undefined,
      delete: async () => { throw Object.assign(new Error("Unknown Channel"), { status: 404 }); },
    };
    const gateway = new DiscordRestBuilderGateway(rest);
    expect(await gateway.botStatus(GUILD)).toEqual({ userId: BOT_ID, permissions: 1024n | 268435472n, topRolePosition: 4, highestRolePosition: 7, community: true });
    await expect(gateway.deleteChannel("1", "undo")).resolves.toBeUndefined();
    expect(await gateway.createChannel(GUILD, { name: "x", type: 0, overwrites: [] }, "r")).toBe("42");
  });

  it("sends forum tags, the default reaction, and creates and pins the first post", async () => {
    const calls: { method: string; route: string; body: unknown }[] = [];
    const rest = {
      get: async () => ({}),
      post: async (route: string, options?: { body?: unknown }) => { calls.push({ method: "POST", route, body: options?.body }); return { id: "77" }; },
      patch: async (route: string, options?: { body?: unknown }) => { calls.push({ method: "PATCH", route, body: options?.body }); return undefined; },
      put: async () => undefined,
      delete: async () => undefined,
    };
    const gateway = new DiscordRestBuilderGateway(rest);
    await gateway.createChannel(GUILD, { name: "help", type: 15, overwrites: [], topic: "Rules", tags: [{ name: "Question", emoji: "❓" }, { name: "Custom", emoji: "pepe:123456789012345678" }, { name: "Plain" }], defaultReactionEmoji: "👍" }, "r");
    expect(calls[0]?.body).toMatchObject({
      topic: "Rules",
      available_tags: [{ name: "Question", moderated: false, emoji_name: "❓", emoji_id: null }, { name: "Custom", moderated: false, emoji_id: "123456789012345678", emoji_name: null }, { name: "Plain", moderated: false }],
      default_reaction_emoji: { emoji_name: "👍", emoji_id: null },
    });
    expect(await gateway.createForumPost("77", { title: "Read me", content: "Hi" }, "r")).toEqual({ threadId: "77" });
    expect(calls[1]).toEqual({ method: "POST", route: "/channels/77/threads", body: { name: "Read me", message: { content: "Hi" }, applied_tags: [] } });
    await gateway.pinForumPost("77", "r");
    expect(calls[2]).toEqual({ method: "PATCH", route: "/channels/77", body: { flags: 2 } });
  });
});
