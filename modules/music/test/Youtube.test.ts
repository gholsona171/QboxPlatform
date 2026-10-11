import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  MusicError,
  YOUTUBE_BUSY_MESSAGE,
  YOUTUBE_FAILED_MESSAGE,
  YOUTUBE_SIGN_IN_MESSAGE,
  YOUTUBE_TIMEOUT_MESSAGE,
  YOUTUBE_UNAVAILABLE_MESSAGE,
  YtDlpYoutubeSource,
  cleanYoutubeQuery,
  findYtDlp,
  parseYoutubeLink,
  parseYoutubeRows,
  runProcess,
  youtubeError,
  youtubeStreamExpiry,
  youtubeWatchUrl,
  type ProcessResult,
  type ProcessRunner,
  type YtDlpYoutubeOptions,
} from "../src/index.js";

const ID = "dQw4w9WgXcQ";
const OTHER = "n61ULEU7CO0";
const FIELDS = "%(.{id,title,channel,uploader,duration,is_live,live_status,url})j";
const BASE = ["--ignore-config", "--no-warnings", "--no-playlist", "--socket-timeout", "10", "--js-runtimes", "node:/usr/bin/node"];
/** 2026-10-11T12:00:00Z in seconds; stream addresses below expire six hours later. */
const NOW_SECONDS = 1_791_720_000;
const EXPIRE = NOW_SECONDS + 6 * 3600;
const streamUrl = (tag: string, expire = EXPIRE) => `https://rr4---sn-test.googlevideo.com/videoplayback?expire=${expire}&ei=${tag}&itag=251`;
const row = (fields: Readonly<Record<string, unknown>>) => JSON.stringify({ id: ID, title: "Never Gonna Give You Up", channel: "Rick Astley", uploader: "Rick Astley", duration: 213, ...fields });
const ok = (stdout: string): ProcessResult => ({ code: 0, stdout, stderr: "", timedOut: false, truncated: false });
const failed = (stderr: string): ProcessResult => ({ code: 1, stdout: "", stderr, timedOut: false, truncated: false });

interface Call {
  readonly file: string;
  readonly args: readonly string[];
  readonly limits: { readonly timeoutMs: number; readonly maxBytes: number };
}

function setup(respond: (call: Call, at: number) => ProcessResult | Promise<ProcessResult>, options: Partial<YtDlpYoutubeOptions> = {}) {
  const calls: Call[] = [];
  const warnings: { message: string; details: Readonly<Record<string, unknown>> }[] = [];
  const clock = { now: NOW_SECONDS * 1000 };
  const run: ProcessRunner = async (file, args, limits) => {
    const call = { file, args, limits };
    calls.push(call);
    return respond(call, calls.length);
  };
  const source = new YtDlpYoutubeSource({ binary: "/opt/yt-dlp", jsRuntime: "node:/usr/bin/node", run, now: () => clock.now, log: { warn: (message, details) => warnings.push({ message, details }) }, ...options });
  return { source, calls, warnings, clock };
}

describe("YouTube links", () => {
  it("reads the video ID from every supported link shape", () => {
    for (const link of [
      `https://www.youtube.com/watch?v=${ID}`,
      `http://youtube.com/watch?v=${ID}&t=42s`,
      `https://m.youtube.com/watch?feature=share&v=${ID}`,
      `https://music.youtube.com/watch?v=${ID}&list=RDAMVM${ID}`,
      `https://www.youtube.com/watch?v=${ID}&list=PL1234567890&index=3`,
      `https://youtu.be/${ID}?si=abc`,
      `https://www.youtube.com/shorts/${ID}`,
      `https://www.youtube.com/live/${ID}?feature=share`,
      `https://www.youtube.com/embed/${ID}`,
      `https://www.youtube-nocookie.com/embed/${ID}`,
      `youtube.com/watch?v=${ID}`,
      `www.youtube.com/watch?v=${ID}`,
      `youtu.be/${ID}`,
      `  https://youtu.be/${ID}  `,
    ]) expect(parseYoutubeLink(link), link).toEqual({ kind: "video", id: ID });
  });

  it("tells playlists and other YouTube pages apart, and leaves everything else alone", () => {
    expect(parseYoutubeLink("https://www.youtube.com/playlist?list=PL1234567890")).toEqual({ kind: "playlist" });
    expect(parseYoutubeLink("https://music.youtube.com/playlist?list=OLAK5uy_abc")).toEqual({ kind: "playlist" });
    expect(parseYoutubeLink("https://www.youtube.com/watch?list=PL1234567890")).toEqual({ kind: "playlist" });
    for (const link of ["https://www.youtube.com/@LofiGirl", "https://www.youtube.com/results?search_query=lofi", "https://www.youtube.com/", "https://www.youtube.com/watch?v=short", `https://www.youtube.com/watch?v=${ID}extra`, "https://youtu.be/", "https://www.youtube.com/shorts/"])
      expect(parseYoutubeLink(link), link).toEqual({ kind: "other" });
    for (const text of ["never gonna give you up", "https://example.com/watch?v=dQw4w9WgXcQ", "https://notyoutube.com/watch?v=dQw4w9WgXcQ", "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ", "https://open.spotify.com/track/1", `ftp://youtube.com/watch?v=${ID}`, "library:abc", ""])
      expect(parseYoutubeLink(text), text).toBeUndefined();
  });

  it("builds the watch address only from a valid ID", () => {
    expect(youtubeWatchUrl(ID)).toBe(`https://www.youtube.com/watch?v=${ID}`);
    for (const bad of ["", "short", `${ID}x`, "--exec=rm x", "dQw4w9WgXc;", "../../../etc"]) expect(() => youtubeWatchUrl(bad), bad).toThrow(MusicError);
  });
});

describe("yt-dlp arguments", () => {
  it("passes search text as one argument, whatever it contains", async () => {
    const nasty = "$(rm -rf /); echo \"x\" | cat > /tmp/y & `id` 'q' \\ %PATH% \n second line\t\u0000end";
    const { source, calls } = setup(() => ok(""));
    await source.search(nasty, 3);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.file).toBe("/opt/yt-dlp");
    expect(calls[0]?.args).toEqual([...BASE, "--flat-playlist", "--print", FIELDS, "--", "ytsearch3:$(rm -rf /); echo \"x\" | cat > /tmp/y & `id` 'q' \\ %PATH% second line end"]);
    expect(calls[0]?.limits).toEqual({ timeoutMs: 12_000, maxBytes: 512 * 1024 });
  });

  it("keeps text that starts with a dash inside the search argument, after --", async () => {
    const { source, calls } = setup(() => ok(row({ url: streamUrl("a") })));
    await source.search("--exec rm -rf ~", 5);
    await source.first("-o /etc/passwd");
    for (const call of calls) expect(call.args.indexOf("--")).toBe(call.args.length - 2);
    expect(calls[0]?.args.at(-1)).toBe("ytsearch5:--exec rm -rf ~");
    expect(calls[1]?.args).toEqual([...BASE, "-f", "bestaudio/best", "--print", FIELDS, "--", "ytsearch1:-o /etc/passwd"]);
  });

  it("caps the query length and the number of results, and skips empty searches", async () => {
    const { source, calls } = setup(() => ok(Array.from({ length: 12 }, (_, at) => row({ id: `video-${String(at).padStart(5, "0")}` })).join("\n")));
    expect(await source.search("x".repeat(400), 50)).toHaveLength(10);
    expect(calls[0]?.args.at(-1)).toBe(`ytsearch10:${"x".repeat(150)}`);
    await source.search("one", 0);
    expect(calls[1]?.args.at(-1)).toBe("ytsearch1:one");
    expect(await source.search(" \n\t ")).toEqual([]);
    await expect(source.first("   ")).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect(calls).toHaveLength(2);
    expect(cleanYoutubeQuery("  a\r\n b\u0007  c ")).toBe("a b c");
  });

  it("looks up a video by the watch address it built, never by member text", async () => {
    const { source, calls } = setup(() => ok(row({ url: streamUrl("a") })));
    expect(await source.video(ID)).toEqual({ id: ID, title: "Never Gonna Give You Up", channel: "Rick Astley", durationSeconds: 213, thumbnailUrl: `https://i.ytimg.com/vi/${ID}/hqdefault.jpg` });
    expect(calls[0]?.args).toEqual([...BASE, "-f", "bestaudio/best", "--print", FIELDS, "--", `https://www.youtube.com/watch?v=${ID}`]);
    for (const bad of ["", "abc", `https://youtu.be/${ID}`, "--version", `${ID}&list=PL1`]) {
      await expect(source.video(bad), bad).rejects.toBeInstanceOf(MusicError);
      await expect(source.stream(bad), bad).rejects.toBeInstanceOf(MusicError);
    }
    expect(calls).toHaveLength(1);
  });

  it("adds the cookies file and test-only extra arguments before the request", async () => {
    const { source, calls } = setup(() => ok(""), { cookiesFile: "/home/qbox/cookies.txt", extraArgs: ["--no-check-certificates"] });
    await source.search("song", 2);
    expect(calls[0]?.args).toEqual([...BASE, "--cookies", "/home/qbox/cookies.txt", "--no-check-certificates", "--flat-playlist", "--print", FIELDS, "--", "ytsearch2:song"]);
    const plain = setup(() => ok(""));
    await plain.source.search("song", 2);
    expect(plain.calls[0]?.args).not.toContain("--no-check-certificates");
    expect(plain.calls[0]?.args).not.toContain("--cookies");
  });
});

describe("yt-dlp output", () => {
  it("reads one video per JSON line and skips what it cannot use", () => {
    const output = [
      "WARNING: something on stdout",
      row({}),
      "{not json",
      JSON.stringify({ id: "too-short", title: "Bad ID" }),
      JSON.stringify({ id: OTHER, title: "   " }),
      JSON.stringify({ id: OTHER, title: "No channel", uploader: "Uploader", duration: 59.6 }),
      JSON.stringify(["an", "array"]),
      "",
    ].join("\r\n");
    expect(parseYoutubeRows(output)).toEqual([
      { id: ID, title: "Never Gonna Give You Up", channel: "Rick Astley", durationSeconds: 213, thumbnailUrl: `https://i.ytimg.com/vi/${ID}/hqdefault.jpg` },
      { id: OTHER, title: "No channel", channel: "Uploader", durationSeconds: 60, thumbnailUrl: `https://i.ytimg.com/vi/${OTHER}/hqdefault.jpg` },
    ]);
  });

  it("treats live videos and missing lengths as live, and tidies live titles", () => {
    const [flat, live, long] = parseYoutubeRows([
      JSON.stringify({ id: ID, title: "lofi radio", channel: "Lofi Girl" }),
      JSON.stringify({ id: OTHER, title: "lofi radio 2026-10-11 12:15", channel: "Lofi Girl", duration: 0, is_live: true, live_status: "is_live", url: "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1791756901/id/x" }),
      JSON.stringify({ id: ID, title: "t".repeat(500), duration: null }),
    ].join("\n"));
    expect(flat).toMatchObject({ durationSeconds: null, title: "lofi radio" });
    expect(live).toMatchObject({ durationSeconds: null, title: "lofi radio", url: expect.stringContaining("manifest.googlevideo.com") });
    expect(long?.title).toHaveLength(200);
  });

  it("reads the expiry time from both address shapes", () => {
    expect(youtubeStreamExpiry(streamUrl("a"))).toBe(EXPIRE * 1000);
    expect(youtubeStreamExpiry("https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1791756901/ei/abc")).toBe(1_791_756_901_000);
    expect(youtubeStreamExpiry("https://example.com/audio?x=1")).toBeUndefined();
  });

  it("maps yt-dlp failures to plain messages", () => {
    const cases: readonly (readonly [string, string, RegExp | string])[] = [
      ["ERROR: [youtube] abc: Sign in to confirm you're not a bot. Use --cookies-from-browser or --cookies for the authentication.", "DEPENDENCY_UNAVAILABLE", YOUTUBE_SIGN_IN_MESSAGE],
      ["ERROR: [youtube] abc: Sign in to confirm your age. This video may be inappropriate for some users.", "FORBIDDEN", /age-restricted/],
      ["ERROR: [youtube] abc: Private video. Sign in if you've been granted access to this video", "FORBIDDEN", /private/],
      ["ERROR: [youtube] abc: Join this channel to get access to members-only content like this video", "FORBIDDEN", /members only/],
      ["ERROR: [youtube] abc: Video unavailable. This video has been removed by the uploader", "NOT_FOUND", /not available/],
      ["ERROR: [youtube] aaaaaaaaaaa: This video is unavailable", "NOT_FOUND", /not available/],
      ["ERROR: [youtube] abc: The uploader has not made this video available in your country", "NOT_FOUND", /host's country/],
      ["ERROR: [youtube] abc: Premieres in 3 hours", "INVALID_STATE", /not started/],
      ["ERROR: unable to download video data: HTTP Error 429: Too Many Requests", "DEPENDENCY_UNAVAILABLE", /limiting this host/],
      ["ERROR: [youtube] abc: Requested format is not available", "DEPENDENCY_UNAVAILABLE", YOUTUBE_FAILED_MESSAGE],
      ["", "DEPENDENCY_UNAVAILABLE", YOUTUBE_FAILED_MESSAGE],
    ];
    for (const [stderr, code, message] of cases) {
      const error = youtubeError(stderr);
      expect(error.code, stderr).toBe(code);
      if (typeof message === "string") expect(error.message, stderr).toBe(message);
      else expect(error.message, stderr).toMatch(message);
    }
  });

  it("logs the raw error and shows the member only the plain sentence", async () => {
    const stderr = "ERROR: [youtube] dQw4w9WgXcQ: Sign in to confirm you're not a bot. Use --cookies /secret/path";
    const { source, warnings } = setup(() => failed(stderr));
    const error = await source.stream(ID).catch((caught: unknown) => caught);
    expect(error).toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: YOUTUBE_SIGN_IN_MESSAGE });
    expect((error as Error).message).not.toContain("/secret/path");
    expect(warnings).toEqual([{ message: "yt-dlp failed.", details: { videoId: ID, exitCode: 1, truncated: false, stderr } }]);
  });

  it("reports no results, timeouts, and a process that will not start", async () => {
    await expect(setup(() => ok("")).source.first("zzzz")).rejects.toMatchObject({ code: "NOT_FOUND", message: 'YouTube has no results for "zzzz".' });
    expect(await setup(() => ok("")).source.search("zzzz")).toEqual([]);
    await expect(setup(() => failed("ERROR: boom")).source.search("zzzz")).rejects.toMatchObject({ message: YOUTUBE_FAILED_MESSAGE });
    const slow = setup(() => ({ code: null, stdout: "", stderr: "", timedOut: true, truncated: false }));
    await expect(slow.source.first("slow")).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: YOUTUBE_TIMEOUT_MESSAGE });
    expect(slow.warnings[0]?.message).toBe("yt-dlp timed out.");
    const broken = setup((_call, at) => {
      if (at === 1) throw new Error("spawn EACCES");
      return ok(row({}));
    }, { concurrency: 1, maxWaiting: 0 });
    await expect(broken.source.search("song")).rejects.toMatchObject({ message: YOUTUBE_FAILED_MESSAGE });
    expect(await broken.source.search("its turn was given back")).toHaveLength(1);
  });

  it("keeps partial search results when yt-dlp exits with an error", async () => {
    const { source } = setup(() => ({ code: 1, stdout: `${row({})}\n`, stderr: "ERROR: one result failed", timedOut: false, truncated: false }));
    expect(await source.search("song")).toHaveLength(1);
  });
});

describe("yt-dlp availability", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is unavailable without the program, and looks for it again later", async () => {
    let found: string | undefined;
    const { source, calls, clock } = setup(() => ok(row({})), { binary: () => found });
    expect(source.available).toBe(false);
    await expect(source.search("song")).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: YOUTUBE_UNAVAILABLE_MESSAGE });
    await expect(source.stream(ID)).rejects.toMatchObject({ message: YOUTUBE_UNAVAILABLE_MESSAGE });
    expect(calls).toHaveLength(0);
    found = process.execPath;
    expect(source.available).toBe(false);
    clock.now += 31_000;
    expect(source.available).toBe(true);
    await source.search("song");
    expect(calls[0]?.file).toBe(process.execPath);
    expect(setup(() => ok(""), { binary: undefined }).source.available).toBe(false);
  });

  it("finds yt-dlp from the override, then PATH, then ~/.local/bin", async () => {
    const home = await mkdtemp(join(tmpdir(), "qbox-ytdlp-"));
    try {
      const name = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
      const local = join(home, ".local", "bin");
      const onPath = join(home, "path");
      await mkdir(local, { recursive: true });
      await mkdir(onPath, { recursive: true });
      vi.stubEnv("PATH", "");
      expect(findYtDlp(undefined, home)).toBeUndefined();
      await writeFile(join(local, name), "");
      await chmod(join(local, name), 0o755);
      expect(findYtDlp(undefined, home)).toBe(join(local, name));
      await writeFile(join(onPath, name), "");
      await chmod(join(onPath, name), 0o755);
      vi.stubEnv("PATH", onPath);
      expect(findYtDlp(undefined, home)).toBe(join(onPath, name));
      expect(findYtDlp(join(local, name), home)).toBe(join(local, name));
      expect(findYtDlp(join(home, "missing"), home)).toBeUndefined();
    } finally {
      await rm(home, { recursive: true, force: true });
    }
  });
});

describe("yt-dlp limits", () => {
  it("runs at most two at once and queues the rest", async () => {
    const pending: ((result: ProcessResult) => void)[] = [];
    const { source, calls } = setup(() => new Promise<ProcessResult>((resolve) => pending.push(resolve)));
    const searches = Promise.allSettled(["a", "b", "c", "d", "e"].map((query) => source.search(query)));
    const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
    await settle();
    expect(calls.map((call) => call.args.at(-1))).toEqual(["ytsearch5:a", "ytsearch5:b"]);
    pending[0]?.(ok(row({})));
    await settle();
    expect(calls).toHaveLength(3);
    pending[1]?.(failed("ERROR: boom"));
    await settle();
    expect(calls).toHaveLength(4);
    pending[2]?.(ok(""));
    pending[3]?.(ok(""));
    await settle();
    expect(calls.map((call) => call.args.at(-1))).toEqual(["ytsearch5:a", "ytsearch5:b", "ytsearch5:c", "ytsearch5:d", "ytsearch5:e"]);
    pending[4]?.(ok(""));
    const results = await searches;
    expect(results.map((result) => result.status)).toEqual(["fulfilled", "rejected", "fulfilled", "fulfilled", "fulfilled"]);
  });

  it("refuses new requests when too many are already waiting", async () => {
    const pending: ((result: ProcessResult) => void)[] = [];
    const { source, calls } = setup(() => new Promise<ProcessResult>((resolve) => pending.push(resolve)), { concurrency: 1, maxWaiting: 1 });
    const running = source.search("a");
    const waiting = source.search("b");
    await expect(source.search("c")).rejects.toMatchObject({ code: "LIMIT_REACHED", message: YOUTUBE_BUSY_MESSAGE });
    expect(calls).toHaveLength(1);
    pending[0]?.(ok(""));
    await running;
    await new Promise((resolve) => setTimeout(resolve, 0));
    pending[1]?.(ok(""));
    await waiting;
    expect(calls).toHaveLength(2);
  });

  it("stops a real process that runs too long or prints too much", async () => {
    const node = process.execPath;
    expect(await runProcess(node, ["-e", "process.stdout.write('hi'); process.stderr.write('warn')"], { timeoutMs: 10_000, maxBytes: 1024 })).toEqual({ code: 0, stdout: "hi", stderr: "warn", timedOut: false, truncated: false });
    const slow = await runProcess(node, ["-e", "setTimeout(() => {}, 60000)"], { timeoutMs: 200, maxBytes: 1024 });
    expect(slow).toMatchObject({ timedOut: true, stdout: "" });
    const loud = await runProcess(node, ["-e", "setInterval(() => process.stdout.write('x'.repeat(65536)), 5)"], { timeoutMs: 10_000, maxBytes: 100_000 });
    expect(loud.truncated).toBe(true);
    expect(loud.stdout.length).toBeLessThanOrEqual(100_000);
    const literal = await runProcess(node, ["-e", "process.stdout.write(process.argv[1])", "$(echo injected) && echo more"], { timeoutMs: 10_000, maxBytes: 1024 });
    expect(literal.stdout).toBe("$(echo injected) && echo more");
    expect(await runProcess(join(tmpdir(), "qbox-no-such-program"), [], { timeoutMs: 1000, maxBytes: 1024 })).toMatchObject({ code: null, timedOut: false });
  }, 20_000);
});

describe("YouTube stream addresses", () => {
  it("remembers an address until shortly before it expires", async () => {
    const { source, calls, clock } = setup((_call, at) => ok(row({ url: streamUrl(`call${at}`) })));
    expect(await source.stream(ID)).toEqual({ url: streamUrl("call1"), cached: false });
    expect(await source.stream(ID)).toEqual({ url: streamUrl("call1"), cached: true });
    clock.now = (EXPIRE - 11 * 60) * 1000;
    expect(await source.stream(ID)).toEqual({ url: streamUrl("call1"), cached: true });
    expect(calls).toHaveLength(1);
    clock.now = (EXPIRE - 9 * 60) * 1000;
    expect(await source.stream(ID)).toEqual({ url: streamUrl("call2"), cached: false });
    expect(calls).toHaveLength(2);
  });

  it("looks the address up again after forget, and shares one lookup between callers", async () => {
    const { source, calls } = setup((_call, at) => ok(row({ url: streamUrl(`call${at}`) })));
    const [one, two] = await Promise.all([source.stream(ID), source.stream(ID)]);
    expect(one).toEqual(two);
    expect(calls).toHaveLength(1);
    source.forget(ID);
    expect(await source.stream(ID)).toEqual({ url: streamUrl("call2"), cached: false });
    expect(calls).toHaveLength(2);
  });

  it("keeps the address that came with a search or video lookup", async () => {
    const { source, calls } = setup((_call, at) => ok(row({ url: streamUrl(`call${at}`) })));
    await source.first("never gonna give you up");
    expect(await source.stream(ID)).toEqual({ url: streamUrl("call1"), cached: true });
    source.forget(ID);
    await source.video(ID);
    expect(await source.stream(ID)).toEqual({ url: streamUrl("call2"), cached: true });
    expect(calls).toHaveLength(2);
  });

  it("keeps an address without an expiry time for five minutes", async () => {
    const { source, calls, clock } = setup(() => ok(row({ url: "https://cdn.example.com/audio.webm" })));
    await source.stream(ID);
    clock.now += 4 * 60_000;
    expect((await source.stream(ID)).cached).toBe(true);
    clock.now += 2 * 60_000;
    expect((await source.stream(ID)).cached).toBe(false);
    expect(calls).toHaveLength(2);
  });

  it("refuses addresses that are not public https, and results for another video", async () => {
    for (const url of ["http://rr4.googlevideo.com/videoplayback?expire=1791756896", "https://127.0.0.1/videoplayback", "https://localhost/a", "file:///etc/passwd", "-i /etc/passwd", ""]) {
      const { source, warnings } = setup(() => ok(row({ url })));
      await expect(source.stream(ID), url).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: YOUTUBE_FAILED_MESSAGE });
      expect(warnings[0]?.message).toBe("yt-dlp did not return a usable stream address.");
    }
    const other = setup(() => ok(JSON.stringify({ id: OTHER, title: "Another video", url: streamUrl("a") })));
    await expect(other.source.stream(ID)).rejects.toMatchObject({ message: YOUTUBE_FAILED_MESSAGE });
  });
});
