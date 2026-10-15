import { z } from "zod";
import { ValidationApiError } from "../errors/ApiError.js";
/**
 * Parses all route inputs exactly once and converts Zod failures into the
 * stable API validation contract without retaining rejected values.
 */
export function parseRouteInput(input, schemas) {
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
        throw new ValidationApiError(failures);
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
function issuesFor(location, result) {
    if (result.success)
        return [];
    return result.error.issues.map((issue) => ({
        path: [location, ...issue.path.map(String)].join("."),
        code: stableIssueCode(issue.code),
    }));
}
function stableIssueCode(code) {
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
//# sourceMappingURL=RouteValidation.js.map