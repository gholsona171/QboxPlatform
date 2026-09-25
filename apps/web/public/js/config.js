/**
 * Hosting configuration read from the page shell.
 *
 * The API origin serves the portal at `/` (live mode). The GitHub Pages build
 * rewrites `<base href>` to the repository path and sets `qbox-hosting` to
 * `static`, which shows a sign-in screen that links to the live
 * platform URL from `qbox-live-url`.
 */
function meta(name) {
  if (typeof document === "undefined") return "";
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute("content")?.trim() ?? "";
}

export function basePath() {
  if (typeof document === "undefined") return "";
  return new URL(document.baseURI).pathname.replace(/\/+$/, "");
}

export function staticHosting() {
  return meta("qbox-hosting") === "static";
}

export function liveUrl() {
  return meta("qbox-live-url").replace(/\/+$/, "");
}

export function appPath(path) {
  return `${basePath()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function currentRoutePage() {
  const base = basePath();
  const path = base && location.pathname.startsWith(base) ? location.pathname.slice(base.length) : location.pathname;
  return path.split("/").filter(Boolean)[0] || "overview";
}
