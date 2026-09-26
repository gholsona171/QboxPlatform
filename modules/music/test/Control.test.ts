import { describe, expect, it } from "vitest";

import {
  HttpMusicControlClient,
  UNREACHABLE_MESSAGE,
  botIdFromToken,
  controlKey,
  parseMusicActor,
  parseMusicCommand,
  signControlRequest,
  verifyControlRequest,
  voiceBotInviteUrl,
} from "../src/index.js";

const key = controlKey("token-a");
const now = 1_800_000_000_000;
const body = JSON.stringify({ action: "pause" });
const signed = (timestamp: number, signingKey = key, text = body) => ({ remoteAddress: "127.0.0.1", timestamp: String(timestamp), signature: signControlRequest(signingKey, String(timestamp), text), body });

describe("control signature", () => {
  it("accepts a fresh request signed with the shared key from this machine", () => {
    expect(verifyControlRequest(key, signed(now), now)).toEqual({ ok: true });
    expect(verifyControlRequest(key, { ...signed(now - 29_000), remoteAddress: "::ffff:127.0.0.1" }, now)).toEqual({ ok: true });
    expect(verifyControlRequest(key, { ...signed(now), remoteAddress: "::1" }, now)).toEqual({ ok: true });
  });

  it("refuses stale or future timestamps", () => {
    expect(verifyControlRequest(key, signed(now - 31_000), now)).toEqual({ ok: false, reason: "stale" });
    expect(verifyControlRequest(key, signed(now + 31_000), now)).toEqual({ ok: false, reason: "stale" });
    expect(verifyControlRequest(key, { ...signed(now), timestamp: "soon" }, now)).toEqual({ ok: false, reason: "stale" });
  });

  it("refuses the wrong key, a changed body, and a missing signature", () => {
    expect(verifyControlRequest(key, signed(now, controlKey("token-b")), now)).toEqual({ ok: false, reason: "signature" });
    expect(verifyControlRequest(key, { ...signed(now), body: JSON.stringify({ action: "stop" }) }, now)).toEqual({ ok: false, reason: "signature" });
    expect(verifyControlRequest(key, { ...signed(now), signature: undefined }, now)).toEqual({ ok: false, reason: "signature" });
  });

  it("refuses requests that are not from this machine", () => {
    expect(verifyControlRequest(key, { ...signed(now), remoteAddress: "10.0.0.5" }, now)).toEqual({ ok: false, reason: "remote" });
    expect(verifyControlRequest(key, { ...signed(now), remoteAddress: undefined }, now)).toEqual({ ok: false, reason: "remote" });
  });
});

describe("control client", () => {
  it("signs requests and maps errors", async () => {
    const seen: { url: string; headers: Headers; body: string }[] = [];
    const client = new HttpMusicControlClient("token-a", "http://127.0.0.1:3102", (async (url: string | URL | Request, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      const text = typeof init?.body === "string" ? init.body : "";
      seen.push({ url: String(url), headers, body: text });
      const check = verifyControlRequest(key, { remoteAddress: "127.0.0.1", timestamp: headers.get("x-qbox-timestamp") ?? undefined, signature: headers.get("x-qbox-signature") ?? undefined, body: text });
      if (!check.ok) return new Response("{}", { status: 401 });
      if (String(url).endsWith("/state")) return Response.json({ state: { guildId: "1", state: "idle" } });
      return Response.json({ error: { code: "FORBIDDEN", message: "Only DJs can control the music here." } }, { status: 403 });
    }) as typeof fetch);
    expect(await client.state("100000000000000001")).toMatchObject({ state: "idle" });
    await expect(client.command("100000000000000001", { action: "pause" }, { userId: "300000000000000001", manager: false, dj: false, roleIds: [] })).rejects.toMatchObject({ code: "FORBIDDEN", message: "Only DJs can control the music here." });
    expect(seen[1]?.body).toBe(JSON.stringify({ action: "pause", actor: { userId: "300000000000000001", manager: false, dj: false, roleIds: [] } }));

    const offline = new HttpMusicControlClient("token-a", "http://127.0.0.1:3102", (async () => { throw new TypeError("fetch failed"); }) as typeof fetch);
    await expect(offline.state("100000000000000001")).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE", message: UNREACHABLE_MESSAGE });
  });
});

describe("commands and invite links", () => {
  it("validates commands and actors from JSON", () => {
    expect(parseMusicCommand({ action: "play", query: "library:x", now: true })).toEqual({ action: "play", query: "library:x", title: undefined, now: true, channelId: undefined });
    expect(parseMusicCommand({ action: "move", from: 1, to: 3 })).toEqual({ action: "move", from: 1, to: 3 });
    expect(parseMusicCommand({ action: "loop", mode: "track" })).toEqual({ action: "loop", mode: "track" });
    expect(() => parseMusicCommand({ action: "loop", mode: "forever" })).toThrow(/mode is not valid/);
    expect(() => parseMusicCommand({ action: "seek" })).toThrow(/seconds is missing/);
    expect(() => parseMusicCommand({ action: "explode" })).toThrow(/not a music command/);
    expect(() => parseMusicCommand([])).toThrow(/not valid/);
    expect(parseMusicActor({ userId: "300000000000000001", manager: true, roleIds: ["400000000000000001", "bad"] })).toEqual({ userId: "300000000000000001", manager: true, dj: false, roleIds: ["400000000000000001"] });
    expect(() => parseMusicActor({})).toThrow(/actor/);
  });

  it("reads the bot ID from a token and builds the voice invite", () => {
    const id = "1234567890123456789";
    expect(botIdFromToken(`${Buffer.from(id).toString("base64")}.abc.def`)).toBe(id);
    expect(botIdFromToken("garbage")).toBeUndefined();
    expect(voiceBotInviteUrl(id)).toBe(`https://discord.com/oauth2/authorize?client_id=${id}&scope=bot&permissions=3146752`);
  });
});
