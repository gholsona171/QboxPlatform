import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { ApiConfiguration } from "../src/config/ApiConfiguration.js";
import { createApiServer } from "../src/createApiServer.js";
import { portalDirectoryFromEnvironment } from "../src/main.js";
import { registerPortalStaticRoutes } from "../src/portal/PortalStaticRoutes.js";

const root = mkdtempSync(join(tmpdir(), "qbox-portal-"));
const portal = join(root, "public");
mkdirSync(join(portal, "js"), { recursive: true });
writeFileSync(join(portal, "index.html"), "<!doctype html><title>portal</title>");
writeFileSync(join(portal, "js", "app.js"), "export {};");
writeFileSync(join(root, "secret.txt"), "outside");

afterAll(() => rmSync(root, { recursive: true, force: true }));

function server() {
  return createApiServer({
    configuration: ApiConfiguration.from({
      environment: "test",
      publicBaseUrl: "http://127.0.0.1:3000",
      buildVersion: "portal-test",
    }),
    registerRoutes: (instance) => registerPortalStaticRoutes(instance, { directory: portal }),
  });
}

const host = { host: "127.0.0.1:3000" };

describe("portal static routes", () => {
  it("serves the shell with a content security policy", async () => {
    const response = await server().inject({ method: "GET", url: "/", headers: host });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(response.body).toContain("portal");
  });

  it("serves assets with their content type", async () => {
    const response = await server().inject({ method: "GET", url: "/js/app.js", headers: host });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/javascript");
  });

  it("falls back to the shell for client routes", async () => {
    const response = await server().inject({ method: "GET", url: "/tickets?tab=open", headers: host });
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("portal");
  });

  it("does not fall back for reserved API prefixes or missing assets", async () => {
    const app = server();
    for (const url of ["/api/v1/unknown", "/auth/unknown", "/health/unknown", "/js/missing.js"]) {
      const response = await app.inject({ method: "GET", url, headers: host });
      expect(response.statusCode, url).toBe(404);
    }
  });

  it("rejects path traversal outside the portal directory", async () => {
    const app = server();
    for (const url of ["/../secret.txt", "/%2e%2e/secret.txt", "/js/..%2f..%2fsecret.txt"]) {
      const response = await app.inject({ method: "GET", url, headers: host });
      expect(response.body, url).not.toContain("outside");
    }
  });

  it("resolves the portal directory from the environment", () => {
    expect(portalDirectoryFromEnvironment(portal)).toBe(portal);
    expect(portalDirectoryFromEnvironment("disabled")).toBeUndefined();
    expect(portalDirectoryFromEnvironment(join(root, "missing"))).toBeUndefined();
  });
});
