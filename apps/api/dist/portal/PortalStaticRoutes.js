import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { brotliCompressSync, constants as zlibConstants, gzipSync } from "node:zlib";
import { NotFoundApiError } from "../errors/ApiError.js";
const CONTENT_TYPES = {
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
const RESERVED_PREFIXES = ["api", "auth", "health"];
/** Text files worth compressing; images are already compressed. */
const COMPRESSIBLE = /^(text\/|application\/json|image\/svg\+xml)/u;
/** Browsers keep a copy and ask again each time; an unchanged file answers 304 without a body. */
const STATIC_CACHE_CONTROL = "no-cache";
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
export function registerPortalStaticRoutes(server, options) {
    const root = resolve(options.directory);
    const prepared = new Map();
    const sendFile = (request, reply, file) => sendPreparedFile(request, reply, file, prepared);
    const handler = async (request, reply) => {
        const pathname = decodePath(request.url);
        const firstSegment = pathname.split("/").filter(Boolean)[0];
        if (firstSegment && RESERVED_PREFIXES.includes(firstSegment))
            throw new NotFoundApiError();
        const asset = await resolveAsset(root, pathname);
        if (asset)
            return sendFile(request, reply, asset);
        if (extname(pathname) !== "")
            throw new NotFoundApiError();
        return sendFile(request, reply, resolve(root, "index.html"));
    };
    server.get("/", handler);
    server.get("/*", handler);
}
function decodePath(url) {
    const path = url.split("?")[0] ?? "/";
    try {
        return decodeURIComponent(path);
    }
    catch {
        throw new NotFoundApiError();
    }
}
async function resolveAsset(root, pathname) {
    if (pathname.includes("\0"))
        return undefined;
    const candidate = resolve(root, `.${pathname}`);
    if (candidate !== root && !candidate.startsWith(`${root}${sep}`))
        return undefined;
    try {
        const info = await stat(candidate);
        return info.isFile() ? candidate : undefined;
    }
    catch {
        return undefined;
    }
}
/**
 * Sends one portal file with an ETag and `cache-control: no-cache`, so a
 * browser revalidates cheaply (304) instead of downloading it again, and
 * gzip or brotli for text files when the browser accepts them. Files are
 * read and compressed once and kept until they change on disk.
 */
async function sendPreparedFile(request, reply, file, cache) {
    const type = CONTENT_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
    const prepared = await prepareFile(file, type, cache);
    reply.header("content-type", type);
    reply.header("cache-control", STATIC_CACHE_CONTROL);
    reply.header("etag", prepared.etag);
    reply.header("vary", "accept-encoding");
    if (type.startsWith("text/html")) {
        reply.header("content-security-policy", CONTENT_SECURITY_POLICY);
        reply.header("x-frame-options", "DENY");
    }
    if (etagMatches(request.headers["if-none-match"], prepared.etag))
        return reply.code(304).send();
    const encoding = chooseEncoding(request.headers["accept-encoding"], prepared);
    if (encoding === "br" && prepared.br)
        return reply.header("content-encoding", "br").code(200).send(prepared.br);
    if (encoding === "gzip" && prepared.gzip)
        return reply.header("content-encoding", "gzip").code(200).send(prepared.gzip);
    return reply.code(200).send(prepared.body);
}
async function prepareFile(file, type, cache) {
    let info;
    try {
        info = await stat(file);
    }
    catch {
        throw new NotFoundApiError();
    }
    const cached = cache.get(file);
    if (cached && cached.mtimeMs === info.mtimeMs && cached.size === info.size)
        return cached;
    let body;
    try {
        body = await readFile(file);
    }
    catch {
        throw new NotFoundApiError();
    }
    const etag = `"${createHash("sha256").update(body).digest("base64url").slice(0, 27)}"`;
    const compress = COMPRESSIBLE.test(type) && body.length >= 512;
    const entry = {
        mtimeMs: info.mtimeMs,
        size: info.size,
        etag,
        body,
        ...(compress
            ? {
                gzip: gzipSync(body, { level: 9 }),
                br: brotliCompressSync(body, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 9, [zlibConstants.BROTLI_PARAM_SIZE_HINT]: body.length } }),
            }
            : {}),
    };
    cache.set(file, entry);
    return entry;
}
function etagMatches(header, etag) {
    if (typeof header !== "string")
        return false;
    return header.split(",").some((candidate) => {
        const value = candidate.trim();
        return value === "*" || value === etag || value === `W/${etag}`;
    });
}
/** Picks br, then gzip, when the browser lists them without `q=0`. */
function chooseEncoding(header, file) {
    if (typeof header !== "string")
        return undefined;
    const accepted = new Set(header
        .split(",")
        .map((part) => part.trim().toLowerCase().split(";"))
        .filter(([, ...params]) => !params.some((param) => /^\s*q\s*=\s*0(\.0*)?\s*$/u.test(param)))
        .map(([name]) => name?.trim()));
    if (file.br && accepted.has("br"))
        return "br";
    if (file.gzip && accepted.has("gzip"))
        return "gzip";
    return undefined;
}
//# sourceMappingURL=PortalStaticRoutes.js.map