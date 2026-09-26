import { describe, expect, it } from "vitest";

import {
  HttpLinkResolver,
  JamendoApiCatalog,
  NOT_AUDIO_MESSAGE,
  RadioBrowserDirectory,
  STREAMING_SERVICE_MESSAGE,
  firstPlaylistEntry,
  isPrivateHost,
  parseProbeOutput,
  tagsFromFileName,
  type Fetch,
  type MusicProbe,
} from "../src/index.js";

interface FakeResponse {
  readonly status?: number;
  readonly headers?: Record<string, string>;
  readonly body?: string;
}

function fakeFetch(routes: Record<string, FakeResponse>, calls: string[] = []): Fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push(url);
    const headers = new Headers(init?.headers);
    if (headers.get("user-agent") !== "Guildhall/1.0") throw new Error("missing user agent");
    const route = routes[url];
    if (!route) throw new TypeError("fetch failed");
    return new Response(route.body ?? "", { status: route.status ?? 200, headers: route.headers ?? {} });
  }) as Fetch;
}

const probe: MusicProbe = {
  probe: async (input) => (input.endsWith("known.mp3") ? { durationSeconds: 181, title: "Known", cover: undefined } : undefined),
  extractCover: async () => false,
};

describe("link resolver", () => {
  it("rejects Spotify, Apple Music and YouTube with the plain explanation, and never fetches them", async () => {
    const calls: string[] = [];
    const resolver = new HttpLinkResolver(fakeFetch({}, calls));
    for (const url of ["https://open.spotify.com/track/abc", "https://music.apple.com/us/album/x", "https://www.youtube.com/watch?v=abc", "https://youtu.be/abc", "https://music.youtube.com/watch?v=1"])
      await expect(resolver.resolve(url)).rejects.toMatchObject({ code: "INVALID_INPUT", message: STREAMING_SERVICE_MESSAGE });
    await expect(resolver.resolve("https://soundcloud.com/a/b")).rejects.toThrow(/SoundCloud does not allow bots/);
    expect(calls).toEqual([]);
  });

  it("rejects bad links and private addresses", async () => {
    const resolver = new HttpLinkResolver(fakeFetch({}));
    await expect(resolver.resolve("not a link")).rejects.toThrow(/not a valid link/);
    await expect(resolver.resolve("ftp://files.example/a.mp3")).rejects.toThrow(/Only http and https/);
    await expect(resolver.resolve("http://127.0.0.1:3102/music")).rejects.toThrow(/local or private/);
    expect(isPrivateHost("192.168.1.4")).toBe(true);
    expect(isPrivateHost("[::1]")).toBe(true);
    expect(isPrivateHost("example.com")).toBe(false);
  });

  it("accepts audio files by extension, with the length from ffprobe when known", async () => {
    const resolver = new HttpLinkResolver(fakeFetch({}), probe);
    expect(await resolver.resolve("https://cdn.example/music/known.mp3")).toEqual({ url: "https://cdn.example/music/known.mp3", title: "Known", durationSeconds: 181, seekable: true });
    expect(await resolver.resolve("https://cdn.example/music/My%20Song.flac")).toEqual({ url: "https://cdn.example/music/My%20Song.flac", title: "My Song", durationSeconds: null, seekable: false });
  });

  it("checks the content type when the extension says nothing", async () => {
    const resolver = new HttpLinkResolver(fakeFetch({
      "https://radio.example/live": { headers: { "content-type": "audio/mpeg", "icy-name": "Cool FM" } },
      "https://files.example/get?id=1": { headers: { "content-type": "application/ogg", "content-length": "1000" } },
      "https://blog.example/post": { headers: { "content-type": "text/html; charset=utf-8" }, body: "<html></html>" },
      "https://files.example/missing": { status: 404 },
    }));
    expect(await resolver.resolve("https://radio.example/live")).toMatchObject({ title: "Cool FM", durationSeconds: null, seekable: false });
    expect(await resolver.resolve("https://files.example/get?id=1")).toMatchObject({ title: "get", seekable: false });
    await expect(resolver.resolve("https://blog.example/post")).rejects.toMatchObject({ code: "INVALID_INPUT", message: NOT_AUDIO_MESSAGE });
    await expect(resolver.resolve("https://files.example/missing")).rejects.toThrow(/error \(404\)/);
    await expect(resolver.resolve("https://down.example/a")).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE" });
  });

  it("plays the first entry of m3u and pls playlists", async () => {
    const resolver = new HttpLinkResolver(fakeFetch({
      "https://radio.example/listen.m3u": { body: "#EXTM3U\n#EXTINF:-1,Cool FM\nhttps://stream.example/cool\nhttps://stream.example/backup\n" },
      "https://radio.example/listen.pls": { body: "[playlist]\nNumberOfEntries=2\nFile1=https://stream.example/pls-first\nTitle1=First\nFile2=https://stream.example/second\n" },
      "https://radio.example/tune": { headers: { "content-type": "audio/x-scpls" }, body: "[playlist]\nFile1=/relative/stream\n" },
      "https://stream.example/cool": { headers: { "content-type": "audio/aac" } },
      "https://stream.example/pls-first": { headers: { "content-type": "audio/mpeg", "icy-name": "First FM" } },
      "https://radio.example/relative/stream": { headers: { "content-type": "audio/mpeg" } },
      "https://radio.example/empty.m3u": { body: "#EXTM3U\n" },
    }));
    expect(await resolver.resolve("https://radio.example/listen.m3u")).toEqual({ url: "https://stream.example/cool", title: "listen", durationSeconds: null, seekable: false });
    expect(await resolver.resolve("https://radio.example/listen.pls")).toMatchObject({ url: "https://stream.example/pls-first", title: "First FM" });
    expect(await resolver.resolve("https://radio.example/tune")).toMatchObject({ url: "https://radio.example/relative/stream", seekable: false });
    await expect(resolver.resolve("https://radio.example/empty.m3u")).rejects.toThrow(/no entries/);
    expect(firstPlaylistEntry("File1 = http://a.example/x", "http://b.example/")).toBe("http://a.example/x");
  });
});

describe("radio and Jamendo", () => {
  it("searches Radio Browser and keeps usable stations", async () => {
    const calls: string[] = [];
    const url = "https://de1.api.radio-browser.info/json/stations/search?name=jazz%20fm&limit=20&hidebroken=true";
    const directory = new RadioBrowserDirectory(fakeFetch({
      [url]: { headers: { "content-type": "application/json" }, body: JSON.stringify([
        { stationuuid: "u1", name: " Jazz FM ", url: "http://a", url_resolved: "https://jazz.example/stream", favicon: "https://jazz.example/icon.png", tags: "jazz, smooth", countrycode: "GB", codec: "MP3", bitrate: 128 },
        { stationuuid: "u2", name: "", url_resolved: "https://x.example" },
        { stationuuid: "u3", name: "No url", url_resolved: "" },
      ]) },
    }, calls));
    expect(await directory.search("jazz fm")).toEqual([{ id: "u1", name: "Jazz FM", url: "https://jazz.example/stream", faviconUrl: "https://jazz.example/icon.png", tags: ["jazz", "smooth"], country: "GB", codec: "MP3", bitrate: 128 }]);
    expect(calls).toEqual([url]);
    expect(await directory.search("  ")).toEqual([]);
  });

  it("searches Jamendo only with a client ID", async () => {
    expect(new JamendoApiCatalog("").available).toBe(false);
    await expect(new JamendoApiCatalog("").search("rock")).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE" });
    const catalog = new JamendoApiCatalog("abc", fakeFetch({
      "https://api.jamendo.com/v3.0/tracks/?client_id=abc&format=json&audioformat=mp32&search=rock&limit=20": { body: JSON.stringify({ results: [{ id: "12", name: "Rocking", artist_name: "Band", album_name: "LP", duration: 200, audio: "https://mp3.jamendo.com/12.mp3", image: "https://img/12.jpg" }, { id: "13", name: "No audio" }] }) },
      "https://api.jamendo.com/v3.0/tracks/?client_id=abc&format=json&audioformat=mp32&id=12": { body: JSON.stringify({ results: [{ id: 12, name: "Rocking", duration: "200", audio: "https://mp3.jamendo.com/12.mp3" }] }) },
    }));
    expect(await catalog.search("rock")).toEqual([{ id: "12", title: "Rocking", artist: "Band", album: "LP", durationSeconds: 200, url: "https://mp3.jamendo.com/12.mp3", imageUrl: "https://img/12.jpg" }]);
    expect(await catalog.track("12")).toMatchObject({ id: "12", artist: "Unknown artist", durationSeconds: 200 });
    expect(await catalog.track("../etc")).toBeUndefined();
  });
});

describe("tags", () => {
  it("reads ffprobe tags case-insensitively and finds the cover stream", () => {
    const tags = parseProbeOutput(JSON.stringify({
      format: { duration: "215.4", tags: { TITLE: "Song", Artist: "Singer", album: "Album", track: "3/12" } },
      streams: [{ index: 0, codec_type: "audio", codec_name: "mp3" }, { index: 1, codec_type: "video", codec_name: "mjpeg", disposition: { attached_pic: 1 } }],
    }));
    expect(tags).toEqual({ title: "Song", artist: "Singer", album: "Album", trackNumber: 3, durationSeconds: 215, cover: { streamIndex: 1, extension: "jpg" } });
    expect(parseProbeOutput("{}")).toEqual({ title: undefined, artist: undefined, album: undefined, trackNumber: undefined, durationSeconds: undefined, cover: undefined });
  });

  it("falls back to the file name", () => {
    expect(tagsFromFileName("Daft Punk - One More Time.mp3")).toEqual({ artist: "Daft Punk", title: "One More Time" });
    expect(tagsFromFileName("03 - Artist - Title.flac")).toEqual({ artist: "Artist", title: "Title" });
    expect(tagsFromFileName("my_song.ogg")).toEqual({ title: "my song" });
  });
});
