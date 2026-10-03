import { type Application, type ApplicationCreateData, type ApplicationFilter, type ApplicationForm, type ApplicationFormInput, type ApplicationPanel, type ApplicationPanelInput, type ApplicationPatch, type ApplicationRepository, type ApplicationStats, type VoteType } from "@qbox/applications";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "applicationCounter" | "applicationForm" | "applicationPanel" | "application" | "applicationVote" | "applicationNote">;
/** PostgreSQL application forms, panels, and submissions. `guildId` is the Discord guild ID. */
export declare class PrismaApplicationRepository implements ApplicationRepository {
    private readonly client;
    constructor(client: Client);
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
}
export {};
//# sourceMappingURL=PrismaApplicationRepository.d.ts.map