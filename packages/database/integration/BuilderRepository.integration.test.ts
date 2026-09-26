import { PrismaClientFactory } from "@qbox/prisma";
import { generateBlueprint, templateFor } from "@qbox/server-builder";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaBuilderRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for server builder repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing server builder cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaBuilderRepository(client);
const guildId = "1257928923048837201";

beforeAll(async () => client.$connect());
beforeEach(async () => {
  await client.$executeRawUnsafe('TRUNCATE TABLE "builder_run_items", "builder_runs", "builder_drafts"');
});
afterAll(async () => client.$disconnect());

describe("PrismaBuilderRepository", () => {
  it("round-trips drafts with revisions", async () => {
    const answers = templateFor("FIVEM_RP").answers;
    const blueprint = generateBlueprint(answers);
    const saved = await repository.saveDraft({ guildId, answers, blueprint, updatedById: "804859666655739997", expectedRevision: 0 });
    expect(saved.revision).toBe(1);
    const loaded = await repository.getDraft(guildId);
    expect(loaded?.blueprint).toEqual(JSON.parse(JSON.stringify(blueprint)));
    expect(loaded?.answers.departments).toEqual(answers.departments);
    await expect(repository.saveDraft({ guildId, answers, blueprint, expectedRevision: 0 })).rejects.toMatchObject({ code: "CONFLICT" });
    expect((await repository.saveDraft({ guildId, answers, blueprint, expectedRevision: 1 })).revision).toBe(2);
  });

  it("records runs and items in order and fails interrupted runs", async () => {
    const run = await repository.createRun({ guildId, mode: "ADD", links: ["moderation"], planned: 3, startedById: "804859666655739997", startedByName: "Jay" });
    expect(run).toMatchObject({ status: "QUEUED", done: 0, links: ["moderation"], warnings: [] });
    expect((await repository.findActiveRun(guildId))?.id).toBe(run.id);
    const first = await repository.addItem({ runId: run.id, kind: "ROLE", key: "staff-owner", name: "Owner", status: "CREATED", discordId: "1262656532902842425" });
    await repository.addItem({ runId: run.id, kind: "CHANNEL", key: "general", name: "general", status: "SKIPPED", discordId: "1262656532902842426", note: "Already in the server." });
    await repository.addItem({ runId: run.id, kind: "LINK", key: "moderation", name: "Moderation", status: "FAILED", error: "Nope" });
    await repository.updateItem(first.id, { status: "DELETED" });
    const items = await repository.listItems(run.id);
    expect(items.map((item) => [item.key, item.status])).toEqual([["staff-owner", "DELETED"], ["general", "SKIPPED"], ["moderation", "FAILED"]]);
    expect(items[1]?.note).toBe("Already in the server.");
    const updated = await repository.updateRun(run.id, { status: "RUNNING", done: 1, skipped: 1, failed: 1, warnings: ["Roles not moved."], startedAt: new Date() });
    expect(updated).toMatchObject({ status: "RUNNING", done: 1, warnings: ["Roles not moved."] });
    expect(await repository.failActiveRuns("Restarted.", new Date())).toBe(1);
    expect(await repository.getRun(guildId, run.id)).toMatchObject({ status: "FAILED", error: "Restarted." });
    expect(await repository.getRun(guildId, "not-a-uuid")).toBeUndefined();
    expect(await repository.findActiveRun(guildId)).toBeUndefined();
    expect((await repository.updateRun(run.id, { error: null })).error).toBeUndefined();
    expect(await repository.listRuns(guildId, 10)).toHaveLength(1);
  });

  it("stores a wipe run with its snapshot and the new statuses and kinds", async () => {
    const snapshot = {
      guildName: "Test City",
      botUserId: "900000000000000001",
      community: true,
      rulesChannelId: "600000000000000201",
      roles: [{ id: "600000000000000102", name: "Member", color: 3447003, hoist: false, mentionable: false, permissions: "1024", position: 2, managed: false }],
      channels: [{ id: "600000000000000202", name: "general", type: 0, nsfw: false, slowmodeSeconds: 0, userLimit: 0, position: 0, overwrites: [] }],
      emojis: [{ id: "600000000000000300", name: "pepe" }],
      stickers: [],
    } as const;
    const run = await repository.createRun({ guildId, mode: "WIPE", links: [], planned: 3, startedById: "804859666655739997", startedByName: "Jay", snapshot });
    expect(run.mode).toBe("WIPE");
    const loaded = await repository.getRun(guildId, run.id);
    expect(loaded?.snapshot).toEqual(JSON.parse(JSON.stringify(snapshot)));
    await repository.addItem({ runId: run.id, kind: "CHANNEL", key: "600000000000000202", name: "general", status: "DELETED", discordId: "600000000000000202" });
    await repository.addItem({ runId: run.id, kind: "EMOJI", key: "600000000000000300", name: "pepe", status: "DELETED", discordId: "600000000000000300" });
    await repository.addItem({ runId: run.id, kind: "STICKER", key: "600000000000000301", name: "wave", status: "KEPT", note: "Above the role." });
    const items = await repository.listItems(run.id);
    expect(items.map((item) => [item.kind, item.status])).toEqual([["CHANNEL", "DELETED"], ["EMOJI", "DELETED"], ["STICKER", "KEPT"]]);
    const wipeAndBuild = await repository.createRun({ guildId, mode: "WIPE_AND_BUILD", links: [], planned: 0, startedById: "804859666655739997", startedByName: "Jay" });
    expect(wipeAndBuild.mode).toBe("WIPE_AND_BUILD");
    expect(wipeAndBuild.snapshot).toBeUndefined();
  });
});
