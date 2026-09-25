import { BRAND } from "@qbox/shared/brand";
import { colorValue } from "@qbox/shared/discord-rest";
import { renderPlaceholders, type OutgoingEmbed } from "@qbox/shared/messages";

import type { MessagesLook } from "./types.js";

export interface LookContext {
  readonly guildName: string;
  /** Used for the timestamp; defaults to now. */
  readonly now?: Date | undefined;
}

export function defaultLook(guildId: string): MessagesLook {
  return { guildId, enabled: true, showTimestamp: false, mode: "fill", revision: 0 };
}

/** Whether a look changes anything at all. */
export function lookIsEmpty(look: MessagesLook): boolean {
  return !look.accentColor && !look.footerText && !look.footerIconUrl && !look.authorName && !look.authorIconUrl && !look.thumbnailUrl && !look.showTimestamp;
}

/**
 * Applies a server's look to one embed. In "fill" mode only parts the embed
 * leaves empty are set; in "override" mode color, footer, and author are
 * always replaced. Thumbnail and timestamp only fill. Pure.
 */
export function applyLook(embed: OutgoingEmbed, look: MessagesLook, context: LookContext): OutgoingEmbed {
  if (!look.enabled) return embed;
  const values = { server: context.guildName, brand: BRAND.name };
  const text = (value: string): string => renderPlaceholders(value, values);
  const override = look.mode === "override";
  let result: OutgoingEmbed = embed;

  if (look.accentColor && (override || embed.color === undefined)) result = { ...result, color: colorValue(look.accentColor) };

  if (look.footerText && (override || !embed.footer))
    result = { ...result, footer: { text: text(look.footerText), ...(look.footerIconUrl ? { icon_url: look.footerIconUrl } : {}) } };
  else if (look.footerIconUrl && embed.footer && !embed.footer.icon_url && !override)
    result = { ...result, footer: { ...embed.footer, icon_url: look.footerIconUrl } };

  if (look.authorName && (override || !embed.author))
    result = { ...result, author: { name: text(look.authorName), ...(look.authorIconUrl ? { icon_url: look.authorIconUrl } : {}) } };
  else if (look.authorIconUrl && embed.author && !embed.author.icon_url && !override)
    result = { ...result, author: { ...embed.author, icon_url: look.authorIconUrl } };

  if (look.thumbnailUrl && !embed.thumbnail) result = { ...result, thumbnail: { url: look.thumbnailUrl } };
  if (look.showTimestamp && !embed.timestamp) result = { ...result, timestamp: (context.now ?? new Date()).toISOString() };
  return result;
}
