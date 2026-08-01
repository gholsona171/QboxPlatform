import { describe, expect, it } from "vitest";

import {
  DatabaseConfiguration,
  DatabaseConfigurationError,
} from "../src/index.js";

const secretUrl =
  "postgresql://service:super-secret@db.internal:5433/qbox?schema=public";

describe("DatabaseConfiguration", () => {
  it("accepts PostgreSQL and exposes explicit redacted diagnostics", () => {
    const configuration = DatabaseConfiguration.from({
      databaseUrl: secretUrl,
      environment: "development",
      startupTimeoutMs: 2_000,
      queryTimeoutMs: 750,
      sslMode: "disable",
    });
    expect(configuration.diagnostics()).toEqual({
      provider: "postgresql",
      environment: "development",
      host: "db.internal",
      port: 5433,
      database: "qbox",
      startupTimeoutMs: 2_000,
      queryTimeoutMs: 750,
      sslMode: "disable",
    });
    expect(configuration.connectionStringForClientFactory()).toBe(secretUrl);
  });

  it.each([
    [undefined, "required"],
    ["", "required"],
    ["not a url", "valid PostgreSQL URL"],
    ["mysql://user:password@host/qbox", "postgresql protocol"],
    ["postgresql://host/qbox", "include a user"],
    ["postgresql://user:password@host", "database name"],
  ])("rejects invalid URL %s", (databaseUrl, expected) => {
    expect(() => DatabaseConfiguration.from({ databaseUrl })).toThrow(expected);
  });

  it("requires TLS in production", () => {
    expect(() =>
      DatabaseConfiguration.from({
        databaseUrl: secretUrl,
        environment: "production",
        sslMode: "disable",
      }),
    ).toThrow(DatabaseConfigurationError);
    expect(
      DatabaseConfiguration.from({
        databaseUrl: secretUrl,
        environment: "production",
      }).diagnostics().sslMode,
    ).toBe("require");
  });

  it.each([0, 99, 1.5, 300_001, Number.NaN])(
    "rejects invalid startup timeout %s",
    (startupTimeoutMs) => {
      expect(() =>
        DatabaseConfiguration.from({
          databaseUrl: secretUrl,
          startupTimeoutMs,
        }),
      ).toThrow("startupTimeoutMs");
    },
  );

  it.each([0, 99, 1.5, 300_001, Number.NaN])(
    "rejects invalid query timeout %s",
    (queryTimeoutMs) => {
      expect(() =>
        DatabaseConfiguration.from({ databaseUrl: secretUrl, queryTimeoutMs }),
      ).toThrow("queryTimeoutMs");
    },
  );

  it("never serializes credentials, query parameters, or the raw URL", () => {
    const configuration = DatabaseConfiguration.from({
      databaseUrl: secretUrl,
    });
    const serialized = JSON.stringify(configuration);
    expect(serialized).not.toContain("super-secret");
    expect(serialized).not.toContain("service");
    expect(serialized).not.toContain("schema=public");
    expect(serialized).not.toContain(secretUrl);
    expect(serialized).toContain('"provider":"postgresql"');
  });

  it("rejects unsupported environments without reflecting the URL", () => {
    let message = "";
    try {
      DatabaseConfiguration.from({
        databaseUrl: secretUrl,
        environment: "stage",
      });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toContain("development, test, or production");
    expect(message).not.toContain(secretUrl);
    expect(message).not.toContain("super-secret");
  });
});
