import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ValidationApiError } from "../src/errors/ApiError.js";
import { parseRouteInput } from "../src/transport/RouteValidation.js";

const schemas = {
  params: z.strictObject({ id: z.uuid() }),
  query: z.strictObject({ limit: z.coerce.number().int().min(1).max(100) }),
  headers: z.strictObject({ correlationId: z.uuid() }),
  body: z.strictObject({ name: z.string().min(1).max(32) }),
};

describe("parseRouteInput", () => {
  it("returns typed values after one transport parse", () => {
    const parsed = parseRouteInput({
      params: { id: "11111111-1111-4111-8111-111111111111" },
      query: { limit: "10" },
      headers: { correlationId: "22222222-2222-4222-8222-222222222222" },
      body: { name: "example" },
    }, schemas);
    expect(parsed.query.limit).toBe(10);
    expect(parsed.body.name).toBe("example");
  });

  it("returns only stable paths and issue codes", () => {
    try {
      parseRouteInput({
        params: { id: "sensitive-invalid-id" },
        query: { limit: 500 },
        headers: { correlationId: "invalid" },
        body: { name: "" },
      }, schemas);
      throw new Error("Expected validation failure.");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationApiError);
      if (!(error instanceof ValidationApiError)) throw error;
      expect(error.details).toEqual(expect.arrayContaining([
        { path: "params.id", code: "INVALID_FORMAT" },
        { path: "query.limit", code: "ABOVE_MAXIMUM" },
      ]));
      expect(JSON.stringify(error.details)).not.toContain("sensitive-invalid-id");
    }
  });
});
