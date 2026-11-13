import { randomUUID } from "node:crypto";
import { PollError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryPollRepository {
    now;
    polls = [];
    votes = [];
    counters = new Map();
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async allocateNumber(guildId) {
        const next = (this.counters.get(guildId) ?? 0) + 1;
        this.counters.set(guildId, next);
        return next;
    }
    async create(data) {
        const now = this.now();
        const poll = { ...data, id: randomUUID(), status: "OPEN", createdAt: now, updatedAt: now };
        this.polls.push(poll);
        return poll;
    }
    async get(guildId, id) {
        return this.polls.find((poll) => poll.guildId === guildId && poll.id === id);
    }
    async findById(id) {
        return this.polls.find((poll) => poll.id === id);
    }
    async getByNumber(guildId, number) {
        return this.polls.find((poll) => poll.guildId === guildId && poll.number === number);
    }
    async list(filter) {
        return this.polls
            .filter((poll) => poll.guildId === filter.guildId && (!filter.status || poll.status === filter.status))
            .sort((left, right) => right.number - left.number)
            .slice(0, filter.limit ?? 50);
    }
    async update(id, patch) {
        const index = this.polls.findIndex((poll) => poll.id === id);
        const current = this.polls[index];
        if (!current)
            throw new PollError("NOT_FOUND", "That poll was not found.");
        const next = { ...current, updatedAt: this.now() };
        for (const [key, value] of Object.entries(patch)) {
            if (value === null)
                delete next[key];
            else if (value !== undefined)
                next[key] = value;
        }
        const updated = next;
        this.polls[index] = updated;
        return updated;
    }
    async delete(id) {
        const index = this.polls.findIndex((poll) => poll.id === id);
        if (index >= 0)
            this.polls.splice(index, 1);
        for (let at = this.votes.length - 1; at >= 0; at -= 1)
            if (this.votes[at]?.pollId === id)
                this.votes.splice(at, 1);
    }
    async listEnded(now) {
        return this.polls.filter((poll) => poll.status === "OPEN" && poll.endsAt !== undefined && poll.endsAt <= now);
    }
    async getVote(pollId, userId) {
        return this.votes.find((vote) => vote.pollId === pollId && vote.userId === userId);
    }
    async saveVote(pollId, userId, userName, optionIds) {
        const now = this.now();
        const index = this.votes.findIndex((vote) => vote.pollId === pollId && vote.userId === userId);
        const existing = this.votes[index];
        const vote = { pollId, userId, userName, optionIds: [...optionIds], createdAt: existing?.createdAt ?? now, updatedAt: now };
        if (existing)
            this.votes[index] = vote;
        else
            this.votes.push(vote);
        return vote;
    }
    async deleteVote(pollId, userId) {
        const index = this.votes.findIndex((vote) => vote.pollId === pollId && vote.userId === userId);
        if (index < 0)
            return false;
        this.votes.splice(index, 1);
        return true;
    }
    async listVotes(pollId) {
        return this.votes.filter((vote) => vote.pollId === pollId);
    }
    async countVoters(pollIds) {
        return new Map(pollIds.map((id) => [id, this.votes.filter((vote) => vote.pollId === id).length]));
    }
}
//# sourceMappingURL=InMemoryPollRepository.js.map