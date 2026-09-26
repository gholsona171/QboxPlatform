import { generateDependencyReport } from "@discordjs/voice";
import { MusicError, SIGNATURE_HEADER, TIMESTAMP_HEADER, controlKey, signControlRequest, type MusicActor, type MusicCommand, type MusicControl, type MusicStateSnapshot } from "@qbox/music";
import { afterEach, describe, expect, it } from "vitest";

import { queueEmbed } from "../src/commands/Music.command.js";
import { CommandLoader } from "../src/loaders/CommandLoader.js";
import { MusicControlServer } from "../src/music/MusicControlServer.js";

const GUILD = "100000000000000001";

const state: MusicStateSnapshot = {
  guildId: GUILD,
  connected: true,
  channelId: "200000000000000001",
  state: "playing",
  index: 1,
  queue: [
    { id: "1", source: "library", title: "Old", durationSeconds: 100, seekable: true },
    { id: "2", source: "library", title: "Now", artist: "Band", durationSeconds: 225, seekable: true },
    { id: "3", source: "radio", title: "Radio", durationSeconds: null, seekable: false },
  ],
  positionSeconds: 10,
  durationSeconds: 225,
  live: false,
  loop: "off",
  shuffle: false,
  volume: 60,
  stayConnected: false,
  ffmpeg: true,
};

describe("music command", () => {
  it("loads and passes Discord validation", async () => {
    const result = await new CommandLoader().load();
    expect(result.diagnostics.failures).toEqual([]);
    const music = result.commands.find((command) => command.data.name === "music")?.data.toJSON();
    expect(music?.options?.map((option) => option.name)).toEqual([
      "play", "playlist", "radio", "pause", "resume", "skip", "previous", "stop", "seek", "rewind", "forward",
      "volume", "loop", "shuffle", "queue", "remove", "move", "clear", "nowplaying", "join", "leave",
    ]);
  });

  it("shows the queue with the current song marked", () => {
    const embed = queueEmbed(state, undefined);
    expect(embed.description).toBe("~~1. Old (1:40)~~\n**▶ 2. Now - Band (3:45)**\n3. Radio (live)");
    expect(embed.footer?.text).toBe("Page 1 of 1 · Loop: off · Shuffle: off · Volume: 60%");
    expect(queueEmbed({ ...state, queue: [] }, 1).description).toContain("empty");
  });

  it("has Opus, DAVE and aes-256-gcm encryption available for voice", () => {
    const report = generateDependencyReport();
    expect(report).toContain("opusscript:");
    expect(report).toContain("native crypto support for aes-256-gcm: yes");
    expect(report).toMatch(/@snazzah\/davey: \d/);
  });
});

describe("music control server", () => {
  let server: MusicControlServer | undefined;
  afterEach(async () => server?.close());

  it("answers signed requests from this machine and refuses the rest", async () => {
    const commands: { guildId: string; command: MusicCommand; actor: MusicActor }[] = [];
    const control: MusicControl = {
      state: async () => state,
      command: async (guildId, command, actor) => {
        commands.push({ guildId, command, actor });
        if (command.action === "skip") throw new MusicError("FORBIDDEN", "Only DJs can control the music here.");
        return { message: "Paused.", state };
      },
    };
    server = new MusicControlServer(control, "token-a");
    const port = await server.listen(0);
    const key = controlKey("token-a");
    const call = (method: "GET" | "POST", path: string, body = "", signingKey = key, timestamp = String(Date.now())) =>
      fetch(`http://127.0.0.1:${port}${path}`, { method, headers: { [TIMESTAMP_HEADER]: timestamp, [SIGNATURE_HEADER]: signControlRequest(signingKey, timestamp, body), "content-type": "application/json" }, ...(method === "POST" ? { body } : {}) });

    const got = await call("GET", `/music/${GUILD}/state`);
    expect(got.status).toBe(200);
    expect((await got.json()).state.queue).toHaveLength(3);

    const actor = { userId: "300000000000000001", manager: true, dj: false, roleIds: [] };
    const paused = await call("POST", `/music/${GUILD}/command`, JSON.stringify({ action: "pause", actor }));
    expect(await paused.json()).toMatchObject({ message: "Paused." });
    expect(commands[0]).toEqual({ guildId: GUILD, command: { action: "pause" }, actor });

    const denied = await call("POST", `/music/${GUILD}/command`, JSON.stringify({ action: "skip", actor }));
    expect(denied.status).toBe(403);
    expect(await denied.json()).toEqual({ error: { code: "FORBIDDEN", message: "Only DJs can control the music here." } });

    expect((await call("POST", `/music/${GUILD}/command`, JSON.stringify({ action: "fly", actor }))).status).toBe(400);
    expect((await call("GET", `/music/${GUILD}/state`, "", controlKey("token-b"))).status).toBe(401);
    expect((await call("GET", `/music/${GUILD}/state`, "", key, String(Date.now() - 60_000))).status).toBe(401);
    expect((await call("GET", "/other")).status).toBe(404);
  });
});
