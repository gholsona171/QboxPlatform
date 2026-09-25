import { readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PRISMA_POSTGRES_SESSION_OPTIONS,
  PRISMA_SAFE_LOG_CONFIGURATION,
  Prisma,
  PrismaClient,
  PrismaClientFactory,
} from "../src/index.js";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageDirectory, "../..");
const placeholderUrl =
  "postgresql://tooling-user:tooling-password@127.0.0.1:5432/qbox_tooling";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Prisma 7 toolchain", () => {
  it("resolves the canonical root schema independently of the cwd", async () => {
    vi.stubEnv("DATABASE_URL", placeholderUrl);
    const configuration = await import("../prisma.config.js");
    expect(configuration.PRISMA_SCHEMA_PATH).toBe(
      resolve(repositoryRoot, "prisma/schema"),
    );
    expect(configuration.PRISMA_MIGRATIONS_PATH).toBe(
      resolve(repositoryRoot, "prisma/migrations"),
    );
    expect(configuration.default.schema).toBe(configuration.PRISMA_SCHEMA_PATH);
    expect(configuration.default.datasource?.url).toBe(placeholderUrl);
  }, 10_000);

  it("uses PostgreSQL and only the approved infrastructure models", async () => {
    const schema = await readFile(
      resolve(repositoryRoot, "prisma/schema/base.prisma"),
      "utf8",
    );
    expect(schema).toContain('provider = "postgresql"');
    expect(schema).toContain('provider               = "prisma-client"');
    expect(schema).toContain('moduleFormat           = "esm"');
    const models = [...schema.matchAll(/^model\s+(\w+)/gm)].map(
      ([, model]) => model,
    );
    expect(models).toEqual([
      "Guild",
      "RoleMenu",
      "RoleMenuOption",
      "WelcomeGoodbyeConfig",
      "AutoroleConfig",
      "AutoroleRule",
      "RulesConfig",
      "DiscordRoleAuditEvent",
      "CommunityCounter",
      "ServerLogConfig",
      "EmbedTemplate",
      "CustomCommand",
      "Suggestion",
      "StarboardConfig",
      "StarboardEntry",
      "PermissionPrincipal",
      "PermissionDefinition",
      "PermissionAssignment",
      "PermissionAuditEvent",
      "PermissionCatalogState",
      "PlatformUser",
      "ExternalIdentity",
      "BrowserSession",
      "OAuthTransaction",
      "OAuthCredential",
      "DiscordGuildMembership",
      "DiscordGuildMembershipRole",
      "AuthenticationAuditEvent",
    ]);
  });

  it("keeps each feature schema file limited to its own prefixed models and enums", async () => {
    const directory = resolve(repositoryRoot, "prisma/schema");
    const files = (await readdir(directory)).filter((file) => file.endsWith(".prisma") && file !== "base.prisma");
    for (const file of files) {
      const prefix = file
        .replace(/\.prisma$/, "")
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("")
        .replace(/s$/, "");
      const schema = await readFile(resolve(directory, file), "utf8");
      expect(schema, file).not.toMatch(/^(generator|datasource)\s/m);
      for (const [, name] of schema.matchAll(/^(?:model|enum)\s+(\w+)/gm))
        expect(name.startsWith(prefix), `${file}: ${name} must start with ${prefix}`).toBe(true);
    }
  });

  it("exports the generated client through an ESM-compatible package source", () => {
    expect(PrismaClient).toBeTypeOf("function");
    expect(Prisma).toBeTypeOf("object");
  });
});

describe("PrismaClientFactory", () => {
  it("constructs distinct clients without connecting or creating a singleton", () => {
    const connect = vi.spyOn(PrismaPg.prototype, "connect");
    const configuration = {
      connectionStringForClientFactory: vi.fn(() => placeholderUrl),
    };
    const factory = new PrismaClientFactory();
    const first = factory.create(configuration);
    const second = factory.create(configuration);

    expect(first.$connect).toBeTypeOf("function");
    expect(first.$disconnect).toBeTypeOf("function");
    expect(second.$connect).toBeTypeOf("function");
    expect(second).not.toBe(first);
    expect(
      configuration.connectionStringForClientFactory,
    ).toHaveBeenCalledTimes(2);
    expect(connect).not.toHaveBeenCalled();
  });

  it("configures only event-mode warning and error logging", () => {
    expect(PRISMA_POSTGRES_SESSION_OPTIONS).toBe("-c timezone=UTC");
    expect(PRISMA_SAFE_LOG_CONFIGURATION).toEqual([
      { emit: "event", level: "warn" },
      { emit: "event", level: "error" },
    ]);
    expect(
      PRISMA_SAFE_LOG_CONFIGURATION.map(({ level }) => level),
    ).not.toContain("query");
  });

  it("does not print the raw connection string during construction", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    new PrismaClientFactory().create({
      connectionStringForClientFactory: () => placeholderUrl,
    });

    const output = [log, warn, error]
      .flatMap((spy) => spy.mock.calls.flat())
      .join(" ");
    expect(output).not.toContain(placeholderUrl);
    expect(output).not.toContain("tooling-password");
  });
});

describe("Prisma package boundaries", () => {
  it("keeps direct Prisma imports and generated paths inside @qbox/prisma", async () => {
    const roots = [
      "apps",
      "packages/authentication",
      "packages/discord",
      "packages/permissions",
    ];
    const violations: string[] = [];
    for (const root of roots) {
      for (const file of await typescriptFiles(resolve(repositoryRoot, root))) {
        const source = await readFile(file, "utf8");
        if (
          source.includes("@prisma/client") ||
          source.includes("@prisma/adapter-") ||
          source.includes("packages/prisma/src/generated")
        ) {
          violations.push(relative(repositoryRoot, file));
        }
      }
    }
    expect(violations).toEqual([]);
  });
});

async function typescriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name === "dist" || entry.name === "node_modules") continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await typescriptFiles(path)));
    else if (entry.isFile() && path.endsWith(".ts")) files.push(path);
  }
  return files;
}
