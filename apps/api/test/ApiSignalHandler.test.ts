import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import type { ApiLogFields, ApiLogger } from "../src/logging/ApiLogger.js";
import { installApiSignalHandlers, type ApiProcessSignals } from "../src/process/ApiSignalHandler.js";

class FakeProcess extends EventEmitter implements ApiProcessSignals {
  public exitCode: string | number | null | undefined;
  public override on(signal: "SIGINT" | "SIGTERM", listener: () => void): this { return super.on(signal, listener); }
  public override off(signal: "SIGINT" | "SIGTERM", listener: () => void): this { return super.off(signal, listener); }
}

const logger: ApiLogger = {
  child: () => logger,
  info: () => undefined,
  warn: () => undefined,
  error: (_fields: ApiLogFields) => undefined,
};

describe("installApiSignalHandlers", () => {
  it.each(["SIGINT", "SIGTERM"] as const)("handles %s once and removes listeners", async (signal) => {
    const target = { shutdown: vi.fn(async () => undefined) };
    const fakeProcess = new FakeProcess();
    const dispose = installApiSignalHandlers(target, logger, fakeProcess);
    fakeProcess.emit(signal);
    fakeProcess.emit(signal);
    await vi.waitFor(() => expect(target.shutdown).toHaveBeenCalledTimes(1));
    expect(fakeProcess.exitCode).toBe(0);
    dispose();
    expect(fakeProcess.listenerCount("SIGINT")).toBe(0);
    expect(fakeProcess.listenerCount("SIGTERM")).toBe(0);
  });

  it("sets a nonzero exit code when shutdown fails", async () => {
    const target = { shutdown: async () => { throw new Error("failed"); } };
    const fakeProcess = new FakeProcess();
    const dispose = installApiSignalHandlers(target, logger, fakeProcess);
    fakeProcess.emit("SIGTERM");
    await vi.waitFor(() => expect(fakeProcess.exitCode).toBe(1));
    dispose();
  });
});
