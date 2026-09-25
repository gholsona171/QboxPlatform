import { defaultLook } from "./applyLook.js";
import type { MessagesLook, MessagesLookInput, MessagesRepository, MessagesTemplate, MessagesTemplateInput } from "./types.js";
import { MessagesError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryMessagesRepository implements MessagesRepository {
  public readonly looks = new Map<string, MessagesLook>();
  public readonly templates = new Map<string, MessagesTemplate>();

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async getLook(guildId: string): Promise<MessagesLook | undefined> {
    return this.looks.get(guildId);
  }

  public async saveLook(input: MessagesLookInput): Promise<MessagesLook> {
    const current = this.looks.get(input.guildId) ?? defaultLook(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new MessagesError("CONFLICT", "The look changed since it was loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const look = { ...rest, revision: current.revision + 1 };
    this.looks.set(input.guildId, look);
    return look;
  }

  public async listTemplates(guildId: string): Promise<readonly MessagesTemplate[]> {
    return [...this.templates.values()].filter((template) => template.guildId === guildId).sort((left, right) => left.key.localeCompare(right.key));
  }

  public async getTemplate(guildId: string, key: string): Promise<MessagesTemplate | undefined> {
    return this.templates.get(`${guildId}:${key}`);
  }

  public async saveTemplate(input: MessagesTemplateInput): Promise<MessagesTemplate> {
    const template: MessagesTemplate = { ...input, embeds: input.embeds.map((embed) => ({ ...embed })), updatedAt: this.now() };
    this.templates.set(`${input.guildId}:${input.key}`, template);
    return template;
  }

  public async deleteTemplate(guildId: string, key: string): Promise<boolean> {
    return this.templates.delete(`${guildId}:${key}`);
  }
}
