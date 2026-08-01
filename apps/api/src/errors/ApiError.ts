import { z } from "zod";

/** Stable machine-readable API error codes. */
export type ApiErrorCode =
  | "VALIDATION_FAILED"
  | "AUTHENTICATION_REQUIRED"
  | "AUTHORIZATION_DENIED"
  | "RESOURCE_CONFLICT"
  | "RESOURCE_NOT_FOUND"
  | "DEPENDENCY_UNAVAILABLE"
  | "INTERNAL_ERROR";

/** Expected application/transport failure safe for centralized mapping. */
export class ApiError extends Error {
  public constructor(
    public readonly code: ApiErrorCode,
    public readonly status: number,
    public readonly title: string,
    public readonly publicMessage: string,
    public readonly logLevel: "info" | "warn" | "error",
    public readonly details?: readonly Readonly<Record<string, unknown>>[],
  ) {
    super(publicMessage);
    this.name = "ApiError";
  }
}

export class ValidationApiError extends ApiError {
  public constructor(details?: readonly Readonly<Record<string, unknown>>[]) {
    super("VALIDATION_FAILED", 400, "Request validation failed", "The request is invalid.", "warn", details);
  }
}

export class AuthenticationRequiredApiError extends ApiError {
  public constructor() {
    super("AUTHENTICATION_REQUIRED", 401, "Authentication required", "Authentication is required.", "warn");
  }
}

export class AuthorizationDeniedApiError extends ApiError {
  public constructor() {
    super("AUTHORIZATION_DENIED", 403, "Authorization denied", "You are not authorized to perform this operation.", "warn");
  }
}

export class NotFoundApiError extends ApiError {
  public constructor() {
    super("RESOURCE_NOT_FOUND", 404, "Resource not found", "The requested resource was not found.", "info");
  }
}

export class ConflictApiError extends ApiError {
  public constructor() {
    super("RESOURCE_CONFLICT", 409, "Resource conflict", "The request conflicts with current resource state.", "warn");
  }
}

export class DependencyUnavailableApiError extends ApiError {
  public constructor() {
    super("DEPENDENCY_UNAVAILABLE", 503, "Dependency unavailable", "A required service is temporarily unavailable.", "error");
  }
}

/** Authoritative RFC 9457-compatible error response schema. */
export const ApiProblemDetailsSchema = z.strictObject({
  type: z.url(),
  title: z.string().trim().min(1),
  status: z.number().int().min(400).max(599),
  detail: z.string().trim().min(1),
  code: z.enum([
    "VALIDATION_FAILED",
    "AUTHENTICATION_REQUIRED",
    "AUTHORIZATION_DENIED",
    "RESOURCE_CONFLICT",
    "RESOURCE_NOT_FOUND",
    "DEPENDENCY_UNAVAILABLE",
    "INTERNAL_ERROR",
  ]),
  requestId: z.string().min(1),
  correlationId: z.string().min(1),
  errors: z.array(z.record(z.string(), z.unknown())).optional(),
});

/** RFC 9457-compatible response extended with stable platform identifiers. */
export type ApiProblemDetails = Readonly<
  z.infer<typeof ApiProblemDetailsSchema>
>;

/** Maps expected and unknown failures without exposing internal messages. */
export function mapApiError(
  error: unknown,
  requestId: string,
  correlationId: string,
): { readonly error: ApiError; readonly problem: ApiProblemDetails } {
  const mapped =
    error instanceof ApiError
      ? error
      : error instanceof z.ZodError
        ? new ValidationApiError(
            error.issues.map((issue) => ({
              path: issue.path.join("."),
              code: issue.code,
            })),
          )
        : isFastifyInputError(error)
          ? new ValidationApiError()
        : new ApiError("INTERNAL_ERROR", 500, "Internal server error", "An unexpected error occurred.", "error");
  return {
    error: mapped,
    problem: ApiProblemDetailsSchema.parse({
      type: `https://qbox.invalid/problems/${mapped.code.toLowerCase().replaceAll("_", "-")}`,
      title: mapped.title,
      status: mapped.status,
      detail: mapped.publicMessage,
      code: mapped.code,
      requestId,
      correlationId,
      ...(mapped.details === undefined ? {} : { errors: mapped.details }),
    }),
  };
}

function isFastifyInputError(
  error: unknown,
): error is { readonly statusCode: number } {
  if (typeof error !== "object" || error === null) return false;
  const statusCode = Reflect.get(error, "statusCode");
  return statusCode === 400 || statusCode === 413 || statusCode === 415;
}
