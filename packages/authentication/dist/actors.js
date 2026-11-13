/** Creates a frozen immutable unauthenticated actor. */
export function createUnauthenticatedActor() {
    return Object.freeze({ type: "unauthenticated" });
}
/**
 * Creates a deeply frozen platform-user actor from already verified internal
 * identity and session data. Callers remain responsible for credential proof.
 */
export function createPlatformUserActor(input) {
    if (!Number.isSafeInteger(input.authenticationRevision) || input.authenticationRevision < 1)
        throw new RangeError("Authentication revision must be a positive integer.");
    const authentication = Object.freeze({
        method: "discord-oauth",
        sessionId: input.sessionId,
        loginIdentityId: input.loginIdentityId,
        authenticationRevision: input.authenticationRevision,
        authenticatedAt: input.authenticatedAt.toISOString(),
    });
    return Object.freeze({
        type: "platform-user",
        platformUserId: input.platformUserId,
        authentication,
    });
}
//# sourceMappingURL=actors.js.map