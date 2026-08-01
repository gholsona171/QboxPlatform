import { env } from "@qbox/shared";
import { main } from "./main.js";

void main({
  ...process.env,
  NODE_ENV: env.NODE_ENV,
  DATABASE_URL: env.DATABASE_URL,
}).catch(() => {
  process.exitCode = 1;
});
