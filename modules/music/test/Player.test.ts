import { describe, expect, it } from "vitest";

import { HISTORY_LIMIT, Player, type MusicQueueEntry } from "../src/index.js";

function entry(id: string, options: Partial<MusicQueueEntry> = {}): MusicQueueEntry {
  return { id, source: "library", title: `Song ${id}`, durationSeconds: 200, seekable: true, filePath: `/music/${id}.mp3`, ...options };
}

const live = (id: string) => entry(id, { source: "radio", durationSeconds: null, seekable: false, url: "https://radio.example/stream" });
const titles = (player: Player) => player.queue.map((item) => item.id);

function sequence(values: readonly number[]): () => number {
  let at = 0;
  return () => values[at++ % values.length] as number;
}

describe("Player queue", () => {
  it("starts with the first song and queues the rest", () => {
    const player = new Player(60);
    expect(player.add([entry("a")], 100)).toEqual({ start: true, added: 1 });
    expect(player.add([entry("b"), entry("c")], 100)).toEqual({ start: false, added: 2 });
    expect(player.current?.id).toBe("a");
    expect(player.upcoming.map((item) => item.id)).toEqual(["b", "c"]);
  });

  it("puts 'play now' songs right after the current one and makes them current", () => {
    const player = new Player(60);
    player.add([entry("a"), entry("b")], 100);
    expect(player.add([entry("x")], 100, { now: true })).toEqual({ start: true, added: 1 });
    expect(titles(player)).toEqual(["a", "x", "b"]);
    expect(player.current?.id).toBe("x");
  });

  it("limits waiting songs to maxQueue and adds what fits", () => {
    const player = new Player(60);
    player.add([entry("a")], 2);
    expect(player.add([entry("b"), entry("c"), entry("d")], 2)).toEqual({ start: false, added: 2 });
    expect(() => player.add([entry("e")], 2)).toThrow(/queue is full/);
  });

  it("advances, ends, and restarts from the end when songs are added", () => {
    const player = new Player(60);
    player.add([entry("a"), entry("b")], 100);
    expect(player.next(true)?.id).toBe("b");
    expect(player.next(true)).toBeUndefined();
    expect(player.current).toBeUndefined();
    expect(player.index).toBe(2);
    expect(player.add([entry("c")], 100).start).toBe(true);
    expect(player.current?.id).toBe("c");
  });

  it("repeats the song in track loop only when it ends on its own", () => {
    const player = new Player(60);
    player.add([entry("a"), entry("b")], 100);
    player.setLoop("track");
    expect(player.next(true)?.id).toBe("a");
    expect(player.next(false)?.id).toBe("b");
  });

  it("wraps around in queue loop and cycles loop modes", () => {
    const player = new Player(60);
    player.add([entry("a"), entry("b")], 100);
    expect(player.setLoop()).toBe("queue");
    player.next(true);
    expect(player.next(true)?.id).toBe("a");
    expect(player.setLoop()).toBe("track");
    expect(player.setLoop()).toBe("off");
  });

  it("previous restarts after 5 seconds, otherwise goes back", () => {
    const player = new Player(60);
    player.add([entry("a"), entry("b")], 100);
    player.next(false);
    player.positionSeconds = 30;
    expect(player.previous().id).toBe("b");
    expect(player.positionSeconds).toBe(0);
    player.positionSeconds = 3;
    expect(player.previous().id).toBe("a");
    expect(player.previous().id).toBe("a");
    player.next(false);
    player.next(false);
    expect(player.current).toBeUndefined();
    expect(player.previous().id).toBe("b");
  });

  it("shuffle keeps the current song and only reorders what is waiting", () => {
    const player = new Player(60, sequence([0]));
    player.add([entry("a"), entry("b"), entry("c"), entry("d")], 100);
    expect(player.toggleShuffle()).toBe(true);
    expect(player.current?.id).toBe("a");
    expect(player.queue[0]?.id).toBe("a");
    expect([...titles(player)].sort()).toEqual(["a", "b", "c", "d"]);
    expect(titles(player)).not.toEqual(["a", "b", "c", "d"]);
    expect(player.toggleShuffle()).toBe(false);
  });

  it("seeks within the song, clamps, and refuses live streams", () => {
    const player = new Player(60);
    expect(() => player.seekTarget(10)).toThrow(/Nothing is playing/);
    player.add([entry("a"), live("r")], 100);
    expect(player.seekTarget(-5)).toBe(0);
    expect(player.seekTarget(90.7)).toBe(90);
    expect(player.seekTarget(5000)).toBe(199);
    player.next(false);
    expect(() => player.seekTarget(10)).toThrow(/live stream/);
    expect(player.live).toBe(true);
  });

  it("clamps volume to 0-200", () => {
    const player = new Player(500);
    expect(player.volume).toBe(200);
    expect(player.setVolume(-3)).toBe(0);
    expect(player.setVolume(55.6)).toBe(56);
    expect(() => player.setVolume(Number.NaN)).toThrow(/Volume/);
  });

  it("remove and move keep the current song current", () => {
    const player = new Player(60);
    player.add([entry("a"), entry("b"), entry("c"), entry("d")], 100);
    player.jump(3);
    expect(player.current?.id).toBe("c");
    expect(() => player.remove(3)).toThrow(/playing now/);
    expect(player.remove(1).id).toBe("a");
    expect(player.current?.id).toBe("c");
    expect(player.index).toBe(1);
    player.move(3, 1);
    expect(titles(player)).toEqual(["d", "b", "c"]);
    expect(player.current?.id).toBe("c");
    player.move(3, 1);
    expect(titles(player)).toEqual(["c", "d", "b"]);
    expect(player.index).toBe(0);
    expect(() => player.remove(9)).toThrow(/from 1 to 3/);
  });

  it("clear keeps only the current song; stop empties everything", () => {
    const player = new Player(60);
    player.add([entry("a"), entry("b"), entry("c")], 100);
    player.next(false);
    expect(player.clear()).toBe(2);
    expect(titles(player)).toEqual(["b"]);
    expect(player.current?.id).toBe("b");
    player.stop();
    expect(player.queue).toEqual([]);
    expect(player.current).toBeUndefined();
    expect(player.state).toBe("idle");
  });

  it("keeps a bounded history", () => {
    const player = new Player(60);
    player.add(Array.from({ length: HISTORY_LIMIT + 10 }, (_, at) => entry(String(at))), 1000);
    for (let at = 0; at < HISTORY_LIMIT + 5; at += 1) player.next(false);
    expect(player.history).toHaveLength(HISTORY_LIMIT);
    expect(player.current?.id).toBe(String(HISTORY_LIMIT + 5));
  });

  it("restores a saved session", () => {
    const player = Player.restore({ guildId: "1", queue: [entry("a"), entry("b")], index: 1, positionSeconds: 42, state: "playing", loop: "queue", shuffle: true, volume: 80, updatedAt: new Date() });
    expect(player.current?.id).toBe("b");
    expect(player).toMatchObject({ positionSeconds: 42, loop: "queue", shuffle: true, volume: 80, state: "idle" });
  });
});
