/**
 * Deterministic repository adapter for unit tests and local domain composition.
 *
 * It is process-local, owns no resources, and is not suitable for production or
 * cross-process synchronization. Future persistence adapters implement the same port.
 */
export class InMemoryPermissionRepository {
    audits = [];
    assignments = new Map();
    nextId = 1;
    constructor(seed = []) {
        for (const assignment of seed)
            this.assignments.set(assignment.id, assignment);
    }
    async findAssignments(query) {
        return [...this.assignments.values()].filter((assignment) => query.principals.some((principal) => principal.type === assignment.principal.type &&
            principal.externalId === assignment.principal.externalId &&
            principal.guildId === assignment.principal.guildId) && this.sameScope(query.scope, assignment.scope));
    }
    async findAssignment(assignmentId) {
        return this.assignments.get(assignmentId);
    }
    async applyMutation(mutation, audit) {
        this.audits.push(audit);
        if (mutation.type === "revoke-assignment" ||
            mutation.type === "disable-assignment") {
            const assignment = this.assignments.get(mutation.assignmentId);
            if (!assignment)
                return { affectedScopes: [] };
            this.assignments.set(mutation.assignmentId, {
                ...assignment,
                enabled: false,
            });
            return { affectedScopes: [assignment.scope] };
        }
        if (mutation.type === "enable-assignment") {
            const assignment = this.assignments.get(mutation.assignmentId);
            if (!assignment)
                return { affectedScopes: [] };
            const enabled = { ...assignment, enabled: true };
            this.assignments.set(mutation.assignmentId, enabled);
            return { assignment: enabled, affectedScopes: [assignment.scope] };
        }
        if (mutation.type === "expire-assignment") {
            const assignment = this.assignments.get(mutation.assignmentId);
            if (!assignment)
                return { affectedScopes: [] };
            const expired = { ...assignment, expiresAt: mutation.expiresAt };
            this.assignments.set(mutation.assignmentId, expired);
            return { assignment: expired, affectedScopes: [assignment.scope] };
        }
        const assignment = {
            id: `assignment-${this.nextId++}`,
            principal: mutation.target,
            selector: mutation.selector,
            scope: mutation.scope,
            effect: mutation.effect,
            enabled: true,
            ...(mutation.expiresAt === undefined
                ? {}
                : { expiresAt: mutation.expiresAt }),
        };
        this.assignments.set(assignment.id, assignment);
        return { assignment, affectedScopes: [assignment.scope] };
    }
    async countActiveOwners(now) {
        return [...this.assignments.values()].filter((assignment) => assignment.enabled &&
            (!assignment.expiresAt || assignment.expiresAt > now) &&
            assignment.effect === "allow" &&
            assignment.selector.type === "permission" &&
            assignment.selector.permission === "platform.owner").length;
    }
    async isActiveOwner(principal, now) {
        return [...this.assignments.values()].some((assignment) => assignment.enabled &&
            (!assignment.expiresAt || assignment.expiresAt > now) &&
            assignment.effect === "allow" &&
            assignment.scope.type === "platform" &&
            assignment.selector.type === "permission" &&
            assignment.selector.permission === "platform.owner" &&
            assignment.principal.type === principal.type &&
            assignment.principal.externalId === principal.externalId &&
            assignment.principal.guildId === principal.guildId);
    }
    async recordRejectedMutation(_mutation, audit, _errorCode) {
        this.audits.push({ ...audit, action: "owner-protection-rejection" });
    }
    sameScope(left, right) {
        return (left.type === right.type &&
            (left.type === "platform" ||
                (right.type === "discord-guild" && left.guildId === right.guildId)));
    }
}
/** How long the bot and API trust cached permission lookups before rereading the database. */
export const PERMISSION_CACHE_TTL_MS = 60_000;
/**
 * Process-local permission cache.
 *
 * Entries are isolated by serialized principal and scope identity. It owns no
 * resources and provides no cross-process invalidation, so processes that
 * share a database (bot, API, operator CLI) pass `ttlMs` to pick up changes
 * made elsewhere. Without it, entries live until invalidated.
 */
export class InMemoryPermissionCache {
    values = new Map();
    ttlMs;
    now;
    constructor(options = {}) {
        this.ttlMs = options.ttlMs;
        this.now = options.now ?? Date.now;
    }
    async get(key) {
        const cacheKey = this.key(key);
        const entry = this.values.get(cacheKey);
        if (!entry)
            return undefined;
        if (this.ttlMs !== undefined && this.now() - entry.storedAt >= this.ttlMs) {
            this.values.delete(cacheKey);
            return undefined;
        }
        return entry.value;
    }
    async set(key, value) {
        this.values.set(this.key(key), { value, storedAt: this.now() });
    }
    async invalidate(scopes) {
        for (const [key] of this.values) {
            if (scopes.some((scope) => key.includes(this.scopeKey(scope))))
                this.values.delete(key);
        }
    }
    key(key) {
        const principals = [...key.principals]
            .map((principal) => `${principal.type}:${principal.guildId}:${principal.externalId}`)
            .sort()
            .join("|");
        return `${this.scopeKey(key.scope)}::${principals}`;
    }
    scopeKey(scope) {
        return scope.type === "platform"
            ? "platform"
            : `discord-guild:${scope.guildId}`;
    }
}
//# sourceMappingURL=InMemoryPermissionAdapters.js.map