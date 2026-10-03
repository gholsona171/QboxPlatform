import { QUESTIONS_PER_PAGE } from "./types.js";
import { BRAND } from "@qbox/shared/brand";
import { ApplicationError, MAX_ANSWER_LENGTH, MAX_FORMS, MAX_PANELS, invalid, requireLength, requireSnowflake, validateForm, validatePanel, } from "./validation.js";
const DAY_MS = 86_400_000;
const DISCORD_EPOCH = 1420070400000n;
const STATUS_COLORS = {
    PENDING: "#5865F2",
    ACCEPTED: "#57F287",
    DENIED: "#ED4245",
    WITHDRAWN: "#99AAB5",
};
const STATUS_LABELS = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    DENIED: "Denied",
    WITHDRAWN: "Withdrawn",
};
const DEFAULT_ACCEPT = "Your {form} application in {server} was accepted. Welcome aboard!";
const DEFAULT_DENY = "Your {form} application in {server} was denied.";
/** When a Discord account was created, read from its user ID. */
export function accountCreatedAt(userId) {
    return new Date(Number((BigInt(userId) >> 22n) + DISCORD_EPOCH));
}
export function statusLabel(status) {
    return STATUS_LABELS[status];
}
/** Questions split into Discord form pages of five. */
export function questionPages(form) {
    const pages = [];
    for (let index = 0; index < form.questions.length; index += QUESTIONS_PER_PAGE)
        pages.push(form.questions.slice(index, index + QUESTIONS_PER_PAGE));
    return pages;
}
/** Replaces {user} {form} {number} {reason} {server} in a DM template. */
export function renderTemplate(template, values) {
    return template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}
/**
 * Application rules shared by the bot and the API.
 *
 * The caller works out who the member is (roles, and whether they hold
 * `applications.review`). This service checks eligibility, validates answers,
 * numbers applications, posts review messages, and applies decisions (roles
 * and DMs).
 */
export class ApplicationService {
    repository;
    gateway;
    now;
    constructor(repository, gateway, now = () => new Date()) {
        this.repository = repository;
        this.gateway = gateway;
        this.now = now;
    }
    /* ---------- Forms ---------- */
    async forms(guildId) {
        requireSnowflake("guildId", guildId);
        return [...(await this.repository.listForms(guildId))].sort((left, right) => left.position - right.position || left.name.localeCompare(right.name));
    }
    async form(guildId, id) {
        requireSnowflake("guildId", guildId);
        const found = await this.repository.getForm(guildId, id);
        if (!found)
            throw new ApplicationError("NOT_FOUND", "That application form was not found.");
        return found;
    }
    /** Creates a form, or updates form `id`. */
    async saveForm(input, id) {
        const normalized = {
            ...input,
            name: input.name.trim(),
            questions: input.questions.map((question) => ({
                ...question,
                label: question.label.trim(),
                choices: question.type === "CHOICE" ? question.choices.map((choice) => choice.trim()) : [],
                ...(question.type === "SHORT" || question.type === "PARAGRAPH" ? {} : { minLength: undefined, maxLength: undefined }),
            })),
        };
        validateForm(normalized);
        if (id === undefined) {
            if ((await this.repository.listForms(input.guildId)).length >= MAX_FORMS)
                throw new ApplicationError("LIMIT_REACHED", `A server can have at most ${MAX_FORMS} application forms.`);
            return this.repository.createForm(normalized);
        }
        await this.form(input.guildId, id);
        return this.repository.updateForm(id, normalized);
    }
    async deleteForm(guildId, id) {
        await this.form(guildId, id);
        await this.repository.deleteForm(guildId, id);
    }
    /* ---------- Panels ---------- */
    async panels(guildId) {
        requireSnowflake("guildId", guildId);
        return this.repository.listPanels(guildId);
    }
    async savePanel(input, id) {
        const normalized = { ...input, title: input.title.trim(), description: input.description.trim(), formIds: [...new Set(input.formIds)] };
        validatePanel(normalized);
        const forms = await this.repository.listForms(input.guildId);
        for (const formId of normalized.formIds)
            if (!forms.some((form) => form.id === formId))
                invalid("A panel form was not found.");
        if (id === undefined) {
            if ((await this.repository.listPanels(input.guildId)).length >= MAX_PANELS)
                throw new ApplicationError("LIMIT_REACHED", `A server can have at most ${MAX_PANELS} application panels.`);
            return this.repository.createPanel(normalized);
        }
        const current = await this.panel(input.guildId, id);
        if (current.messageId && current.channelId !== normalized.channelId)
            await this.gateway?.deleteMessage(current.channelId, current.messageId).catch(() => undefined);
        const updated = await this.repository.updatePanel(id, normalized);
        return current.channelId === normalized.channelId ? updated : this.repository.setPanelMessage(id, null);
    }
    /** Posts the panel, or edits its existing message. */
    async publishPanel(guildId, id) {
        const panel = await this.panel(guildId, id);
        const forms = await this.forms(guildId);
        const shown = panel.formIds.length
            ? panel.formIds.flatMap((formId) => forms.filter((form) => form.id === formId && form.enabled))
            : forms.filter((form) => form.enabled);
        if (shown.length === 0)
            throw new ApplicationError("INVALID_STATE", "Enable at least one form before posting the panel.");
        const { messageId } = await this.requireGateway().publishPanel(panel, shown);
        return this.repository.setPanelMessage(panel.id, messageId);
    }
    /** Posts a panel with every enabled form to a channel, reusing a panel already in that channel. */
    async postPanel(guildId, channelId, title, description) {
        requireSnowflake("Channel", channelId);
        const existing = (await this.panels(guildId)).find((panel) => panel.channelId === channelId);
        const input = {
            guildId,
            channelId,
            title: title ?? existing?.title ?? "Applications",
            description: description ?? existing?.description ?? "Pick a position below to apply.",
            color: existing?.color ?? "#5865F2",
            formIds: existing?.formIds ?? [],
        };
        const saved = await this.savePanel(input, existing?.id);
        return this.publishPanel(guildId, saved.id);
    }
    async deletePanel(guildId, id) {
        const panel = await this.panel(guildId, id);
        if (panel.messageId)
            await this.gateway?.deleteMessage(panel.channelId, panel.messageId).catch(() => undefined);
        await this.repository.deletePanel(guildId, id);
    }
    /* ---------- Applying ---------- */
    /** Enabled forms and whether this member can apply to each. */
    async availability(guildId, applicant) {
        const forms = (await this.forms(guildId)).filter((form) => form.enabled);
        return Promise.all(forms.map(async (form) => {
            const blocked = await this.blocker(form, applicant);
            return blocked ? { form, canApply: false, reason: blocked.message } : { form, canApply: true };
        }));
    }
    /** The form, when this member may apply to it now. */
    async requireEligible(guildId, formId, applicant) {
        const form = await this.form(guildId, formId);
        const blocked = await this.blocker(form, applicant);
        if (blocked)
            throw blocked;
        return form;
    }
    async submit(input) {
        requireSnowflake("member", input.applicant.userId);
        const form = await this.requireEligible(input.guildId, input.formId, input.applicant);
        const answers = validateAnswers(form, input.answers);
        const number = await this.repository.allocateNumber(input.guildId);
        let application = await this.repository.createApplication({
            guildId: input.guildId,
            number,
            formId: form.id,
            formName: form.name,
            applicantId: input.applicant.userId,
            applicantName: input.applicant.displayName.slice(0, 100),
            source: input.applicant.source,
            answers,
        });
        if (this.gateway && form.reviewChannelId) {
            const posted = await this.gateway.postReview(form.reviewChannelId, this.reviewMessage(application, form, true)).catch(() => undefined);
            if (posted)
                application = await this.repository.updateApplication(application.id, { reviewChannelId: form.reviewChannelId, reviewMessageId: posted.messageId });
        }
        if (this.gateway && form.discussionChannelId) {
            const content = [
                `<@${application.applicantId}> thanks for applying for **${form.name}**. Staff may ask you questions here.`,
                ...(form.pingMemberIds.length ? [form.pingMemberIds.map((id) => `<@${id}>`).join(" ")] : []),
                ...(form.reviewerRoleIds.length ? [form.reviewerRoleIds.map((id) => `<@&${id}>`).join(" ")] : []),
            ].join("\n");
            const thread = await this.gateway
                .createDiscussion(form.discussionChannelId, `${form.name} #${number} ${application.applicantName}`.slice(0, 100), [application.applicantId, ...form.pingMemberIds], content)
                .catch(() => undefined);
            if (thread)
                application = await this.repository.updateApplication(application.id, { threadId: thread.threadId });
        }
        return application;
    }
    async withdraw(guildId, id, applicant) {
        const application = await this.application(guildId, id);
        if (application.applicantId !== applicant.userId)
            throw new ApplicationError("FORBIDDEN", "You can only withdraw your own applications.");
        if (application.status !== "PENDING")
            throw new ApplicationError("INVALID_STATE", "Only pending applications can be withdrawn.");
        const updated = await this.repository.updateApplication(application.id, { status: "WITHDRAWN" });
        await this.refreshReview(updated);
        if (updated.threadId)
            await this.gateway?.postMessage(updated.threadId, "The applicant withdrew this application.").catch(() => undefined);
        return updated;
    }
    /** A member's own applications, newest first. */
    async mine(guildId, userId) {
        requireSnowflake("guildId", guildId);
        requireSnowflake("member", userId);
        const applications = await this.repository.listApplications({ guildId, applicantId: userId, limit: 50 });
        return applications.map((application) => ({ ...application, votes: [], notes: [] }));
    }
    /* ---------- Reviewing ---------- */
    /** True when the reviewer may review at least one form. */
    async isReviewer(guildId, reviewer) {
        if (reviewer.elevated)
            return true;
        return (await this.forms(guildId)).some((form) => canReviewForm(form, reviewer));
    }
    /** Forms this reviewer can review. */
    async reviewableForms(guildId, reviewer) {
        return (await this.forms(guildId)).filter((form) => reviewer.elevated || canReviewForm(form, reviewer));
    }
    async list(filter, reviewer) {
        requireSnowflake("guildId", filter.guildId);
        let formIds = filter.formIds;
        if (!reviewer.elevated) {
            const allowed = (await this.reviewableForms(filter.guildId, reviewer)).map((form) => form.id);
            if (allowed.length === 0)
                throw new ApplicationError("FORBIDDEN", "You can't review applications.");
            formIds = formIds ? formIds.filter((id) => allowed.includes(id)) : allowed;
            if (formIds.length === 0)
                return [];
        }
        return this.repository.listApplications({ ...filter, ...(formIds ? { formIds } : {}), limit: Math.min(Math.max(filter.limit ?? 50, 1), 200) });
    }
    async application(guildId, id) {
        requireSnowflake("guildId", guildId);
        const found = await this.repository.getApplication(guildId, id);
        if (!found)
            throw new ApplicationError("NOT_FOUND", "That application was not found.");
        return found;
    }
    async applicationByNumber(guildId, number) {
        requireSnowflake("guildId", guildId);
        const found = await this.repository.getApplicationByNumber(guildId, number);
        if (!found)
            throw new ApplicationError("NOT_FOUND", `Application #${number} was not found.`);
        return found;
    }
    /** An application the reviewer is allowed to see. */
    async review(guildId, id, reviewer) {
        const application = await this.application(guildId, id);
        await this.requireReviewer(application, reviewer);
        return application;
    }
    /** Sets a vote, or clears it with `undefined`. */
    async vote(guildId, id, reviewer, vote) {
        const application = await this.review(guildId, id, reviewer);
        if (application.status !== "PENDING")
            throw new ApplicationError("INVALID_STATE", "Voting is closed for this application.");
        if (application.applicantId === reviewer.userId)
            throw new ApplicationError("FORBIDDEN", "You can't vote on your own application.");
        const updated = await this.repository.setVote(application.id, reviewer.userId, vote);
        await this.refreshReview(updated);
        return updated;
    }
    /** Votes, or removes the vote when the reviewer presses the same button again. */
    async toggleVote(guildId, id, reviewer, vote) {
        const application = await this.application(guildId, id);
        const current = application.votes.find((item) => item.userId === reviewer.userId)?.vote;
        return this.vote(guildId, id, reviewer, current === vote ? undefined : vote);
    }
    async addNote(guildId, id, reviewer, body) {
        const text = body.trim();
        requireLength("Note", text, 1, 1000);
        const application = await this.review(guildId, id, reviewer);
        return this.repository.addNote(application.id, reviewer.userId, reviewer.displayName.slice(0, 100), text);
    }
    /** Accepts (roles and DM) or denies (DM) a pending application. */
    async decide(guildId, id, reviewer, decision, reason) {
        const application = await this.review(guildId, id, reviewer);
        if (application.status !== "PENDING")
            throw new ApplicationError("INVALID_STATE", `Application #${application.number} is already ${statusLabel(application.status).toLowerCase()}.`);
        if (application.applicantId === reviewer.userId)
            throw new ApplicationError("FORBIDDEN", "You can't decide your own application.");
        const text = reason?.trim() || undefined;
        if (text !== undefined)
            requireLength("Reason", text, 1, 1000);
        const form = application.formId ? await this.repository.getForm(guildId, application.formId) : undefined;
        const gateway = this.requireGateway();
        const audit = `Application #${application.number} accepted by ${reviewer.displayName}`.slice(0, 512);
        if (decision === "ACCEPTED" && form) {
            try {
                if (form.acceptRoleIds.length)
                    await gateway.addRoles(guildId, application.applicantId, form.acceptRoleIds, audit);
                if (form.removeRoleIds.length)
                    await gateway.removeRoles(guildId, application.applicantId, form.removeRoleIds, audit);
            }
            catch {
                throw new ApplicationError("INVALID_STATE", `Could not change the member's roles. Check that they are still in the server and the ${BRAND.name} role (the bot's role) is above those roles.`);
            }
        }
        const server = await gateway.guildName(guildId).catch(() => "the server");
        const dmDelivered = await gateway.directMessage(application.applicantId, this.decisionEmbed(application, form, decision, text, server)).catch(() => false);
        const updated = await this.repository.updateApplication(application.id, {
            status: decision,
            decidedById: reviewer.userId,
            decidedByName: reviewer.displayName.slice(0, 100),
            decisionReason: text ?? null,
            decidedAt: this.now(),
            dmDelivered,
        });
        await this.refreshReview(updated, form);
        if (updated.threadId)
            await gateway.postMessage(updated.threadId, `This application was **${statusLabel(decision).toLowerCase()}** by <@${reviewer.userId}>.${text ? `\n**Reason:** ${text}` : ""}`).catch(() => undefined);
        return updated;
    }
    async stats(guildId, reviewer) {
        requireSnowflake("guildId", guildId);
        if (!(await this.isReviewer(guildId, reviewer)))
            throw new ApplicationError("FORBIDDEN", "You can't review applications.");
        return this.repository.stats(guildId, this.now());
    }
    /* ---------- Internals ---------- */
    async blocker(form, applicant) {
        if (!form.enabled)
            return new ApplicationError("INVALID_STATE", `${form.name} applications are closed.`);
        if (form.blockedRoleIds.some((id) => applicant.roleIds.includes(id)))
            return new ApplicationError("FORBIDDEN", `You can't apply for ${form.name}.`);
        if (form.requiredRoleIds.length && !form.requiredRoleIds.some((id) => applicant.roleIds.includes(id)))
            return new ApplicationError("FORBIDDEN", `You don't have a role needed to apply for ${form.name}.`);
        if (form.minAccountAgeDays !== undefined) {
            const ageDays = (this.now().getTime() - accountCreatedAt(applicant.userId).getTime()) / DAY_MS;
            if (ageDays < form.minAccountAgeDays)
                return new ApplicationError("FORBIDDEN", `Your Discord account must be at least ${form.minAccountAgeDays} days old to apply.`);
        }
        const previous = await this.repository.listForApplicant(form.guildId, form.id, applicant.userId);
        const pending = previous.find((item) => item.status === "PENDING");
        if (form.onePending && pending)
            return new ApplicationError("LIMIT_REACHED", `You already have a pending ${form.name} application (#${pending.number}).`);
        const denied = previous.find((item) => item.status === "DENIED" && item.decidedAt);
        if (form.cooldownDays > 0 && denied?.decidedAt) {
            const until = new Date(denied.decidedAt.getTime() + form.cooldownDays * DAY_MS);
            if (until > this.now())
                return new ApplicationError("LIMIT_REACHED", `You can apply for ${form.name} again after ${until.toISOString().slice(0, 10)}.`);
        }
        return undefined;
    }
    async requireReviewer(application, reviewer) {
        const form = application.formId ? await this.repository.getForm(application.guildId, application.formId) : undefined;
        if (reviewer.elevated || (form && canReviewForm(form, reviewer)))
            return form;
        throw new ApplicationError("FORBIDDEN", "You can't review this application.");
    }
    async refreshReview(application, form) {
        if (!this.gateway || !application.reviewChannelId || !application.reviewMessageId)
            return;
        const current = form ?? (application.formId ? await this.repository.getForm(application.guildId, application.formId) : undefined);
        await this.gateway.updateReview(application.reviewChannelId, application.reviewMessageId, this.reviewMessage(application, current, false)).catch(() => undefined);
    }
    reviewMessage(application, form, initial) {
        const upvotes = application.votes.filter((vote) => vote.vote === "UP").length;
        const downvotes = application.votes.length - upvotes;
        const pings = form?.pingMemberIds ?? [];
        const budget = Math.min(1024, Math.max(100, Math.floor(4500 / Math.max(application.answers.length, 1))));
        const status = application.status === "PENDING"
            ? "Pending"
            : application.status === "WITHDRAWN"
                ? "Withdrawn by the applicant"
                : `${statusLabel(application.status)} by <@${application.decidedById}>`;
        return {
            ...(initial ? { content: `New ${application.formName} application from <@${application.applicantId}>${pings.length ? ` ${pings.map((id) => `<@${id}>`).join(" ")}` : ""}` } : {}),
            mentionUserIds: pings,
            applicationId: application.id,
            upvotes,
            downvotes,
            closed: application.status !== "PENDING",
            embed: {
                title: `Application #${application.number} · ${application.formName}`.slice(0, 256),
                description: [
                    `**Applicant:** <@${application.applicantId}> (${application.applicantName})`,
                    `**Account created:** <t:${Math.floor(accountCreatedAt(application.applicantId).getTime() / 1000)}:R>`,
                    `**Status:** ${status}`,
                    ...(application.decisionReason ? [`**Reason:** ${application.decisionReason}`] : []),
                    ...(application.threadId ? [`**Discussion:** <#${application.threadId}>`] : []),
                    `**Votes:** 👍 ${upvotes} · 👎 ${downvotes}`,
                ].join("\n"),
                color: STATUS_COLORS[application.status],
                fields: application.answers.slice(0, 25).map((answer) => ({ name: answer.question.slice(0, 256), value: truncate(answer.answer || "—", budget) })),
                footer: `Applicant ID ${application.applicantId}${application.source === "WEB" ? " · sent from the portal" : ""}`,
            },
        };
    }
    decisionEmbed(application, form, decision, reason, server) {
        const template = (decision === "ACCEPTED" ? form?.acceptMessage : form?.denyMessage) ?? (decision === "ACCEPTED" ? DEFAULT_ACCEPT : DEFAULT_DENY);
        const description = renderTemplate(template, {
            user: `<@${application.applicantId}>`,
            form: application.formName,
            number: String(application.number),
            reason: reason ?? "No reason given",
            server,
        });
        return {
            title: decision === "ACCEPTED" ? "Your application was accepted" : "Your application was denied",
            description: description.slice(0, 4000),
            color: STATUS_COLORS[decision],
            fields: reason && !template.includes("{reason}") ? [{ name: "Reason", value: reason }] : [],
            footer: `Application #${application.number}`,
        };
    }
    async panel(guildId, id) {
        requireSnowflake("guildId", guildId);
        const found = await this.repository.getPanel(guildId, id);
        if (!found)
            throw new ApplicationError("NOT_FOUND", "That panel was not found.");
        return found;
    }
    requireGateway() {
        if (!this.gateway)
            throw new ApplicationError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
        return this.gateway;
    }
}
export function canReviewForm(form, reviewer) {
    return reviewer.elevated || form.reviewerRoleIds.some((id) => reviewer.roleIds.includes(id));
}
/** Checks answers against the form and returns them in question order. */
export function validateAnswers(form, answers) {
    return form.questions.flatMap((question) => {
        const raw = (answers[question.id] ?? "").trim();
        if (!raw) {
            if (question.required)
                invalid(`"${question.label}" needs an answer.`);
            return [];
        }
        let answer = raw;
        if (question.type === "YES_NO") {
            const lower = raw.toLowerCase();
            if (lower !== "yes" && lower !== "no")
                invalid(`"${question.label}" must be Yes or No.`);
            answer = lower === "yes" ? "Yes" : "No";
        }
        else if (question.type === "CHOICE") {
            const match = question.choices.find((choice) => choice.toLowerCase() === raw.toLowerCase());
            if (!match)
                invalid(`"${question.label}" must be one of the listed choices.`);
            answer = match;
        }
        else {
            const min = question.minLength ?? 0;
            const max = question.maxLength ?? MAX_ANSWER_LENGTH;
            if (raw.length < min || raw.length > max)
                invalid(`"${question.label}" must be between ${min} and ${max} characters.`);
        }
        return [{ questionId: question.id, question: question.label, answer }];
    });
}
function truncate(value, max) {
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
//# sourceMappingURL=ApplicationService.js.map