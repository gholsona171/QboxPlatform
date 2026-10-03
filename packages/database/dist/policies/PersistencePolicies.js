/**
 * Ordinary deletion policy for permission infrastructure records.
 *
 * Persistence adapters must disable or revoke records and preserve audit
 * history. Physical deletion is reserved for separately approved retention,
 * privacy, or disaster-recovery procedures outside ordinary repository APIs.
 */
export const PERMISSION_RECORD_DELETION_POLICY = "SOFT_DELETE_ONLY";
//# sourceMappingURL=PersistencePolicies.js.map