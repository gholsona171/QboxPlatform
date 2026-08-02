import { describe, expect, it } from "vitest";
import {
  authenticationCorrelationId,
  discordUserId,
  DiscordLoginService,
} from "../src/index.js";
import { FakeIds, FixedClock, MemoryUnitOfWork, memoryState } from "./serviceFixtures.js";

const context = {
  correlationId: authenticationCorrelationId("33333333-3333-4333-8333-333333333333"),
};

describe("DiscordLoginService", () => {
  it("creates a platform account and Discord identity on first login", async () => {
    const state = memoryState();
    const service = new DiscordLoginService({
      unitOfWork: new MemoryUnitOfWork(state),
      clock: new FixedClock(new Date("2026-08-01T00:00:00.000Z")),
      ids: new FakeIds(),
    });
    const resolved = await service.resolveLogin(
      {
        userId: discordUserId("804859666655739996"),
        username: "qbox",
        globalName: "Qbox User",
      },
      context,
    );
    expect(resolved.created).toBe(true);
    expect(state.users.size).toBe(1);
    expect(state.identities.size).toBe(1);
    expect(resolved.externalIdentity.providerSubjectId).toBe("804859666655739996");
    expect([...state.audits.values()].map((event) => event.action)).toEqual([
      "IDENTITY_LINK",
      "LOGIN_SUCCESS",
    ]);
  });

  it("resolves an existing account and updates display-only profile data", async () => {
    const state = memoryState();
    const service = new DiscordLoginService({
      unitOfWork: new MemoryUnitOfWork(state),
      clock: new FixedClock(new Date("2026-08-01T00:00:00.000Z")),
      ids: new FakeIds(),
    });
    await service.resolveLogin(
      { userId: discordUserId("804859666655739996"), username: "old" },
      context,
    );
    const resolved = await service.resolveLogin(
      { userId: discordUserId("804859666655739996"), username: "new" },
      context,
    );
    expect(resolved.created).toBe(false);
    expect(state.users.size).toBe(1);
    expect(state.identities.size).toBe(1);
    expect(resolved.externalIdentity.profile.username).toBe("new");
  });
});
