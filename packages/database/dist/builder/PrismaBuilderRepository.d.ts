import { type BuilderDraft, type BuilderDraftInput, type BuilderRepository, type BuilderRun, type BuilderRunCreateData, type BuilderRunItem, type BuilderRunItemCreateData, type BuilderRunItemPatch, type BuilderRunPatch } from "@qbox/server-builder";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "builderDraft" | "builderRun" | "builderRunItem">;
/** PostgreSQL server builder drafts and runs. `guildId` is the Discord guild ID. */
export declare class PrismaBuilderRepository implements BuilderRepository {
    private readonly client;
    constructor(client: Client);
    getDraft(guildId: string): Promise<BuilderDraft | undefined>;
    saveDraft(input: BuilderDraftInput): Promise<BuilderDraft>;
    createRun(input: BuilderRunCreateData): Promise<BuilderRun>;
    updateRun(id: string, patch: BuilderRunPatch): Promise<BuilderRun>;
    getRun(guildId: string, id: string): Promise<BuilderRun | undefined>;
    listRuns(guildId: string, limit: number): Promise<readonly BuilderRun[]>;
    findActiveRun(guildId: string): Promise<BuilderRun | undefined>;
    addItem(input: BuilderRunItemCreateData): Promise<BuilderRunItem>;
    updateItem(id: string, patch: BuilderRunItemPatch): Promise<BuilderRunItem>;
    listItems(runId: string): Promise<readonly BuilderRunItem[]>;
    failActiveRuns(message: string, now: Date): Promise<number>;
}
export {};
//# sourceMappingURL=PrismaBuilderRepository.d.ts.map