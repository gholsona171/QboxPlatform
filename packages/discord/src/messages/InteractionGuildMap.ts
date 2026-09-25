import type { InteractionGuildSource } from "@qbox/messages";

const DEFAULT_TTL_MS = 15 * 60_000;
const MAX_ENTRIES = 20_000;

interface Entry {
  readonly guildId: string;
  readonly expiresAt: number;
}

/**
 * Remembers which server an interaction came from, by interaction id and by
 * token, so REST calls that only carry those (`/interactions/:id/:token/callback`,
 * `/webhooks/:appId/:token/...`) can be themed. Entries expire after 15 minutes,
 * the lifetime of an interaction token.
 */
export class InteractionGuildMap implements InteractionGuildSource {
  private readonly ids = new Map<string, Entry>();
  private readonly tokens = new Map<string, Entry>();

  public constructor(
    private readonly now: () => number = Date.now,
    private readonly ttlMs: number = DEFAULT_TTL_MS,
  ) {}

  public remember(interactionId: string, token: string, guildId: string | null | undefined): void {
    if (!guildId) return;
    const entry = { guildId, expiresAt: this.now() + this.ttlMs };
    this.store(this.ids, interactionId, entry);
    this.store(this.tokens, token, entry);
  }

  public byId(interactionId: string): string | undefined {
    return this.read(this.ids, interactionId);
  }

  public byToken(token: string): string | undefined {
    return this.read(this.tokens, token);
  }

  public get size(): number {
    return this.ids.size;
  }

  private store(map: Map<string, Entry>, key: string, entry: Entry): void {
    if (map.size >= MAX_ENTRIES) this.sweep(map);
    map.set(key, entry);
  }

  private read(map: Map<string, Entry>, key: string): string | undefined {
    const entry = map.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      map.delete(key);
      return undefined;
    }
    return entry.guildId;
  }

  private sweep(map: Map<string, Entry>): void {
    const now = this.now();
    for (const [key, entry] of map) if (entry.expiresAt <= now) map.delete(key);
    while (map.size >= MAX_ENTRIES) {
      const oldest = map.keys().next().value;
      if (oldest === undefined) break;
      map.delete(oldest);
    }
  }
}
