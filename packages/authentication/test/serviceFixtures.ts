import { createHash, randomUUID } from "node:crypto";

import {
  authenticationAuditEventId,
  authenticationDigest,
  browserSessionId,
  discordGuildMembershipId,
  claimOAuthTransaction,
  externalIdentityId,
  oauthCredentialId,
  oauthTransactionId,
  opaqueAuthenticationSecret,
  platformUserId,
  transitionPlatformUser,
  type AuthenticationAuditEvent,
  type AuthenticationClock,
  type AuthenticationCrypto,
  type AuthenticationIdGenerator,
  type AuthenticationKeyHandle,
  type AuthenticationKeyProvider,
  type AuthenticationTransactionContext,
  type AuthenticationUnitOfWork,
  type BrowserSession,
  type DiscordGuildMembership,
  type ExternalIdentity,
  type OAuthCredential,
  type OAuthTransaction,
  type PlatformUser,
} from "../src/index.js";

export interface MemoryState {
  readonly users: Map<string, PlatformUser>;
  readonly identities: Map<string, ExternalIdentity>;
  readonly sessions: Map<string, BrowserSession>;
  readonly transactions: Map<string, OAuthTransaction>;
  readonly credentials: Map<string, OAuthCredential>;
  readonly memberships: Map<string, DiscordGuildMembership>;
  readonly audits: Map<string, AuthenticationAuditEvent>;
}

export function memoryState(): MemoryState {
  return {
    users: new Map(),
    identities: new Map(),
    sessions: new Map(),
    transactions: new Map(),
    credentials: new Map(),
    memberships: new Map(),
    audits: new Map(),
  };
}

export class MemoryUnitOfWork implements AuthenticationUnitOfWork {
  public failAudit = false;
  public active = false;
  #tail: Promise<void> = Promise.resolve();
  public constructor(public readonly state: MemoryState) {}

  public async run<TResult>(
    operation: (context: AuthenticationTransactionContext) => Promise<TResult>,
  ): Promise<TResult> {
    let release!: () => void;
    const predecessor = this.#tail;
    this.#tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await predecessor;
    try {
      this.active = true;
      const copy = cloneState(this.state);
      const result = await operation(contextFor(copy, () => this.failAudit));
      replace(this.state.users, copy.users);
      replace(this.state.identities, copy.identities);
      replace(this.state.sessions, copy.sessions);
      replace(this.state.transactions, copy.transactions);
      replace(this.state.credentials, copy.credentials);
      replace(this.state.memberships, copy.memberships);
      replace(this.state.audits, copy.audits);
      return result;
    } finally {
      this.active = false;
      release();
    }
  }
}

export class FixedClock implements AuthenticationClock {
  public constructor(public current: Date) {}
  public now(): Date {
    return new Date(this.current);
  }
}

export class FakeKeys implements AuthenticationKeyProvider {
  readonly #handles = new Map<AuthenticationKeyHandle["purpose"], readonly AuthenticationKeyHandle[]>([
    ["SESSION_HMAC", [handle("SESSION_HMAC", 2), handle("SESSION_HMAC", 1)]],
    ["CSRF_HMAC", [handle("CSRF_HMAC", 1)]],
    ["METADATA_HMAC", [handle("METADATA_HMAC", 1)]],
    ["OAUTH_ENCRYPTION", [handle("OAUTH_ENCRYPTION", 1)]],
  ]);
  public async active(purpose: AuthenticationKeyHandle["purpose"]): Promise<AuthenticationKeyHandle> {
    return this.#handles.get(purpose)![0]!;
  }
  public async byVersion(purpose: AuthenticationKeyHandle["purpose"], version: number): Promise<AuthenticationKeyHandle | undefined> {
    return this.#handles.get(purpose)?.find((key) => key.version === version);
  }
  public async verificationCandidates(purpose: AuthenticationKeyHandle["purpose"]): Promise<readonly AuthenticationKeyHandle[]> {
    return this.#handles.get(purpose)!;
  }
}

export class FakeCrypto implements AuthenticationCrypto {
  #counter = 0;
  public async createOpaqueSecret(): Promise<ReturnType<typeof opaqueAuthenticationSecret>> {
    this.#counter += 1;
    return opaqueAuthenticationSecret(`secret-${this.#counter}-` + "x".repeat(32));
  }
  public async hmac(value: string, key: AuthenticationKeyHandle): Promise<ReturnType<typeof authenticationDigest>> {
    return authenticationDigest(
      createHash("sha256").update(`${key.identifier}:${value}`).digest("hex"),
    );
  }
  public async encrypt(): Promise<never> {
    throw new Error("not implemented by default fake crypto");
  }
  public async decrypt(): Promise<never> {
    throw new Error("not implemented by default fake crypto");
  }
  public async constantTimeEqual(left: ReturnType<typeof authenticationDigest>, right: ReturnType<typeof authenticationDigest>): Promise<boolean> {
    return left === right;
  }
}

export class FakeIds implements AuthenticationIdGenerator {
  public platformUserId() { return platformUserId(randomUUID()); }
  public externalIdentityId() { return externalIdentityId(randomUUID()); }
  public browserSessionId() { return browserSessionId(randomUUID()); }
  public oauthTransactionId() { return oauthTransactionId(randomUUID()); }
  public oauthCredentialId() { return oauthCredentialId(randomUUID()); }
  public discordGuildMembershipId() { return discordGuildMembershipId(randomUUID()); }
  public authenticationAuditEventId() { return authenticationAuditEventId(randomUUID()); }
}

function contextFor(
  state: MemoryState,
  failAudit: () => boolean,
): AuthenticationTransactionContext {
  return {
    platformUsers: {
      findById: async (id) => state.users.get(id),
      create: async (user) => {
        if (state.users.has(user.id)) throw new Error("conflict");
        state.users.set(user.id, user);
        return user;
      },
      updateStatus: async (id, revision, status, reason, at) => {
        const current = required(state.users.get(id));
        if (current.authenticationRevision !== revision) throw new Error("stale");
        const next = transitionPlatformUser(current, status, reason, at);
        state.users.set(id, next);
        return next;
      },
      incrementAuthenticationRevision: async (id, revision, at) => {
        const current = required(state.users.get(id));
        if (current.authenticationRevision !== revision) throw new Error("stale");
        const next = { ...current, authenticationRevision: revision + 1, updatedAt: at };
        state.users.set(id, next);
        return next;
      },
    },
    externalIdentities: {
      findById: async (id) => state.identities.get(id),
      findByProviderSubject: async (provider, subject) =>
        [...state.identities.values()].find(
          (identity) => identity.provider === provider && identity.providerSubjectId === subject,
        ),
      findByPlatformUser: async (userId, provider) =>
        [...state.identities.values()].find(
          (identity) => identity.platformUserId === userId && identity.provider === provider,
        ),
      create: async (identity) => {
        state.identities.set(identity.id, identity);
        return identity;
      },
      updateVerifiedIdentity: async (identity) => {
        state.identities.set(identity.id, identity);
        return identity;
      },
      unlink: async (id, at) => {
        const current = required(state.identities.get(id));
        const next = { ...current, enabled: false, unlinkedAt: at, updatedAt: at };
        state.identities.set(id, next);
        return next;
      },
    },
    browserSessions: {
      acquireAccountMutationLock: async () => undefined,
      findByTokenDigest: async (digest) =>
        [...state.sessions.values()].find((session) => session.tokenDigest === digest),
      findById: async (id) => state.sessions.get(id),
      create: async (session) => {
        if ([...state.sessions.values()].some((value) => value.tokenDigest === session.tokenDigest))
          throw new Error("duplicate");
        state.sessions.set(session.id, session);
        return session;
      },
      rotate: async (id, successor) => {
        const current = required(state.sessions.get(id));
        if (current.status !== "ACTIVE") throw new Error("rotation-conflict");
        state.sessions.set(id, {
          ...current,
          status: "ROTATED",
          revokedAt: successor.createdAt,
          revocationReason: "ROTATED",
          updatedAt: successor.createdAt,
        });
        state.sessions.set(successor.id, successor);
        return successor;
      },
      revoke: async (id, reason, at) => {
        const current = state.sessions.get(id);
        if (!current || current.status !== "ACTIVE") return current;
        const next: BrowserSession = {
          ...current,
          status: reason === "EXPIRED" ? "EXPIRED" : "REVOKED",
          revokedAt: at,
          revocationReason: reason,
          updatedAt: at,
        };
        state.sessions.set(id, next);
        return next;
      },
      revokeAll: async (userId, reason, at) => {
        let count = 0;
        for (const session of state.sessions.values()) {
          if (session.platformUserId === userId && session.status === "ACTIVE") {
            state.sessions.set(session.id, {
              ...session,
              status: "REVOKED",
              revokedAt: at,
              revocationReason: reason,
              updatedAt: at,
            });
            count += 1;
          }
        }
        return count;
      },
      findActiveForPlatformUser: async (userId, now) =>
        [...state.sessions.values()]
          .filter(
            (session) =>
              session.platformUserId === userId &&
              session.status === "ACTIVE" &&
              session.idleExpiresAt > now &&
              session.absoluteExpiresAt > now,
          )
          .sort(
            (left, right) =>
              left.lastSeenAt.getTime() - right.lastSeenAt.getTime() ||
              left.createdAt.getTime() - right.createdAt.getTime() ||
              left.id.localeCompare(right.id),
          ),
      findExpired: async (now, limit) =>
        [...state.sessions.values()]
          .filter(
            (session) =>
              session.status === "ACTIVE" &&
              (session.idleExpiresAt <= now || session.absoluteExpiresAt <= now),
          )
          .slice(0, limit),
      touch: async (id, expected, lastSeenAt, idleExpiresAt) => {
        const current = state.sessions.get(id);
        if (!current || current.lastSeenAt.getTime() !== expected.getTime()) return undefined;
        const next = { ...current, lastSeenAt, idleExpiresAt, updatedAt: lastSeenAt };
        state.sessions.set(id, next);
        return next;
      },
    },
    oauthTransactions: {
      create: async (transaction) => {
        state.transactions.set(transaction.id, transaction);
        return transaction;
      },
      findByStateDigest: async (digest) =>
        [...state.transactions.values()].find(
          (transaction) => transaction.stateDigest === digest,
        ),
      findById: async (id) => state.transactions.get(id),
      claim: async (id, claimedAt, claimExpiresAt) => {
        const current = required(state.transactions.get(id));
        const next = claimOAuthTransaction(
          current,
          claimedAt,
          claimExpiresAt.getTime() - claimedAt.getTime(),
        );
        state.transactions.set(id, next);
        return next;
      },
      transition: async (transaction, expected) => {
        const current = required(state.transactions.get(transaction.id));
        if (current.state !== expected) throw new Error("stale");
        state.transactions.set(transaction.id, transaction);
        return transaction;
      },
      findExpired: async (now, limit) =>
        [...state.transactions.values()]
          .filter((transaction) => !["COMPLETED", "FAILED", "CANCELLED", "EXPIRED"].includes(transaction.state) && transaction.expiresAt <= now)
          .slice(0, limit),
    },
    oauthCredentials: {
      findByExternalIdentity: async (id) =>
        [...state.credentials.values()].find((credential) => credential.externalIdentityId === id),
      create: async (credential) => {
        state.credentials.set(credential.id, credential);
        return credential;
      },
      updateEncryptedCredential: async (id, version, credential) => {
        const current = required(state.credentials.get(id));
        if (current.refreshVersion !== version) throw new Error("stale");
        state.credentials.set(id, credential);
        return credential;
      },
      revoke: async (id, reason, at) => {
        const current = required(state.credentials.get(id));
        const next = { ...current, revokedAt: at, revocationReason: reason, updatedAt: at };
        state.credentials.set(id, next);
        return next;
      },
    },
    guildMemberships: {
      find: async (identityId, targetGuildId) =>
        [...state.memberships.values()].find(
          (membership) =>
            membership.externalIdentityId === identityId &&
            (membership.guildId === targetGuildId || String(targetGuildId).length >= 17),
        ),
      replaceVerifiedSnapshot: async (membership) => {
        state.memberships.set(membership.id, membership);
        return membership;
      },
    },
    audit: {
      append: async (event) => {
        if (failAudit()) throw new Error("audit-failed");
        state.audits.set(event.id, event);
        return event;
      },
      findByCorrelationId: async (id) =>
        [...state.audits.values()].filter((event) => event.correlationId === id),
      findById: async (id) => state.audits.get(id),
    },
  };
}

function handle(purpose: AuthenticationKeyHandle["purpose"], version: number): AuthenticationKeyHandle {
  return Object.freeze({ purpose, version, identifier: `${purpose}:${version}` });
}

function cloneState(state: MemoryState): MemoryState {
  return {
    users: new Map(state.users),
    identities: new Map(state.identities),
    sessions: new Map(state.sessions),
    transactions: new Map(state.transactions),
    credentials: new Map(state.credentials),
    memberships: new Map(state.memberships),
    audits: new Map(state.audits),
  };
}

function replace<T>(target: Map<string, T>, source: Map<string, T>): void {
  target.clear();
  for (const [key, value] of source) target.set(key, value);
}

function required<T>(value: T | undefined): T {
  if (!value) throw new Error("fixture record not found");
  return value;
}
