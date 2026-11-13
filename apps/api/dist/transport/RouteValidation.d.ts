import { z } from "zod";
/** The four input locations parsed once at a route/application boundary. */
export interface UnknownRouteInput {
    readonly params: unknown;
    readonly query: unknown;
    readonly headers: unknown;
    readonly body: unknown;
}
/** One authoritative Zod schema per route input location. */
export interface RouteInputSchemas<Params extends z.ZodType, Query extends z.ZodType, Headers extends z.ZodType, Body extends z.ZodType> {
    readonly params: Params;
    readonly query: Query;
    readonly headers: Headers;
    readonly body: Body;
}
/** Fully typed route input returned after one successful parse. */
export interface ParsedRouteInput<Params extends z.ZodType, Query extends z.ZodType, Headers extends z.ZodType, Body extends z.ZodType> {
    readonly params: z.output<Params>;
    readonly query: z.output<Query>;
    readonly headers: z.output<Headers>;
    readonly body: z.output<Body>;
}
/**
 * Parses all route inputs exactly once and converts Zod failures into the
 * stable API validation contract without retaining rejected values.
 */
export declare function parseRouteInput<Params extends z.ZodType, Query extends z.ZodType, Headers extends z.ZodType, Body extends z.ZodType>(input: UnknownRouteInput, schemas: RouteInputSchemas<Params, Query, Headers, Body>): ParsedRouteInput<Params, Query, Headers, Body>;
//# sourceMappingURL=RouteValidation.d.ts.map