import { randomUUID } from "node:crypto";

import type {
  Application,
  ApplicationCreateData,
  ApplicationFilter,
  ApplicationForm,
  ApplicationFormInput,
  ApplicationFormStats,
  ApplicationPanel,
  ApplicationPanelInput,
  ApplicationPatch,
  ApplicationRepository,
  ApplicationStats,
  ApplicationStatus,
  VoteType,
} from "./types.js";
import { ApplicationError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryApplicationRepository implements ApplicationRepository {
  public readonly forms: ApplicationForm[] = [];
  public readonly panels: ApplicationPanel[] = [];
  public readonly applications: Application[] = [];
  private readonly counters = new Map<string, number>();

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async listForms(guildId: string): Promise<readonly ApplicationForm[]> {
    return this.forms.filter((form) => form.guildId === guildId);
  }

  public async getForm(guildId: string, id: string): Promise<ApplicationForm | undefined> {
    return this.forms.find((form) => form.guildId === guildId && form.id === id);
  }

  public async createForm(input: ApplicationFormInput): Promise<ApplicationForm> {
    const { expectedRevision: _expected, ...rest } = input;
    const now = this.now();
    const form: ApplicationForm = { ...rest, id: randomUUID(), revision: 1, createdAt: now, updatedAt: now };
    this.forms.push(form);
    return form;
  }

  public async updateForm(id: string, input: ApplicationFormInput): Promise<ApplicationForm> {
    const index = this.forms.findIndex((form) => form.id === id);
    const current = this.forms[index];
    if (!current) throw new ApplicationError("NOT_FOUND", "That application form was not found.");
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new ApplicationError("CONFLICT", "This form changed since it was loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const updated: ApplicationForm = { ...rest, id, revision: current.revision + 1, createdAt: current.createdAt, updatedAt: this.now() };
    this.forms[index] = updated;
    return updated;
  }

  public async deleteForm(guildId: string, id: string): Promise<void> {
    const index = this.forms.findIndex((form) => form.guildId === guildId && form.id === id);
    if (index >= 0) this.forms.splice(index, 1);
    for (const [position, application] of this.applications.entries())
      if (application.formId === id) this.applications[position] = { ...application, formId: undefined };
  }

  public async listPanels(guildId: string): Promise<readonly ApplicationPanel[]> {
    return this.panels.filter((panel) => panel.guildId === guildId);
  }

  public async getPanel(guildId: string, id: string): Promise<ApplicationPanel | undefined> {
    return this.panels.find((panel) => panel.guildId === guildId && panel.id === id);
  }

  public async createPanel(input: ApplicationPanelInput): Promise<ApplicationPanel> {
    const now = this.now();
    const panel: ApplicationPanel = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    this.panels.push(panel);
    return panel;
  }

  public async updatePanel(id: string, input: ApplicationPanelInput): Promise<ApplicationPanel> {
    return this.patchPanel(id, { ...input });
  }

  public async setPanelMessage(id: string, messageId: string | null): Promise<ApplicationPanel> {
    return this.patchPanel(id, { messageId: messageId ?? undefined });
  }

  public async deletePanel(guildId: string, id: string): Promise<void> {
    const index = this.panels.findIndex((panel) => panel.guildId === guildId && panel.id === id);
    if (index >= 0) this.panels.splice(index, 1);
  }

  public async allocateNumber(guildId: string): Promise<number> {
    const next = (this.counters.get(guildId) ?? 0) + 1;
    this.counters.set(guildId, next);
    return next;
  }

  public async createApplication(input: ApplicationCreateData): Promise<Application> {
    const now = this.now();
    const created: Application = { ...input, id: randomUUID(), status: "PENDING", votes: [], notes: [], createdAt: now, updatedAt: now };
    this.applications.push(created);
    return created;
  }

  public async getApplication(guildId: string, id: string): Promise<Application | undefined> {
    return this.applications.find((item) => item.guildId === guildId && item.id === id);
  }

  public async getApplicationByNumber(guildId: string, number: number): Promise<Application | undefined> {
    return this.applications.find((item) => item.guildId === guildId && item.number === number);
  }

  public async listApplications(filter: ApplicationFilter): Promise<readonly Application[]> {
    const search = filter.search?.toLowerCase().replace(/^#/, "");
    return this.applications
      .filter((item) => item.guildId === filter.guildId)
      .filter((item) => !filter.statuses || filter.statuses.includes(item.status))
      .filter((item) => !filter.formIds || (item.formId !== undefined && filter.formIds.includes(item.formId)))
      .filter((item) => !filter.applicantId || item.applicantId === filter.applicantId)
      .filter((item) => !search || `${item.applicantName} ${item.applicantId} ${item.formName} ${item.number}`.toLowerCase().includes(search))
      .sort((left, right) => right.number - left.number)
      .slice(0, filter.limit ?? 50);
  }

  public async updateApplication(id: string, patch: ApplicationPatch): Promise<Application> {
    const index = this.applications.findIndex((item) => item.id === id);
    const current = this.applications[index];
    if (!current) throw new ApplicationError("NOT_FOUND", "That application was not found.");
    const next: Record<string, unknown> = { ...current, updatedAt: this.now() };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as Application;
    this.applications[index] = updated;
    return updated;
  }

  public async setVote(applicationId: string, userId: string, vote: VoteType | undefined): Promise<Application> {
    return this.replace(applicationId, (current) => ({
      ...current,
      votes: [...current.votes.filter((item) => item.userId !== userId), ...(vote ? [{ userId, vote, createdAt: this.now() }] : [])],
    }));
  }

  public async addNote(applicationId: string, authorId: string, authorName: string, body: string): Promise<Application> {
    return this.replace(applicationId, (current) => ({
      ...current,
      notes: [...current.notes, { id: randomUUID(), authorId, authorName, body, createdAt: this.now() }],
    }));
  }

  public async listForApplicant(guildId: string, formId: string, applicantId: string): Promise<readonly Application[]> {
    return this.applications
      .filter((item) => item.guildId === guildId && item.formId === formId && item.applicantId === applicantId)
      .sort((left, right) => right.number - left.number);
  }

  public async stats(guildId: string, now: Date): Promise<ApplicationStats> {
    const items = this.applications.filter((item) => item.guildId === guildId);
    const count = (status: ApplicationStatus, list: readonly Application[] = items) => list.filter((item) => item.status === status).length;
    const byForm = new Map<string, Application[]>();
    for (const item of items) byForm.set(item.formName, [...(byForm.get(item.formName) ?? []), item]);
    const decided = items.filter((item) => item.decidedAt && (item.status === "ACCEPTED" || item.status === "DENIED"));
    return {
      total: items.length,
      last7Days: items.filter((item) => now.getTime() - item.createdAt.getTime() < 7 * 86_400_000).length,
      byStatus: { PENDING: count("PENDING"), ACCEPTED: count("ACCEPTED"), DENIED: count("DENIED"), WITHDRAWN: count("WITHDRAWN") },
      byForm: [...byForm.entries()].map(([formName, list]): ApplicationFormStats => ({
        formId: list[0]?.formId,
        formName,
        total: list.length,
        pending: count("PENDING", list),
        accepted: count("ACCEPTED", list),
        denied: count("DENIED", list),
      })),
      averageReviewMinutes: decided.length
        ? Math.round(decided.reduce((sum, item) => sum + ((item.decidedAt?.getTime() ?? 0) - item.createdAt.getTime()), 0) / decided.length / 60_000)
        : undefined,
    };
  }

  private patchPanel(id: string, patch: Partial<ApplicationPanel>): ApplicationPanel {
    const index = this.panels.findIndex((panel) => panel.id === id);
    const current = this.panels[index];
    if (!current) throw new ApplicationError("NOT_FOUND", "That panel was not found.");
    const next: Record<string, unknown> = { ...current, ...patch, updatedAt: this.now() };
    if (next.messageId === undefined) delete next.messageId;
    const updated = next as unknown as ApplicationPanel;
    this.panels[index] = updated;
    return updated;
  }

  private replace(id: string, change: (current: Application) => Application): Application {
    const index = this.applications.findIndex((item) => item.id === id);
    const current = this.applications[index];
    if (!current) throw new ApplicationError("NOT_FOUND", "That application was not found.");
    const updated = { ...change(current), updatedAt: this.now() };
    this.applications[index] = updated;
    return updated;
  }
}
