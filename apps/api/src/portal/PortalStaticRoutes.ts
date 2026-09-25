import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { NotFoundApiError } from "../errors/ApiError.js";

/** Options for serving the static web portal from the API origin. */
export interface PortalStaticRouteOptions {
  /** Absolute directory containing `index.html` and portal assets. */
  readonly directory: string;
}

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

const RESERVED_PREFIXES = ["api", "auth", "health"] as const;

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.discordapp.com",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/**
 * Serves the framework-free portal from the same origin as the API so browser
 * session cookies, CSRF cookies, and OAuth redirects stay first-party.
 *
 * Unknown non-asset paths return `index.html` for client-side routing. Paths
 * under `/api`, `/auth`, and `/health` never fall back to the portal.
 */
export function registerPortalStaticRoutes(
  server: FastifyInstance,
  options: PortalStaticRouteOptions,
): void {
  const root = resolve(options.directory);
  const handler = async (request: FastifyRequest, reply: FastifyReply) => {
    const pathname = decodePath(request.url);
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    if (firstSegment && (RESERVED_PREFIXES as readonly string[]).includes(firstSegment))
      throw new NotFoundApiError();
    const asset = await resolveAsset(root, pathname);
    if (asset) return sendFile(reply, asset);
    if (extname(pathname) !== "") throw new NotFoundApiError();
    return sendFile(reply, resolve(root, "index.html"));
  };
  server.get("/", handler);
  server.get("/*", handler);
}

function decodePath(url: string): string {
  const path = url.split("?")[0] ?? "/";
  try {
    return decodeURIComponent(path);
  } catch {
    throw new NotFoundApiError();
  }
}

async function resolveAsset(root: string, pathname: string): Promise<string | undefined> {
  if (pathname.includes("\0")) return undefined;
  const candidate = resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return undefined;
  try {
    const info = await stat(candidate);
    return info.isFile() ? candidate : undefined;
  } catch {
    return undefined;
  }
}

async function sendFile(reply: FastifyReply, file: string): Promise<FastifyReply> {
  let body: Buffer;
  try {
    body = await readFile(file);
  } catch {
    throw new NotFoundApiError();
  }
  const type = CONTENT_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
  reply.header("content-type", type);
  if (type.startsWith("text/html")) {
    reply.header("content-security-policy", CONTENT_SECURITY_POLICY);
    reply.header("x-frame-options", "DENY");
  }
  return reply.code(200).send(body);
}
