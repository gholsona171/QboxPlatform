import { z } from "zod";

/** Canonical UUID accepted at API transport boundaries. */
export const ApiUuidSchema = z.uuid().refine(
  (value) => value === value.toLowerCase(),
  { error: "UUID must use canonical lowercase form." },
);

/** Canonical UUID used for client-supplied correlation identifiers. */
export const ApiCorrelationIdSchema = ApiUuidSchema;

/** Discord snowflake represented without unsafe JavaScript number conversion. */
export const DiscordSnowflakeSchema = z.string().regex(/^[1-9]\d{16,19}$/u, {
  error: "Invalid Discord snowflake.",
});

/** Stable lowercase identifier suitable for URL and configuration keys. */
export const SafeIdentifierSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z][a-z0-9]*(?:[-_.][a-z0-9]+)*$/u, {
    error: "Invalid safe identifier.",
  });

/** Creates a trimmed string schema with explicit transport bounds. */
export function boundedStringSchema(minimum: number, maximum: number) {
  if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) || minimum < 0 || maximum < minimum)
    throw new Error("Invalid bounded string limits.");
  return z.string().trim().min(minimum).max(maximum);
}

/** ISO-8601 timestamp with an explicit timezone offset. */
export const IsoTimestampSchema = z.iso.datetime({ offset: true });

/** Supported deterministic sort directions. */
export const SortDirectionSchema = z.enum(["asc", "desc"]);

/** Common cursor-based pagination query contract. */
export const PaginationSchema = z.strictObject({
  cursor: boundedStringSchema(1, 256).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

/** RFC-compatible hostname without a port or URL syntax. */
export const HostnameSchema = z
  .string()
  .trim()
  .min(1)
  .max(253)
  .refine(isValidHostname, { error: "Invalid hostname." });

/** HTTP(S) origin without credentials, path, query, or fragment. */
export const HttpOriginSchema = z.string().transform((value, context) => {
  try {
    const url = new URL(value);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      context.addIssue({ code: "custom", message: "Invalid HTTP origin." });
      return z.NEVER;
    }
    return url.origin;
  } catch {
    context.addIssue({ code: "custom", message: "Invalid HTTP origin." });
    return z.NEVER;
  }
});

function isValidHostname(value: string): boolean {
  if (value === "localhost") return true;
  if (value.endsWith(".") || value.includes("..")) return false;
  const labels = value.split(".");
  return labels.every(
    (label) =>
      label.length >= 1 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/iu.test(label),
  );
}
