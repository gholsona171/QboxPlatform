import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const filename = fileURLToPath(import.meta.url);
const currentDirectory = dirname(filename);
const envPath = resolve(currentDirectory, "../../../.env");

const result = config({
  path: envPath
});

if (result.error) {
  throw result.error;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DISCORD_TOKEN: process.env.DISCORD_TOKEN ?? "",
  DISCORD_APPLICATION_ID:
    process.env.DISCORD_APPLICATION_ID ?? "",
  DISCORD_COMMAND_TIMEOUT_MS:
    process.env.DISCORD_COMMAND_TIMEOUT_MS ?? "15000",
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  REDIS_URL: process.env.REDIS_URL ?? "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID ?? "",

  ADMIN_ROLE_IDS: (process.env.ADMIN_ROLE_IDS ?? "")
    .split(",")
    .map((roleId) => roleId.trim())
    .filter(Boolean)
} as const;
