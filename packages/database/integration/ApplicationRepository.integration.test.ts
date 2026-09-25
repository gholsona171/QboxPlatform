import { PrismaClientFactory } from "@qbox/prisma";
import { ApplicationService, type ApplicationFormInput, type ApplicationGateway, type Reviewer } from "@qbox/applications";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { DatabaseConfiguration, PrismaApplicationRepository } from "../src/index.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for application repository integration tests.");
if (!new URL(databaseUrl).pathname.toLowerCase().includes("test")) throw new Error("Refusing application cleanup for a non-test database.");

const client = new PrismaClientFactory().create(DatabaseConfiguration.from({ databaseUrl, environment: "test" }));
const repository = new PrismaApplicationRepository(client);
const guildId = "1257928923048837201";
const applicant = { userId: "804859666655739996", displayName: "Member", roleIds: [], source: "WEB" as const };
const reviewer: Reviewer = { userId: "804859666655739997", displayName: "Staff", roleIds: [], elevated: true, source: "WEB" };

const gateway: ApplicationGateway = {
  postReview: async () => ({ messageId: "1432100000000000001" }),
  updateReview: async () => undefined,
  createDiscussion: async () => ({ threadId: "1432100000000000002" }),
  postMessage: async () => undefined,
  addRoles: async () => undefined,
  removeRoles: async () => undefined,
  directMessage: async () => true,
  publishPanel: async () => ({ messageId: "1432100000000000003" }),
  deleteMessage: async () => undefined,
  guildName: async () => "Qbox",
};

/** Real time, because the database stamps createdAt itself. */
let clock = new Date();
const service = new ApplicationService(repository, gateway, () => clock);

const formInput: ApplicationFormInput = {
  guildId,
  name: "Whitelist",
  enabled: true,
  questions: [
    { id: "name", label: "Character name", type: "SHORT", required: true, maxLength: 50, choices: [] },
    { id: "rules", label: "Did you read the rules?", type: "YES_NO", required: true, choices: [] },
    { id: "role", label: "Preferred job", type: "CHOICE", required: false, choices: ["Police", "EMS"] },
  ],
  cooldownDays: 3,
  onePending: true,
  requiredRoleIds: [],
  blockedRoleIds: [],
  reviewChannelId: "1262656532902842425",
  reviewerRoleIds: ["1262656532902842426"],
  pingMemberIds: [],
  acceptRoleIds: ["1262656532902842427"],
  removeRoleIds: [],
  denyMessage: "Denied: {reason}",
  buttonStyle: "SUCCESS",
  position: 0,
};

beforeAll(async () => client.$connect());
beforeEach(async () => {
  clock = new Date();
  await client.$executeRawUnsafe('TRUNCATE TABLE "application_notes", "application_votes", "applications", "application_panels", "application_forms", "application_counters"');
});
afterAll(async () => client.$disconnect());

describe("PrismaApplicationRepository", () => {
  it("round-trips forms with questions and rejects stale edits", async () => {
    const form = await service.saveForm(formInput);
    expect(form).toMatchObject({ name: "Whitelist", revision: 1, buttonStyle: "SUCCESS", reviewChannelId: "1262656532902842425" });
    expect(form.questions[2]).toEqual({ id: "role", label: "Preferred job", type: "CHOICE", required: false, choices: ["Police", "EMS"] });
    const updated = await service.saveForm({ ...formInput, minAccountAgeDays: 7, expectedRevision: 1 }, form.id);
    expect(updated).toMatchObject({ revision: 2, minAccountAgeDays: 7 });
    await expect(service.saveForm({ ...formInput, expectedRevision: 1 }, form.id)).rejects.toMatchObject({ code: "CONFLICT" });
    expect(await repository.getForm(guildId, "not-a-uuid")).toBeUndefined();
  });

  it("numbers applications without gaps under concurrency", async () => {
    const numbers = await Promise.all(Array.from({ length: 12 }, () => repository.allocateNumber(guildId)));
    expect([...numbers].sort((a, b) => a - b)).toEqual(Array.from({ length: 12 }, (_, index) => index + 1));
  });

  it("stores submissions, votes, notes, decisions, and stats", async () => {
    const form = await service.saveForm(formInput);
    const application = await service.submit({ guildId, formId: form.id, applicant, answers: { name: "John Doe", rules: "Yes", role: "ems" } });
    expect(application).toMatchObject({ number: 1, status: "PENDING", reviewMessageId: "1432100000000000001" });
    expect(application.answers).toEqual([
      { questionId: "name", question: "Character name", answer: "John Doe" },
      { questionId: "rules", question: "Did you read the rules?", answer: "Yes" },
      { questionId: "role", question: "Preferred job", answer: "EMS" },
    ]);
    await service.vote(guildId, application.id, reviewer, "UP");
    await service.vote(guildId, application.id, { ...reviewer, userId: "804859666655739998" }, "DOWN");
    await service.vote(guildId, application.id, reviewer, "DOWN");
    const noted = await service.addNote(guildId, application.id, reviewer, "Checked references");
    expect(noted.votes.map((vote) => vote.vote)).toEqual(["DOWN", "DOWN"]);
    expect(noted.notes[0]).toMatchObject({ body: "Checked references", authorName: "Staff" });
    clock = new Date(clock.getTime() + 90 * 60_000);
    const denied = await service.decide(guildId, application.id, reviewer, "DENIED", "Incomplete");
    expect(denied).toMatchObject({ status: "DENIED", decisionReason: "Incomplete", dmDelivered: true });
    await expect(service.requireEligible(guildId, form.id, applicant)).rejects.toMatchObject({ code: "LIMIT_REACHED" });
    expect((await service.list({ guildId, search: "#1" }, reviewer))[0]?.number).toBe(1);
    expect(await service.list({ guildId, statuses: ["PENDING"] }, reviewer)).toHaveLength(0);
    expect(await service.mine(guildId, applicant.userId)).toHaveLength(1);
    const stats = await service.stats(guildId, reviewer);
    expect(stats).toMatchObject({ total: 1, byStatus: { DENIED: 1, PENDING: 0 }, averageReviewMinutes: 90 });
    expect(stats.byForm[0]).toMatchObject({ formId: form.id, formName: "Whitelist", denied: 1 });
    await service.deleteForm(guildId, form.id);
    expect((await service.application(guildId, application.id)).formId).toBeUndefined();
  });

  it("publishes panels and keeps their message", async () => {
    const form = await service.saveForm(formInput);
    const panel = await service.postPanel(guildId, "1262656532902842430", "Apply here");
    expect(panel).toMatchObject({ messageId: "1432100000000000003", title: "Apply here", formIds: [] });
    const edited = await service.savePanel({ guildId, channelId: panel.channelId, title: "Apply", description: "Pick one", color: "#57F287", formIds: [form.id] }, panel.id);
    expect(edited).toMatchObject({ messageId: "1432100000000000003", formIds: [form.id] });
    await service.deletePanel(guildId, panel.id);
    expect(await service.panels(guildId)).toHaveLength(0);
  });
});
