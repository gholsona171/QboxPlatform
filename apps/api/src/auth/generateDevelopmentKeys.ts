import { randomBytes } from "node:crypto";

const key = () => randomBytes(32).toString("base64url");

console.log([
  "# New QboxPlatform local authentication keys.",
  "# Paste these into your local ignored .env file. Do not commit them.",
  "AUTH_KEY_VERSION=1",
  `AUTH_SESSION_HMAC_KEY=${key()}`,
  `AUTH_CSRF_HMAC_KEY=${key()}`,
  `AUTH_METADATA_HMAC_KEY=${key()}`,
  `AUTH_OAUTH_ENCRYPTION_KEY=${key()}`,
].join("\n"));
