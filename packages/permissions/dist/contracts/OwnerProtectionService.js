/** Stable typed failure returned when a mutation would violate owner recovery. */
export class OwnerInvariantViolationError extends Error {
    code = "last-owner-protection";
    constructor(message = "The mutation would remove the last active platform owner.") {
        super(message);
        this.name = "OwnerInvariantViolationError";
    }
}
/** Deterministic owner invariant evaluated after the adapter acquires its lock. */
export class DeterministicOwnerProtectionService {
    async protect(request, context, operation) {
        await context.acquireMutationLock();
        const owners = await context.loadActiveOwners(request.now);
        if (this.invalidatesLastOwner(request, owners))
            throw new OwnerInvariantViolationError();
        return operation();
    }
    invalidatesLastOwner(request, owners) {
        if (request.target.type === "permission-definition")
            return true;
        const target = request.target;
        if (target.type === "assignment" &&
            !owners.some((owner) => owner.id === target.assignmentId))
            return false;
        const unaffected = owners.filter((owner) => {
            if (target.type === "assignment")
                return owner.id !== target.assignmentId;
            if (target.type === "principal")
                return !samePrincipal(owner.principal, target.principal);
            if (target.type === "guild")
                return owner.principal.guildId !== target.guildId;
            return false;
        });
        if (target.type === "assignment" && target.expiresAt) {
            return !unaffected.some((owner) => !owner.expiresAt || owner.expiresAt > target.expiresAt);
        }
        return unaffected.length === 0 && owners.length > 0;
    }
}
function samePrincipal(left, right) {
    return (left.type === right.type &&
        left.externalId === right.externalId &&
        left.guildId === right.guildId);
}
//# sourceMappingURL=OwnerProtectionService.js.map