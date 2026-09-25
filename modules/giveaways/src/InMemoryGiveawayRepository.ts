import { randomUUID } from "node:crypto";

import type { Giveaway, GiveawayCreateData, GiveawayEntry, GiveawayFilter, GiveawayPatch, GiveawayRepository } from "./types.js";
import { GiveawayError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryGiveawayRepository implements GiveawayRepository {
  public readonly giveaways: Giveaway[] = [];
  public readonly entries: GiveawayEntry[] = [];
  private readonly counters = new Map<string, number>();

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async allocateNumber(guildId: string): Promise<number> {
    const next = (this.counters.get(guildId) ?? 0) + 1;
    this.counters.set(guildId, next);
    return next;
  }

  public async create(data: GiveawayCreateData): Promise<Giveaway> {
    const now = this.now();
    const giveaway: Giveaway = { ...data, id: randomUUID(), status: "RUNNING", winnerIds: [], createdAt: now, updatedAt: now };
    this.giveaways.push(giveaway);
    return giveaway;
  }

  public async get(guildId: string, id: string): Promise<Giveaway | undefined> {
    return this.giveaways.find((giveaway) => giveaway.guildId === guildId && giveaway.id === id);
  }

  public async findById(id: string): Promise<Giveaway | undefined> {
    return this.giveaways.find((giveaway) => giveaway.id === id);
  }

  public async getByNumber(guildId: string, number: number): Promise<Giveaway | undefined> {
    return this.giveaways.find((giveaway) => giveaway.guildId === guildId && giveaway.number === number);
  }

  public async list(filter: GiveawayFilter): Promise<readonly Giveaway[]> {
    return this.giveaways
      .filter((giveaway) => giveaway.guildId === filter.guildId && (!filter.statuses || filter.statuses.includes(giveaway.status)))
      .sort((left, right) => right.number - left.number)
      .slice(0, filter.limit ?? 50);
  }

  public async update(id: string, patch: GiveawayPatch): Promise<Giveaway> {
    const index = this.giveaways.findIndex((giveaway) => giveaway.id === id);
    const current = this.giveaways[index];
    if (!current) throw new GiveawayError("NOT_FOUND", "That giveaway was not found.");
    const next: Record<string, unknown> = { ...current, updatedAt: this.now() };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as Giveaway;
    this.giveaways[index] = updated;
    return updated;
  }

  public async delete(id: string): Promise<void> {
    const index = this.giveaways.findIndex((giveaway) => giveaway.id === id);
    if (index >= 0) this.giveaways.splice(index, 1);
    for (let at = this.entries.length - 1; at >= 0; at -= 1) if (this.entries[at]?.giveawayId === id) this.entries.splice(at, 1);
  }

  public async listDue(now: Date): Promise<readonly Giveaway[]> {
    return this.giveaways.filter((giveaway) => giveaway.status === "RUNNING" && giveaway.endsAt <= now);
  }

  public async addEntry(giveawayId: string, userId: string, userName: string, entries: number): Promise<GiveawayEntry> {
    const existing = this.entries.find((entry) => entry.giveawayId === giveawayId && entry.userId === userId);
    if (existing) return existing;
    const entry: GiveawayEntry = { giveawayId, userId, userName, entries, createdAt: this.now() };
    this.entries.push(entry);
    return entry;
  }

  public async removeEntry(giveawayId: string, userId: string): Promise<boolean> {
    const index = this.entries.findIndex((entry) => entry.giveawayId === giveawayId && entry.userId === userId);
    if (index < 0) return false;
    this.entries.splice(index, 1);
    return true;
  }

  public async listEntries(giveawayId: string): Promise<readonly GiveawayEntry[]> {
    return this.entries.filter((entry) => entry.giveawayId === giveawayId);
  }

  public async countEntrants(giveawayIds: readonly string[]): Promise<ReadonlyMap<string, number>> {
    return new Map(giveawayIds.map((id) => [id, this.entries.filter((entry) => entry.giveawayId === id).length]));
  }
}
