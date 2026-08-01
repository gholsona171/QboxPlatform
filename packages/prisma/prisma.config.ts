import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, env } from "prisma/config";

const packageDirectory = dirname(fileURLToPath(import.meta.url));

/** Absolute canonical schema path resolved independently of the caller's cwd. */
export const PRISMA_SCHEMA_PATH = resolve(
  packageDirectory,
  "../../prisma/schema.prisma",
);

export default defineConfig({
  schema: PRISMA_SCHEMA_PATH,
  datasource: {
    url: env("DATABASE_URL"),
  },
});
