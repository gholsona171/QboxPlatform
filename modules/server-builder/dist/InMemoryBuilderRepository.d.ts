import type { BuilderDraft, BuilderDraftInput, BuilderRepository, BuilderRun, BuilderRunCreateData, BuilderRunItem, BuilderRunItemCreateData, BuilderRunItemPatch, BuilderRunPatch } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryBuilderRepository implements BuilderRepository {
    private readonly now;
    readonly drafts: Map<string, BuilderDraft>;
    readonly runList: BuilderRun[];
    readonly items: BuilderRunItem[];
    constructor(now?: () => Date);
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
//# sourceMappingURL=InMemoryBuilderRepository.d.ts.map