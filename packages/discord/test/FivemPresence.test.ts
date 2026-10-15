import { describe, expect, it } from "vitest";
import type { FivemTickResult } from "@qbox/fivem";

import { FivemPresence } from "../src/index.js";

const result = (guildId: string, players: number, phase: FivemTickResult["phase"] = "online"): FivemTickResult => ({
  guildId,
  phase,
  status: { online: phase !== "offline", hostname: "Cloud Nine RP", players: [], playerCount: players, maxPlayers: 64, checkedAt: new Date() },
});

describe("FiveM presence", () => {
  it("shows the player count when exactly one server is watched, and only changes when the text does", () => {
    let now = 0;
    const presence = new FivemPresence(() => now);
    expect(presence.update([result("100000000000000001", 12)])).toBe("12/64 on Cloud Nine RP");
    expect(presence.update([result("100000000000000001", 12)])).toBeUndefined();
    expect(presence.update([result("100000000000000001", 0, "restarting")])).toBe("Cloud Nine RP: restarting");
    expect(presence.update([])).toBeUndefined();
    now += 60_000;
    expect(presence.update([result("100000000000000002", 3)])).toBe("");
    now += 10 * 60_000;
    expect(presence.update([result("100000000000000002", 3)])).toBe("3/64 on Cloud Nine RP");
  });
});
