import { colorValue } from "@qbox/shared/discord-rest";
import { renderPlaceholders, type OutgoingEmbed, type OutgoingMessage, type TemplateValues } from "@qbox/shared/messages";

import type { LiveStream, StreamPlatform, StreamVideo, StreamsSubscription } from "./types.js";
import { platformLabel } from "./validation.js";

/** Embed colors per platform. */
export const PLATFORM_COLORS: Readonly<Record<StreamPlatform, string>> = { twitch: "#9146FF", kick: "#53FC18", youtube: "#FF0000" };

/** The creator's channel page. */
export function creatorUrl(platform: StreamPlatform, handle: string, platformId: string): string {
  if (platform === "twitch") return `https://www.twitch.tv/${handle}`;
  if (platform === "kick") return `https://kick.com/${platformId}`;
  return `https://www.youtube.com/channel/${platformId}`;
}

/** "2h 5m", "45m". */
export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60_000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

/** Adds a timestamp query so Discord fetches a fresh preview image. */
export function cacheBusted(url: string, now: Date): string {
  return `${url}${url.includes("?") ? "&" : "?"}t=${Math.floor(now.getTime() / 1000)}`;
}

function author(subscription: StreamsSubscription): OutgoingEmbed["author"] {
  return {
    name: subscription.displayName,
    url: creatorUrl(subscription.platform, subscription.handle, subscription.platformId),
    ...(subscription.avatarUrl ? { icon_url: subscription.avatarUrl } : {}),
  };
}

export function liveValues(subscription: StreamsSubscription, stream: LiveStream, server: string | undefined): TemplateValues {
  return {
    creator: subscription.displayName,
    platform: platformLabel(subscription.platform),
    title: stream.title,
    game: stream.game ?? "",
    viewers: stream.viewers ?? "",
    url: stream.url,
    thumbnail: stream.thumbnailUrl ?? "",
    startedAt: stream.startedAt ?? null,
    server: server ?? "",
    ping: subscription.pingRoleId ? `<@&${subscription.pingRoleId}>` : "",
  };
}

/** Default "is live" announcement: platform-colored embed with the stream details. */
export function liveMessage(subscription: StreamsSubscription, stream: LiveStream, values: TemplateValues, now: Date): OutgoingMessage {
  const platform = platformLabel(subscription.platform);
  const ping = subscription.pingRoleId ? `<@&${subscription.pingRoleId}> ` : "";
  const content = subscription.messageText ? renderPlaceholders(subscription.messageText, values) : `${ping}**${subscription.displayName}** is live on ${platform}!`;
  const fields = [
    ...(stream.game ? [{ name: subscription.platform === "youtube" ? "Category" : "Game", value: stream.game.slice(0, 1024), inline: true }] : []),
    ...(stream.viewers === undefined ? [] : [{ name: "Viewers", value: stream.viewers.toLocaleString("en-US"), inline: true }]),
  ];
  return {
    content,
    embeds: [{
      author: author(subscription),
      title: (stream.title || `${subscription.displayName} is live`).slice(0, 256),
      url: stream.url,
      color: colorValue(PLATFORM_COLORS[subscription.platform]),
      ...(fields.length ? { fields } : {}),
      ...(stream.thumbnailUrl ? { image: { url: cacheBusted(stream.thumbnailUrl, now) } } : {}),
      footer: { text: platform },
      ...(stream.startedAt ? { timestamp: stream.startedAt.toISOString() } : {}),
    }],
  };
}

export function endedValues(subscription: StreamsSubscription, durationMs: number, url: string): TemplateValues {
  return { creator: subscription.displayName, platform: platformLabel(subscription.platform), duration: formatDuration(durationMs), url };
}

/** What the live announcement becomes when the stream ends (edit behavior). */
export function endedMessage(subscription: StreamsSubscription, values: TemplateValues): OutgoingMessage {
  return {
    content: `**${subscription.displayName}**'s ${values["platform"]} stream has ended.`,
    embeds: [{
      author: author(subscription),
      title: "Stream ended",
      url: String(values["url"]),
      description: `Live for ${values["duration"]}.`,
      color: colorValue(PLATFORM_COLORS[subscription.platform]),
      footer: { text: platformLabel(subscription.platform) },
    }],
  };
}

export function videoValues(subscription: StreamsSubscription, video: StreamVideo): TemplateValues {
  return { creator: subscription.displayName, title: video.title, url: video.url, publishedAt: video.publishedAt };
}

/** Default "new video" announcement. */
export function videoMessage(subscription: StreamsSubscription, video: StreamVideo): OutgoingMessage {
  return {
    content: `**${subscription.displayName}** uploaded a new video!`,
    embeds: [{
      author: author(subscription),
      title: video.title.slice(0, 256),
      url: video.url,
      color: colorValue(PLATFORM_COLORS.youtube),
      image: { url: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg` },
      footer: { text: "YouTube" },
      timestamp: video.publishedAt.toISOString(),
    }],
  };
}

/** Stream used by the portal's "Test" button when the creator is offline. */
export function sampleStream(subscription: StreamsSubscription, now: Date): LiveStream {
  return {
    id: `sample-${now.getTime()}`,
    title: `Testing the live announcement for ${subscription.displayName}`,
    game: subscription.platform === "youtube" ? "Gaming" : "Just Chatting",
    viewers: 123,
    startedAt: now,
    url: creatorUrl(subscription.platform, subscription.handle, subscription.platformId),
  };
}
