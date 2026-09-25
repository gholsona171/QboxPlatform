import { BROWSER_USER_AGENT, DEFAULT_TIMEOUT_MS, HttpError, capture, decodeEntities, describeFailure, getJson, getText, type Fetch } from "./http.js";
import type { LiveCheck, LiveStream, StreamCreator, StreamPlatformClient, StreamVideo } from "./types.js";
import { StreamsError } from "./validation.js";

const DATA_API_URL = "https://www.googleapis.com/youtube/v3";
const SITE_URL = "https://www.youtube.com";
const CHANNEL_ID = /^UC[\w-]{22}$/;
/** Headers that skip the EU consent page and get the full HTML. */
const SITE_HEADERS = { "user-agent": BROWSER_USER_AGENT, "accept-language": "en-US,en;q=0.9", cookie: "CONSENT=YES+1; SOCS=CAI" };

interface ChannelJson { readonly id: string; readonly snippet?: { readonly title?: string; readonly customUrl?: string; readonly thumbnails?: { readonly default?: { readonly url?: string }; readonly medium?: { readonly url?: string } } } }
interface SearchJson { readonly id?: { readonly videoId?: string }; readonly snippet?: { readonly title?: string; readonly thumbnails?: { readonly high?: { readonly url?: string }; readonly medium?: { readonly url?: string } } } }

/**
 * YouTube channels through the Data API when the host has an API key, else
 * by reading the public channel pages. New uploads come from the channel's
 * RSS feed, which needs no key.
 */
export class YouTubeClient implements StreamPlatformClient {
  public readonly platform = "youtube" as const;
  public readonly available = true;

  public constructor(
    private readonly apiKey: string | undefined,
    private readonly fetchImpl: Fetch = fetch,
    private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ) {}

  public async resolve(handle: string): Promise<StreamCreator> {
    try {
      return this.apiKey ? await this.resolveApi(handle, this.apiKey) : await this.resolveSite(handle);
    } catch (error) {
      if (error instanceof StreamsError) throw error;
      if (error instanceof HttpError && error.status === 404) throw new StreamsError("NOT_FOUND", `No YouTube channel called "${handle}" was found.`);
      throw new StreamsError("DEPENDENCY_UNAVAILABLE", describeFailure("YouTube", error));
    }
  }

  public async liveStatus(platformIds: readonly string[]): Promise<ReadonlyMap<string, LiveCheck>> {
    const results = new Map<string, LiveCheck>();
    for (const channelId of platformIds) {
      try {
        const stream = this.apiKey ? await this.liveApi(channelId, this.apiKey) : await this.liveSite(channelId);
        results.set(channelId, stream ? { status: "live", stream } : { status: "offline" });
      } catch (error) {
        results.set(channelId, { status: "error", error: describeFailure("YouTube", error) });
      }
    }
    return results;
  }

  /** Newest first, from the channel's RSS feed. */
  public async latestVideos(channelId: string): Promise<readonly StreamVideo[]> {
    const xml = await getText(this.fetchImpl, `${SITE_URL}/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`, { accept: "application/atom+xml, application/xml" }, this.timeoutMs);
    const videos: StreamVideo[] = [];
    for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
      const id = /<yt:videoId>([\w-]{11})<\/yt:videoId>/.exec(entry ?? "")?.[1];
      const title = /<title>([\s\S]*?)<\/title>/.exec(entry ?? "")?.[1];
      const published = /<published>([^<]+)<\/published>/.exec(entry ?? "")?.[1];
      if (!id || title === undefined) continue;
      const publishedAt = published ? new Date(published) : new Date(NaN);
      videos.push({ id, title: decodeEntities(title.trim()), url: `${SITE_URL}/watch?v=${id}`, publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date(0) : publishedAt });
    }
    return videos.sort((left, right) => right.publishedAt.getTime() - left.publishedAt.getTime());
  }

  private async resolveApi(handle: string, key: string): Promise<StreamCreator> {
    const query = CHANNEL_ID.test(handle) ? `id=${handle}` : `forHandle=${encodeURIComponent(`@${handle}`)}`;
    const json = await getJson<{ readonly items?: readonly ChannelJson[] }>(this.fetchImpl, `${DATA_API_URL}/channels?part=snippet&${query}&key=${encodeURIComponent(key)}`, {}, this.timeoutMs);
    const channel = json.items?.[0];
    if (!channel) throw new StreamsError("NOT_FOUND", `No YouTube channel called "${handle}" was found.`);
    const custom = channel.snippet?.customUrl?.replace(/^@/, "");
    return {
      platform: "youtube",
      platformId: channel.id,
      handle: custom || handle,
      displayName: channel.snippet?.title || handle,
      avatarUrl: channel.snippet?.thumbnails?.medium?.url ?? channel.snippet?.thumbnails?.default?.url,
      url: `${SITE_URL}/channel/${channel.id}`,
    };
  }

  private async resolveSite(handle: string): Promise<StreamCreator> {
    const path = CHANNEL_ID.test(handle) ? `/channel/${handle}` : `/@${encodeURIComponent(handle)}`;
    const html = await getText(this.fetchImpl, `${SITE_URL}${path}`, SITE_HEADERS, this.timeoutMs);
    const channelId = capture(html, /"channelId":"(UC[\w-]{22})"/) ?? capture(html, /<meta itemprop="identifier" content="(UC[\w-]{22})">/);
    if (!channelId) throw new StreamsError("NOT_FOUND", `No YouTube channel called "${handle}" was found.`);
    const title = capture(html, /<meta property="og:title" content="([^"]*)">/);
    const avatar = capture(html, /<link itemprop="thumbnailUrl" href="([^"]+)">/) ?? capture(html, /"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/);
    const canonical = capture(html, /"canonicalBaseUrl":"\/@([^"/]+)"/) ?? capture(html, /<link rel="canonical" href="https:\/\/www\.youtube\.com\/@([^"/]+)">/);
    return {
      platform: "youtube",
      platformId: channelId,
      handle: canonical ? decodeURIComponent(canonical) : handle,
      displayName: title ? decodeEntities(title) : handle,
      ...(avatar ? { avatarUrl: avatar } : {}),
      url: `${SITE_URL}/channel/${channelId}`,
    };
  }

  private async liveApi(channelId: string, key: string): Promise<LiveStream | undefined> {
    const json = await getJson<{ readonly items?: readonly SearchJson[] }>(
      this.fetchImpl,
      `${DATA_API_URL}/search?part=snippet&channelId=${encodeURIComponent(channelId)}&eventType=live&type=video&maxResults=1&key=${encodeURIComponent(key)}`,
      {},
      this.timeoutMs,
    );
    const item = json.items?.[0];
    const videoId = item?.id?.videoId;
    if (!item || !videoId) return undefined;
    return {
      id: videoId,
      title: item.snippet?.title ?? "",
      ...(item.snippet?.thumbnails?.high?.url ? { thumbnailUrl: item.snippet.thumbnails.high.url } : {}),
      url: `${SITE_URL}/watch?v=${videoId}`,
    };
  }

  private async liveSite(channelId: string): Promise<LiveStream | undefined> {
    const html = await getText(this.fetchImpl, `${SITE_URL}/channel/${encodeURIComponent(channelId)}/live`, SITE_HEADERS, this.timeoutMs);
    const videoId = capture(html, /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})">/);
    if (!videoId || !/"isLive":true/.test(html)) return undefined;
    const title = capture(html, /<meta property="og:title" content="([^"]*)">/) ?? capture(html, /<meta name="title" content="([^"]*)">/);
    const viewers = capture(html, /"viewCount":\{"videoViewCountRenderer":\{"viewCount":\{"runs":\[\{"text":"([\d,.]+)"/);
    const startedAt = capture(html, /"startTimestamp":"([^"]+)"/);
    const started = startedAt ? new Date(startedAt) : undefined;
    const count = viewers ? Number(viewers.replace(/[,.]/g, "")) : NaN;
    return {
      id: videoId,
      title: title ? decodeEntities(title) : "",
      ...(Number.isFinite(count) ? { viewers: count } : {}),
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      ...(started && !Number.isNaN(started.getTime()) ? { startedAt: started } : {}),
      url: `${SITE_URL}/watch?v=${videoId}`,
    };
  }
}
