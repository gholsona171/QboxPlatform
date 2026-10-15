/**
 * Path helpers for the portal. The API serves it from its own origin;
 * `<base href>` in the page shell gives the base path.
 */
export function basePath() {
  if (typeof document === "undefined") return "";
  return new URL(document.baseURI).pathname.replace(/\/+$/, "");
}

export function appPath(path) {
  return `${basePath()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function currentRoutePage() {
  const base = basePath();
  const path = base && location.pathname.startsWith(base) ? location.pathname.slice(base.length) : location.pathname;
  return path.split("/").filter(Boolean)[0] || "overview";
}
