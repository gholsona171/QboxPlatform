import type { PermissionCacheInvalidationEvent } from "@qbox/permissions";
import { describe, expect, it, vi } from "vitest";

import {
  InMemoryPermissionInvalidationBus,
  validateDiscordSnowflake,
} from "../src/index.js";

describe("InMemoryPermissionInvalidationBus", () => {
  it("publishes committed invalidations to every current subscriber", async () => {
    const bus = new InMemoryPermissionInvalidationBus();
    const first = vi.fn<
      (event: PermissionCacheInvalidationEvent) => Promise<void>
    >(async () => undefined);
    const second = vi.fn<
      (event: PermissionCacheInvalidationEvent) => Promise<void>
    >(async () => undefined);
    bus.subscribe(first);
    bus.subscribe(second);
    const event: PermissionCacheInvalidationEvent = {
      scopes: [{ type: "platform" }],
      occurredAt: new Date("2026-07-31T00:00:00.000Z"),
      correlationId: "correlation-1",
    };

    await bus.publish(event);

    expect(first).toHaveBeenCalledWith(event);
    expect(second).toHaveBeenCalledWith(event);
  });

  it("stops delivery after the returned unsubscribe function is called", async () => {
    const bus = new InMemoryPermissionInvalidationBus();
    const listener = vi.fn<
      (event: PermissionCacheInvalidationEvent) => Promise<void>
    >(async () => undefined);
    const unsubscribe = bus.subscribe(listener);
    unsubscribe();

    await bus.publish({
      scopes: [{ type: "platform" }],
      occurredAt: new Date(),
    });

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("permission bootstrap identity validation", () => {
  it("accepts Discord snowflakes and rejects malformed identifiers", () => {
    expect(() =>
      validateDiscordSnowflake("guild ID", "1257928923048837201"),
    ).not.toThrow();
    expect(() => validateDiscordSnowflake("guild ID", "not-an-id")).toThrow(
      "17-20 digit",
    );
  });
});
