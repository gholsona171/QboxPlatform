import { DEFAULT_TIMEOUT_MS, HttpError, describeFailure, request, type Fetch } from "./http.js";
import type { LiveCheck, StreamCreator, StreamPlatformClient } from "./types.js";
import { StreamsError } from "./validation.js";

export interface TwitchCredentials {
  readonly clientId: string;
  readonly clientSecret: string;
}

/** User IDs per `/helix/streams` request. */
const BATCH_SIZE = 100;
const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const HELIX_URL = "https://api.twitch.tv/helix";

interface UserJson { readonly id: string; readonly login: string; readonly display_name: string; readonly profile_image_url?: string }
interface StreamJson { readonly id: string; readonly user_id: string; readonly user_login: string; readonly title: string; readonly game_name?: string; readonly viewer_count?: number; readonly thumbnail_url?: string; readonly started_at?: string }
interface TokenJson { readonly access_token: string; readonly expires_in: number }

/** Twitch Helix with an app access token (client credentials), refreshed when it expires or Twitch answers 401. */
export class HelixTwitchClient implements StreamPlatformClient {
  public readonly platform = "twitch" as const;
  public readonly available: boolean;
  private token: { readonly value: string; readonly expiresAt: number } | undefined;

  public constructor(
    private readonly credentials: TwitchCredentials | undefined,
    private readonly fetchImpl: Fetch = fetch,
    private readonly now: () => Date = () => new Date(),
    private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ) {
    this.available = credentials !== undefined;
  }

  public async resolve(handle: string): Promise<StreamCreator> {
    const query = /^\d+$/.test(handle) ? `id=${handle}` : `login=${encodeURIComponent(handle)}`;
    const users = await this.helix<UserJson>(`users?${query}`).catch((error: unknown) => {
      throw new StreamsError("DEPENDENCY_UNAVAILABLE", describeFailure("Twitch", error));
    });
    const user = users[0];
    if (!user) throw new StreamsError("NOT_FOUND", `No Twitch channel called "${handle}" was found.`);
    return { platform: "twitch", platformId: user.id, handle: user.login, displayName: user.display_name || user.login, avatarUrl: user.profile_image_url, url: `https://www.twitch.tv/${user.login}` };
  }

  public async liveStatus(platformIds: readonly string[]): Promise<ReadonlyMap<string, LiveCheck>> {
    const results = new Map<string, LiveCheck>();
    for (let start = 0; start < platformIds.length; start += BATCH_SIZE) {
      const chunk = platformIds.slice(start, start + BATCH_SIZE);
      try {
        const streams = await this.helix<StreamJson>(`streams?first=${BATCH_SIZE}&${chunk.map((id) => `user_id=${encodeURIComponent(id)}`).join("&")}`);
        for (const id of chunk) {
          const stream = streams.find((item) => item.user_id === id);
          results.set(id, stream ? { status: "live", stream: toStream(stream) } : { status: "offline" });
        }
      } catch (error) {
        for (const id of chunk) results.set(id, { status: "error", error: describeFailure("Twitch", error) });
      }
    }
    return results;
  }

  private async helix<T>(path: string, retry = true): Promise<readonly T[]> {
    const credentials = this.credentials;
    if (!credentials) throw new StreamsError("DEPENDENCY_UNAVAILABLE", "Twitch needs app credentials on the host.");
    const token = await this.accessToken(credentials);
    try {
      const response = await request(this.fetchImpl, `${HELIX_URL}/${path}`, { headers: { accept: "application/json", "client-id": credentials.clientId, authorization: `Bearer ${token}` } }, this.timeoutMs);
      return ((await response.json()) as { readonly data?: readonly T[] }).data ?? [];
    } catch (error) {
      if (error instanceof HttpError && error.status === 401 && retry) {
        this.token = undefined;
        return this.helix<T>(path, false);
      }
      throw error;
    }
  }

  private async accessToken(credentials: TwitchCredentials): Promise<string> {
    if (this.token && this.token.expiresAt - this.now().getTime() > 60_000) return this.token.value;
    const body = new URLSearchParams({ client_id: credentials.clientId, client_secret: credentials.clientSecret, grant_type: "client_credentials" });
    const response = await request(this.fetchImpl, TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: body.toString() }, this.timeoutMs);
    const json = (await response.json()) as TokenJson;
    this.token = { value: json.access_token, expiresAt: this.now().getTime() + json.expires_in * 1000 };
    return json.access_token;
  }
}

function toStream(stream: StreamJson) {
  const startedAt = stream.started_at ? new Date(stream.started_at) : undefined;
  return {
    id: stream.id,
    title: stream.title,
    ...(stream.game_name ? { game: stream.game_name } : {}),
    ...(typeof stream.viewer_count === "number" ? { viewers: stream.viewer_count } : {}),
    ...(stream.thumbnail_url ? { thumbnailUrl: stream.thumbnail_url.replace("{width}", "1280").replace("{height}", "720") } : {}),
    ...(startedAt && !Number.isNaN(startedAt.getTime()) ? { startedAt } : {}),
    url: `https://www.twitch.tv/${stream.user_login}`,
  };
}
