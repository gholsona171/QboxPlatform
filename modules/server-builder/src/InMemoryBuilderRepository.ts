import { randomUUID } from "node:crypto";

import type {
  BuilderDraft,
  BuilderDraftInput,
  BuilderRepository,
  BuilderRun,
  BuilderRunCreateData,
  BuilderRunItem,
  BuilderRunItemCreateData,
  BuilderRunItemPatch,
  BuilderRunPatch,
} from "./types.js";
import { BuilderError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryBuilderRepository implements BuilderRepository {
  public readonly drafts = new Map<string, BuilderDraft>();
  public readonly runList: BuilderRun[] = [];
  public readonly items: BuilderRunItem[] = [];

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async getDraft(guildId: string): Promise<BuilderDraft | undefined> {
    return this.drafts.get(guildId);
  }

  public async saveDraft(input: BuilderDraftInput): Promise<BuilderDraft> {
    const current = this.drafts.get(input.guildId);
    const revision = current?.revision ?? 0;
    if (input.expectedRevision !== undefined && input.expectedRevision !== revision)
      throw new BuilderError("CONFLICT", "The blueprint changed since it was loaded.", { currentRevision: revision });
    const saved: BuilderDraft = { guildId: input.guildId, answers: input.answers, blueprint: input.blueprint, revision: revision + 1, updatedAt: this.now(), ...(input.updatedById ? { updatedById: input.updatedById } : {}) };
    this.drafts.set(input.guildId, saved);
    return saved;
  }

  public async createRun(input: BuilderRunCreateData): Promise<BuilderRun> {
    const now = this.now();
    const run: BuilderRun = { ...input, id: randomUUID(), status: "QUEUED", done: 0, skipped: 0, failed: 0, warnings: [], createdAt: now, updatedAt: now };
    this.runList.push(run);
    return run;
  }

  public async updateRun(id: string, patch: BuilderRunPatch): Promise<BuilderRun> {
    const index = this.runList.findIndex((run) => run.id === id);
    const current = this.runList[index];
    if (!current) throw new BuilderError("NOT_FOUND", "That build was not found.");
    const next: Record<string, unknown> = { ...current, updatedAt: this.now() };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as BuilderRun;
    this.runList[index] = updated;
    return updated;
  }

  public async getRun(guildId: string, id: string): Promise<BuilderRun | undefined> {
    return this.runList.find((run) => run.guildId === guildId && run.id === id);
  }

  public async listRuns(guildId: string, limit: number): Promise<readonly BuilderRun[]> {
    return this.runList.filter((run) => run.guildId === guildId).reverse().slice(0, limit);
  }

  public async findActiveRun(guildId: string): Promise<BuilderRun | undefined> {
    return this.runList.find((run) => run.guildId === guildId && (run.status === "QUEUED" || run.status === "RUNNING"));
  }

  public async addItem(input: BuilderRunItemCreateData): Promise<BuilderRunItem> {
    const item: BuilderRunItem = { ...input, id: randomUUID(), createdAt: this.now() };
    this.items.push(item);
    return item;
  }

  public async updateItem(id: string, patch: BuilderRunItemPatch): Promise<BuilderRunItem> {
    const index = this.items.findIndex((item) => item.id === id);
    const current = this.items[index];
    if (!current) throw new BuilderError("NOT_FOUND", "That build item was not found.");
    const next: Record<string, unknown> = { ...current };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as BuilderRunItem;
    this.items[index] = updated;
    return updated;
  }

  public async listItems(runId: string): Promise<readonly BuilderRunItem[]> {
    return this.items.filter((item) => item.runId === runId);
  }

  public async failActiveRuns(message: string, now: Date): Promise<number> {
    const active = this.runList.filter((run) => run.status === "QUEUED" || run.status === "RUNNING");
    for (const run of active) await this.updateRun(run.id, { status: "FAILED", error: message, finishedAt: now });
    return active.length;
  }
}
