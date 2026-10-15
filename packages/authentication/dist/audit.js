import { AuthenticationDomainError } from "./errors.js";
const FORBIDDEN_METADATA_KEY = /(?:authorization|cookie|password|secret|token|digest|oauth[._-]?(?:code|state)|pkce|request[._-]?body)/i;
/** Validates an immutable authentication audit event and its bounded metadata. */
export function validateAuthenticationAuditEvent(event) {
    validateAuthenticationAuditMetadata(event.metadata);
    if (event.createdAt < event.occurredAt)
        unsafeMetadata("Audit createdAt cannot precede occurredAt.");
    const hmacPresent = Boolean(event.ipHmac || event.userAgentHmac || event.deviceHmac);
    if (hmacPresent !== Boolean(event.metadataKeyVersion) ||
        (event.metadataKeyVersion !== undefined &&
            (!Number.isSafeInteger(event.metadataKeyVersion) ||
                event.metadataKeyVersion < 1)))
        unsafeMetadata("Audit metadata HMACs and their key version must be stored together.");
    return event;
}
/** Validates bounded scalar metadata and rejects fields likely to contain secrets. */
export function validateAuthenticationAuditMetadata(metadata) {
    const entries = Object.entries(metadata);
    if (entries.length > 20)
        unsafeMetadata("Authentication audit metadata may contain at most 20 fields.");
    for (const [key, value] of entries) {
        if (!/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(key) ||
            key.length > 64 ||
            FORBIDDEN_METADATA_KEY.test(key))
            unsafeMetadata("Authentication audit metadata contains an unsafe key.");
        if (typeof value === "string") {
            if (value.length > 256 || /[\u0000-\u001f\u007f]/.test(value))
                unsafeMetadata("Authentication audit metadata contains an unsafe string.");
        }
        else if (typeof value === "number" && !Number.isFinite(value)) {
            unsafeMetadata("Authentication audit metadata numbers must be finite.");
        }
    }
    return metadata;
}
function unsafeMetadata(message) {
    throw new AuthenticationDomainError("unsafe-audit-metadata", message);
}
//# sourceMappingURL=audit.js.map