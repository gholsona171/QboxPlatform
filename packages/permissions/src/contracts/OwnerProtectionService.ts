/** Revocation request entering the future owner-protection transaction boundary. */
export interface OwnerRevocationRequest {
  readonly assignmentId: string;
  readonly now: Date;
}

/**
 * Transaction-scoped owner protection port.
 *
 * Phase 4 deliberately supplies a pass-through implementation. Phase 5 will
 * execute the operation only after locking active platform-owner assignment
 * rows in the same database transaction and verifying that one owner remains.
 */
export interface OwnerProtectionService {
  protect<TResult>(
    request: OwnerRevocationRequest,
    operation: () => Promise<TResult>,
  ): Promise<TResult>;
}

/** Phase-4 boundary that performs no last-owner enforcement or row locking. */
export class DeferredOwnerProtectionService implements OwnerProtectionService {
  public async protect<TResult>(
    _request: OwnerRevocationRequest,
    operation: () => Promise<TResult>,
  ): Promise<TResult> {
    return operation();
  }
}
