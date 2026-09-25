import { randomUUID } from "node:crypto";

import type {
  ScheduledMessage,
  ScheduledMessageCreate,
  ScheduledMessagePatch,
  ScheduledMessageRepository,
  ScheduledMessageRun,
  ScheduledMessageRunCreate,
} from "./types.js";
import { ScheduledMessageError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryScheduledMessageRepository implements ScheduledMessageRepository {
  public readonly messages: ScheduledMessage[] = [];
  public readonly runsList: ScheduledMessageRun[] = [];

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async create(input: ScheduledMessageCreate): Promise<ScheduledMessage> {
    const now = this.now();
    const created: ScheduledMessage = { ...input, id: randomUUID(), runCount: 0, createdAt: now, updatedAt: now };
    this.messages.push(created);
    return created;
  }

  public async get(guildId: string, id: string): Promise<ScheduledMessage | undefined> {
    return this.messages.find((item) => item.guildId === guildId && item.id === id);
  }

  public async findByName(guildId: string, name: string): Promise<ScheduledMessage | undefined> {
    return this.messages.find((item) => item.guildId === guildId && item.name.toLowerCase() === name.toLowerCase());
  }

  public async list(guildId: string): Promise<readonly ScheduledMessage[]> {
    return this.messages.filter((item) => item.guildId === guildId).sort((left, right) => left.name.localeCompare(right.name));
  }

  public async count(guildId: string): Promise<number> {
    return this.messages.filter((item) => item.guildId === guildId).length;
  }

  public async update(id: string, patch: ScheduledMessagePatch): Promise<ScheduledMessage> {
    const index = this.messages.findIndex((item) => item.id === id);
    const current = this.messages[index];
    if (!current) throw new ScheduledMessageError("NOT_FOUND", "That scheduled message was not found.");
    const next: Record<string, unknown> = { ...current, updatedAt: this.now() };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as ScheduledMessage;
    this.messages[index] = updated;
    return updated;
  }

  public async delete(id: string): Promise<void> {
    const index = this.messages.findIndex((item) => item.id === id);
    if (index >= 0) this.messages.splice(index, 1);
  }

  public async listDue(now: Date, limit: number): Promise<readonly ScheduledMessage[]> {
    return this.messages.filter((item) => item.enabled && item.nextRunAt !== undefined && item.nextRunAt <= now).slice(0, limit);
  }

  public async claim(id: string, expected: Date, next: Date | undefined, runCount: number): Promise<boolean> {
    const current = this.messages.find((item) => item.id === id);
    if (!current?.nextRunAt || current.nextRunAt.getTime() !== expected.getTime()) return false;
    await this.update(id, { nextRunAt: next ?? null, runCount });
    return true;
  }

  public async addRun(input: ScheduledMessageRunCreate): Promise<ScheduledMessageRun> {
    const run = { ...input, id: randomUUID() };
    this.runsList.push(run);
    return run;
  }

  public async listRuns(guildId: string, messageId?: string, limit = 50): Promise<readonly ScheduledMessageRun[]> {
    return this.runsList
      .filter((run) => run.guildId === guildId && (!messageId || run.messageId === messageId))
      .sort((left, right) => right.ranAt.getTime() - left.ranAt.getTime())
      .slice(0, limit);
  }
}
