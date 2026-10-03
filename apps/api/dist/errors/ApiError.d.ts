import { z } from "zod";
/** Stable machine-readable API error codes. */
export type ApiErrorCode = "VALIDATION_FAILED" | "AUTHENTICATION_REQUIRED" | "AUTHORIZATION_DENIED" | "RESOURCE_CONFLICT" | "RESOURCE_NOT_FOUND" | "INVALID_REQUEST_HEADERS" | "INVALID_HOST" | "UNSUPPORTED_MEDIA_TYPE" | "PAYLOAD_TOO_LARGE" | "REQUEST_TIMEOUT" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "GUILD_REQUIRED" | "INTERNAL_ERROR";
/** Expected application/transport failure safe for centralized mapping. */
export declare class ApiError extends Error {
    readonly code: ApiErrorCode;
    readonly status: number;
    readonly title: string;
    readonly publicMessage: string;
    readonly logLevel: "info" | "warn" | "error";
    readonly details?: readonly Readonly<Record<string, unknown>>[] | undefined;
    constructor(code: ApiErrorCode, status: number, title: string, publicMessage: string, logLevel: "info" | "warn" | "error", details?: readonly Readonly<Record<string, unknown>>[] | undefined);
}
export declare class ValidationApiError extends ApiError {
    constructor(details?: readonly Readonly<Record<string, unknown>>[]);
}
export declare class AuthenticationRequiredApiError extends ApiError {
    constructor();
}
export declare class AuthorizationDeniedApiError extends ApiError {
    constructor();
}
/** 403 with a feature-specific message (for example, only the server owner may wipe). */
export declare class ForbiddenApiError extends ApiError {
    constructor(message: string, details?: readonly Readonly<Record<string, unknown>>[]);
}
export declare class NotFoundApiError extends ApiError {
    constructor();
}
export declare class ConflictApiError extends ApiError {
    constructor(details?: readonly Readonly<Record<string, unknown>>[]);
}
export declare class DependencyUnavailableApiError extends ApiError {
    /** `details` carries a feature's plain message (for example which host setting is missing) so the portal can show it. */
    constructor(details?: readonly Readonly<Record<string, unknown>>[]);
}
export declare class InvalidRequestHeadersApiError extends ApiError {
    constructor();
}
export declare class InvalidHostApiError extends ApiError {
    constructor();
}
export declare class UnsupportedMediaTypeApiError extends ApiError {
    constructor();
}
export declare class PayloadTooLargeApiError extends ApiError {
    constructor();
}
export declare class RequestTimeoutApiError extends ApiError {
    constructor();
}
export declare class RateLimitedApiError extends ApiError {
    constructor();
}
/** No server is selected for this browser and no default server is configured. */
export declare class GuildRequiredApiError extends ApiError {
    constructor();
}
/** Authoritative RFC 9457-compatible error response schema. */
export declare const ApiProblemDetailsSchema: z.ZodObject<{
    type: z.ZodURL;
    title: z.ZodString;
    status: z.ZodNumber;
    detail: z.ZodString;
    code: z.ZodEnum<{
        VALIDATION_FAILED: "VALIDATION_FAILED";
        AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED";
        AUTHORIZATION_DENIED: "AUTHORIZATION_DENIED";
        RESOURCE_CONFLICT: "RESOURCE_CONFLICT";
        RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND";
        INVALID_REQUEST_HEADERS: "INVALID_REQUEST_HEADERS";
        INVALID_HOST: "INVALID_HOST";
        UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE";
        PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE";
        REQUEST_TIMEOUT: "REQUEST_TIMEOUT";
        RATE_LIMITED: "RATE_LIMITED";
        DEPENDENCY_UNAVAILABLE: "DEPENDENCY_UNAVAILABLE";
        GUILD_REQUIRED: "GUILD_REQUIRED";
        INTERNAL_ERROR: "INTERNAL_ERROR";
    }>;
    requestId: z.ZodString;
    correlationId: z.ZodString;
    errors: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strict>;
/** RFC 9457-compatible response extended with stable platform identifiers. */
export type ApiProblemDetails = Readonly<z.infer<typeof ApiProblemDetailsSchema>>;
/** Maps expected and unknown failures without exposing internal messages. */
export declare function mapApiError(error: unknown, requestId: string, correlationId: string): {
    readonly error: ApiError;
    readonly problem: ApiProblemDetails;
};
//# sourceMappingURL=ApiError.d.ts.map