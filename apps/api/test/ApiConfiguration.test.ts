import { describe, expect, it } from "vitest";

import {
  ApiConfiguration,
  ApiConfigurationError,
} from "../src/config/ApiConfiguration.js";

describe("ApiConfiguration", () => {
  it("applies safe development defaults and freezes diagnostics", () => {
    const configuration = ApiConfiguration.from({});
    expect(configuration.diagnostics()).toEqual({
      environment: "development",
      host: "127.0.0.1",
      port: 3000,
      bodySizeLimitBytes: 1_048_576,
      headerSizeLimitBytes: 16_384,
      userAgentLimitChars: 1_024,
      requestTimeoutMs: 120_000,
      keepAliveTimeoutMs: 5_000,
      shutdownTimeoutMs: 10_000,
      trustProxy: { mode: "disabled" },
      allowedHosts: [],
      corsPolicy: { mode: "disabled" },
      rateLimitPolicy: { mode: "disabled" },
      publicBaseUrl: "http://127.0.0.1:3000",
      logLevel: "info",
      buildVersion: "0.0.0-dev",
    });
    expect(Object.isFrozen(configuration.diagnostics())).toBe(true);
  });

  it("accepts explicit typed limits, proxy allowlists, and metadata", () => {
    const configuration = ApiConfiguration.from({
      environment: "test",
      host: "localhost",
      port: 4_321,
      bodySizeLimitBytes: 2_048,
      requestTimeoutMs: 1_000,
      keepAliveTimeoutMs: 2_000,
      shutdownTimeoutMs: 3_000,
      trustProxy: ["127.0.0.1", "10.0.0.0/8", "::1/128"],
      allowedHosts: ["device.tailnet.ts.net", "device.tailnet.ts.net"],
      publicBaseUrl: "http://localhost:4321/",
      logLevel: "debug",
      buildVersion: "test-build",
    });
    expect(configuration.diagnostics()).toMatchObject({
      port: 4_321,
      bodySizeLimitBytes: 2_048,
      trustProxy: {
        mode: "allowlist",
        addresses: ["127.0.0.1", "10.0.0.0/8", "::1/128"],
      },
      allowedHosts: ["device.tailnet.ts.net"],
      publicBaseUrl: "http://localhost:4321",
      buildVersion: "test-build",
    });
  });

  it.each([
    { host: "" },
    { host: "http://localhost" },
    { port: -1 },
    { port: 65_536 },
    { bodySizeLimitBytes: 0 },
    { headerSizeLimitBytes: 1_000 },
    { userAgentLimitChars: 20 },
    { requestTimeoutMs: 0 },
    { keepAliveTimeoutMs: Number.NaN },
    { shutdownTimeoutMs: 300_001 },
    { trustProxy: [] },
    { trustProxy: ["not-an-address"] },
    { trustProxy: ["127.0.0.1/33"] },
    { allowedHosts: ["https://device.tailnet.ts.net"] },
    { allowedHosts: ["device.tailnet.ts.net/path"] },
    { allowedHosts: ["device.tailnet.ts.net,evil.example"] },
    { publicBaseUrl: "" },
    { publicBaseUrl: "ftp://example.com" },
    { publicBaseUrl: "https://user:password@example.com" },
    { logLevel: "verbose" },
  ])("rejects invalid input %#", (input) => {
    expect(() => ApiConfiguration.from(input)).toThrow(ApiConfigurationError);
  });

  it("requires HTTPS in production", () => {
    expect(() =>
      ApiConfiguration.from({
        environment: "production",
        publicBaseUrl: "http://api.example.com",
      }),
    ).toThrow("HTTPS");
    expect(
      ApiConfiguration.from({
        environment: "production",
        publicBaseUrl: "https://api.example.com",
      }).diagnostics().publicBaseUrl,
    ).toBe("https://api.example.com");
  });

  it("allows ephemeral port zero only outside production", () => {
    expect(ApiConfiguration.from({ environment: "test", port: 0 }).diagnostics().port).toBe(0);
    expect(() =>
      ApiConfiguration.from({
        environment: "production",
        port: 0,
        publicBaseUrl: "https://api.example.com",
      }),
    ).toThrow("port cannot be zero");
  });

  it("validates the future CORS allowlist without enabling enforcement", () => {
    const configuration = ApiConfiguration.from({
      corsPolicy: {
        mode: "allowlist",
        origins: ["https://panel.example.com"],
        credentials: true,
      },
    });
    expect(configuration.diagnostics().corsPolicy).toEqual({
      mode: "allowlist",
      origins: ["https://panel.example.com"],
      credentials: true,
    });
    expect(() => ApiConfiguration.from({
      environment: "production",
      publicBaseUrl: "https://api.example.com",
      corsPolicy: { mode: "allowlist", origins: ["*"], credentials: true },
    })).toThrow("wildcard origins");
  });

  it("serializes only validated diagnostics", () => {
    const serialized = JSON.stringify(
      ApiConfiguration.from({ publicBaseUrl: "https://api.example.com" }),
    );
    expect(serialized).toContain('"publicBaseUrl":"https://api.example.com"');
    expect(serialized).not.toContain("authorization");
    expect(serialized).not.toContain("cookie");
    expect(serialized).not.toContain("DATABASE_URL");
  });
});
