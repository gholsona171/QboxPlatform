import type { AutomodMessage, AutomodRule, AutomodSettings, AutomodViolation } from "./types.js";

const INVITE_PATTERN = /(?:discord(?:app)?\.com\/invite|discord\.gg|discord\.me|dsc\.gg)\/[a-z0-9-]+/i;
const LINK_PATTERN = /https?:\/\/([^\s/?#<>]+)/gi;

const rule = (action: AutomodRule["action"] = "DELETE"): AutomodRule => ({ enabled: false, action, timeoutMinutes: 10 });

export function defaultAutomod(): AutomodSettings {
  return {
    enabled: false,
    exemptRoleIds: [],
    exemptChannelIds: [],
    spam: { ...rule("TIMEOUT"), maxMessages: 6, perSeconds: 5 },
    invites: rule(),
    links: { ...rule(), allowedDomains: ["tenor.com", "giphy.com", "youtube.com", "youtu.be"] },
    words: { ...rule("WARN"), words: [] },
    mentions: { ...rule("TIMEOUT"), maxMentions: 6 },
    caps: { ...rule(), minLength: 12, percent: 75 },
  };
}

/** Tracks recent message times per member to detect spam bursts. */
export class SpamTracker {
  private readonly recent = new Map<string, number[]>();

  /** Records a message and returns how many the member sent inside the window. */
  public record(key: string, at: number, windowSeconds: number): number {
    const cutoff = at - windowSeconds * 1000;
    const times = (this.recent.get(key) ?? []).filter((time) => time > cutoff);
    times.push(at);
    this.recent.set(key, times);
    if (this.recent.size > 10_000) this.prune(cutoff);
    return times.length;
  }

  public reset(key: string): void {
    this.recent.delete(key);
  }

  private prune(cutoff: number): void {
    for (const [key, times] of this.recent) if (!times.some((time) => time > cutoff)) this.recent.delete(key);
  }
}

/**
 * Checks one message against the automod rules. Returns the first violation,
 * or undefined. Exempt roles and channels are never checked.
 */
export function evaluateAutomod(settings: AutomodSettings, message: AutomodMessage, spam: SpamTracker): AutomodViolation | undefined {
  if (!settings.enabled) return undefined;
  if (settings.exemptChannelIds.includes(message.channelId)) return undefined;
  if (message.authorRoleIds.some((roleId) => settings.exemptRoleIds.includes(roleId))) return undefined;
  const content = message.content;
  const violation = (name: AutomodViolation["rule"], config: AutomodRule, description: string): AutomodViolation => ({
    rule: name,
    description,
    action: config.action,
    timeoutMinutes: config.timeoutMinutes,
  });

  if (settings.spam.enabled) {
    const count = spam.record(`${message.guildId}:${message.authorId}`, message.createdAt.getTime(), settings.spam.perSeconds);
    if (count > settings.spam.maxMessages) {
      spam.reset(`${message.guildId}:${message.authorId}`);
      return violation("spam", settings.spam, `Sent more than ${settings.spam.maxMessages} messages in ${settings.spam.perSeconds} seconds.`);
    }
  }
  if (settings.mentions.enabled && message.mentionCount > settings.mentions.maxMentions)
    return violation("mentions", settings.mentions, `Mentioned ${message.mentionCount} users or roles at once.`);
  if (!content) return undefined;
  if (settings.invites.enabled && INVITE_PATTERN.test(content))
    return violation("invites", settings.invites, "Posted a Discord invite link.");
  if (settings.links.enabled) {
    for (const match of content.matchAll(LINK_PATTERN)) {
      const host = (match[1] ?? "").toLowerCase().replace(/^www\./, "");
      const allowed = settings.links.allowedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
      if (!allowed) return violation("links", settings.links, `Posted a link to ${host}.`);
    }
  }
  if (settings.words.enabled) {
    const word = settings.words.words.find((entry) => wordPattern(entry).test(content));
    if (word) return violation("words", settings.words, "Used a blocked word.");
  }
  if (settings.caps.enabled) {
    const letters = content.replace(/[^a-z]/gi, "");
    if (letters.length >= settings.caps.minLength) {
      const upper = letters.replace(/[^A-Z]/g, "").length;
      if ((upper / letters.length) * 100 >= settings.caps.percent)
        return violation("caps", settings.caps, "Used too many capital letters.");
    }
  }
  return undefined;
}

/** Whole-word, case-insensitive match. A `*` in the entry matches any letters. */
function wordPattern(entry: string): RegExp {
  const escaped = entry.trim().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", "\\w*");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "iu");
}

/** Parses durations like `30m`, `2h`, `7d`, `1w`, or a number of minutes. */
export function parseDuration(value: string): number | undefined {
  const match = /^\s*(\d+)\s*(m|min|mins|minutes?|h|hr|hrs|hours?|d|days?|w|weeks?)?\s*$/i.exec(value);
  if (!match) return undefined;
  const amount = Number(match[1]);
  const unit = (match[2] ?? "m").toLowerCase();
  const factor = unit.startsWith("w") ? 10_080 : unit.startsWith("d") ? 1_440 : unit.startsWith("h") ? 60 : 1;
  const minutes = amount * factor;
  return minutes > 0 ? minutes : undefined;
}

/** Formats minutes as a short human duration, e.g. `2 hours`. */
export function formatDuration(minutes: number): string {
  if (minutes % 10_080 === 0) return plural(minutes / 10_080, "week");
  if (minutes % 1_440 === 0) return plural(minutes / 1_440, "day");
  if (minutes % 60 === 0) return plural(minutes / 60, "hour");
  return plural(minutes, "minute");
}

function plural(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}
