import { z } from "zod";
import { ValidationApiError } from "../errors/ApiError.js";

/** The four input locations parsed once at a route/application boundary. */
export interface UnknownRouteInput {
  readonly params: unknown;
  readonly query: unknown;
  readonly headers: unknown;
  readonly body: unknown;
}

/** One authoritative Zod schema per route input location. */
export interface RouteInputSchemas<
  Params extends z.ZodType,
  Query extends z.ZodType,
  Headers extends z.ZodType,
  Body extends z.ZodType,
> {
  readonly params: Params;
  readonly query: Query;
  readonly headers: Headers;
  readonly body: Body;
}

/** Fully typed route input returned after one successful parse. */
export interface ParsedRouteInput<
  Params extends z.ZodType,
  Query extends z.ZodType,
  Headers extends z.ZodType,
  Body extends z.ZodType,
> {
  readonly params: z.output<Params>;
  readonly query: z.output<Query>;
  readonly headers: z.output<Headers>;
  readonly body: z.output<Body>;
}

/**
 * Parses all route inputs exactly once and converts Zod failures into the
 * stable API validation contract without retaining rejected values.
 */
export function parseRouteInput<
  Params extends z.ZodType,
  Query extends z.ZodType,
  Headers extends z.ZodType,
  Body extends z.ZodType,
>(
  input: UnknownRouteInput,
  schemas: RouteInputSchemas<Params, Query, Headers, Body>,
): ParsedRouteInput<Params, Query, Headers, Body> {
  const params = schemas.params.safeParse(input.params);
  const query = schemas.query.safeParse(input.query);
  const headers = schemas.headers.safeParse(input.headers);
  const body = schemas.body.safeParse(input.body);
  const failures = [
    ...issuesFor("params", params),
    ...issuesFor("query", query),
    ...issuesFor("headers", headers),
    ...issuesFor("body", body),
  ];
  if (failures.length > 0) {
    throw new ValidationApiError(
      failures,
    );
  }
  if (!params.success || !query.success || !headers.success || !body.success)
    throw new ValidationApiError();
  return Object.freeze({
    params: params.data,
    query: query.data,
    headers: headers.data,
    body: body.data,
  });
}

function issuesFor(
  location: string,
  result: z.ZodSafeParseResult<unknown>,
): readonly Readonly<Record<string, unknown>>[] {
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    path: [location, ...issue.path.map(String)].join("."),
    code: stableIssueCode(issue.code),
  }));
}

function stableIssueCode(code: string): string {
  switch (code) {
    case "invalid_type": return "INVALID_TYPE";
    case "too_small": return "BELOW_MINIMUM";
    case "too_big": return "ABOVE_MAXIMUM";
    case "invalid_format": return "INVALID_FORMAT";
    case "unrecognized_keys": return "UNRECOGNIZED_FIELD";
    case "invalid_value": return "INVALID_VALUE";
    case "invalid_union": return "INVALID_VARIANT";
    default: return "INVALID_VALUE";
  }
}
