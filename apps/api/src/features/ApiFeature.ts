import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Permission } from "@qbox/permissions";

/** Signed-in Discord user after an access check. */
export interface ApiIdentity {
  readonly userId: string;
  readonly displayName: string;
  /** Discord role IDs from the verified server membership. */
  readonly roleIds: readonly string[];
}

export interface ApiGuardOptions {
  /** Changes must pass the double-submit CSRF check. */
  readonly mutation: boolean;
}

/**
 * Requires a signed-in server member holding `permission` (administrators pass).
 * With a list, holding any one of the permissions is enough.
 */
export type ApiPermissionGuard = (request: FastifyRequest, permission: Permission | readonly Permission[], options: ApiGuardOptions) => Promise<ApiIdentity>;

/** Requires any signed-in member of the configured server. */
export type ApiMemberGuard = (request: FastifyRequest, options: ApiGuardOptions) => Promise<ApiIdentity>;

export interface ApiFeatureContext {
  /** Discord guild the platform manages. */
  readonly guildId: string;
  readonly guard: ApiPermissionGuard;
  readonly member: ApiMemberGuard;
}

/** A pluggable API feature that registers its own `/api/v1/...` routes. */
export interface ApiFeature {
  readonly name: string;
  register(server: FastifyInstance, context: ApiFeatureContext): void;
}
