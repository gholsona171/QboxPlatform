import { z } from "zod";
/** Canonical UUID accepted at API transport boundaries. */
export declare const ApiUuidSchema: z.ZodUUID;
/** Canonical UUID used for client-supplied correlation identifiers. */
export declare const ApiCorrelationIdSchema: z.ZodUUID;
/** Discord snowflake represented without unsafe JavaScript number conversion. */
export declare const DiscordSnowflakeSchema: z.ZodString;
/** Stable lowercase identifier suitable for URL and configuration keys. */
export declare const SafeIdentifierSchema: z.ZodString;
/** Creates a trimmed string schema with explicit transport bounds. */
export declare function boundedStringSchema(minimum: number, maximum: number): z.ZodString;
/** ISO-8601 timestamp with an explicit timezone offset. */
export declare const IsoTimestampSchema: z.ZodISODateTime;
/** Supported deterministic sort directions. */
export declare const SortDirectionSchema: z.ZodEnum<{
    asc: "asc";
    desc: "desc";
}>;
/** Common cursor-based pagination query contract. */
export declare const PaginationSchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
/** RFC-compatible hostname without a port or URL syntax. */
export declare const HostnameSchema: z.ZodString;
/** HTTP(S) origin without credentials, path, query, or fragment. */
export declare const HttpOriginSchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
//# sourceMappingURL=ApiTransportSchemas.d.ts.map