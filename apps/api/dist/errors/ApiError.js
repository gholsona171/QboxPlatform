import { z } from "zod";
/** Expected application/transport failure safe for centralized mapping. */
export class ApiError extends Error {
    code;
    status;
    title;
    publicMessage;
    logLevel;
    details;
    constructor(code, status, title, publicMessage, logLevel, details) {
        super(publicMessage);
        this.code = code;
        this.status = status;
        this.title = title;
        this.publicMessage = publicMessage;
        this.logLevel = logLevel;
        this.details = details;
        this.name = "ApiError";
    }
}
export class ValidationApiError extends ApiError {
    constructor(details) {
        super("VALIDATION_FAILED", 400, "Request validation failed", "The request is invalid.", "warn", details);
    }
}
export class AuthenticationRequiredApiError extends ApiError {
    constructor() {
        super("AUTHENTICATION_REQUIRED", 401, "Authentication required", "Authentication is required.", "warn");
    }
}
export class AuthorizationDeniedApiError extends ApiError {
    constructor() {
        super("AUTHORIZATION_DENIED", 403, "Authorization denied", "You are not authorized to perform this operation.", "warn");
    }
}
/** 403 with a feature-specific message (for example, only the server owner may wipe). */
export class ForbiddenApiError extends ApiError {
    constructor(message, details) {
        super("AUTHORIZATION_DENIED", 403, "Authorization denied", message, "warn", details);
    }
}
export class NotFoundApiError extends ApiError {
    constructor() {
        super("RESOURCE_NOT_FOUND", 404, "Resource not found", "The requested resource was not found.", "info");
    }
}
export class ConflictApiError extends ApiError {
    constructor(details) {
        super("RESOURCE_CONFLICT", 409, "Resource conflict", "The request conflicts with current resource state.", "warn", details);
    }
}
export class DependencyUnavailableApiError extends ApiError {
    /** `details` carries a feature's plain message (for example which host setting is missing) so the portal can show it. */
    constructor(details) {
        super("DEPENDENCY_UNAVAILABLE", 503, "Dependency unavailable", "A required service is temporarily unavailable.", "error", details);
    }
}
export class InvalidRequestHeadersApiError extends ApiError {
    constructor() {
        super("INVALID_REQUEST_HEADERS", 400, "Invalid request headers", "The request headers are invalid.", "warn");
    }
}
export class InvalidHostApiError extends ApiError {
    constructor() {
        super("INVALID_HOST", 400, "Invalid request host", "The request host is invalid.", "warn");
    }
}
export class UnsupportedMediaTypeApiError extends ApiError {
    constructor() {
        super("UNSUPPORTED_MEDIA_TYPE", 415, "Unsupported media type", "The request content type is not supported.", "warn");
    }
}
export class PayloadTooLargeApiError extends ApiError {
    constructor() {
        super("PAYLOAD_TOO_LARGE", 413, "Payload too large", "The request payload exceeds the configured limit.", "warn");
    }
}
export class RequestTimeoutApiError extends ApiError {
    constructor() {
        super("REQUEST_TIMEOUT", 408, "Request timeout", "The request deadline was exceeded.", "warn");
    }
}
export class RateLimitedApiError extends ApiError {
    constructor() {
        super("RATE_LIMITED", 429, "Rate limit exceeded", "Too many requests were received.", "warn");
    }
}
/** No server is selected for this browser and no default server is configured. */
export class GuildRequiredApiError extends ApiError {
    constructor() {
        super("GUILD_REQUIRED", 409, "Server selection required", "Pick a server before using this route.", "info");
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
        "INVALID_REQUEST_HEADERS",
        "INVALID_HOST",
        "UNSUPPORTED_MEDIA_TYPE",
        "PAYLOAD_TOO_LARGE",
        "REQUEST_TIMEOUT",
        "RATE_LIMITED",
        "DEPENDENCY_UNAVAILABLE",
        "GUILD_REQUIRED",
        "INTERNAL_ERROR",
    ]),
    requestId: z.string().min(1),
    correlationId: z.string().min(1),
    errors: z.array(z.record(z.string(), z.unknown())).optional(),
});
/** Maps expected and unknown failures without exposing internal messages. */
export function mapApiError(error, requestId, correlationId) {
    const mapped = error instanceof ApiError
        ? error
        : error instanceof z.ZodError
            ? new ValidationApiError(error.issues.map((issue) => ({
                path: issue.path.join("."),
                code: issue.code,
            })))
            : fastifyErrorCode(error) === "FST_ERR_CTP_BODY_TOO_LARGE"
                ? new PayloadTooLargeApiError()
                : fastifyErrorCode(error) === "FST_ERR_CTP_INVALID_MEDIA_TYPE"
                    ? new UnsupportedMediaTypeApiError()
                    : fastifyErrorCode(error) === "FST_ERR_HANDLER_TIMEOUT"
                        ? new RequestTimeoutApiError()
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
function fastifyErrorCode(error) {
    if (typeof error !== "object" || error === null)
        return undefined;
    const code = Reflect.get(error, "code");
    return typeof code === "string" ? code : undefined;
}
function isFastifyInputError(error) {
    if (typeof error !== "object" || error === null)
        return false;
    const statusCode = Reflect.get(error, "statusCode");
    return statusCode === 400 || statusCode === 413 || statusCode === 415;
}
//# sourceMappingURL=ApiError.js.map