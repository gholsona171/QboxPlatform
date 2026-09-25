import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, env } from "prisma/config";

const packageDirectory = dirname(fileURLToPath(import.meta.url));

/** Absolute schema folder; every `*.prisma` file in it is part of the schema. */
export const PRISMA_SCHEMA_PATH = resolve(
  packageDirectory,
  "../../prisma/schema",
);

/** Absolute migrations directory shared by every schema file. */
export const PRISMA_MIGRATIONS_PATH = resolve(packageDirectory, "../../prisma/migrations");

export default defineConfig({
  schema: PRISMA_SCHEMA_PATH,
  migrations: { path: PRISMA_MIGRATIONS_PATH },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
