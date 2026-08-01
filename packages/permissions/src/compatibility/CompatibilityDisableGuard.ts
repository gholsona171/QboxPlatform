/** Typed startup failure when legacy recovery cannot be safely disabled. */
export class CompatibilityDisableGuardError extends Error {
  public readonly code = "compatibility-disable-unsafe";

  public constructor(message: string) {
    super(message);
    this.name = "CompatibilityDisableGuardError";
  }
}

/** Verifies persistent owner and administrator recovery before fallback removal. */
export function assertCompatibilityCanBeDisabled(
  activeOwnerCount: number,
  activeAdministratorCount: number,
): void {
  if (activeOwnerCount < 1)
    throw new CompatibilityDisableGuardError(
      "Legacy administrator compatibility cannot be disabled without an active platform owner.",
    );
  if (activeAdministratorCount < 1)
    throw new CompatibilityDisableGuardError(
      "Legacy administrator compatibility cannot be disabled without a persistent administrator recovery path.",
    );
}
