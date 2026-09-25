import { describe, expect, it } from "vitest";

import { HelixTwitchClient, KickClient, YouTubeClient } from "../src/index.js";

const now = () => new Date("2026-09-25T12:00:00Z");

interface Call { readonly url: string; readonly init: RequestInit }

/** A fake `fetch` answering by URL substring, recording every call. */
function fakeFetch(routes: readonly (readonly [string, (call: Call, hit: number) => Response])[]) {
  const calls: Call[] = [];
  const hits = new Map<string, number>();
  const fetchImpl = (async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = String(input);
    const call = { url, init };
    calls.push(call);
    const route = routes.find(([needle]) => url.includes(needle));
    if (!route) return new Response("not found", { status: 404 });
    const hit = (hits.get(route[0]) ?? 0) + 1;
    hits.set(route[0], hit);
    return route[1](call, hit);
  }) as typeof fetch;
  return { fetchImpl, calls };
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("HelixTwitchClient", () => {
  const twitchStream = { id: "39001", user_id: "12345", user_login: "amy", title: "Ranked grind", game_name: "Valorant", viewer_count: 1200, thumbnail_url: "https://static-cdn.jtvnw.net/previews-ttv/live_user_amy-{width}x{height}.jpg", started_at: "2026-09-25T11:00:00Z" };

  it("is unavailable without credentials", async () => {
    const client = new HelixTwitchClient(undefined, fakeFetch([]).fetchImpl, now);
    expect(client.available).toBe(false);
    await expect(client.resolve("amy")).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE" });
  });

  it("fetches a token, resolves users, and batches stream lookups", async () => {
    const { fetchImpl, calls } = fakeFetch([
      ["id.twitch.tv/oauth2/token", () => json({ access_token: "tok", expires_in: 3600 })],
      ["helix/users", () => json({ data: [{ id: "12345", login: "amy", display_name: "Amy", profile_image_url: "https://cdn/amy.png" }] })],
      ["helix/streams", () => json({ data: [twitchStream] })],
    ]);
    const client = new HelixTwitchClient({ clientId: "cid", clientSecret: "sec" }, fetchImpl, now);
    expect(await client.resolve("amy")).toEqual({ platform: "twitch", platformId: "12345", handle: "amy", displayName: "Amy", avatarUrl: "https://cdn/amy.png", url: "https://www.twitch.tv/amy" });
    expect(calls[0]?.url).toContain("oauth2/token");
    expect(String(calls[0]?.init.body)).toContain("grant_type=client_credentials");
    expect((calls[1]?.init.headers as Record<string, string>)["client-id"]).toBe("cid");
    const ids = Array.from({ length: 101 }, (_, index) => String(10_000 + index)).concat("12345");
    const status = await client.liveStatus(ids);
    expect(calls.filter((call) => call.url.includes("helix/streams"))).toHaveLength(2);
    expect(calls.filter((call) => call.url.includes("oauth2/token"))).toHaveLength(1);
    expect(status.get("12345")).toEqual({ status: "live", stream: { id: "39001", title: "Ranked grind", game: "Valorant", viewers: 1200, thumbnailUrl: "https://static-cdn.jtvnw.net/previews-ttv/live_user_amy-1280x720.jpg", startedAt: new Date("2026-09-25T11:00:00Z"), url: "https://www.twitch.tv/amy" } });
    expect(status.get("10000")).toEqual({ status: "offline" });
    expect(status.size).toBe(102);
  });

  it("refreshes the token once on 401 and reports failures per batch", async () => {
    const { fetchImpl, calls } = fakeFetch([
      ["id.twitch.tv/oauth2/token", (_call, hit) => json({ access_token: `tok${hit}`, expires_in: 3600 })],
      ["helix/streams", (call) => ((call.init.headers as Record<string, string>).authorization === "Bearer tok1" ? json({ message: "expired" }, 401) : json({ data: [] }))],
      ["helix/users", () => json({ data: [] }, 500)],
    ]);
    const client = new HelixTwitchClient({ clientId: "cid", clientSecret: "sec" }, fetchImpl, now);
    expect((await client.liveStatus(["1"])).get("1")).toEqual({ status: "offline" });
    expect(calls.filter((call) => call.url.includes("oauth2/token"))).toHaveLength(2);
    await expect(client.resolve("amy")).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: "Twitch answered with status 500." });
    const missing = new HelixTwitchClient({ clientId: "cid", clientSecret: "sec" }, fakeFetch([["oauth2/token", () => json({ access_token: "t", expires_in: 1 })], ["helix/users", () => json({ data: [] })]]).fetchImpl, now);
    await expect(missing.resolve("nobody")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("KickClient", () => {
  const siteChannel = { id: 77, slug: "amy", user: { username: "Amy", profile_pic: "https://kick/amy.png" }, livestream: { id: 501, session_title: "Chatting", viewer_count: 88, thumbnail: { url: "https://kick/thumb.jpg" }, categories: [{ name: "Just Chatting" }], created_at: "2026-09-25 10:30:00" } };

  it("uses the site API with a browser User-Agent when credentials are missing", async () => {
    const { fetchImpl, calls } = fakeFetch([
      ["kick.com/api/v2/channels/amy", () => json(siteChannel)],
      ["kick.com/api/v2/channels/bob", () => json({ ...siteChannel, slug: "bob", livestream: null })],
      ["kick.com/api/v2/channels/blocked", () => new Response("cloudflare", { status: 403 })],
    ]);
    const client = new KickClient(undefined, fetchImpl, now);
    expect(client.available).toBe(true);
    expect(await client.resolve("amy")).toEqual({ platform: "kick", platformId: "amy", handle: "amy", displayName: "Amy", avatarUrl: "https://kick/amy.png", url: "https://kick.com/amy" });
    expect((calls[0]?.init.headers as Record<string, string>)["user-agent"]).toContain("Mozilla/5.0");
    const status = await client.liveStatus(["amy", "bob", "blocked", "nobody"]);
    expect(status.get("amy")).toEqual({ status: "live", stream: { id: "501", title: "Chatting", game: "Just Chatting", viewers: 88, thumbnailUrl: "https://kick/thumb.jpg", startedAt: new Date("2026-09-25T10:30:00Z"), url: "https://kick.com/amy" } });
    expect(status.get("bob")).toEqual({ status: "offline" });
    expect(status.get("blocked")).toMatchObject({ status: "error", error: expect.stringContaining("403") });
    expect(status.get("nobody")).toMatchObject({ status: "error", error: "Kick says that creator does not exist." });
    await expect(client.resolve("nobody")).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(client.resolve("blocked")).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE" });
  });

  it("uses the public API with client credentials", async () => {
    const { fetchImpl, calls } = fakeFetch([
      ["id.kick.com/oauth/token", () => json({ access_token: "ktok", expires_in: 3600 })],
      ["public/v1/channels", () => json({ data: [
        { broadcaster_user_id: 9, slug: "amy", stream_title: "Speedrun", category: { name: "Celeste" }, stream: { is_live: true, viewer_count: 12, thumbnail: "https://kick/live.jpg", start_time: "2026-09-25T09:00:00Z" } },
        { broadcaster_user_id: 10, slug: "bob", stream: { is_live: false } },
      ] })],
      ["public/v1/users", () => json({ data: [{ user_id: 9, name: "Amy K", profile_picture: "https://kick/amy.png" }] })],
    ]);
    const client = new KickClient({ clientId: "kid", clientSecret: "ks" }, fetchImpl, now);
    expect(await client.resolve("amy")).toEqual({ platform: "kick", platformId: "amy", handle: "amy", displayName: "Amy K", avatarUrl: "https://kick/amy.png", url: "https://kick.com/amy" });
    expect((calls[1]?.init.headers as Record<string, string>).authorization).toBe("Bearer ktok");
    const status = await client.liveStatus(["amy", "bob", "zed"]);
    expect(calls.filter((call) => call.url.includes("public/v1/channels?slug=amy&slug=bob&slug=zed"))).toHaveLength(1);
    expect(status.get("amy")).toEqual({ status: "live", stream: { id: "amy:2026-09-25T09:00:00Z", title: "Speedrun", game: "Celeste", viewers: 12, thumbnailUrl: "https://kick/live.jpg", startedAt: new Date("2026-09-25T09:00:00Z"), url: "https://kick.com/amy" } });
    expect(status.get("bob")).toEqual({ status: "offline" });
    expect(status.get("zed")).toMatchObject({ status: "error" });
  });
});

describe("YouTubeClient", () => {
  const channelPage = `<html><head><meta property="og:title" content="Marques &amp; Co"><link itemprop="thumbnailUrl" href="https://yt3/avatar.jpg"><link rel="canonical" href="https://www.youtube.com/@mkbhd"></head><body><script>var ytInitialData = {"metadata":{"channelMetadataRenderer":{"externalId":"UCBJycsmduvYEL83R_U4JriQ"}},"header":{"channelId":"UCBJycsmduvYEL83R_U4JriQ"}}</script></body></html>`;
  const livePage = `<html><head><meta property="og:title" content="Live Q&amp;A"><link rel="canonical" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></head><body><script>{"videoDetails":{"videoId":"dQw4w9WgXcQ","isLive":true},"viewCount":{"videoViewCountRenderer":{"viewCount":{"runs":[{"text":"1,234"},{"text":" watching now"}]}}},"liveBroadcastDetails":{"startTimestamp":"2026-09-25T11:30:00+00:00"}}</script></body></html>`;
  const feed = `<?xml version="1.0"?><feed><entry><yt:videoId>aaaaaaaaaaa</yt:videoId><title>Older &amp; wiser</title><published>2026-09-20T10:00:00+00:00</published></entry><entry><yt:videoId>bbbbbbbbbbb</yt:videoId><title>Newest</title><published>2026-09-24T10:00:00+00:00</published></entry></feed>`;

  it("reads channel pages and the RSS feed without an API key", async () => {
    const { fetchImpl, calls } = fakeFetch([
      ["youtube.com/@mkbhd", () => new Response(channelPage)],
      ["youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ/live", () => new Response(livePage)],
      ["youtube.com/channel/UCoffline000000000000000/live", () => new Response(channelPage)],
      ["feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ", () => new Response(feed)],
    ]);
    const client = new YouTubeClient(undefined, fetchImpl);
    expect(await client.resolve("mkbhd")).toEqual({ platform: "youtube", platformId: "UCBJycsmduvYEL83R_U4JriQ", handle: "mkbhd", displayName: "Marques & Co", avatarUrl: "https://yt3/avatar.jpg", url: "https://www.youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ" });
    expect((calls[0]?.init.headers as Record<string, string>).cookie).toContain("CONSENT");
    const status = await client.liveStatus(["UCBJycsmduvYEL83R_U4JriQ", "UCoffline000000000000000", "UCmissing0000000000000000"]);
    expect(status.get("UCBJycsmduvYEL83R_U4JriQ")).toEqual({ status: "live", stream: { id: "dQw4w9WgXcQ", title: "Live Q&A", viewers: 1234, thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", startedAt: new Date("2026-09-25T11:30:00Z"), url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } });
    expect(status.get("UCoffline000000000000000")).toEqual({ status: "offline" });
    expect(status.get("UCmissing0000000000000000")).toMatchObject({ status: "error" });
    expect(await client.latestVideos("UCBJycsmduvYEL83R_U4JriQ")).toEqual([
      { id: "bbbbbbbbbbb", title: "Newest", url: "https://www.youtube.com/watch?v=bbbbbbbbbbb", publishedAt: new Date("2026-09-24T10:00:00Z") },
      { id: "aaaaaaaaaaa", title: "Older & wiser", url: "https://www.youtube.com/watch?v=aaaaaaaaaaa", publishedAt: new Date("2026-09-20T10:00:00Z") },
    ]);
    await expect(client.resolve("nobody")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("uses the Data API with a key", async () => {
    const { fetchImpl, calls } = fakeFetch([
      ["youtube/v3/channels?part=snippet&forHandle=%40mkbhd", () => json({ items: [{ id: "UCBJycsmduvYEL83R_U4JriQ", snippet: { title: "Marques", customUrl: "@mkbhd", thumbnails: { default: { url: "https://yt3/s.jpg" }, medium: { url: "https://yt3/m.jpg" } } } }] })],
      ["youtube/v3/channels?part=snippet&id=UCBJycsmduvYEL83R_U4JriQ", () => json({ items: [{ id: "UCBJycsmduvYEL83R_U4JriQ", snippet: { title: "Marques" } }] })],
      ["youtube/v3/search", (call) => (call.url.includes("channelId=UCBJycsmduvYEL83R_U4JriQ") ? json({ items: [{ id: { videoId: "dQw4w9WgXcQ" }, snippet: { title: "Live now", thumbnails: { high: { url: "https://i/high.jpg" } } } }] }) : json({ items: [] }))],
    ]);
    const client = new YouTubeClient("key123", fetchImpl);
    expect(await client.resolve("mkbhd")).toMatchObject({ platformId: "UCBJycsmduvYEL83R_U4JriQ", handle: "mkbhd", displayName: "Marques", avatarUrl: "https://yt3/m.jpg" });
    expect(await client.resolve("UCBJycsmduvYEL83R_U4JriQ")).toMatchObject({ handle: "UCBJycsmduvYEL83R_U4JriQ", displayName: "Marques" });
    expect(calls[0]?.url).toContain("key=key123");
    const status = await client.liveStatus(["UCBJycsmduvYEL83R_U4JriQ", "UCother00000000000000000"]);
    expect(status.get("UCBJycsmduvYEL83R_U4JriQ")).toEqual({ status: "live", stream: { id: "dQw4w9WgXcQ", title: "Live now", thumbnailUrl: "https://i/high.jpg", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" } });
    expect(status.get("UCother00000000000000000")).toEqual({ status: "offline" });
  });
});
