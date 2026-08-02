import { spawnSync } from "node:child_process";

const allowedCommands = new Set(["format", "validate", "generate"]);
const command = process.argv[2];

if (!allowedCommands.has(command)) {
  console.error("Unsupported Prisma tooling command.");
  process.exit(1);
}

const environment = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://127.0.0.1:5432/qbox_tooling",
};

const result = spawnSync(
  "prisma",
  [command, "--config", "prisma.config.ts"],
  {
    env: environment,
    shell: process.platform === "win32",
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
