import { defaultLook } from "./applyLook.js";
import { MessagesError } from "./validation.js";
/** Process-local repository for tests. Not for production use. */
export class InMemoryMessagesRepository {
    now;
    looks = new Map();
    templates = new Map();
    constructor(now = () => new Date()) {
        this.now = now;
    }
    async getLook(guildId) {
        return this.looks.get(guildId);
    }
    async saveLook(input) {
        const current = this.looks.get(input.guildId) ?? defaultLook(input.guildId);
        if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
            throw new MessagesError("CONFLICT", "The look changed since it was loaded.", { currentRevision: current.revision });
        const { expectedRevision: _expected, ...rest } = input;
        const look = { ...rest, revision: current.revision + 1 };
        this.looks.set(input.guildId, look);
        return look;
    }
    async listTemplates(guildId) {
        return [...this.templates.values()].filter((template) => template.guildId === guildId).sort((left, right) => left.key.localeCompare(right.key));
    }
    async getTemplate(guildId, key) {
        return this.templates.get(`${guildId}:${key}`);
    }
    async saveTemplate(input) {
        const template = { ...input, embeds: input.embeds.map((embed) => ({ ...embed })), updatedAt: this.now() };
        this.templates.set(`${input.guildId}:${input.key}`, template);
        return template;
    }
    async deleteTemplate(guildId, key) {
        return this.templates.delete(`${guildId}:${key}`);
    }
}
//# sourceMappingURL=InMemoryMessagesRepository.js.map