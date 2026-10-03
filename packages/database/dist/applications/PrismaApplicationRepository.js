import { APPLICATION_STATUSES, ApplicationError, QUESTION_TYPES, } from "@qbox/applications";
const WITH_REVIEW = { votes: { orderBy: { createdAt: "asc" } }, notes: { orderBy: { createdAt: "asc" } } };
/** PostgreSQL application forms, panels, and submissions. `guildId` is the Discord guild ID. */
export class PrismaApplicationRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async listForms(guildId) {
        const rows = await this.client.applicationForm.findMany({ where: { guildId }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
        return rows.map(mapForm);
    }
    async getForm(guildId, id) {
        if (!isUuid(id))
            return undefined;
        const row = await this.client.applicationForm.findFirst({ where: { guildId, id } });
        return row ? mapForm(row) : undefined;
    }
    async createForm(input) {
        return mapForm(await this.client.applicationForm.create({ data: { guildId: input.guildId, ...formData(input) } }));
    }
    async updateForm(id, input) {
        const result = await this.client.applicationForm.updateMany({
            where: { id, guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
            data: { ...formData(input), revision: { increment: 1 } },
        });
        if (result.count === 0) {
            const current = await this.client.applicationForm.findFirst({ where: { id, guildId: input.guildId }, select: { revision: true } });
            if (!current)
                throw new ApplicationError("NOT_FOUND", "That application form was not found.");
            throw new ApplicationError("CONFLICT", "This form changed since it was loaded.", { currentRevision: current.revision });
        }
        return mapForm(await this.client.applicationForm.findUniqueOrThrow({ where: { id } }));
    }
    async deleteForm(guildId, id) {
        await this.client.applicationForm.deleteMany({ where: { guildId, id } });
    }
    async listPanels(guildId) {
        const rows = await this.client.applicationPanel.findMany({ where: { guildId }, orderBy: { createdAt: "asc" } });
        return rows.map(mapPanel);
    }
    async getPanel(guildId, id) {
        if (!isUuid(id))
            return undefined;
        const row = await this.client.applicationPanel.findFirst({ where: { guildId, id } });
        return row ? mapPanel(row) : undefined;
    }
    async createPanel(input) {
        return mapPanel(await this.client.applicationPanel.create({ data: { guildId: input.guildId, ...panelData(input) } }));
    }
    async updatePanel(id, input) {
        return mapPanel(await this.client.applicationPanel.update({ where: { id }, data: panelData(input) }));
    }
    async setPanelMessage(id, messageId) {
        return mapPanel(await this.client.applicationPanel.update({ where: { id }, data: { messageId } }));
    }
    async deletePanel(guildId, id) {
        await this.client.applicationPanel.deleteMany({ where: { guildId, id } });
    }
    async allocateNumber(guildId) {
        const row = await this.client.applicationCounter.upsert({
            where: { guildId },
            create: { guildId, nextNumber: 2 },
            update: { nextNumber: { increment: 1 } },
            select: { nextNumber: true },
        });
        return row.nextNumber - 1;
    }
    async createApplication(input) {
        return mapApplication(await this.client.application.create({
            data: {
                guildId: input.guildId,
                number: input.number,
                formId: input.formId,
                formName: input.formName,
                applicantId: input.applicantId,
                applicantName: input.applicantName,
                source: input.source,
                answers: input.answers.map((answer) => ({ ...answer })),
            },
            include: WITH_REVIEW,
        }));
    }
    async getApplication(guildId, id) {
        if (!isUuid(id))
            return undefined;
        const row = await this.client.application.findFirst({ where: { guildId, id }, include: WITH_REVIEW });
        return row ? mapApplication(row) : undefined;
    }
    async getApplicationByNumber(guildId, number) {
        const row = await this.client.application.findUnique({ where: { guildId_number: { guildId, number } }, include: WITH_REVIEW });
        return row ? mapApplication(row) : undefined;
    }
    async listApplications(filter) {
        const search = filter.search?.trim();
        const searchNumber = search && /^#?\d{1,9}$/.test(search) ? Number(search.replace("#", "")) : undefined;
        const rows = await this.client.application.findMany({
            where: {
                guildId: filter.guildId,
                ...(filter.statuses ? { status: { in: [...filter.statuses] } } : {}),
                ...(filter.formIds ? { formId: { in: filter.formIds.filter(isUuid) } } : {}),
                ...(filter.applicantId ? { applicantId: filter.applicantId } : {}),
                ...(search
                    ? {
                        OR: [
                            ...(searchNumber === undefined ? [] : [{ number: searchNumber }]),
                            { applicantName: { contains: search, mode: "insensitive" } },
                            { formName: { contains: search, mode: "insensitive" } },
                            { applicantId: search },
                        ],
                    }
                    : {}),
            },
            include: WITH_REVIEW,
            orderBy: { number: "desc" },
            take: filter.limit ?? 50,
        });
        return rows.map(mapApplication);
    }
    async updateApplication(id, patch) {
        const data = {};
        if (patch.status !== undefined)
            data.status = patch.status;
        if (patch.reviewChannelId !== undefined)
            data.reviewChannelId = patch.reviewChannelId;
        if (patch.reviewMessageId !== undefined)
            data.reviewMessageId = patch.reviewMessageId;
        if (patch.threadId !== undefined)
            data.threadId = patch.threadId;
        if (patch.decidedById !== undefined)
            data.decidedById = patch.decidedById;
        if (patch.decidedByName !== undefined)
            data.decidedByName = patch.decidedByName;
        if (patch.decisionReason !== undefined)
            data.decisionReason = patch.decisionReason;
        if (patch.decidedAt !== undefined)
            data.decidedAt = patch.decidedAt;
        if (patch.dmDelivered !== undefined)
            data.dmDelivered = patch.dmDelivered;
        return mapApplication(await this.client.application.update({ where: { id }, data, include: WITH_REVIEW }));
    }
    async setVote(applicationId, userId, vote) {
        if (vote) {
            await this.client.applicationVote.upsert({
                where: { applicationId_userId: { applicationId, userId } },
                create: { applicationId, userId, vote },
                update: { vote },
            });
        }
        else {
            await this.client.applicationVote.deleteMany({ where: { applicationId, userId } });
        }
        return mapApplication(await this.client.application.findUniqueOrThrow({ where: { id: applicationId }, include: WITH_REVIEW }));
    }
    async addNote(applicationId, authorId, authorName, body) {
        await this.client.applicationNote.create({ data: { applicationId, authorId, authorName, body } });
        return mapApplication(await this.client.application.findUniqueOrThrow({ where: { id: applicationId }, include: WITH_REVIEW }));
    }
    async listForApplicant(guildId, formId, applicantId) {
        if (!isUuid(formId))
            return [];
        const rows = await this.client.application.findMany({
            where: { guildId, formId, applicantId },
            include: WITH_REVIEW,
            orderBy: { number: "desc" },
            take: 50,
        });
        return rows.map(mapApplication);
    }
    async stats(guildId, now) {
        const [byStatus, total, recent, byForm, decided] = await Promise.all([
            this.client.application.groupBy({ by: ["status"], where: { guildId }, _count: { _all: true } }),
            this.client.application.count({ where: { guildId } }),
            this.client.application.count({ where: { guildId, createdAt: { gte: new Date(now.getTime() - 7 * 86_400_000) } } }),
            this.client.application.groupBy({ by: ["formId", "formName", "status"], where: { guildId }, _count: { _all: true } }),
            this.client.application.findMany({
                where: { guildId, status: { in: ["ACCEPTED", "DENIED"] }, decidedAt: { not: null } },
                select: { createdAt: true, decidedAt: true },
                orderBy: { decidedAt: "desc" },
                take: 1000,
            }),
        ]);
        const statusCounts = Object.fromEntries(APPLICATION_STATUSES.map((status) => [status, byStatus.find((row) => row.status === status)?._count._all ?? 0]));
        const forms = new Map();
        for (const row of byForm) {
            const key = row.formId ?? `name:${row.formName}`;
            const entry = forms.get(key) ?? { ...(row.formId ? { formId: row.formId } : {}), formName: row.formName, total: 0, pending: 0, accepted: 0, denied: 0 };
            const count = row._count._all;
            entry.total += count;
            if (row.status === "PENDING")
                entry.pending += count;
            if (row.status === "ACCEPTED")
                entry.accepted += count;
            if (row.status === "DENIED")
                entry.denied += count;
            forms.set(key, entry);
        }
        const reviewMs = decided.reduce((sum, row) => sum + ((row.decidedAt?.getTime() ?? row.createdAt.getTime()) - row.createdAt.getTime()), 0);
        return {
            total,
            last7Days: recent,
            byStatus: statusCounts,
            byForm: [...forms.values()].sort((left, right) => right.total - left.total),
            ...(decided.length ? { averageReviewMinutes: Math.round(reviewMs / decided.length / 60_000) } : {}),
        };
    }
}
function formData(input) {
    return {
        name: input.name,
        description: input.description ?? null,
        enabled: input.enabled,
        questions: input.questions.map((question) => JSON.parse(JSON.stringify(question))),
        cooldownDays: input.cooldownDays,
        onePending: input.onePending,
        requiredRoleIds: [...input.requiredRoleIds],
        blockedRoleIds: [...input.blockedRoleIds],
        minAccountAgeDays: input.minAccountAgeDays ?? null,
        reviewChannelId: input.reviewChannelId ?? null,
        reviewerRoleIds: [...input.reviewerRoleIds],
        pingMemberIds: [...input.pingMemberIds],
        acceptRoleIds: [...input.acceptRoleIds],
        removeRoleIds: [...input.removeRoleIds],
        acceptMessage: input.acceptMessage ?? null,
        denyMessage: input.denyMessage ?? null,
        discussionChannelId: input.discussionChannelId ?? null,
        buttonLabel: input.buttonLabel ?? null,
        buttonEmoji: input.buttonEmoji ?? null,
        buttonStyle: input.buttonStyle,
        position: input.position,
    };
}
function panelData(input) {
    return { channelId: input.channelId, title: input.title, description: input.description, color: input.color, formIds: [...input.formIds] };
}
function mapForm(row) {
    return {
        id: row.id,
        guildId: row.guildId,
        name: row.name,
        ...(row.description === null ? {} : { description: row.description }),
        enabled: row.enabled,
        questions: parseQuestions(row.questions),
        cooldownDays: row.cooldownDays,
        onePending: row.onePending,
        requiredRoleIds: row.requiredRoleIds,
        blockedRoleIds: row.blockedRoleIds,
        ...(row.minAccountAgeDays === null ? {} : { minAccountAgeDays: row.minAccountAgeDays }),
        ...(row.reviewChannelId === null ? {} : { reviewChannelId: row.reviewChannelId }),
        reviewerRoleIds: row.reviewerRoleIds,
        pingMemberIds: row.pingMemberIds,
        acceptRoleIds: row.acceptRoleIds,
        removeRoleIds: row.removeRoleIds,
        ...(row.acceptMessage === null ? {} : { acceptMessage: row.acceptMessage }),
        ...(row.denyMessage === null ? {} : { denyMessage: row.denyMessage }),
        ...(row.discussionChannelId === null ? {} : { discussionChannelId: row.discussionChannelId }),
        ...(row.buttonLabel === null ? {} : { buttonLabel: row.buttonLabel }),
        ...(row.buttonEmoji === null ? {} : { buttonEmoji: row.buttonEmoji }),
        buttonStyle: row.buttonStyle,
        position: row.position,
        revision: row.revision,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
function mapPanel(row) {
    return {
        id: row.id,
        guildId: row.guildId,
        channelId: row.channelId,
        ...(row.messageId === null ? {} : { messageId: row.messageId }),
        title: row.title,
        description: row.description,
        color: row.color,
        formIds: row.formIds,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
function mapApplication(row) {
    return {
        id: row.id,
        guildId: row.guildId,
        number: row.number,
        ...(row.formId === null ? {} : { formId: row.formId }),
        formName: row.formName,
        applicantId: row.applicantId,
        applicantName: row.applicantName,
        status: row.status,
        source: row.source,
        answers: parseAnswers(row.answers),
        votes: row.votes.map((vote) => ({ userId: vote.userId, vote: vote.vote, createdAt: vote.createdAt })),
        notes: row.notes.map((note) => ({ id: note.id, authorId: note.authorId, authorName: note.authorName, body: note.body, createdAt: note.createdAt })),
        ...(row.reviewChannelId === null ? {} : { reviewChannelId: row.reviewChannelId }),
        ...(row.reviewMessageId === null ? {} : { reviewMessageId: row.reviewMessageId }),
        ...(row.threadId === null ? {} : { threadId: row.threadId }),
        ...(row.decidedById === null ? {} : { decidedById: row.decidedById }),
        ...(row.decidedByName === null ? {} : { decidedByName: row.decidedByName }),
        ...(row.decisionReason === null ? {} : { decisionReason: row.decisionReason }),
        ...(row.decidedAt === null ? {} : { decidedAt: row.decidedAt }),
        ...(row.dmDelivered === null ? {} : { dmDelivered: row.dmDelivered }),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
function parseQuestions(value) {
    if (!Array.isArray(value))
        return [];
    return value.flatMap((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item))
            return [];
        const { id, label, description, type, required, minLength, maxLength, choices } = item;
        if (typeof id !== "string" || typeof label !== "string" || !QUESTION_TYPES.includes(type))
            return [];
        return [{
                id,
                label,
                ...(typeof description === "string" ? { description } : {}),
                type: type,
                required: required === true,
                ...(typeof minLength === "number" ? { minLength } : {}),
                ...(typeof maxLength === "number" ? { maxLength } : {}),
                choices: Array.isArray(choices) ? choices.filter((choice) => typeof choice === "string") : [],
            }];
    });
}
function parseAnswers(value) {
    if (!Array.isArray(value))
        return [];
    return value.flatMap((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item))
            return [];
        const { questionId, question, answer } = item;
        return typeof questionId === "string" && typeof question === "string" && typeof answer === "string" ? [{ questionId, question, answer }] : [];
    });
}
function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
//# sourceMappingURL=PrismaApplicationRepository.js.map