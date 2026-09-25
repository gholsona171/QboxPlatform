import {
  BUILDER_LINKS,
  BuilderError,
  type BuilderAnswers,
  type BuilderBlueprint,
  type BuilderDraft,
  type BuilderDraftInput,
  type BuilderLink,
  type BuilderRepository,
  type BuilderRun,
  type BuilderRunCreateData,
  type BuilderRunItem,
  type BuilderRunItemCreateData,
  type BuilderRunItemPatch,
  type BuilderRunPatch,
} from "@qbox/server-builder";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<PrismaClient, "builderDraft" | "builderRun" | "builderRunItem">;
type DraftRow = Prisma.BuilderDraftGetPayload<object>;
type RunRow = Prisma.BuilderRunGetPayload<object>;
type ItemRow = Prisma.BuilderRunItemGetPayload<object>;

/** PostgreSQL server builder drafts and runs. `guildId` is the Discord guild ID. */
export class PrismaBuilderRepository implements BuilderRepository {
  public constructor(private readonly client: Client) {}

  public async getDraft(guildId: string): Promise<BuilderDraft | undefined> {
    const row = await this.client.builderDraft.findUnique({ where: { guildId } });
    return row ? mapDraft(row) : undefined;
  }

  public async saveDraft(input: BuilderDraftInput): Promise<BuilderDraft> {
    const data = {
      answers: json(input.answers),
      blueprint: json(input.blueprint),
      updatedById: input.updatedById ?? null,
    };
    const existing = await this.client.builderDraft.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
    if (!existing) {
      if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
        throw new BuilderError("CONFLICT", "The blueprint changed since it was loaded.", { currentRevision: 0 });
      return mapDraft(await this.client.builderDraft.create({ data: { guildId: input.guildId, ...data } }));
    }
    const result = await this.client.builderDraft.updateMany({
      where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
      data: { ...data, revision: { increment: 1 } },
    });
    if (result.count === 0) throw new BuilderError("CONFLICT", "The blueprint changed since it was loaded.", { currentRevision: existing.revision });
    return mapDraft(await this.client.builderDraft.findUniqueOrThrow({ where: { guildId: input.guildId } }));
  }

  public async createRun(input: BuilderRunCreateData): Promise<BuilderRun> {
    return mapRun(await this.client.builderRun.create({
      data: {
        guildId: input.guildId,
        mode: input.mode,
        links: [...input.links],
        planned: input.planned,
        startedById: input.startedById,
        startedByName: input.startedByName,
        warnings: [],
      },
    }));
  }

  public async updateRun(id: string, patch: BuilderRunPatch): Promise<BuilderRun> {
    const data: Prisma.BuilderRunUpdateInput = {};
    if (patch.status !== undefined) data.status = patch.status;
    if (patch.done !== undefined) data.done = patch.done;
    if (patch.skipped !== undefined) data.skipped = patch.skipped;
    if (patch.failed !== undefined) data.failed = patch.failed;
    if (patch.warnings !== undefined) data.warnings = [...patch.warnings];
    if (patch.error !== undefined) data.error = patch.error;
    if (patch.startedAt !== undefined) data.startedAt = patch.startedAt;
    if (patch.finishedAt !== undefined) data.finishedAt = patch.finishedAt;
    if (patch.undoneAt !== undefined) data.undoneAt = patch.undoneAt;
    return mapRun(await this.client.builderRun.update({ where: { id }, data }));
  }

  public async getRun(guildId: string, id: string): Promise<BuilderRun | undefined> {
    if (!UUID.test(id)) return undefined;
    const row = await this.client.builderRun.findFirst({ where: { id, guildId } });
    return row ? mapRun(row) : undefined;
  }

  public async listRuns(guildId: string, limit: number): Promise<readonly BuilderRun[]> {
    const rows = await this.client.builderRun.findMany({ where: { guildId }, orderBy: { createdAt: "desc" }, take: limit });
    return rows.map(mapRun);
  }

  public async findActiveRun(guildId: string): Promise<BuilderRun | undefined> {
    const row = await this.client.builderRun.findFirst({ where: { guildId, status: { in: ["QUEUED", "RUNNING"] } } });
    return row ? mapRun(row) : undefined;
  }

  public async addItem(input: BuilderRunItemCreateData): Promise<BuilderRunItem> {
    return mapItem(await this.client.builderRunItem.create({
      data: {
        runId: input.runId,
        kind: input.kind,
        key: input.key,
        name: input.name,
        status: input.status,
        discordId: input.discordId ?? null,
        error: input.error ?? null,
        note: input.note ?? null,
      },
    }));
  }

  public async updateItem(id: string, patch: BuilderRunItemPatch): Promise<BuilderRunItem> {
    const data: Prisma.BuilderRunItemUpdateInput = {};
    if (patch.status !== undefined) data.status = patch.status;
    if (patch.error !== undefined) data.error = patch.error;
    return mapItem(await this.client.builderRunItem.update({ where: { id }, data }));
  }

  public async listItems(runId: string): Promise<readonly BuilderRunItem[]> {
    const rows = await this.client.builderRunItem.findMany({ where: { runId }, orderBy: { sequence: "asc" } });
    return rows.map(mapItem);
  }

  public async failActiveRuns(message: string, now: Date): Promise<number> {
    const result = await this.client.builderRun.updateMany({
      where: { status: { in: ["QUEUED", "RUNNING"] } },
      data: { status: "FAILED", error: message, finishedAt: now },
    });
    return result.count;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(value: BuilderAnswers | BuilderBlueprint): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function mapDraft(row: DraftRow): BuilderDraft {
  return {
    guildId: row.guildId,
    answers: row.answers as unknown as BuilderAnswers,
    blueprint: row.blueprint as unknown as BuilderBlueprint,
    ...(row.updatedById === null ? {} : { updatedById: row.updatedById }),
    revision: row.revision,
    updatedAt: row.updatedAt,
  };
}

function mapRun(row: RunRow): BuilderRun {
  return {
    id: row.id,
    guildId: row.guildId,
    status: row.status,
    mode: row.mode,
    links: row.links.filter((link): link is BuilderLink => (BUILDER_LINKS as readonly string[]).includes(link)),
    planned: row.planned,
    done: row.done,
    skipped: row.skipped,
    failed: row.failed,
    startedById: row.startedById,
    startedByName: row.startedByName,
    warnings: row.warnings,
    ...(row.error === null ? {} : { error: row.error }),
    ...(row.startedAt === null ? {} : { startedAt: row.startedAt }),
    ...(row.finishedAt === null ? {} : { finishedAt: row.finishedAt }),
    ...(row.undoneAt === null ? {} : { undoneAt: row.undoneAt }),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapItem(row: ItemRow): BuilderRunItem {
  return {
    id: row.id,
    runId: row.runId,
    kind: row.kind,
    key: row.key,
    name: row.name,
    status: row.status,
    ...(row.discordId === null ? {} : { discordId: row.discordId }),
    ...(row.error === null ? {} : { error: row.error }),
    ...(row.note === null ? {} : { note: row.note }),
    createdAt: row.createdAt,
  };
}
