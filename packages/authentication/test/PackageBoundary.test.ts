import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const forbiddenSpecifiers = [
  "fastify",
  "@prisma/",
  "@qbox/database",
  "discord.js",
  "redis",
  "ioredis",
  "express",
  "node:http",
  "node:https",
];

describe("authentication package boundary", () => {
  it("declares no runtime or development dependencies", async () => {
    const manifest = JSON.parse(
      await readFile(resolve(packageRoot, "package.json"), "utf8"),
    ) as Record<string, unknown>;
    expect(manifest).not.toHaveProperty("dependencies");
    expect(manifest).not.toHaveProperty("devDependencies");
  });

  it("keeps framework, persistence, Discord, Redis, and HTTP imports out of source", async () => {
    const violations: string[] = [];
    for (const path of await sourceFiles(resolve(packageRoot, "src"))) {
      const source = await readFile(path, "utf8");
      const specifiers = [...source.matchAll(/(?:from|import\s*\()\s*["']([^"']+)/g)].map(
        ([, specifier]) => specifier ?? "",
      );
      if (
        specifiers.some((specifier) =>
          forbiddenSpecifiers.some((forbidden) => specifier.startsWith(forbidden)),
        )
      )
        violations.push(path);
    }
    expect(violations).toEqual([]);
  });
});

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths: string[] = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) paths.push(...(await sourceFiles(path)));
    else if (entry.isFile() && path.endsWith(".ts")) paths.push(path);
  }
  return paths;
}
