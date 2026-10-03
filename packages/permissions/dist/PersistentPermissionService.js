import { randomUUID } from "node:crypto";
import { isPermission } from "./catalog/PermissionCatalog.js";
import { PERMISSION_MUTATION_REASON_CODES } from "./models/Mutation.js";
/** Typed rejection for trusted-context and privileged mutation violations. */
export class PermissionMutationAuthorizationError extends Error {
    code = "permission-mutation-not-authorized";
    constructor(message) {
        super(message);
        this.name = "PermissionMutationAuthorizationError";
    }
}
/**
 * Pure application-domain authorization and mutation coordinator.
 *
 * Instances are safe to share within one process when injected repository and
 * cache adapters satisfy their own concurrency contracts. The service owns no
 * external resources; adapter lifecycle remains with process composition.
 */
export class PersistentPermissionService {
    repository;
    cache;
    cacheTtlMs;
    legacyAssignments;
    constructor(repository, cache, options = {}) {
        this.repository = repository;
        this.cache = cache;
        this.cacheTtlMs = options.cacheTtlMs ?? 5_000;
        this.legacyAssignments = options.legacyAssignments ?? [];
        if (!Number.isInteger(this.cacheTtlMs) || this.cacheTtlMs <= 0) {
            throw new Error("Permission cache TTL must be a positive integer.");
        }
    }
    /** Evaluates exact permissions with deterministic owner, deny, and admin precedence. */
    async authorize(request) {
        this.validateRequest(request);
        if (request.required.length === 0)
            return this.decision(true, "no-permissions-required", [], [], false, false);
        if (request.scope.type === "discord-guild") {
            const guildId = request.scope.guildId;
            if (request.principals.some((principal) => principal.guildId !== guildId)) {
                return this.decision(false, "missing-guild-context", [], [], false, false);
            }
        }
        const now = request.now ?? new Date();
        const loaded = await this.loadAssignments(request.principals, request.scope, now);
        if (!loaded)
            return this.decision(false, "repository-unavailable", [], [], false, true);
        const applicable = [
            ...loaded.assignments,
            ...this.legacyAssignments,
        ].filter((assignment) => this.isApplicable(assignment, request.principals, request.scope, now));
        if (applicable.some((assignment) => assignment.selector.type === "permission" &&
            !isPermission(assignment.selector.permission))) {
            return this.decision(false, "invalid-permission-data", [], [], loaded.usedCache, loaded.degraded);
        }
        if (applicable.some((assignment) => assignment.selector.type === "group")) {
            return this.decision(false, "unsupported-permission-group", [], [], loaded.usedCache, loaded.degraded);
        }
        const allows = this.permissionsFor(applicable, "allow");
        const denies = this.permissionsFor(applicable, "deny");
        if (allows.has("platform.owner")) {
            return this.decision(true, "owner-override", [...allows], [...denies], loaded.usedCache, loaded.degraded);
        }
        for (const denied of denies)
            allows.delete(denied);
        if (request.administratorOverride && allows.has("platform.admin")) {
            return this.decision(true, "administrator-override", [...allows], [...denies], loaded.usedCache, loaded.degraded);
        }
        const allowed = request.mode === "all"
            ? request.required.every((permission) => allows.has(permission))
            : request.required.some((permission) => allows.has(permission));
        return this.decision(allowed, allowed ? "permissions-satisfied" : "permission-denied", [...allows], [...denies], loaded.usedCache, loaded.degraded);
    }
    /** Validates, commits, audits, and invalidates one permission mutation. */
    async mutate(mutation, now = new Date()) {
        this.validateMutation(mutation, now);
        const audit = {
            correlationId: mutation.correlationId ?? randomUUID(),
            action: mutation.type,
            actor: mutation.actor,
            reasonCode: mutation.reasonCode,
            ...(mutation.reason === undefined ? {} : { reason: mutation.reason }),
            ...(mutation.type === "set-assignment"
                ? { target: mutation.target, scope: mutation.scope }
                : {}),
            occurredAt: now,
        };
        if (mutation.type === "set-assignment" &&
            mutation.selector.type === "permission" &&
            mutation.selector.permission === "platform.owner" &&
            mutation.actor.type === "principal" &&
            !(await this.repository.isActiveOwner(mutation.actor.principal, now))) {
            const error = new PermissionMutationAuthorizationError("Only an active owner or trusted system operation may grant platform.owner.");
            await this.repository.recordRejectedMutation(mutation, audit, error.code);
            throw error;
        }
        const result = await this.repository.applyMutation(mutation, audit);
        let cacheInvalidated = true;
        try {
            await this.cache?.invalidate(result.affectedScopes);
        }
        catch {
            cacheInvalidated = false;
        }
        return { result, cacheInvalidated };
    }
    async loadAssignments(principals, scope, now) {
        const scopes = scope.type === "platform" ? [scope] : [{ type: "platform" }, scope];
        // The platform and server scopes are independent reads; load them together.
        const loaded = await Promise.all(scopes.map((candidateScope) => this.loadAssignmentsForScope(principals, candidateScope, now)));
        if (loaded.some((snapshot) => snapshot === undefined))
            return undefined;
        const snapshots = loaded.filter((snapshot) => snapshot !== undefined);
        return {
            assignments: snapshots.flatMap((snapshot) => snapshot.assignments),
            usedCache: snapshots.every((snapshot) => snapshot.usedCache),
            degraded: snapshots.some((snapshot) => snapshot.degraded),
        };
    }
    async loadAssignmentsForScope(principals, scope, now) {
        const key = { principals, scope };
        if (this.cache) {
            try {
                const cached = await this.cache.get(key);
                if (cached && cached.expiresAt > now)
                    return {
                        assignments: cached.assignments,
                        usedCache: true,
                        degraded: false,
                    };
            }
            catch {
                // Repository fallback is the fail-safe path.
            }
        }
        try {
            const assignments = await this.repository.findAssignments(key);
            try {
                await this.cache?.set(key, {
                    assignments,
                    expiresAt: new Date(now.getTime() + this.cacheTtlMs),
                });
            }
            catch {
                return { assignments, usedCache: false, degraded: true };
            }
            return { assignments, usedCache: false, degraded: false };
        }
        catch {
            return undefined;
        }
    }
    isApplicable(assignment, principals, scope, now) {
        return (assignment.enabled &&
            (!assignment.expiresAt || assignment.expiresAt > now) &&
            principals.some((principal) => this.samePrincipal(principal, assignment.principal)) &&
            this.sameScope(scope, assignment.scope));
    }
    permissionsFor(assignments, effect) {
        return new Set(assignments.flatMap((assignment) => assignment.effect === effect &&
            assignment.selector.type === "permission"
            ? [assignment.selector.permission]
            : []));
    }
    samePrincipal(left, right) {
        return (left.type === right.type &&
            left.externalId === right.externalId &&
            left.guildId === right.guildId);
    }
    sameScope(left, right) {
        if (right.type === "platform")
            return true;
        return left.type === "discord-guild" && left.guildId === right.guildId;
    }
    validateRequest(request) {
        if (request.principals.length === 0)
            throw new Error("Authorization requires at least one verified principal.");
        if (request.mode !== "all" && request.mode !== "any")
            throw new Error("Permission evaluation mode is invalid.");
        if (request.required.some((permission) => !isPermission(permission)))
            throw new Error("Authorization contains an unknown compiled permission.");
        if (request.principals.some((principal) => principal.externalId.trim().length === 0 ||
            principal.guildId.trim().length === 0))
            throw new Error("Permission principals require external and guild IDs.");
        if (request.scope.type === "discord-guild" &&
            request.scope.guildId.trim().length === 0)
            throw new Error("Discord guild scope requires a guild ID.");
    }
    validateMutation(mutation, now) {
        if (mutation.correlationId !== undefined &&
            mutation.correlationId.trim().length === 0)
            throw new Error("Permission mutation correlationId cannot be blank.");
        if (!PERMISSION_MUTATION_REASON_CODES.includes(mutation.reasonCode)) {
            throw new Error("Permission mutation reasonCode is invalid.");
        }
        if (mutation.reason !== undefined && mutation.reason.trim().length === 0)
            throw new Error("Permission mutation reason cannot be blank.");
        if (this.isPrivilegedMutation(mutation) &&
            (!mutation.correlationId || mutation.correlationId.trim().length === 0))
            throw new Error("Privileged permission mutations require a correlationId.");
        if (mutation.type === "set-assignment") {
            if (mutation.selector.type === "group")
                throw new Error("Permission groups are reserved but not implemented.");
            if (!isPermission(mutation.selector.permission))
                throw new Error("Permission mutation contains an unknown compiled permission.");
            if (mutation.target.externalId.trim().length === 0 ||
                mutation.target.guildId.trim().length === 0)
                throw new Error("Permission mutation target requires external and guild IDs.");
            if (mutation.expiresAt && mutation.expiresAt <= now)
                throw new Error("Permission assignment expiration must be in the future.");
            if (mutation.scope.type === "discord-guild" &&
                mutation.target.guildId !== mutation.scope.guildId)
                throw new Error("Permission principal and guild scope must match.");
            if (mutation.actor.type === "principal" &&
                this.samePrincipal(mutation.actor.principal, mutation.target) &&
                (mutation.selector.permission === "platform.owner" ||
                    mutation.selector.permission === "platform.admin")) {
                throw new Error("A principal cannot grant elevated platform permission to itself.");
            }
        }
        else {
            if (mutation.assignmentId.trim().length === 0)
                throw new Error("Permission assignment mutation requires an assignment ID.");
            if (mutation.type === "expire-assignment" && mutation.expiresAt <= now)
                throw new Error("Permission assignment expiration must be in the future.");
        }
    }
    isPrivilegedMutation(mutation) {
        if (mutation.type !== "set-assignment")
            return true;
        return (mutation.selector.type === "permission" &&
            (mutation.selector.permission === "platform.owner" ||
                mutation.selector.permission === "platform.admin"));
    }
    decision(allowed, reason, effectivePermissions, deniedPermissions, usedCache, degraded) {
        return {
            allowed,
            reason,
            effectivePermissions,
            deniedPermissions,
            usedCache,
            degraded,
        };
    }
}
//# sourceMappingURL=PersistentPermissionService.js.map