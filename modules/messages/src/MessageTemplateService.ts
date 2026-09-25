import { MESSAGE_CATALOG, renderMessage, type MessageKeyDefinition, type MessageTemplates, type OutgoingMessage, type TemplateValues } from "@qbox/shared/messages";

import { applyLook, defaultLook, lookIsEmpty } from "./applyLook.js";
import { sampleValues } from "./samples.js";
import type { LookProvider, MessageCatalogEntry, MessageDraftInput, MessagesGateway, MessagesLook, MessagesLookInput, MessagesRepository, MessagesTemplate } from "./types.js";
import { MessagesError, normalizeMessage, requireMessageKey, requireSnowflake, validateLook } from "./validation.js";

const CACHE_TTL_MS = 60_000;
const CACHE_SIZE = 5000;

interface Cached<T> {
  readonly value: T;
  readonly at: number;
}

class TtlCache<T> {
  private readonly map = new Map<string, Cached<T>>();
  public constructor(private readonly now: () => number) {}
  public get(key: string): T | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (this.now() - entry.at >= CACHE_TTL_MS) {
      this.map.delete(key);
      return undefined;
    }
    return entry.value;
  }
  public set(key: string, value: T): void {
    if (!this.map.has(key) && this.map.size >= CACHE_SIZE) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, { value, at: this.now() });
  }
  public delete(key: string): void {
    this.map.delete(key);
  }
}

export interface MessageTemplateServiceOptions {
  readonly gateway?: MessagesGateway | undefined;
  readonly catalog?: readonly MessageKeyDefinition[] | undefined;
  readonly now?: (() => Date) | undefined;
}

/**
 * Custom messages and the server-wide look. Implements the `MessageTemplates`
 * port feature services call: `apply` never throws and returns the feature's
 * default when the server has not customized the message. Looks and
 * templates are cached for a minute per server. Permission checks happen
 * before the service is called.
 */
export class MessageTemplateService implements MessageTemplates, LookProvider {
  private readonly gateway: MessagesGateway | undefined;
  private readonly catalog: readonly MessageKeyDefinition[];
  private readonly now: () => Date;
  private readonly looks: TtlCache<MessagesLook>;
  private readonly templates: TtlCache<MessagesTemplate | null>;

  public constructor(
    private readonly repository: MessagesRepository,
    options: MessageTemplateServiceOptions = {},
  ) {
    this.gateway = options.gateway;
    this.catalog = options.catalog ?? MESSAGE_CATALOG;
    this.now = options.now ?? (() => new Date());
    const clock = () => this.now().getTime();
    this.looks = new TtlCache(clock);
    this.templates = new TtlCache(clock);
  }

  /* ---------- MessageTemplates port ---------- */

  public async apply(guildId: string, key: string, values: TemplateValues, fallback: OutgoingMessage): Promise<OutgoingMessage> {
    try {
      const template = await this.cachedTemplate(guildId, key);
      if (!template || !template.enabled) return fallback;
      const rendered = renderMessage({ ...(template.content === undefined ? {} : { content: template.content }), embeds: template.embeds }, values);
      if (!rendered.content && !rendered.embeds?.length) return fallback;
      return rendered;
    } catch {
      return fallback;
    }
  }

  /* ---------- LookProvider (used by the REST decorator) ---------- */

  public async look(guildId: string): Promise<MessagesLook | undefined> {
    try {
      const cached = this.looks.get(guildId);
      if (cached) return cached;
      const look = (await this.repository.getLook(guildId)) ?? defaultLook(guildId);
      this.looks.set(guildId, look);
      return look;
    } catch {
      return undefined;
    }
  }

  /* ---------- Look ---------- */

  public async getLook(guildId: string): Promise<MessagesLook> {
    requireSnowflake("guildId", guildId);
    return (await this.repository.getLook(guildId)) ?? defaultLook(guildId);
  }

  public async saveLook(input: MessagesLookInput): Promise<MessagesLook> {
    const saved = await this.repository.saveLook(validateLook(input));
    this.looks.delete(input.guildId);
    return saved;
  }

  /* ---------- Templates ---------- */

  public definition(key: string): MessageKeyDefinition {
    requireMessageKey(key);
    const definition = this.catalog.find((item) => item.key === key);
    if (!definition) throw new MessagesError("NOT_FOUND", "That message key does not exist.");
    return definition;
  }

  /** Every catalog message with the server's override, if any. */
  public async list(guildId: string): Promise<readonly MessageCatalogEntry[]> {
    requireSnowflake("guildId", guildId);
    const overrides = new Map((await this.repository.listTemplates(guildId)).map((template) => [template.key, template]));
    const guildName = await this.gateway?.guildName(guildId);
    return this.catalog.map((definition) => this.entry(definition, overrides.get(definition.key), guildName));
  }

  public async get(guildId: string, key: string): Promise<MessageCatalogEntry> {
    requireSnowflake("guildId", guildId);
    const definition = this.definition(key);
    return this.entry(definition, await this.repository.getTemplate(guildId, key), await this.gateway?.guildName(guildId));
  }

  public async save(guildId: string, key: string, input: MessageDraftInput & { readonly enabled?: boolean | undefined }, updatedBy?: string): Promise<MessageCatalogEntry> {
    requireSnowflake("guildId", guildId);
    const definition = this.definition(key);
    const message = normalizeMessage({ content: input.content, embeds: input.embeds });
    const saved = await this.repository.saveTemplate({ guildId, key, enabled: input.enabled !== false, content: message.content, embeds: message.embeds ?? [], updatedBy });
    this.templates.delete(`${guildId}:${key}`);
    return this.entry(definition, saved, await this.gateway?.guildName(guildId));
  }

  /** Removes the server's version so the feature's default is used again. */
  public async reset(guildId: string, key: string): Promise<MessageCatalogEntry> {
    requireSnowflake("guildId", guildId);
    const definition = this.definition(key);
    await this.repository.deleteTemplate(guildId, key);
    this.templates.delete(`${guildId}:${key}`);
    return this.entry(definition, undefined, await this.gateway?.guildName(guildId));
  }

  /** Renders a draft with sample values and the server's look, as it would be sent. */
  public async preview(guildId: string, key: string, draft: MessageDraftInput): Promise<OutgoingMessage> {
    requireSnowflake("guildId", guildId);
    const definition = this.definition(key);
    const guildName = (await this.gateway?.guildName(guildId)) ?? "Your Server";
    const rendered = renderMessage(normalizeMessage(draft), sampleValues(definition.placeholders, guildName));
    const look = await this.getLook(guildId);
    if (!look.enabled || lookIsEmpty(look) || !rendered.embeds?.length) return rendered;
    return { ...rendered, embeds: rendered.embeds.map((embed) => applyLook(embed, look, { guildName, now: this.now() })) };
  }

  /** Posts the preview of a draft (or the saved template) to a channel. */
  public async sendTest(guildId: string, key: string, channelId: string, draft?: MessageDraftInput): Promise<{ readonly messageId: string }> {
    requireSnowflake("guildId", guildId);
    requireSnowflake("channelId", channelId);
    if (!this.gateway) throw new MessagesError("DEPENDENCY_UNAVAILABLE", "Discord is not connected.");
    const source = draft ?? (await this.repository.getTemplate(guildId, key));
    if (!source) throw new MessagesError("INVALID_STATE", "Write the message first, then send a test.");
    const message = renderMessage(normalizeMessage({ content: source.content, embeds: source.embeds }), sampleValues(this.definition(key).placeholders, await this.gateway.guildName(guildId)));
    return this.gateway.postMessage(channelId, message);
  }

  /* ---------- Internals ---------- */

  private async cachedTemplate(guildId: string, key: string): Promise<MessagesTemplate | undefined> {
    const cacheKey = `${guildId}:${key}`;
    const cached = this.templates.get(cacheKey);
    if (cached !== undefined) return cached ?? undefined;
    const template = await this.repository.getTemplate(guildId, key);
    this.templates.set(cacheKey, template ?? null);
    return template;
  }

  private entry(definition: MessageKeyDefinition, template: MessagesTemplate | undefined, guildName: string | undefined): MessageCatalogEntry {
    return {
      ...definition,
      customized: template !== undefined,
      enabled: template?.enabled ?? true,
      ...(template ? { template: { ...(template.content === undefined ? {} : { content: template.content }), embeds: template.embeds }, updatedAt: template.updatedAt, updatedBy: template.updatedBy } : {}),
      samples: sampleValues(definition.placeholders, guildName),
    };
  }
}
