/** Typed startup failure when legacy recovery cannot be safely disabled. */
export declare class CompatibilityDisableGuardError extends Error {
    readonly code = "compatibility-disable-unsafe";
    constructor(message: string);
}
/** Verifies persistent owner and administrator recovery before fallback removal. */
export declare function assertCompatibilityCanBeDisabled(activeOwnerCount: number, activeAdministratorCount: number): void;
//# sourceMappingURL=CompatibilityDisableGuard.d.ts.map