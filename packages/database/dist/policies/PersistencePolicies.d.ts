/**
 * Ordinary deletion policy for permission infrastructure records.
 *
 * Persistence adapters must disable or revoke records and preserve audit
 * history. Physical deletion is reserved for separately approved retention,
 * privacy, or disaster-recovery procedures outside ordinary repository APIs.
 */
export declare const PERMISSION_RECORD_DELETION_POLICY: "SOFT_DELETE_ONLY";
/**
 * Allowed ordinary disposition of a permission infrastructure record.
 * Repository contracts may disable a record or revoke an assignment; they must
 * not expose physical deletion as an ordinary operation.
 */
export type PermissionRecordDisposition = "DISABLED" | "REVOKED";
//# sourceMappingURL=PersistencePolicies.d.ts.map