import { describe, expect, it, vi } from "vitest";

import { EventBus, ServiceContainer } from "@qbox/core";
import { permissions } from "@qbox/permissions";

import { DiscordModule } from "../src/DiscordModule.js";
import type { DiscordService } from "../src/DiscordService.js";
import type { CommandLoader } from "../src/loaders/CommandLoader.js";
import { createTestAuthorizer } from "./CommandTestFactory.js";

describe("DiscordModule permission lifecycle", () => {
  it("registers the injected authorizer only after Discord starts and never resets the legacy singleton", async () => {
    const authorizer = createTestAuthorizer();
    const clear = vi.spyOn(permissions, "clear");
    const start = vi.fn(async () => undefined);
    const service = {
      client: { user: { tag: "test#0001" } },
      registerCommands: vi.fn(() => 0),
      start,
      stop: vi.fn(async () => undefined),
    } as unknown as DiscordService;
    const loader = {
      load: vi.fn(async () => ({
        commands: [],
        diagnostics: {
          discovered: 0,
          validated: 0,
          loadDurationMs: 0,
          commandFiles: [],
          commandNames: [],
          commandAliases: [],
          warnings: [],
          failures: [],
        },
      })),
    } as unknown as CommandLoader;
    const services = new ServiceContainer();
    const module = new DiscordModule(
      authorizer,
      { enabled: false, roleCount: 0 },
      { discordService: service, commandLoader: loader },
    );

    await module.start({ services, events: new EventBus() });

    expect(start).toHaveBeenCalledOnce();
    expect(services.get("permissions")).toBe(authorizer);
    expect(clear).not.toHaveBeenCalled();
    clear.mockRestore();
  });

  it("does not partially register services when Discord startup fails", async () => {
    const authorizer = createTestAuthorizer();
    const service = {
      client: { user: undefined },
      registerCommands: vi.fn(() => 0),
      start: vi.fn().mockRejectedValue(new Error("login failed")),
      stop: vi.fn(),
    } as unknown as DiscordService;
    const loader = {
      load: vi.fn(async () => ({
        commands: [],
        diagnostics: {
          discovered: 0,
          validated: 0,
          loadDurationMs: 0,
          commandFiles: [],
          commandNames: [],
          commandAliases: [],
          warnings: [],
          failures: [],
        },
      })),
    } as unknown as CommandLoader;
    const services = new ServiceContainer();
    const module = new DiscordModule(
      authorizer,
      { enabled: false, roleCount: 0 },
      { discordService: service, commandLoader: loader },
    );

    await expect(
      module.start({ services, events: new EventBus() }),
    ).rejects.toThrow("login failed");
    expect(() => services.get("permissions")).toThrow("not registered");
    expect(() => services.get("discord")).toThrow("not registered");
  });
});
