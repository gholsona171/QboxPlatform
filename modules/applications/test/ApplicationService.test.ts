import { describe, expect, it } from "vitest";

import {
  ApplicationService,
  DiscordRestApplicationGateway,
  InMemoryApplicationRepository,
  accountCreatedAt,
  questionPages,
  renderTemplate,
  type Applicant,
  type ApplicationEmbed,
  type ApplicationForm,
  type ApplicationFormInput,
  type ApplicationGateway,
  type ApplicationPanel,
  type ReviewMessage,
  type Reviewer,
} from "../src/index.js";

const GUILD = "100000000000000001";
const REVIEW_CHANNEL = "500000000000000001";
const THREAD_CHANNEL = "500000000000000002";
const STAFF_ROLE = "400000000000000001";
const MEMBER_ROLE = "400000000000000002";
const BLOCKED_ROLE = "400000000000000003";
const REVIEWER_ROLE = "400000000000000004";
/** A user ID created in 2021, so the account is old. */
const APPLICANT: Applicant = { userId: "800000000000000000", displayName: "Alex", roleIds: [MEMBER_ROLE], source: "DISCORD" };
const ADMIN: Reviewer = { userId: "300000000000000001", displayName: "Jay", roleIds: [], elevated: true, source: "DISCORD" };
const ROLE_REVIEWER: Reviewer = { userId: "300000000000000002", displayName: "Sam", roleIds: [REVIEWER_ROLE], elevated: false, source: "WEB" };
const OUTSIDER: Reviewer = { userId: "300000000000000003", displayName: "Kim", roleIds: [], elevated: false, source: "WEB" };

class FakeGateway implements ApplicationGateway {
  public readonly calls: string[] = [];
  public readonly reviews: ReviewMessage[] = [];
  public readonly dms: ApplicationEmbed[] = [];
  public rolesFail = false;

  public async postReview(_c: string, message: ReviewMessage) { this.reviews.push(message); return { messageId: "700000000000000001" }; }
  public async updateReview(_c: string, _m: string, message: ReviewMessage) { this.reviews.push(message); }
  public async createDiscussion(channelId: string, _name: string, members: readonly string[]) { this.calls.push(`thread ${channelId} ${members.join(",")}`); return { threadId: "600000000000000001" }; }
  public async postMessage(channelId: string, content: string) { this.calls.push(`post ${channelId} ${content.split("\n")[0]}`); }
  public async addRoles(_g: string, userId: string, roles: readonly string[]) { if (this.rolesFail) throw new Error("Missing Permissions"); this.calls.push(`add ${userId} ${roles.join(",")}`); }
  public async removeRoles(_g: string, userId: string, roles: readonly string[]) { this.calls.push(`remove ${userId} ${roles.join(",")}`); }
  public async directMessage(_u: string, embed: ApplicationEmbed) { this.dms.push(embed); return true; }
  public async publishPanel(_p: ApplicationPanel, forms: readonly ApplicationForm[]) { this.calls.push(`panel ${forms.map((form) => form.name).join(",")}`); return { messageId: "700000000000000009" }; }
  public async deleteMessage(_c: string, messageId: string) { this.calls.push(`delete ${messageId}`); }
  public async guildName() { return "Qbox City"; }
}

function formInput(overrides: Partial<ApplicationFormInput> = {}): ApplicationFormInput {
  return {
    guildId: GUILD,
    name: "Staff",
    description: "Join the staff team.",
    enabled: true,
    questions: [
      { id: "age", label: "How old are you?", type: "SHORT", required: true, maxLength: 3, choices: [] },
      { id: "why", label: "Why do you want to join?", type: "PARAGRAPH", required: true, minLength: 10, choices: [] },
      { id: "mic", label: "Do you have a microphone?", type: "YES_NO", required: true, choices: [] },
      { id: "tz", label: "Time zone", type: "CHOICE", required: false, choices: ["EU", "NA", "Asia"] },
    ],
    cooldownDays: 7,
    onePending: true,
    requiredRoleIds: [MEMBER_ROLE],
    blockedRoleIds: [BLOCKED_ROLE],
    reviewChannelId: REVIEW_CHANNEL,
    reviewerRoleIds: [REVIEWER_ROLE],
    pingMemberIds: ["300000000000000009"],
    acceptRoleIds: [STAFF_ROLE],
    removeRoleIds: [MEMBER_ROLE],
    acceptMessage: "Welcome {user} to {form} on {server}!",
    denyMessage: "Sorry, {form} was denied: {reason}",
    discussionChannelId: THREAD_CHANNEL,
    buttonStyle: "PRIMARY",
    position: 0,
    ...overrides,
  };
}

const ANSWERS = { age: "21", why: "I like helping people out.", mic: "yes", tz: "eu" };

async function setup(overrides: Partial<ApplicationFormInput> = {}) {
  let clock = new Date("2026-09-25T12:00:00.000Z");
  const now = () => clock;
  const gateway = new FakeGateway();
  const repository = new InMemoryApplicationRepository(now);
  const service = new ApplicationService(repository, gateway, now);
  const form = await service.saveForm(formInput(overrides));
  return { service, gateway, repository, form, advance: (days: number) => { clock = new Date(clock.getTime() + days * 86_400_000); } };
}

describe("ApplicationService forms and panels", () => {
  it("validates forms with readable messages", async () => {
    const { service } = await setup();
    await expect(service.saveForm(formInput({ questions: [] }))).rejects.toThrow("at least one question");
    await expect(service.saveForm(formInput({ questions: Array.from({ length: 26 }, (_, index) => ({ id: `q${index}`, label: "Q", type: "SHORT" as const, required: false, choices: [] })) }))).rejects.toThrow("at most 25 questions");
    await expect(service.saveForm(formInput({ questions: [{ id: "c", label: "Pick", type: "CHOICE", required: true, choices: ["Only"] }] }))).rejects.toThrow("between 2 and 25 choices");
    await expect(service.saveForm(formInput({ removeRoleIds: [STAFF_ROLE] }))).rejects.toThrow("both given and removed");
  });

  it("rejects stale form edits", async () => {
    const { service, form } = await setup();
    const updated = await service.saveForm({ ...formInput({ name: "Staff team" }), expectedRevision: form.revision }, form.id);
    expect(updated).toMatchObject({ name: "Staff team", revision: 2 });
    await expect(service.saveForm({ ...formInput(), expectedRevision: 1 }, form.id)).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("splits questions into pages of five", async () => {
    const { form } = await setup({ questions: Array.from({ length: 12 }, (_, index) => ({ id: `q${index}`, label: `Q${index}`, type: "SHORT" as const, required: false, choices: [] })) });
    expect(questionPages(form).map((page) => page.length)).toEqual([5, 5, 2]);
  });

  it("posts a panel with enabled forms and reuses the panel in a channel", async () => {
    const { service, gateway } = await setup();
    await service.saveForm(formInput({ name: "Closed", enabled: false }));
    const panel = await service.postPanel(GUILD, REVIEW_CHANNEL);
    expect(panel.messageId).toBe("700000000000000009");
    expect(gateway.calls).toContain("panel Staff");
    const again = await service.postPanel(GUILD, REVIEW_CHANNEL, "Join us");
    expect(again.id).toBe(panel.id);
    expect((await service.panels(GUILD))).toHaveLength(1);
    await service.deletePanel(GUILD, panel.id);
    expect(gateway.calls).toContain("delete 700000000000000009");
  });
});

describe("ApplicationService applying", () => {
  it("submits, numbers, posts for review, pings, and opens a discussion thread", async () => {
    const { service, gateway, form } = await setup();
    const application = await service.submit({ guildId: GUILD, formId: form.id, applicant: APPLICANT, answers: ANSWERS });
    expect(application).toMatchObject({ number: 1, status: "PENDING", reviewMessageId: "700000000000000001", threadId: "600000000000000001" });
    expect(application.answers.map((answer) => answer.answer)).toEqual(["21", "I like helping people out.", "Yes", "EU"]);
    expect(gateway.reviews[0]?.content).toContain("<@300000000000000009>");
    expect(gateway.reviews[0]?.mentionUserIds).toEqual(["300000000000000009"]);
    expect(gateway.reviews[0]?.embed.fields).toHaveLength(4);
    expect(gateway.calls).toContain(`thread ${THREAD_CHANNEL} ${APPLICANT.userId},300000000000000009`);
  });

  it("validates answers", async () => {
    const { service, form } = await setup();
    const submit = (answers: Record<string, string>) => service.submit({ guildId: GUILD, formId: form.id, applicant: APPLICANT, answers });
    await expect(submit({ ...ANSWERS, why: "" })).rejects.toThrow('"Why do you want to join?" needs an answer.');
    await expect(submit({ ...ANSWERS, why: "short" })).rejects.toThrow("between 10 and 4000");
    await expect(submit({ ...ANSWERS, mic: "maybe" })).rejects.toThrow("Yes or No");
    await expect(submit({ ...ANSWERS, tz: "Mars" })).rejects.toThrow("listed choices");
  });

  it("enforces roles, account age, one pending, and the denial cooldown", async () => {
    const { service, form, advance } = await setup({ minAccountAgeDays: 30 });
    const available = async (applicant: Applicant) => (await service.availability(GUILD, applicant))[0];
    expect(await available({ ...APPLICANT, roleIds: [] })).toMatchObject({ canApply: false, reason: "You don't have a role needed to apply for Staff." });
    expect(await available({ ...APPLICANT, roleIds: [MEMBER_ROLE, BLOCKED_ROLE] })).toMatchObject({ canApply: false });
    const fresh = String((BigInt(new Date("2026-09-20T00:00:00.000Z").getTime()) - 1_420_070_400_000n) << 22n);
    expect(await available({ ...APPLICANT, userId: fresh })).toMatchObject({ canApply: false, reason: "Your Discord account must be at least 30 days old to apply." });
    expect(await available(APPLICANT)).toMatchObject({ canApply: true });

    const first = await service.submit({ guildId: GUILD, formId: form.id, applicant: APPLICANT, answers: ANSWERS });
    await expect(service.submit({ guildId: GUILD, formId: form.id, applicant: APPLICANT, answers: ANSWERS })).rejects.toMatchObject({ code: "LIMIT_REACHED" });
    await service.decide(GUILD, first.id, ADMIN, "DENIED", "Too young");
    expect((await available(APPLICANT))?.reason).toBe("You can apply for Staff again after 2026-10-02.");
    advance(8);
    expect(await available(APPLICANT)).toMatchObject({ canApply: true });
  });

  it("lets members withdraw their own pending application and hides staff data", async () => {
    const { service, form, gateway } = await setup();
    const application = await service.submit({ guildId: GUILD, formId: form.id, applicant: APPLICANT, answers: ANSWERS });
    await service.addNote(GUILD, application.id, ADMIN, "Looks good");
    expect((await service.mine(GUILD, APPLICANT.userId))[0]?.notes).toEqual([]);
    await expect(service.withdraw(GUILD, application.id, { ...APPLICANT, userId: "800000000000000001" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const withdrawn = await service.withdraw(GUILD, application.id, APPLICANT);
    expect(withdrawn.status).toBe("WITHDRAWN");
    expect(gateway.reviews.at(-1)?.closed).toBe(true);
  });
});

describe("ApplicationService reviewing", () => {
  it("accepts with roles and a templated DM", async () => {
    const { service, gateway, form } = await setup();
    const application = await service.submit({ guildId: GUILD, formId: form.id, applicant: APPLICANT, answers: ANSWERS });
    const accepted = await service.decide(GUILD, application.id, ROLE_REVIEWER, "ACCEPTED", "Great answers");
    expect(accepted).toMatchObject({ status: "ACCEPTED", decidedById: ROLE_REVIEWER.userId, decisionReason: "Great answers", dmDelivered: true });
    expect(gateway.calls).toEqual(expect.arrayContaining([`add ${APPLICANT.userId} ${STAFF_ROLE}`, `remove ${APPLICANT.userId} ${MEMBER_ROLE}`]));
    expect(gateway.dms[0]).toMatchObject({ title: "Your application was accepted", description: `Welcome <@${APPLICANT.userId}> to Staff on Qbox City!` });
    expect(gateway.dms[0]?.fields).toEqual([{ name: "Reason", value: "Great answers" }]);
    expect(gateway.reviews.at(-1)).toMatchObject({ closed: true });
    await expect(service.decide(GUILD, application.id, ADMIN, "DENIED")).rejects.toMatchObject({ code: "INVALID_STATE" });
  });

  it("denies with the reason in the template, and keeps the application pending when roles fail", async () => {
    const { service, gateway, form } = await setup();
    const application = await service.submit({ guildId: GUILD, formId: form.id, applicant: APPLICANT, answers: ANSWERS });
    gateway.rolesFail = true;
    await expect(service.decide(GUILD, application.id, ADMIN, "ACCEPTED")).rejects.toThrow("Could not change the member's roles");
    expect((await service.application(GUILD, application.id)).status).toBe("PENDING");
    await service.decide(GUILD, application.id, ADMIN, "DENIED", "Not now");
    expect(gateway.dms[0]).toMatchObject({ description: "Sorry, Staff was denied: Not now", fields: [] });
  });

  it("limits reviewers to their forms and blocks self-review", async () => {
    const { service, form } = await setup();
    const application = await service.submit({ guildId: GUILD, formId: form.id, applicant: APPLICANT, answers: ANSWERS });
    await expect(service.review(GUILD, application.id, OUTSIDER)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(service.list({ guildId: GUILD }, OUTSIDER)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(await service.list({ guildId: GUILD, statuses: ["PENDING"] }, ROLE_REVIEWER)).toHaveLength(1);
    const self: Reviewer = { ...ADMIN, userId: APPLICANT.userId };
    await expect(service.decide(GUILD, application.id, self, "ACCEPTED")).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("toggles votes and updates the review message", async () => {
    const { service, gateway, form } = await setup();
    const application = await service.submit({ guildId: GUILD, formId: form.id, applicant: APPLICANT, answers: ANSWERS });
    await service.toggleVote(GUILD, application.id, ADMIN, "UP");
    await service.toggleVote(GUILD, application.id, ROLE_REVIEWER, "DOWN");
    expect(gateway.reviews.at(-1)).toMatchObject({ upvotes: 1, downvotes: 1 });
    const cleared = await service.toggleVote(GUILD, application.id, ADMIN, "UP");
    expect(cleared.votes).toHaveLength(1);
    const switched = await service.toggleVote(GUILD, application.id, ROLE_REVIEWER, "UP");
    expect(switched.votes).toMatchObject([{ userId: ROLE_REVIEWER.userId, vote: "UP" }]);
  });

  it("reports stats with the average review time", async () => {
    const { service, form, advance } = await setup({ onePending: false });
    const first = await service.submit({ guildId: GUILD, formId: form.id, applicant: APPLICANT, answers: ANSWERS });
    await service.submit({ guildId: GUILD, formId: form.id, applicant: APPLICANT, answers: ANSWERS });
    advance(1);
    await service.decide(GUILD, first.id, ADMIN, "ACCEPTED");
    const stats = await service.stats(GUILD, ADMIN);
    expect(stats).toMatchObject({ total: 2, byStatus: { PENDING: 1, ACCEPTED: 1, DENIED: 0, WITHDRAWN: 0 }, averageReviewMinutes: 1440 });
    expect(stats.byForm[0]).toMatchObject({ formName: "Staff", total: 2, accepted: 1, pending: 1 });
  });
});

describe("helpers", () => {
  it("reads account age from a user ID and fills templates", () => {
    expect(accountCreatedAt("175928847299117063").toISOString()).toBe("2016-04-30T11:18:25.796Z");
    expect(renderTemplate("Hi {user}, {unknown}", { user: "Alex" })).toBe("Hi Alex, {unknown}");
  });

  it("builds review buttons through Discord REST", async () => {
    const posts: unknown[] = [];
    const rest = {
      get: async () => ({ name: "Qbox" }),
      post: async (_route: string, options?: { body?: unknown }) => { posts.push(options?.body); return { id: "700000000000000001" }; },
      patch: async () => undefined,
      put: async () => undefined,
      delete: async () => undefined,
    };
    const gateway = new DiscordRestApplicationGateway(rest);
    await gateway.postReview(REVIEW_CHANNEL, { applicationId: "abc", upvotes: 2, downvotes: 0, closed: false, mentionUserIds: ["300000000000000009"], content: "New", embed: { title: "T", description: "D", color: "#5865F2" } });
    expect(posts[0]).toMatchObject({
      content: "New",
      allowed_mentions: { parse: [], users: ["300000000000000009"] },
      components: [{ components: [{ custom_id: "qbox:applications:accept:abc" }, { custom_id: "qbox:applications:deny:abc" }, { label: "2" }, { label: "0" }] }],
    });
  });
});
