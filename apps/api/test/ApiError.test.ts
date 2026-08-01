import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  AuthenticationRequiredApiError,
  AuthorizationDeniedApiError,
  ConflictApiError,
  DependencyUnavailableApiError,
  mapApiError,
  NotFoundApiError,
  ValidationApiError,
} from "../src/errors/ApiError.js";

describe("mapApiError", () => {
  it.each([
    [new ValidationApiError(), 400, "VALIDATION_FAILED"],
    [new AuthenticationRequiredApiError(), 401, "AUTHENTICATION_REQUIRED"],
    [new AuthorizationDeniedApiError(), 403, "AUTHORIZATION_DENIED"],
    [new NotFoundApiError(), 404, "RESOURCE_NOT_FOUND"],
    [new ConflictApiError(), 409, "RESOURCE_CONFLICT"],
    [new DependencyUnavailableApiError(), 503, "DEPENDENCY_UNAVAILABLE"],
  ])("maps %s to %s", (error, status, code) => {
    const mapped = mapApiError(error, "request", "correlation");
    expect(mapped.problem).toMatchObject({ status, code, requestId: "request" });
  });

  it("maps Zod issues without rejected values", () => {
    const result = z.strictObject({ count: z.number() }).safeParse({
      count: "sensitive-value",
    });
    if (result.success) throw new Error("Expected validation failure.");
    const mapped = mapApiError(result.error, "request", "correlation");
    expect(mapped.problem.code).toBe("VALIDATION_FAILED");
    expect(JSON.stringify(mapped.problem)).not.toContain("sensitive-value");
  });

  it("maps unknown failures without exposing messages or stacks", () => {
    const mapped = mapApiError(
      new Error("database password is secret"),
      "request",
      "correlation",
    );
    expect(mapped.problem.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(mapped.problem)).not.toContain("database password");
    expect(mapped.problem).not.toHaveProperty("stack");
  });
});
