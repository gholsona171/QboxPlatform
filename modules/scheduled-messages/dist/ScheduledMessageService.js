import { nextRun } from "./schedule.js";
import { MAX_SCHEDULED_MESSAGES } from "./types.js";
import { ScheduledMessageError, invalid, normalizeMessage, requireSnowflake } from "./validation.js";
const DUE_BATCH = 25;
/**
 * Scheduled message rules shared by the bot and the API: saving messages,
 * working out the next post, posting due messages, and run history.
 */
export class ScheduledMessageService {
    repository;
    gateway;
    now;
    constructor(repository, gateway, now = () => new Date()) {
        this.repository = repository;
        this.gateway = gateway;
        this.now = now;
    }
    async list(guildId) {
        requireSnowflake("guildId", guildId);
        return this.repository.list(guildId);
    }
    async get(guildId, id) {
        requireSnowflake("guildId", guildId);
        const found = await this.repository.get(guildId, id);
        if (!found)
            throw new ScheduledMessageError("NOT_FOUND", "That scheduled message was not found.");
        return found;
    }
    /** Finds a message by its name (any case). */
    async byName(guildId, name) {
        requireSnowflake("guildId", guildId);
        const found = await this.repository.findByName(guildId, name.trim());
        if (!found)
            throw new ScheduledMessageError("NOT_FOUND", `No scheduled message is called "${name.trim()}". Use /schedule list to see them.`);
        return found;
    }
    async create(input, createdById) {
        const message = normalizeMessage(input);
        if ((await this.repository.count(message.guildId)) >= MAX_SCHEDULED_MESSAGES)
            throw new ScheduledMessageError("LIMIT_REACHED", `A server can have at most ${MAX_SCHEDULED_MESSAGES} scheduled messages.`);
        await this.requireUniqueName(message.guildId, message.name);
        const nextRunAt = message.enabled ? this.requireNext(message, this.now(), 0) : undefined;
        return this.repository.create({ ...message, createdById, ...(nextRunAt ? { nextRunAt } : {}) });
    }
    async update(guildId, id, input) {
        const current = await this.get(guildId, id);
        const message = normalizeMessage({ ...input, guildId });
        await this.requireUniqueName(guildId, message.name, id);
        const nextRunAt = message.enabled ? this.requireNext(message, current.createdAt, current.runCount) : undefined;
        return this.repository.update(id, {
            name: message.name,
            channelId: message.channelId,
            content: message.content ?? null,
            embed: message.embed ?? null,
            pingRoleIds: message.pingRoleIds,
            schedule: message.schedule,
            enabled: message.enabled,
            deletePrevious: message.deletePrevious,
            pin: message.pin,
            maxRuns: message.maxRuns ?? null,
            nextRunAt: nextRunAt ?? null,
        });
    }
    async delete(guildId, id) {
        const current = await this.get(guildId, id);
        await this.repository.delete(current.id);
        return current;
    }
    /** Pauses or resumes a message. Resuming continues from now; missed posts are skipped. */
    async setEnabled(guildId, id, enabled) {
        const current = await this.get(guildId, id);
        if (current.enabled === enabled)
            throw new ScheduledMessageError("INVALID_STATE", enabled ? "That message is not paused." : "That message is already paused.");
        const nextRunAt = enabled ? this.requireNext(current, current.createdAt, current.runCount) : undefined;
        return this.repository.update(current.id, { enabled, nextRunAt: nextRunAt ?? null });
    }
    /** Posts a message right away. The schedule and post count do not change. */
    async sendNow(guildId, id) {
        const message = await this.get(guildId, id);
        if (!this.gateway)
            throw new ScheduledMessageError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
        return this.deliver(message, true);
    }
    async runs(guildId, messageId, limit = 50) {
        requireSnowflake("guildId", guildId);
        return this.repository.listRuns(guildId, messageId, Math.min(Math.max(limit, 1), 200));
    }
    /** Posts every message that is due. Each due post is claimed so it is sent once. */
    async runDue() {
        if (!this.gateway)
            return { sent: 0, failed: 0 };
        const now = this.now();
        let sent = 0;
        let failed = 0;
        for (const message of await this.repository.listDue(now, DUE_BATCH)) {
            if (!message.nextRunAt)
                continue;
            const runCount = message.runCount + 1;
            const finished = message.maxRuns !== undefined && runCount >= message.maxRuns;
            const next = finished ? undefined : nextRun(message.schedule, now, message.createdAt);
            if (!(await this.repository.claim(message.id, message.nextRunAt, next, runCount)))
                continue;
            const run = await this.deliver(message, false);
            if (run.success)
                sent += 1;
            else
                failed += 1;
        }
        return { sent, failed };
    }
    async deliver(message, manual) {
        const gateway = this.gateway;
        const ranAt = this.now();
        try {
            const posted = await gateway.post(message.channelId, message);
            if (message.deletePrevious && message.lastMessageId)
                await gateway.deleteMessage(message.channelId, message.lastMessageId).catch(() => undefined);
            if (message.pin)
                await gateway.pin(message.channelId, posted.messageId).catch(() => undefined);
            await this.repository.update(message.id, { lastRunAt: ranAt, lastMessageId: posted.messageId });
            return await this.repository.addRun({ messageId: message.id, guildId: message.guildId, success: true, discordMessageId: posted.messageId, manual, ranAt });
        }
        catch (error) {
            await this.repository.update(message.id, { lastRunAt: ranAt });
            const text = error instanceof Error && error.message ? error.message : "Discord rejected the message.";
            return this.repository.addRun({ messageId: message.id, guildId: message.guildId, success: false, error: text.slice(0, 500), manual, ranAt });
        }
    }
    requireNext(message, anchor, runCount) {
        if (message.maxRuns !== undefined && runCount >= message.maxRuns)
            throw new ScheduledMessageError("INVALID_STATE", "This message already posted its maximum number of times. Raise the limit to keep it going.");
        const next = nextRun(message.schedule, this.now(), anchor);
        if (!next)
            throw new ScheduledMessageError("INVALID_INPUT", "This schedule has no future posts. Check the time and dates.");
        return next;
    }
    async requireUniqueName(guildId, name, exceptId) {
        const existing = await this.repository.findByName(guildId, name);
        if (existing && existing.id !== exceptId)
            invalid(`A scheduled message is already called "${name}".`);
    }
}
//# sourceMappingURL=ScheduledMessageService.js.map