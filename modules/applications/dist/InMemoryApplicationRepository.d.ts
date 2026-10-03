import type { Application, ApplicationCreateData, ApplicationFilter, ApplicationForm, ApplicationFormInput, ApplicationPanel, ApplicationPanelInput, ApplicationPatch, ApplicationRepository, ApplicationStats, VoteType } from "./types.js";
/** Process-local repository for tests. Not for production use. */
export declare class InMemoryApplicationRepository implements ApplicationRepository {
    private readonly now;
    readonly forms: ApplicationForm[];
    readonly panels: ApplicationPanel[];
    readonly applications: Application[];
    private readonly counters;
    constructor(now?: () => Date);
    listForms(guildId: string): Promise<readonly ApplicationForm[]>;
    getForm(guildId: string, id: string): Promise<ApplicationForm | undefined>;
    createForm(input: ApplicationFormInput): Promise<ApplicationForm>;
    updateForm(id: string, input: ApplicationFormInput): Promise<ApplicationForm>;
    deleteForm(guildId: string, id: string): Promise<void>;
    listPanels(guildId: string): Promise<readonly ApplicationPanel[]>;
    getPanel(guildId: string, id: string): Promise<ApplicationPanel | undefined>;
    createPanel(input: ApplicationPanelInput): Promise<ApplicationPanel>;
    updatePanel(id: string, input: ApplicationPanelInput): Promise<ApplicationPanel>;
    setPanelMessage(id: string, messageId: string | null): Promise<ApplicationPanel>;
    deletePanel(guildId: string, id: string): Promise<void>;
    allocateNumber(guildId: string): Promise<number>;
    createApplication(input: ApplicationCreateData): Promise<Application>;
    getApplication(guildId: string, id: string): Promise<Application | undefined>;
    getApplicationByNumber(guildId: string, number: number): Promise<Application | undefined>;
    listApplications(filter: ApplicationFilter): Promise<readonly Application[]>;
    updateApplication(id: string, patch: ApplicationPatch): Promise<Application>;
    setVote(applicationId: string, userId: string, vote: VoteType | undefined): Promise<Application>;
    addNote(applicationId: string, authorId: string, authorName: string, body: string): Promise<Application>;
    listForApplicant(guildId: string, formId: string, applicantId: string): Promise<readonly Application[]>;
    stats(guildId: string, now: Date): Promise<ApplicationStats>;
    private patchPanel;
    private replace;
}
//# sourceMappingURL=InMemoryApplicationRepository.d.ts.map