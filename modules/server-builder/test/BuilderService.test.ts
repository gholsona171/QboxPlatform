import { describe, expect, it } from "vitest";

import {
  BuilderService,
  DiscordRestBuilderGateway,
  InMemoryBuilderRepository,
  PRESETS,
  generateBlueprint,
  templateFor,
  type BotStatus,
  type BuilderBlueprint,
  type BuilderGateway,
  type BuilderLink,
  type BuilderLinkPort,
  type BuilderResolvedIds,
  type ChannelCreateInput,
  type ExistingChannel,
  type ExistingRole,
  type RoleCreateInput,
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
  private next = 1000;

  public async listRoles() { return [...this.roles]; }
  public async listChannels() { return this.channels.map(({ input: _input, ...channel }) => channel); }
  public async botStatus() { return this.status; }
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
  public async deleteChannel(channelId: string) {
    this.deleted.push(channelId);
    this.channels = this.channels.filter((channel) => channel.id !== channelId);
  }
  public async deleteRole(_guild: string, roleId: string) {
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
        { key: "help", name: "help", type: "FORUM", slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: [] },
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
});
