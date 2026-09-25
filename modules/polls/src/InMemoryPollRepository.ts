import { randomUUID } from "node:crypto";

import type { Poll, PollCreateData, PollFilter, PollPatch, PollRepository, PollVote } from "./types.js";
import { PollError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryPollRepository implements PollRepository {
  public readonly polls: Poll[] = [];
  public readonly votes: PollVote[] = [];
  private readonly counters = new Map<string, number>();

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async allocateNumber(guildId: string): Promise<number> {
    const next = (this.counters.get(guildId) ?? 0) + 1;
    this.counters.set(guildId, next);
    return next;
  }

  public async create(data: PollCreateData): Promise<Poll> {
    const now = this.now();
    const poll: Poll = { ...data, id: randomUUID(), status: "OPEN", createdAt: now, updatedAt: now };
    this.polls.push(poll);
    return poll;
  }

  public async get(guildId: string, id: string): Promise<Poll | undefined> {
    return this.polls.find((poll) => poll.guildId === guildId && poll.id === id);
  }

  public async findById(id: string): Promise<Poll | undefined> {
    return this.polls.find((poll) => poll.id === id);
  }

  public async getByNumber(guildId: string, number: number): Promise<Poll | undefined> {
    return this.polls.find((poll) => poll.guildId === guildId && poll.number === number);
  }

  public async list(filter: PollFilter): Promise<readonly Poll[]> {
    return this.polls
      .filter((poll) => poll.guildId === filter.guildId && (!filter.status || poll.status === filter.status))
      .sort((left, right) => right.number - left.number)
      .slice(0, filter.limit ?? 50);
  }

  public async update(id: string, patch: PollPatch): Promise<Poll> {
    const index = this.polls.findIndex((poll) => poll.id === id);
    const current = this.polls[index];
    if (!current) throw new PollError("NOT_FOUND", "That poll was not found.");
    const next: Record<string, unknown> = { ...current, updatedAt: this.now() };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as Poll;
    this.polls[index] = updated;
    return updated;
  }

  public async delete(id: string): Promise<void> {
    const index = this.polls.findIndex((poll) => poll.id === id);
    if (index >= 0) this.polls.splice(index, 1);
    for (let at = this.votes.length - 1; at >= 0; at -= 1) if (this.votes[at]?.pollId === id) this.votes.splice(at, 1);
  }

  public async listEnded(now: Date): Promise<readonly Poll[]> {
    return this.polls.filter((poll) => poll.status === "OPEN" && poll.endsAt !== undefined && poll.endsAt <= now);
  }

  public async getVote(pollId: string, userId: string): Promise<PollVote | undefined> {
    return this.votes.find((vote) => vote.pollId === pollId && vote.userId === userId);
  }

  public async saveVote(pollId: string, userId: string, userName: string, optionIds: readonly string[]): Promise<PollVote> {
    const now = this.now();
    const index = this.votes.findIndex((vote) => vote.pollId === pollId && vote.userId === userId);
    const existing = this.votes[index];
    const vote: PollVote = { pollId, userId, userName, optionIds: [...optionIds], createdAt: existing?.createdAt ?? now, updatedAt: now };
    if (existing) this.votes[index] = vote;
    else this.votes.push(vote);
    return vote;
  }

  public async deleteVote(pollId: string, userId: string): Promise<boolean> {
    const index = this.votes.findIndex((vote) => vote.pollId === pollId && vote.userId === userId);
    if (index < 0) return false;
    this.votes.splice(index, 1);
    return true;
  }

  public async listVotes(pollId: string): Promise<readonly PollVote[]> {
    return this.votes.filter((vote) => vote.pollId === pollId);
  }

  public async countVoters(pollIds: readonly string[]): Promise<ReadonlyMap<string, number>> {
    return new Map(pollIds.map((id) => [id, this.votes.filter((vote) => vote.pollId === id).length]));
  }
}
