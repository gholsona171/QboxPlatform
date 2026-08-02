const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 15_000;

export default async function handler(request, response) {
  let origin;
  try {
    origin = configuredOrigin();
  } catch {
    response.statusCode = 503;
    response.setHeader("cache-control", "no-store");
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "QBOX_API_ORIGIN is invalid." }));
    return;
  }
  if (!origin) {
    response.statusCode = 503;
    response.setHeader("cache-control", "no-store");
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "QBOX_API_ORIGIN is not configured." }));
    return;
  }

  const target = targetUrl(request, origin);
  if (!target) {
    response.statusCode = 400;
    response.end("Invalid proxy target.");
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: forwardedHeaders(request),
      body: hasBody(request.method) ? request : undefined,
      redirect: "manual",
      signal: controller.signal,
      duplex: "half",
    });
    response.statusCode = upstream.status;
    copyResponseHeaders(upstream, response);
    const body = await boundedBody(upstream);
    response.end(body);
  } catch {
    response.statusCode = 502;
    response.setHeader("cache-control", "no-store");
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Qbox API proxy failed." }));
  } finally {
    clearTimeout(timeout);
  }
}

function configuredOrigin() {
  const value = process.env.QBOX_API_ORIGIN;
  if (!value) return undefined;
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && local))
    throw new Error("QBOX_API_ORIGIN must use HTTPS outside local development.");
  url.pathname = "";
  url.search = "";
  url.hash = "";
  url.username = "";
  url.password = "";
  return url;
}

function targetUrl(request, origin) {
  const incoming = new URL(request.url, "https://qbox.invalid");
  let pathname = incoming.pathname;
  if (pathname.startsWith("/api/__proxy/")) {
    pathname = `/${pathname.slice("/api/__proxy/".length)}`;
  }
  if (
    !(
      pathname === "/api" ||
      pathname.startsWith("/api/") ||
      pathname === "/auth" ||
      pathname.startsWith("/auth/") ||
      pathname === "/health" ||
      pathname.startsWith("/health/")
    )
  )
    return undefined;
  const target = new URL(origin.toString());
  target.pathname = pathname;
  target.search = incoming.search;
  return target;
}

function forwardedHeaders(request) {
  const headers = new Headers();
  for (const name of [
    "accept",
    "accept-language",
    "content-type",
    "content-length",
    "cookie",
    "origin",
    "referer",
    "user-agent",
    "x-correlation-id",
    "x-csrf-token",
  ]) {
    const value = request.headers[name];
    if (typeof value === "string") headers.set(name, value);
  }
  headers.set("x-forwarded-host", request.headers.host || "");
  headers.set("x-forwarded-proto", "https");
  return headers;
}

function copyResponseHeaders(upstream, response) {
  response.setHeader("cache-control", "no-store");
  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
  if (setCookies.length > 0) response.setHeader("set-cookie", setCookies);
  for (const [name, value] of upstream.headers) {
    const lower = name.toLowerCase();
    if (lower === "set-cookie" && setCookies.length > 0) continue;
    if (
      [
        "content-type",
        "location",
        "set-cookie",
        "x-request-id",
        "x-correlation-id",
        "x-qbox-version",
      ].includes(lower)
    ) {
      response.setHeader(name, value);
    }
  }
}

async function boundedBody(upstream) {
  const reader = upstream.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) throw new Error("proxy-response-too-large");
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

function hasBody(method) {
  return !["GET", "HEAD"].includes(method);
}
