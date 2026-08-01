import { describe, expect, it } from "vitest";
import {
  ApiCorrelationIdSchema,
  ApiUuidSchema,
  boundedStringSchema,
  DiscordSnowflakeSchema,
  HostnameSchema,
  HttpOriginSchema,
  IsoTimestampSchema,
  PaginationSchema,
  SafeIdentifierSchema,
  SortDirectionSchema,
} from "../src/transport/ApiTransportSchemas.js";

describe("API transport schemas", () => {
  it("accepts canonical reusable transport values", () => {
    expect(ApiUuidSchema.parse("11111111-1111-4111-8111-111111111111")).toBeTruthy();
    expect(ApiCorrelationIdSchema.parse("11111111-1111-4111-8111-111111111111")).toBeTruthy();
    expect(DiscordSnowflakeSchema.parse("1257928923048837201")).toBeTruthy();
    expect(SafeIdentifierSchema.parse("permission-grant.v1")).toBeTruthy();
    expect(IsoTimestampSchema.parse("2026-08-01T12:00:00Z")).toBeTruthy();
    expect(SortDirectionSchema.parse("desc")).toBe("desc");
    expect(HostnameSchema.parse("api.example.com")).toBe("api.example.com");
    expect(HttpOriginSchema.parse("https://panel.example.com")).toBe("https://panel.example.com");
  });

  it("rejects malformed and unbounded values", () => {
    expect(ApiUuidSchema.safeParse("not-a-uuid").success).toBe(false);
    expect(ApiUuidSchema.safeParse("AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA").success).toBe(false);
    expect(DiscordSnowflakeSchema.safeParse("123").success).toBe(false);
    expect(SafeIdentifierSchema.safeParse("Unsafe Identifier").success).toBe(false);
    expect(HostnameSchema.safeParse("bad..host").success).toBe(false);
    expect(HttpOriginSchema.safeParse("https://user:secret@example.com/path").success).toBe(false);
    expect(boundedStringSchema(1, 3).safeParse("four").success).toBe(false);
  });

  it("parses strict bounded pagination", () => {
    expect(PaginationSchema.parse({ limit: "50" })).toEqual({ limit: 50 });
    expect(PaginationSchema.safeParse({ limit: 101 }).success).toBe(false);
    expect(PaginationSchema.safeParse({ limit: 10, unexpected: true }).success).toBe(false);
  });
});
